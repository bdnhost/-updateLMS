import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  Calendar, 
  ShieldCheck,
  ArrowLeft,
  School,
  Check,
  UserCircle2,
  LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';
import PublicCoursesTeaser from '@/components/landing/PublicCoursesTeaser';
import StudentLoginDialog from '@/components/landing/StudentLoginDialog';

export default function Home() {
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    retry: false
  });

  const { data: plans } = useQuery({
    queryKey: ['activePlans'],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ active: true }),
    retry: false
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const features = [
    {
      icon: Users,
      title: 'ניהול תלמידים חכם',
      description: 'מעקב מלא אחר תלמידים, נוכחות, ציונים ומטלות במקום אחד מרכזי.'
    },
    {
      icon: Calendar,
      title: 'מערכת שעות ויומן',
      description: 'ניהול לוח זמנים, אירועים, מבחנים והגשות בצורה ויזואלית ונוחה.'
    },
    {
      icon: BarChart3,
      title: 'דוחות וניתוח נתונים',
      description: 'קבלת תובנות בזמן אמת על ביצועי התלמידים וההתקדמות בקורסים.'
    },
    {
      icon: ShieldCheck,
      title: 'ניהול הרשאות מתקדם',
      description: 'מערכת מאובטחת עם הרשאות גישה למנהלים, מרצים ותלמידים.'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 opacity-[0.03]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-purple-100 text-purple-700 font-medium mb-6">
                <School className="h-4 w-4" />
                <span>הפלטפורמה המובילה לניהול מוסדות לימוד</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                ניהול לימודים <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
                  פשוט, חכם ומתקדם
                </span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                EduManage מעניקה לך את כל הכלים הדרושים לניהול המוסד הלימודי שלך - החל מרישום תלמידים ועד מעקב נוכחות וציונים.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {user ? (
                <Link to={createPageUrl('Dashboard')}>
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-purple-200">
                    עבור לדשבורד
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Button 
                    onClick={handleLogin}
                    size="lg" 
                    className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-purple-200"
                  >
                    התחל עכשיו בחינם
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => setStudentLoginOpen(true)}
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 text-lg rounded-full border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
                  >
                    <UserCircle2 className="ml-2 h-5 w-5" />
                    כניסת תלמידים
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              כל מה שצריך כדי לנהל ביעילות
            </h2>
            <p className="text-lg text-slate-600">
              מערכת אחת שמאגדת את כל הכלים הדרושים למרצים, מנהלים ותלמידים
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-6 text-violet-600">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Courses Teaser */}
      <PublicCoursesTeaser />

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-pink-400 text-transparent bg-clip-text">1000+</div>
              <div className="text-slate-400 font-medium">תלמידים מרוצים</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">500+</div>
              <div className="text-slate-400 font-medium">קורסים פעילים</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">98%</div>
              <div className="text-slate-400 font-medium">שביעות רצון</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Plans & Pricing Section */}
      {plans && plans.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">תוכניות ומחירים</h2>
              <p className="text-lg text-slate-600">בחר את התוכנית המתאימה ביותר לצרכים שלך</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div 
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                    plan.is_popular 
                      ? 'border-violet-600 shadow-xl shadow-violet-100 bg-white ring-1 ring-violet-600 scale-105 z-10' 
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-medium px-6 py-1.5 rounded-full shadow-lg">
                      הכי משתלם
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    {plan.description && <p className="text-slate-500 text-sm mb-6">{plan.description}</p>}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-slate-900">₪{plan.price}</span>
                      <span className="text-slate-500 font-medium">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features?.split('\n').filter(f => f.trim()).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600">
                        <div className={`mt-1 p-1 rounded-full ${plan.is_popular ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-500'}`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    onClick={handleLogin}
                    className={`w-full py-6 text-lg rounded-xl transition-all duration-300 ${
                      plan.is_popular 
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-lg hover:shadow-violet-200' 
                        : 'bg-white text-slate-900 border-2 border-slate-200 hover:border-violet-600 hover:text-violet-600'
                    }`}
                  >
                    התחל עכשיו
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl -ml-24 -mb-24" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                מוכנים לשדרג את חווית הלימוד?
              </h2>
              <p className="text-violet-100 text-lg mb-10">
                הצטרפו למאות מוסדות לימוד שכבר נהנים מניהול חכם, יעיל ומתקדם עם EduManage.
              </p>
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="h-14 px-10 text-lg rounded-full bg-white text-violet-600 hover:bg-slate-50 hover:text-violet-700 shadow-xl"
              >
                התחל עכשיו
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800">EduManage</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2024 כל הזכויות שמורות ל-EduManage
            </div>
          </div>
        </div>
      </footer>

      <StudentLoginDialog open={studentLoginOpen} onClose={() => setStudentLoginOpen(false)} />
    </div>
  );
}