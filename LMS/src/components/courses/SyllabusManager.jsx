import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from
'@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from
'@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, Calendar, Save, GripVertical, Sparkles, AlertCircle, Loader2, ExternalLink } from
'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SyllabusManager({ course }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [localSessions, setLocalSessions] = useState([]);

  // Fetch existing sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['courseSessions', course.id],
    queryFn: () => base44.entities.CourseSession.filter({ course_id: course.id }, 'session_number', 100),
    enabled: !!course.id
  });

  // Fetch linked materials for sessions
  const { data: sessionMaterials } = useQuery({
    queryKey: ['courseSessionMaterials', course.id],
    queryFn: () => base44.entities.SessionMaterial.filter({ course_id: course.id }),
    enabled: !!course.id
  });

  // Fetch actual materials to display details
  const { data: materials } = useQuery({
    queryKey: ['courseMaterials', course.id],
    queryFn: async () => {
      const [legacy, newMats] = await Promise.all([
      base44.entities.Material.filter({ course_id: course.id }),
      base44.entities.Material.filter({ course_ids: course.id })]
      );
      const all = [...(legacy || []), ...(newMats || [])];
      return all.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    },
    enabled: !!course.id
  });

  // Fetch existing calendar events for this course (to know what to sync/delete)
  const { data: calendarEvents } = useQuery({
    queryKey: ['courseEvents', course.id],
    queryFn: () => base44.entities.CalendarEvent.filter({ course_id: course.id, type: 'lesson' }),
    enabled: !!course.id
  });

  useEffect(() => {
    if (sessions) {
      setLocalSessions(sessions.sort((a, b) => a.session_number - b.session_number));
    } else if (!isLoading && (!sessions || sessions.length === 0)) {
      // Init with total sessions from course if empty
      const initial = Array.from({ length: course.total_sessions || 10 }, (_, i) => ({
        id: `temp-${i}`,
        session_number: i + 1,
        title: `מפגש ${i + 1}`,
        description: '',
        objectives: '',
        start_time: course.start_time || '',
        end_time: course.end_time || '',
        location: course.room || ''
      }));
      setLocalSessions(initial);
    }
  }, [sessions, course.total_sessions, isLoading]);

  const saveScheduleMutation = useMutation({
    mutationFn: async ({ sessionsToSave, generateEvents }) => {
      const existingIds = calendarEvents?.map((e) => e.id) || [];

      return base44.functions.invoke('generateCourseSchedule', {
        courseId: course.id,
        sessions: sessionsToSave.map(({ id, ...rest }) => id.toString().startsWith('temp') ? rest : { id, ...rest }),
        generateEvents,
        existingEventsToDelete: generateEvents ? existingIds : []
      });
    },
    onSuccess: (response) => {
      if (response.data.error) throw new Error(response.data.error);
      queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
      queryClient.invalidateQueries({ queryKey: ['courseEvents'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
      toast.success('הסילבוס נשמר בהצלחה ' + (response.data.events_created ? `ונוצרו ${response.data.events_created} אירועים ביומן` : ''));
      setIsGenerating(false);
    },
    onError: (err) => {
      toast.error('שגיאה בשמירה: ' + err.message);
      setIsGenerating(false);
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localSessions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Renumber sessions
    const renumbered = items.map((item, index) => ({
      ...item,
      session_number: index + 1
    }));

    setLocalSessions(renumbered);
  };

  const handleEditSession = (session) => {
    let formattedDate = session.date || '';
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    setCurrentSession({ ...session, date: formattedDate });
    setIsEditing(true);
  };

  const handleSaveSession = () => {
    const updated = localSessions.map((s) =>
    s.id === currentSession.id || s.session_number === currentSession.session_number && s.id.toString().startsWith('temp') ?
    currentSession :
    s
    );
    setLocalSessions(updated);
    setIsEditing(false);
    setCurrentSession(null);
  };

  const handleDeleteSession = async (session) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מפגש זה?')) return;

    if (session.id.toString().startsWith('temp')) {
      setLocalSessions((prev) => prev.filter((s) => s.id !== session.id));
      toast.success('המפגש הוסר מהרשימה (יש לשמור כדי לעדכן סופית)');
    } else {
      try {
        await base44.entities.CourseSession.delete(session.id);
        toast.success('המפגש נמחק');
        queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
        // Remove from local state as well
        setLocalSessions((prev) => prev.filter((s) => s.id !== session.id));
      } catch (e) {
        console.error(e);
        toast.error('שגיאה במחיקת המפגש');
      }
    }
  };

  const handleSaveAll = (generateEvents = false) => {
    setIsGenerating(true);
    saveScheduleMutation.mutate({ sessionsToSave: localSessions, generateEvents });
  };

  const handleSyncDates = async () => {
    if (!confirm('האם אתה בטוח? פעולה זו תעדכן את תאריכי המפגשים והמטלות בהתאם לתאריך התחלת הקורס.')) return;

    setIsGenerating(true);
    toast.info('מסנכרן תאריכים...');
    try {
      const res = await base44.functions.invoke('syncCourseDates', {
        courseId: course.id,
        options: { overwrite: true }
      });

      if (res.data.success) {
        toast.success(res.data.message);
        queryClient.invalidateQueries({ queryKey: ['courseSessions'] });
        queryClient.invalidateQueries({ queryKey: ['courseAssignments'] });
        queryClient.invalidateQueries({ queryKey: ['courseEvents'] });
      } else {
        toast.error(res.data.error || 'שגיאה בסנכרון');
      }
    } catch (e) {
      console.error(e);
      toast.error('שגיאה בתקשורת עם השרת');
    } finally {
      setIsGenerating(false);
    }
  };

  // Link/Unlink Material Logic
  const linkMaterialMutation = useMutation({
    mutationFn: (data) => base44.entities.SessionMaterial.create({
      organization_id: course.organization_id,
      course_id: course.id,
      ...data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSessionMaterials'] });
      toast.success('חומר לימוד קושר למפגש');
    }
  });

  const unlinkMaterialMutation = useMutation({
    mutationFn: (id) => base44.entities.SessionMaterial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSessionMaterials'] });
      toast.success('חומר לימוד הוסר מהמפגש');
    }
  });

  const generateAIContent = async () => {
    setIsGenerating(true);
    toast.info('מייצר תוכן סילבוס באמצעות AI...');
    try {
      const prompt = `
                Generate a detailed syllabus for a course named "${course.name}" (${course.description || ''}).
                The course has ${course.total_sessions} sessions.
                Return a JSON object with a "sessions" key containing an array of objects.
                Each object must have keys: title, description, objectives.
                Language: Hebrew.
            `;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sessions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  objectives: { type: "string" }
                }
              }
            }
          }
        }
      });

      const generated = res.sessions;
      if (generated && Array.isArray(generated)) {
        const newSessions = generated.slice(0, course.total_sessions).map((s, i) => ({
          id: sessions?.[i]?.id || `temp-${i}`,
          session_number: i + 1,
          title: s.title,
          description: s.description,
          objectives: s.objectives
        }));
        setLocalSessions(newSessions);
        toast.success('הסילבוס נוצר בהצלחה! לחץ על שמירה כדי לאשר.');
      } else {
        throw new Error('תשובה לא תקינה מה-AI');
      }
    } catch (e) {
      console.error(e);
      toast.error('שגיאה ביצירת תוכן AI');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="space-y-6\nrtl\ndirection-rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">סילבוס ותוכנית לימודים</h2>
                    <p className="text-slate-500 text-sm">ניהול מפגשי הקורס וסנכרון ללוח השנה</p>
                </div>
                <div className="flex gap-2">
                    <Button
            variant="outline"
            onClick={generateAIContent}
            disabled={isGenerating}
            className="text-purple-600 border-purple-200 hover:bg-purple-50">

                        {isGenerating ?
            <Loader2 className="w-4 h-4 ml-2 animate-spin" /> :

            <Sparkles className="w-4 h-4 ml-2" />
            }
                        {isGenerating ? 'מייצר...' : 'הצע תוכן אוטומטי'}
                    </Button>
                    <Button variant="outline" onClick={() => handleSaveAll(false)} disabled={isGenerating}>
                        <Save className="w-4 h-4 ml-2" />
                        שמור שינויים
                    </Button>
                    <Button onClick={() => handleSaveAll(true)} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700">
                        <Calendar className="w-4 h-4 ml-2" />
                        שמור וצור אירועים ביומן
                    </Button>
                    <Button variant="outline" onClick={handleSyncDates} disabled={isGenerating} title="סנכרן תאריכים לפי עוגן הקורס">
                        <Calendar className="w-4 h-4 ml-2 text-orange-500" />
                        סנכרון תאריכים חכם
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>נושא המפגש</TableHead>
                                <TableHead className="hidden md:table-cell">תקציר / מטרות</TableHead>
                                <TableHead className="w-32">תאריך משוער</TableHead>
                                <TableHead className="w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="syllabus">
                                {(provided) =>
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                        {localSessions.map((session, index) => {
                    // Find linked event date if exists
                    const linkedEvent = calendarEvents?.find((e) => e.session_id === session.id);

                    return (
                      <Draggable key={session.id} draggableId={session.id.toString()} index={index}>
                                                    {(provided) =>
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="group bg-white hover:bg-slate-50">

                                                            <TableCell>
                                                                <div {...provided.dragHandleProps} className="cursor-grab text-slate-400 hover:text-slate-600">
                                                                    <GripVertical className="w-4 h-4" />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-medium">{session.session_number}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="font-semibold text-slate-800">{session.title}</div>
                                                                    {!session.id.toString().startsWith('temp') &&
                              <Link
                                to={`/SessionProfile?courseId=${course.id}&sessionId=${session.id}`}
                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                                title="מעבר לפרופיל מפגש">

                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </Link>
                              }
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell text-slate-500 text-sm max-w-md">
                                                                <div className="truncate">{session.description || session.objectives || '-'}</div>
                                                                {/* Display Linked Materials Count */}
                                                                {sessionMaterials &&
                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                        {sessionMaterials.
                              filter((sm) => sm.session_id === session.id).
                              map((sm) => {
                                const mat = materials?.find((m) => m.id === sm.material_id);
                                return mat ?
                                <Badge key={sm.id} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1">
                                                                                        {mat.title}
                                                                                        <button
                                    onClick={(e) => {e.stopPropagation();unlinkMaterialMutation.mutate(sm.id);}}
                                    className="hover:text-red-500 rounded-full">

                                                                                            ×
                                                                                        </button>
                                                                                    </Badge> :
                                null;
                              })}
                                                                         <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 rounded-full bg-slate-100 hover:bg-slate-200"
                                onClick={(e) => {e.stopPropagation();handleEditSession(session);}} // Open edit to add materials
                              >
                                                                            <Plus className="w-3 h-3 text-slate-600" />
                                                                         </Button>
                                                                    </div>
                            }
                                                            </TableCell>
                                                            <TableCell>
                                                                {linkedEvent ?
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                        {format(new Date(linkedEvent.date), 'dd/MM/yyyy')}
                                                                    </Badge> :
                            session.date ?
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                                                        {format(new Date(session.date), 'dd/MM/yyyy')}
                                                                    </Badge> :

                            <span className="text-slate-400 text-xs">לא משובץ</span>
                            }
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Button variant="ghost" size="icon" onClick={() => handleEditSession(session)}>
                                                                        <GripVertical className="w-4 h-4" /> {/* Reusing icon for edit momentarily or just edit text */}
                                                                        <span className="sr-only">ערוך</span>
                                                                        <span className="text-xs">ערוך</span>
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteSession(session)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                        }
                                                </Draggable>);

                  })}
                                        {provided.placeholder}
                                    </TableBody>
                }
                            </Droppable>
                        </DragDropContext>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>עריכת מפגש {currentSession?.session_number}</DialogTitle>
                    </DialogHeader>
                    {currentSession &&
          <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">נושא המפגש</label>
                                <Input
                value={currentSession.title}
                onChange={(e) => setCurrentSession({ ...currentSession, title: e.target.value })} />

                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">פירוט תכנים (סילבוס)</label>
                                <Textarea
                value={currentSession.description}
                onChange={(e) => setCurrentSession({ ...currentSession, description: e.target.value })}
                rows={3} />

                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">מטרות השיעור</label>
                                <Textarea
                value={currentSession.objectives}
                onChange={(e) => setCurrentSession({ ...currentSession, objectives: e.target.value })}
                rows={2} />

                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">משך בשעות</label>
                                    <Input
                  type="number"
                  value={currentSession.duration_hours || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, duration_hours: parseFloat(e.target.value) })} />

                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">תאריך</label>
                                    <Input
                  type="date"
                  value={currentSession.date || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, date: e.target.value })} />

                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">שעת התחלה</label>
                                    <Input
                  type="time"
                  value={currentSession.start_time || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, start_time: e.target.value })} />

                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">שעת סיום</label>
                                    <Input
                  type="time"
                  value={currentSession.end_time || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, end_time: e.target.value })} />

                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">סטטוס</label>
                                    <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentSession.status || 'planned'}
                  onChange={(e) => setCurrentSession({ ...currentSession, status: e.target.value })}>

                                        <option value="planned">מתוכנן</option>
                                        <option value="completed">בוצע</option>
                                        <option value="cancelled">בוטל</option>
                                        <option value="delayed">נדחה</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">מיקום / חדר</label>
                                    <Input
                  value={currentSession.location || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, location: e.target.value })}
                  placeholder="חדר 302 / זום" />

                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">קישור לזום/אונליין</label>
                                    <Input
                  value={currentSession.video_conference_link || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, video_conference_link: e.target.value })}
                  placeholder="Link" />

                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">הקלטת השיעור</label>
                                    <Input
                  value={currentSession.recording_url || ''}
                  onChange={(e) => setCurrentSession({ ...currentSession, recording_url: e.target.value })}
                  placeholder="Link" />

                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">קישור למצגת</label>
                                <Input
                value={currentSession.presentation_url || ''}
                onChange={(e) => setCurrentSession({ ...currentSession, presentation_url: e.target.value })}
                placeholder="Link" />

                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">קישור למצגת</label>
                                <Input
                value={currentSession.presentation_url || ''}
                onChange={(e) => setCurrentSession({ ...currentSession, presentation_url: e.target.value })}
                placeholder="Link" />

                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">הערות למרצה (אישי)</label>
                                <Textarea
                value={currentSession.teacher_notes || ''}
                onChange={(e) => setCurrentSession({ ...currentSession, teacher_notes: e.target.value })}
                rows={2}
                placeholder="דגשים לשיעור..." />

                            </div>

                            {/* Material Linking Section in Edit Dialog */}
                            {materials && materials.length > 0 &&
            <div className="space-y-2 pt-4 border-t">
                                    <label className="text-sm font-medium">חומרי לימוד מקושרים</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {sessionMaterials?.filter((sm) => sm.session_id === currentSession.id).map((sm) => {
                  const mat = materials.find((m) => m.id === sm.material_id);
                  return mat ?
                  <Badge key={sm.id} variant="secondary" className="bg-indigo-50 text-indigo-700 flex items-center gap-1">
                                                     {mat.title}
                                                     <button onClick={() => unlinkMaterialMutation.mutate(sm.id)} className="hover:text-red-600 ml-1">×</button>
                                                 </Badge> :
                  null;
                })}
                                    </div>
                                    <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => {
                  if (e.target.value) {
                    linkMaterialMutation.mutate({
                      session_id: currentSession.id,
                      material_id: e.target.value
                    });
                    e.target.value = ""; // Reset select
                  }
                }}>

                                        <option value="">+ הוסף חומר לימוד למפגש זה</option>
                                        {materials.filter((m) => !sessionMaterials?.some((sm) => sm.session_id === currentSession.id && sm.material_id === m.id)).map((m) =>
                <option key={m.id} value={m.id}>{m.title} ({m.type})</option>
                )}
                                    </select>
                                </div>
            }
                        </div>
          }
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>סגור</Button>
                        <Button onClick={handleSaveSession} className="bg-purple-700 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9">שמור פרטים</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>);

}