import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Check, Star, BrainCircuit, MessageCircle, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['activePlans'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('התוכנית נוצרה בהצלחה');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['activePlans'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('התוכנית עודכנה בהצלחה');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['activePlans'] });
      toast.success('התוכנית נמחקה בהצלחה');
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: 'חודש',
    description: '',
    features: '',
    max_courses: '',
    max_students: '',
    is_popular: false,
    active: true,
    permissions: {
      ai_tools: 'none',
      whatsapp: 'none',
      branding: false
    }
  });

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      period: 'חודש',
      description: '',
      features: '',
      max_courses: '',
      max_students: '',
      max_sms: '',
      is_popular: false,
      active: true,
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      period: plan.period || 'חודש',
      description: plan.description || '',
      features: plan.features || '',
      max_courses: plan.max_courses || '',
      max_students: plan.max_students || '',
      max_sms: plan.max_sms || '',
      is_popular: plan.is_popular || false,
      active: plan.active !== false,
      permissions: plan.permissions || {
        ai_tools: 'none',
        whatsapp: 'none',
        branding: false
      }
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: Number(formData.price),
      max_courses: formData.max_courses ? Number(formData.max_courses) : 0,
      max_students: formData.max_students ? Number(formData.max_students) : 0,
      max_sms: formData.max_sms ? Number(formData.max_sms) : 0,
      permissions: formData.permissions
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>טוען...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ניהול תוכניות ומחירים</h2>
          <p className="text-slate-500">הוסף וערוך את חבילות המנוי המוצגות באתר</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 ml-2" />
              תוכנית חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'עריכת תוכנית' : 'יצירת תוכנית חדשה'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שם התוכנית</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    placeholder="לדוגמה: בסיסי"
                  />
                </div>
                <div className="space-y-2">
                  <Label>מחיר (₪)</Label>
                  <Input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    required 
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>תקופת חיוב</Label>
                <Input 
                  value={formData.period} 
                  onChange={(e) => setFormData({...formData, period: e.target.value})} 
                  placeholder="לדוגמה: חודש"
                />
              </div>

              <div className="space-y-2">
                <Label>תיאור קצר</Label>
                <Input 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="תיאור קצר שמופיע מתחת למחיר"
                />
              </div>

              <div className="space-y-2">
                <Label>רשימת פיצ'רים (כל שורה היא פיצ'ר נפרד)</Label>
                <Textarea 
                  value={formData.features} 
                  onChange={(e) => setFormData({...formData, features: e.target.value})} 
                  placeholder="גישה לכל הקורסים&#10;תמיכה במייל&#10;תעודת סיום"
                  rows={3}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                 <h4 className="font-semibold text-sm text-slate-700">הרשאות ופיצ'רים מיוחדים</h4>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1.5">
                            <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
                            כלי AI
                        </Label>
                        <Select
                            value={formData.permissions?.ai_tools || 'none'} 
                            onValueChange={(val) => setFormData({
                                ...formData, 
                                permissions: { ...formData.permissions, ai_tools: val }
                            })}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">חסום</SelectItem>
                                <SelectItem value="basic">בסיסי</SelectItem>
                                <SelectItem value="advanced">מתקדם</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                            אינטגרציית WhatsApp
                        </Label>
                         <Select
                            value={formData.permissions?.whatsapp || 'none'} 
                            onValueChange={(val) => setFormData({
                                ...formData, 
                                permissions: { ...formData.permissions, whatsapp: val }
                            })}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">חסום</SelectItem>
                                <SelectItem value="read_only">קריאה בלבד</SelectItem>
                                <SelectItem value="full">מלא</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>

                 <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                        מיתוג אישי (לוגו)
                    </Label>
                    <Switch
                        checked={formData.permissions?.branding || false}
                        onCheckedChange={(checked) => setFormData({
                            ...formData, 
                            permissions: { ...formData.permissions, branding: checked }
                        })}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>מקסימום קורסים</Label>
                  <Input 
                    type="number"
                    value={formData.max_courses} 
                    onChange={(e) => setFormData({...formData, max_courses: e.target.value})} 
                    placeholder="0 = ללא הגבלה"
                  />
                </div>
                <div className="space-y-2">
                  <Label>מקסימום תלמידים</Label>
                  <Input 
                    type="number"
                    value={formData.max_students} 
                    onChange={(e) => setFormData({...formData, max_students: e.target.value})} 
                    placeholder="0 = ללא הגבלה"
                  />
                </div>
                <div className="space-y-2">
                  <Label>מקסימום הודעות SMS</Label>
                  <Input 
                    type="number"
                    value={formData.max_sms} 
                    onChange={(e) => setFormData({...formData, max_sms: e.target.value})} 
                    placeholder="0 = ללא הגבלה"
                  />
                </div>
                </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label>תוכנית פופולרית</Label>
                  <div className="text-sm text-slate-500">סימון התוכנית כמומלצת</div>
                </div>
                <Switch 
                  checked={formData.is_popular} 
                  onCheckedChange={(checked) => setFormData({...formData, is_popular: checked})} 
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                <div className="space-y-0.5">
                  <Label>סטטוס פעיל</Label>
                  <div className="text-sm text-slate-500">הצגת התוכנית באתר</div>
                </div>
                <Switch 
                  checked={formData.active} 
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})} 
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                  {editingPlan ? 'שמור שינויים' : 'צור תוכנית'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.is_popular ? 'border-violet-500 shadow-md' : ''} ${!plan.active ? 'opacity-60 bg-slate-50' : ''}`}>
            {plan.is_popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                מומלץ
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                {!plan.active && <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded">לא פעיל</span>}
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold">₪{plan.price}</span>
                <span className="text-slate-500 text-sm"> / {plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 min-h-[100px]">
                {/* Standard Features */}
                {plan.features?.split('\n').filter(f => f.trim()).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                
                {/* Visual Permissions */}
                {plan.permissions && (
                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
                        <li className="flex items-center gap-2 text-sm">
                            <BrainCircuit className={`h-4 w-4 ${plan.permissions.ai_tools !== 'none' ? 'text-violet-600' : 'text-slate-300'}`} />
                            <span className={plan.permissions.ai_tools !== 'none' ? 'text-slate-800 font-medium' : 'text-slate-400 decoration-slate-300'}>
                                כלי AI {plan.permissions.ai_tools === 'advanced' && '(מתקדם)'}
                            </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <MessageCircle className={`h-4 w-4 ${plan.permissions.whatsapp !== 'none' ? 'text-green-600' : 'text-slate-300'}`} />
                            <span className={plan.permissions.whatsapp !== 'none' ? 'text-slate-800 font-medium' : 'text-slate-400 decoration-slate-300'}>
                                WhatsApp {plan.permissions.whatsapp === 'full' && '(מלא)'}
                            </span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                            <ImageIcon className={`h-4 w-4 ${plan.permissions.branding ? 'text-pink-600' : 'text-slate-300'}`} />
                            <span className={plan.permissions.branding ? 'text-slate-800 font-medium' : 'text-slate-400 decoration-slate-300'}>
                                מיתוג אישי
                            </span>
                        </li>
                    </div>
                )}
              </ul>
              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" className="flex-1" onClick={() => handleEdit(plan)}>
                  <Pencil className="h-4 w-4 ml-2" />
                  ערוך
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4 ml-2" />
                      מחק
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>למחוק את התוכנית?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו תסיר את תוכנית "{plan.name}" מהמערכת ולא תוצג יותר באתר.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(plan.id)} className="bg-red-600 hover:bg-red-700">
                        מחק לצמיתות
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {(!plans || plans.length === 0) && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl border-slate-200">
            <p className="text-slate-500 mb-2">אין תוכניות מוגדרות עדיין</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>צור את התוכנית הראשונה</Button>
          </div>
        )}
      </div>
    </div>
  );
}