import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Users, 
  QrCode, 
  Calendar,
  FileText,
  Bell,
  BarChart3,
  ArrowLeft,
  Play,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  Shield,
  TrendingUp,
  Award,
  Star,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const features = [
  {
    id: 'courses',
    icon: GraduationCap,
    title: 'ניהול קורסים',
    description: 'צור וערוך קורסים בקלות, הגדר מועדים, חדרים ומידע רלוונטי',
    color: 'from-violet-500 to-purple-500',
    demo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop',
    steps: [
      'הגדרת פרטי הקורס - שם, קוד, מוסד',
      'קביעת מועדי הפגישות והחדרים',
      'ניהול תלמידים רשומים',
      'מעקב אחרי התקדמות'
    ],
    highlights: ['אוטומציה מלאה', 'סנכרון ליומנים', 'התראות חכמות']
  },
  {
    id: 'attendance',
    icon: QrCode,
    title: 'נוכחות QR חכמה',
    description: 'תלמידים מאשרים נוכחות בסריקת QR Code - פשוט, מהיר ואמין',
    color: 'from-blue-500 to-cyan-500',
    demo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=500&fit=crop',
    steps: [
      'פתיחת מפגש עם קוד QR ייחודי',
      'תלמידים סורקים עם הנייד',
      'אישור נוכחות אוטומטי',
      'מעקב בזמן אמת'
    ],
    highlights: ['מניעת זיוף', 'התראות בזמן אמת', 'דוחות אוטומטיים']
  },
  {
    id: 'assignments',
    icon: FileText,
    title: 'מטלות וציונים',
    description: 'צור מטלות, קבל הגשות, תן ציונים ומשוב - הכל במקום אחד',
    color: 'from-orange-500 to-amber-500',
    demo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=500&fit=crop',
    steps: [
      'יצירת מטלה עם תאריך הגשה',
      'הגדרת משקלות וקריטריונים',
      'קבלת הגשות מהתלמידים',
      'מתן ציונים ומשוב מפורט'
    ],
    highlights: ['בדיקה חכמה', 'משוב מותאם', 'ניתוח מגמות']
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'דוחות ותובנות',
    description: 'קבל תמונה מלאה על נוכחות, ציונים והתקדמות התלמידים',
    color: 'from-emerald-500 to-teal-500',
    demo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    steps: [
      'גרפים אינטראקטיביים של נוכחות',
      'מעקב אחר ביצועים אישיים',
      'זיהוי תלמידים בסיכון',
      'ייצוא דוחות לאקסל'
    ],
    highlights: ['AI מנבא', 'המלצות אישיות', 'התראות מוקדמות']
  }
];

const benefits = [
  {
    icon: Clock,
    title: 'חיסכון בזמן',
    description: 'חסוך עד 10 שעות שבועיות בעבודה מנהלתית',
    stat: '83%'
  },
  {
    icon: Shield,
    title: 'אמין ומאובטח',
    description: 'הצפנה צבאית ותאימות מלאה ל-GDPR',
    stat: '100%'
  },
  {
    icon: Zap,
    title: 'קל לשימוש',
    description: 'זמן למידה ממוצע: 15 דקות בלבד',
    stat: '15 דק׳'
  },
  {
    icon: TrendingUp,
    title: 'שיפור ביצועים',
    description: 'עלייה ממוצעת של 40% בנוכחות',
    stat: '+40%'
  }
];

const stats = [
  { number: '50K+', label: 'משתמשים פעילים' },
  { number: '98%', label: 'שביעות רצון' },
  { number: '24/7', label: 'תמיכה טכנית' },
  { number: '15 דק׳', label: 'זמן התחלה' }
];

const testimonials = [
  {
    name: 'ד"ר שרה כהן',
    role: 'מרצה בכירה, אוניברסיטת תל אביב',
    content: 'EduManage שינה לחלוטין את הדרך שבה אני מנהלת את הקורסים שלי. חיסכון של שעות כל שבוע!',
    rating: 5,
    avatar: '👩‍🏫'
  },
  {
    name: 'פרופ׳ דוד לוי',
    role: 'ראש המחלקה למדעי המחשב',
    content: 'המערכת הכי אינטואיטיבית שעבדתי איתה. התלמידים אוהבים את מערכת ה-QR לנוכחות.',
    rating: 5,
    avatar: '👨‍💼'
  },
  {
    name: 'ענת רוזן',
    role: 'מרצה במתמטיקה',
    content: 'הדוחות והאנליטיקס עוזרים לי לזהות תלמידים שצריכים עזרה לפני שזה מאוחר מדי.',
    rating: 5,
    avatar: '👩‍🔬'
  }
];

export default function Demo() {
  const [activeTab, setActiveTab] = useState('courses');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Reveal animations
      const elements = document.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8;
        if (isInView && !el.classList.contains('revealed')) {
          el.classList.add('revealed');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-cyan-50" dir="rtl">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-purple-100 z-[60]">
        <div 
          className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-purple-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Landing')} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-transparent bg-clip-text">EduManage</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleLogin}
                className="hover:bg-purple-50 hover:text-purple-600 transition-colors"
              >
                התחברות
              </Button>
              <Button 
                onClick={handleLogin} 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                התחל בחינם
                <Sparkles className="h-4 w-4 mr-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal-on-scroll opacity-0 transition-all duration-1000">
            <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 mb-6 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="h-4 w-4 ml-1 animate-pulse" />
              הדגמה אינטראקטיבית
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              גלה איך EduManage משנה את
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-violet-600 via-purple-600 to-pink-600 animate-gradient">
                חוויית הניהול הקורסים
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              סיור מונחה בתכונות המערכת המתקדמות - גלה כיצד למקסם את הזמן שלך ולשפר את חוויית הלמידה
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="reveal-on-scroll opacity-0 transition-all duration-700 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-100 data-[state=active]:to-purple-100 data-[state=active]:text-violet-700 data-[state=active]:shadow-md rounded-xl py-4 transition-all duration-300 hover:scale-105"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline font-medium">{feature.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <TabsContent key={feature.id} value={feature.id} className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Demo Preview */}
                    <Card className="overflow-hidden border-2 border-transparent hover:border-purple-300 transition-all duration-500 shadow-2xl hover:shadow-purple-200 group">
                      <div className={`h-14 bg-gradient-to-r ${feature.color} flex items-center justify-center gap-3 group-hover:h-16 transition-all duration-300`}>
                        <Icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white font-semibold">{feature.title}</span>
                      </div>
                      <div className="relative group/image overflow-hidden">
                        <img 
                          src={feature.demo}
                          alt={feature.title}
                          className="w-full h-96 object-cover group-hover/image:scale-105 transition-transform duration-700 block"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-2xl transform hover:scale-110 transition-all duration-300">
                            <Play className="h-6 w-6 ml-2" />
                            צפה בפעולה
                          </Button>
                        </div>
                        {/* Highlights Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                          {feature.highlights.map((highlight, idx) => (
                            <Badge 
                              key={idx}
                              className="bg-white/95 backdrop-blur-sm text-slate-800 shadow-lg border-0 hover:scale-105 transition-transform"
                            >
                              <Sparkles className="h-3 w-3 ml-1 text-purple-600" />
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Feature Details - יישור לימין */}
                    <div className="space-y-6 text-right">
                      <div className="space-y-4">
                        <div className="inline-block">
                          <Badge className={`bg-gradient-to-r ${feature.color} text-white shadow-lg`}>
                            <Award className="h-4 w-4 ml-1" />
                            תכונה מומלצת
                          </Badge>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 leading-tight">{feature.title}</h2>
                        <p className="text-xl text-slate-600 leading-relaxed">{feature.description}</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <ChevronRight className="h-5 w-5 text-purple-600" />
                          תהליך העבודה:
                        </h3>
                        {feature.steps.map((step, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-xl hover:shadow-md hover:-translate-x-1 transition-all duration-300 group/step text-right"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg group-hover/step:scale-110 transition-transform`}>
                              {index + 1}
                            </div>
                            <p className="text-slate-700 pt-2 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 space-y-3">
                        <Button 
                          size="lg" 
                          onClick={handleLogin} 
                          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg py-6"
                        >
                          התחל להשתמש עכשיו
                          <ArrowLeft className="h-5 w-5 mr-2" />
                        </Button>
                        <p className="text-center text-sm text-slate-500">
                          ללא כרטיס אשראי • התקנה מיידית • ביטול בכל עת
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 bg-gradient-to-br from-white via-purple-50 to-pink-50 reveal-on-scroll opacity-0 transition-all duration-1000">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 mb-6 shadow-sm">
              <TrendingUp className="h-4 w-4 ml-1" />
              היתרונות שלנו
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              למה לבחור ב-EduManage?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              מערכת מקיפה שמשלבת את כל מה שאתה צריך לניהול קורסים מוצלח
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card 
                  key={index} 
                  className="p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-transparent hover:border-purple-300 bg-white/90 backdrop-blur-sm group reveal-on-scroll opacity-0"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-10 w-10 text-violet-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 mb-3">
                    {benefit.stat}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-3 text-lg">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 reveal-on-scroll opacity-0 transition-all duration-1000">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 mb-6 shadow-sm">
              <MessageSquare className="h-4 w-4 ml-1" />
              המלצות
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              מה אומרים עלינו?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              מרצים ומורים מכל הארץ משתפים את החוויה שלהם
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-transparent hover:border-purple-300 bg-white/90 backdrop-blur-sm reveal-on-scroll opacity-0"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-slate-800">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 reveal-on-scroll opacity-0 transition-all duration-1000">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-white text-center shadow-2xl relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-pulse" />
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="inline-block mb-6">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 shadow-lg text-base py-2 px-4">
                  <Sparkles className="h-4 w-4 ml-1 animate-pulse" />
                  הצעה מיוחדת
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                מוכן לשנות את חוויית הניהול?
              </h2>
              <p className="text-2xl opacity-95 mb-10 max-w-2xl mx-auto">
                הצטרף ל-50,000+ מרצים ומורים שכבר משתמשים ב-EduManage
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-purple-50 text-xl px-10 py-7 shadow-2xl hover:scale-105 transition-all duration-300"
                  onClick={handleLogin}
                >
                  התחל בחינם - 14 יום ניסיון
                  <ArrowLeft className="h-6 w-6 mr-2" />
                </Button>
                <Link to={createPageUrl('Landing')}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-xl px-10 py-7 border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
                  >
                    חזרה לדף הבית
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 text-base opacity-95">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  ללא כרטיס אשראי
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  התקנה ב-15 דקות
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  תמיכה 24/7
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  ביטול בכל עת
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">EduManage</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                הפתרון המקיף לניהול קורסים בעידן הדיגיטלי
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">קישורים מהירים</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to={createPageUrl('Landing')} className="hover:text-white transition-colors">דף הבית</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">תמחור</a></li>
                <li><a href="#" className="hover:text-white transition-colors">תמיכה</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">צור קשר</h3>
              <ul className="space-y-2 text-slate-400">
                <li>info@edumanage.co.il</li>
                <li>1-800-EDUMANAGE</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2024 EduManage. כל הזכויות שמורות.
            </p>
            <div className="flex gap-4 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .reveal-on-scroll {
          transform: translateY(30px);
        }

        .reveal-on-scroll.revealed {
          opacity: 1 !important;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}