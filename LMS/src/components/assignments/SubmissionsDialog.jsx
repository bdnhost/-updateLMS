import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area'; // Kept for sidebar list if needed, but main content uses native scroll
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, isValid } from 'date-fns';
import { CheckCircle2, XCircle, FileText, Download, User, Clock, Loader2, Lightbulb, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import RubricGrader from './RubricGrader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SubmissionsDialog({ open, onClose, assignment, grades, students }) {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rubricGrades, setRubricGrades] = useState({}); // { [criterionId]: { points, feedback } }
  const [quickGrades, setQuickGrades] = useState({});
  const [activeTab, setActiveTab] = useState("detailed");
  
  const queryClient = useQueryClient();

  // Initialize quick grades
  useEffect(() => {
    if (students && grades) {
      const initialQuick = {};
      students.forEach(student => {
        const grade = grades.find(g => g.student_id === student.id);
        initialQuick[student.id] = {
          score: grade?.score !== undefined ? grade.score : '',
          feedback: grade?.feedback || '',
          gradeId: grade?.id,
          status: grade?.submission_status || 'not_submitted'
        };
      });
      setQuickGrades(initialQuick);
    }
  }, [students, grades]);

  // Fetch Rubric
  const { data: rubricData } = useQuery({
      queryKey: ['rubric', assignment?.id],
      queryFn: async () => {
          if (!assignment?.id) return null;
          const rubrics = await base44.entities.GradingRubric.filter({ assignment_id: assignment.id });
          if (rubrics.length === 0) return null;
          
          const criteria = await base44.entities.RubricCriterion.filter({ rubric_id: rubrics[0].id });
          return { rubric: rubrics[0], criteria: criteria.sort((a,b) => a.order - b.order) };
      },
      enabled: !!assignment?.id
  });

  // Fetch existing rubric grades for selected submission
  useQuery({
      queryKey: ['rubricGrades', selectedSubmission?.id],
      queryFn: async () => {
          if (!selectedSubmission?.id) return [];
          const grades = await base44.entities.RubricGrade.filter({ grade_id: selectedSubmission.id });
          const gradesMap = {};
          grades.forEach(g => {
              gradesMap[g.criterion_id] = { points: g.points_earned, feedback: g.feedback };
          });
          setRubricGrades(gradesMap);
          return grades;
      },
      enabled: !!selectedSubmission?.id
  });

  useEffect(() => {
    if (selectedSubmission) {
      setScore(selectedSubmission.score || '');
      setFeedback(selectedSubmission.feedback || '');
      // Rubric grades are reset by query or useEffect
    } else {
        setRubricGrades({});
    }
  }, [selectedSubmission]);

  // Update score based on rubric
  useEffect(() => {
      if (rubricData && Object.keys(rubricGrades).length > 0) {
          const totalPoints = Object.values(rubricGrades).reduce((sum, g) => sum + (Number(g.points) || 0), 0);
          setScore(totalPoints);
      }
  }, [rubricGrades, rubricData]);

  const updateGradeMutation = useMutation({
    mutationFn: async ({ studentId, gradeId, score, feedback, isQuick }) => {
      let finalGradeId = gradeId;
      
      // 1. Create/Update Main Grade
      if (!gradeId) {
          const newGrade = await base44.entities.Grade.create({
              organization_id: assignment.organization_id,
              assignment_id: assignment.id,
              student_id: studentId,
              score: score !== '' ? Number(score) : null,
              feedback: feedback,
              submission_status: 'submitted', // Auto-mark as submitted if graded
              submission_date: new Date().toISOString().split('T')[0]
          });
          finalGradeId = newGrade.id;
      } else {
          await base44.entities.Grade.update(gradeId, {
              score: score !== '' ? Number(score) : null,
              feedback: feedback,
          });
      }

      // 2. Update Rubric Grades (Only for detailed view)
      if (!isQuick && rubricData && rubricGrades && selectedSubmission) {
          // Delete old rubric grades
          const oldGrades = await base44.entities.RubricGrade.filter({ grade_id: finalGradeId });
          await Promise.all(oldGrades.map(g => base44.entities.RubricGrade.delete(g.id)));

          // Create new ones
          const promises = Object.entries(rubricGrades).map(([criterionId, gradeData]) => {
              return base44.entities.RubricGrade.create({
                  organization_id: assignment.organization_id,
                  grade_id: finalGradeId,
                  criterion_id: criterionId,
                  points_earned: Number(gradeData.points),
                  feedback: gradeData.feedback || ''
              });
          });
          await Promise.all(promises);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignmentGrades'] });
      queryClient.invalidateQueries({ queryKey: ['studentGrades'] });
      queryClient.invalidateQueries({ queryKey: ['rubricGrades'] });
      toast.success('הציון והמשוב נשמרו בהצלחה');
    },
    onError: () => toast.error('שגיאה בשמירת הציון')
  });

  const handleSave = (studentId = null) => {
    // Quick Save
    if (studentId) {
        const data = quickGrades[studentId];
        if (data.score !== '' && isNaN(data.score)) return toast.error('ציון לא תקין');
        if (Number(data.score) > (assignment.max_score || 100)) return toast.error('ציון גבוה מהמקסימום');
        
        updateGradeMutation.mutate({
            studentId,
            gradeId: data.gradeId,
            score: data.score,
            feedback: data.feedback,
            isQuick: true
        });
        return;
    }

    // Detailed Save
    if (score === '' || isNaN(score)) {
      toast.error('נא להזין ציון תקין');
      return;
    }
    if (Number(score) > (assignment.max_score || 100)) {
        toast.error(`הציון לא יכול להיות גבוה מ-${assignment.max_score || 100}`);
        return;
    }
    updateGradeMutation.mutate({ 
        studentId: selectedSubmission.student_id,
        gradeId: selectedSubmission.id,
        score, 
        feedback,
        isQuick: false 
    });
  };

  const handleQuickChange = (studentId, field, value) => {
      setQuickGrades(prev => ({
          ...prev,
          [studentId]: { ...prev[studentId], [field]: value }
      }));
  };

  if (!assignment) return null;

  // Combine grades with student info
  const submissions = grades?.filter(g => g.assignment_id === assignment.id).map(grade => {
    // Try to find student by ID (if linked) or use submission_data
    const student = students?.find(s => s.id === grade.student_id);
    return {
      ...grade,
      studentName: student?.full_name || grade.submission_data?.student_name_input || 'לא מזוהה',
      studentIdNumber: student?.id_number || grade.submission_data?.student_id_input || '---',
      isLinked: !!student
    };
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-4 pb-2 border-b bg-slate-50 shrink-0">
          <div className="flex justify-between items-start">
            <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    הגשות: {assignment.title}
                </DialogTitle>
                <DialogDescription className="mt-1">
                    {submissions.length} הגשות סה"כ
                </DialogDescription>
            </div>
            {assignment.file_url && (
                <Button variant="outline" size="sm" asChild>
                    <a href={assignment.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 ml-2" />
                        קובץ המטלה
                    </a>
                </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden flex-col h-full">
            <div className="px-4 border-b bg-white shrink-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                        <TabsTrigger value="detailed" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-2 text-sm">
                            בדיקה מפורטת
                        </TabsTrigger>
                        <TabsTrigger value="quick" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-2 text-sm">
                            בדיקה מהירה (כל הכיתה)
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden relative">
            {activeTab === 'detailed' && (
                <div className="flex h-full w-full absolute inset-0">
                    {/* Sidebar List */}
                    <div className="w-1/3 md:w-1/4 border-l bg-slate-50/50 flex flex-col h-full overflow-hidden">
                        <div className="p-3 border-b">
                            <input 
                                type="text" 
                                placeholder="חיפוש סטודנט..." 
                                className="w-full px-3 py-2 rounded-md border text-sm"
                            />
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-3 space-y-2">
                                {submissions.length === 0 && (
                                    <p className="text-center text-slate-400 py-8 text-sm">אין הגשות עדיין</p>
                                )}
                                {submissions.map(sub => (
                                    <div 
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                                            selectedSubmission?.id === sub.id 
                                            ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                                            : 'bg-white border-slate-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-slate-800 truncate">{sub.studentName}</span>
                                            {sub.score ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {sub.score}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-100 text-slate-500">
                                                    --
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <User className="w-3 h-3" />
                                            <span>{sub.studentIdNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {(() => {
                                                    const d = new Date(sub.submission_date || sub.created_date);
                                                    return isValid(d) ? format(d, 'dd/MM/yy HH:mm') : '-';
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
                        {selectedSubmission ? (
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar h-full">
                        <div className="space-y-6 pb-10">
                            {/* Header Info */}
                            <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{selectedSubmission.studentName}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {selectedSubmission.studentIdNumber}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {(() => {
                                                const d = new Date(selectedSubmission.submission_date || selectedSubmission.created_date);
                                                return isValid(d) ? `הוגש ב-${format(d, 'dd/MM/yyyy HH:mm')}` : 'תאריך לא זמין';
                                            })()}
                                        </span>
                                        {!selectedSubmission.isLinked && (
                                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                משתמש לא מקושר
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="text-left">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        selectedSubmission.submission_status === 'late' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                        {selectedSubmission.submission_status === 'late' ? 'הוגש באיחור' : 'הוגש בזמן'}
                                    </span>
                                </div>
                            </div>

                            {/* Text Content */}
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    תוכן ההגשה
                                </h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap min-h-[100px] leading-relaxed">
                                    {selectedSubmission.submission_content || 'אין תוכן טקסטואלי'}
                                </div>
                            </div>

                            {/* Marked Concepts */}
                            {selectedSubmission.submission_data?.marked_concepts?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        מושגים שסומנו
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubmission.submission_data.marked_concepts.map((concept, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                {concept}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Project Progress History */}
                            {selectedSubmission.submission_data?.project_progress?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-600" />
                                        היסטוריית שלבים בפרויקט
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedSubmission.submission_data.project_progress.map((step, idx) => (
                                            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium text-slate-700 text-sm">
                                                        שלב {step.step_index !== undefined ? step.step_index + 1 : '?'}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {step.date ? format(new Date(step.date), 'dd/MM/yy HH:mm') : '-'}
                                                    </span>
                                                </div>
                                                {step.content && (
                                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-100 mb-2">
                                                        {step.content}
                                                    </p>
                                                )}
                                                {step.file_url && (
                                                    <a href={step.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                                        <Download className="w-3 h-3" />
                                                        קובץ מצורף לשלב
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Attachments (Latest) */}
                            {selectedSubmission.file_url && !selectedSubmission.submission_data?.project_progress && (
                                <div>
                                    <h4 className="font-semibold text-slate-700 mb-2">קבצים מצורפים</h4>
                                    <Button variant="outline" asChild className="h-auto py-2 px-4">
                                        <a href={selectedSubmission.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            <Download className="w-4 h-4 text-blue-600" />
                                            <div className="text-right">
                                                <div className="font-medium text-slate-700">הורדת קובץ</div>
                                                <div className="text-xs text-slate-400">לחץ לפתיחה</div>
                                            </div>
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {/* Grading Section */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-indigo-100 mt-6 space-y-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                                    בדיקה ומתן ציון
                                </h4>

                                {rubricData && (
                                    <div className="mb-6">
                                        <RubricGrader 
                                            rubric={rubricData.rubric}
                                            criteria={rubricData.criteria}
                                            grades={rubricGrades}
                                            onChange={setRubricGrades}
                                        />
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="score">ציון (מתוך {assignment.max_score || 100})</Label>
                                        <Input 
                                            id="score"
                                            type="number" 
                                            value={score} 
                                            onChange={(e) => setScore(e.target.value)}
                                            min="0"
                                            max={assignment.max_score || 100}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="feedback">משוב מילולי</Label>
                                        <Textarea 
                                            id="feedback"
                                            value={feedback} 
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="כתוב הערות לסטודנט כאן..."
                                            className="bg-white min-h-[80px]"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end pt-2">
                                    <Button 
                                        onClick={handleSave} 
                                        disabled={updateGradeMutation.isPending}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {updateGradeMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 ml-2" />
                                        )}
                                        שמור ציון ומשוב
                                    </Button>
                                </div>
                            </div>
                        </div>
                        </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full">
                                <FileText className="w-12 h-12 mb-2 opacity-20" />
                                <p>בחר הגשה לצפייה בפרטים</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'quick' && (
                <div className="flex h-full w-full absolute inset-0 flex-col bg-slate-50/30">
                    <div className="p-4 border-b bg-white flex justify-between items-center shrink-0">
                        <div className="text-sm text-slate-500">
                            מציג {students?.length || 0} סטודנטים
                        </div>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            מקסימום ניקוד: {assignment.max_score || 100}
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div className="space-y-3 max-w-4xl mx-auto pb-10">
                            {students?.map(student => {
                                const qg = quickGrades[student.id] || {};
                                const isGraded = qg.gradeId && qg.score !== '';
                                
                                return (
                                    <div key={student.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                            {student.full_name.charAt(0)}
                                        </div>
                                        <div className="w-48 shrink-0">
                                            <div className="font-semibold text-slate-800">{student.full_name}</div>
                                            <div className="text-xs text-slate-500">{student.id_number}</div>
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-3">
                                                <Label className="text-xs text-slate-400 mb-1 block">ציון</Label>
                                                <Input 
                                                    type="number" 
                                                    value={qg.score}
                                                    onChange={(e) => handleQuickChange(student.id, 'score', e.target.value)}
                                                    className={`h-9 ${isGraded ? 'border-green-200 bg-green-50/30' : ''}`}
                                                    placeholder="--"
                                                />
                                            </div>
                                            <div className="col-span-7">
                                                <Label className="text-xs text-slate-400 mb-1 block">משוב</Label>
                                                <Input 
                                                    value={qg.feedback}
                                                    onChange={(e) => handleQuickChange(student.id, 'feedback', e.target.value)}
                                                    className="h-9"
                                                    placeholder="הערות..."
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-end mt-5">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleSave(student.id)}
                                                    className={isGraded ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"}
                                                    disabled={updateGradeMutation.isPending}
                                                >
                                                    {isGraded ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
                    </DialogContent>
                    </Dialog>
  );
}