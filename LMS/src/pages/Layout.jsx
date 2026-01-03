
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Bell, 
  FolderOpen,
  MessageSquare,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  LogIn,
  QrCode,
  Shield,
  Settings,
  BookOpen,
  UserCircle2,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Footer from '@/components/common/Footer';
import StudentLoginDialog from '@/components/landing/StudentLoginDialog';

// 🎨 Enhanced Nav Items with Colors
const navItems = [
  { 
    name: 'Dashboard', 
    label: 'דשבורד', 
    icon: LayoutDashboard,
    gradient: 'from-violet-500 to-indigo-600',
    hoverGradient: 'from-violet-50 to-indigo-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    activeGradient: 'from-violet-500 to-indigo-600'
  },
  { 
    name: 'Courses', 
    label: 'קורסים', 
    icon: GraduationCap,
    gradient: 'from-orange-500 to-pink-600',
    hoverGradient: 'from-orange-50 to-pink-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    activeGradient: 'from-orange-500 to-pink-600'
  },
  { 
    name: 'Students', 
    label: 'תלמידים', 
    icon: Users,
    gradient: 'from-blue-500 to-cyan-600',
    hoverGradient: 'from-blue-50 to-cyan-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    activeGradient: 'from-blue-500 to-cyan-600'
  },
  { 
    name: 'Attendance', 
    label: 'נוכחות', 
    icon: ClipboardList,
    gradient: 'from-emerald-500 to-teal-600',
    hoverGradient: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    activeGradient: 'from-emerald-500 to-teal-600'
  },
  { 
    name: 'QRAttendance', 
    label: 'נוכחות QR', 
    icon: QrCode,
    gradient: 'from-purple-500 to-fuchsia-600',
    hoverGradient: 'from-purple-50 to-fuchsia-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    activeGradient: 'from-purple-500 to-fuchsia-600'
  },
  { 
    name: 'Assignments', 
    label: 'מטלות', 
    icon: FileText,
    gradient: 'from-amber-500 to-yellow-600',
    hoverGradient: 'from-amber-50 to-yellow-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    activeGradient: 'from-amber-500 to-yellow-600'
  },
  { 
    name: 'Sessions', 
    label: 'ניהול מפגשים', 
    icon: Calendar,
    gradient: 'from-rose-500 to-pink-600',
    hoverGradient: 'from-rose-50 to-pink-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    activeGradient: 'from-rose-500 to-pink-600'
  },
  { 
    name: 'Calendar', 
    label: 'לוח שנה', 
    icon: Calendar,
    gradient: 'from-indigo-500 to-blue-600',
    hoverGradient: 'from-indigo-50 to-blue-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    activeGradient: 'from-indigo-500 to-blue-600'
  },
  { 
    name: 'Materials', 
    label: 'חומרי לימוד', 
    icon: FolderOpen,
    gradient: 'from-teal-500 to-cyan-600',
    hoverGradient: 'from-teal-50 to-cyan-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    activeGradient: 'from-teal-500 to-cyan-600'
  },
  { 
    name: 'Announcements', 
    label: 'הכרזות', 
    icon: Bell,
    gradient: 'from-orange-500 to-amber-600',
    hoverGradient: 'from-orange-50 to-amber-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    activeGradient: 'from-orange-500 to-amber-600'
  },
  { 
    name: 'Messages', 
    label: 'הודעות', 
    icon: MessageSquare,
    gradient: 'from-violet-500 to-purple-600',
    hoverGradient: 'from-violet-50 to-purple-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    activeGradient: 'from-violet-500 to-purple-600'
  },
  { 
    name: 'AdminDashboard', 
    label: 'ניהול משתמשים', 
    icon: Shield,
    gradient: 'from-red-500 to-rose-600',
    hoverGradient: 'from-red-50 to-rose-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    activeGradient: 'from-red-500 to-rose-600'
  },
  { 
    name: 'Settings', 
    label: 'הגדרות', 
    icon: Settings,
    gradient: 'from-slate-500 to-gray-600',
    hoverGradient: 'from-slate-50 to-gray-50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    activeGradient: 'from-slate-500 to-gray-600'
  },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);
  const location = useLocation();

  const isPublicView = currentPageName === 'PublicView' || currentPageName === 'JoinCourse';

  // Google Tag Manager & Analytics
  useEffect(() => {
    // Load GTM script
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-MGV7RRCB');

    // Load gtag.js script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-N86HHR317R';
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-N86HHR317R');

    return () => {
      // Cleanup script on unmount
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
    };
  }, []);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    enabled: !isPublicView
  });

  const queryClient = useQueryClient();

  // --- Global Navigation Stats (Badges) ---
  const { data: globalStats } = useQuery({
    queryKey: ['globalNavStats', currentUser?.organization_id, currentUser?.role],
    queryFn: async () => {
      if (!currentUser?.organization_id || currentUser.role !== 'admin') return { messages: 0, students: 0 };
      
      try {
        // 1. Unread Inbound Messages
        const messages = await base44.entities.Message.filter({
           organization_id: currentUser.organization_id,
           direction: 'inbound',
           is_read: false 
        }, '-created_date', 50);

        // 2. Pending Students
        const students = await base44.entities.Student.filter({
            organization_id: currentUser.organization_id,
            status: 'pending'
        });

        return { 
            messages: messages.length, 
            students: students.length 
        };
      } catch (e) {
        console.error("Error fetching nav stats", e);
        return { messages: 0, students: 0 };
      }
    },
    enabled: !!currentUser?.organization_id,
    refetchInterval: 15000 // Poll every 15s
  });

  // --- Background Media & Audio Sync (Admin Only) ---
  useQuery({
      queryKey: ['backgroundSync', currentUser?.organization_id],
      queryFn: async () => {
          if (currentUser?.role !== 'admin') return null;

          // 2. Media Sync (media4u) - Sync ALL types
          try {
              console.log("Running background media sync...");
              await Promise.all([
                  base44.functions.invoke('mediaSync', { action: 'cpanel_sync', entityType: 'course' }),
                  base44.functions.invoke('mediaSync', { action: 'cpanel_sync', entityType: 'session' }),
                  base44.functions.invoke('mediaSync', { action: 'cpanel_sync', entityType: 'assignment' }),
                  base44.functions.invoke('mediaSync', { action: 'cpanel_sync', entityType: 'material' })
              ]);
          } catch (e) {
              console.error("Media sync failed", e);
          }

          return true;
      },
      enabled: !!currentUser && currentUser.role === 'admin',
      refetchInterval: 60000,
      refetchIntervalInBackground: false 
  });

  const { data: organizationData } = useQuery({
    queryKey: ['layoutOrgData', currentUser?.organization_id, currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;

      let org = null;

      if (currentUser.organization_id) {
          try {
            org = await base44.entities.Organization.get(currentUser.organization_id);
          } catch (e) {
            console.warn("Organization not found by ID", e);
          }
      }

      if (!org && currentUser.email) {
          try {
            const orgs = await base44.entities.Organization.filter({ created_by: currentUser.email }, '-created_date', 1);
            if (orgs && orgs.length > 0) {
                org = orgs[0];
                if (currentUser.organization_id !== org.id) {
                    console.log("Auto-linking organization", org.id, "to user", currentUser.email);
                    await base44.auth.updateMe({ organization_id: org.id });
                    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                }
            }
          } catch (e) {
            console.error("Error finding organization by email", e);
          }
      }

      if (!org && currentUser.email) {
          try {
            console.log("Creating new organization for user", currentUser.email);
            org = await base44.entities.Organization.create({
                name: currentUser.full_name || currentUser.email.split('@')[0],
                billing_email: currentUser.email,
                subscription_status: 'trial'
            });
            await base44.auth.updateMe({ organization_id: org.id });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['layoutOrgData'] });
            queryClient.invalidateQueries({ queryKey: ['myOrganizationWithPlan'] });
          } catch (e) {
            console.error("Error creating organization", e);
          }
      }

      let plan = null;
      if (org?.plan_id) {
          try {
            const plans = await base44.entities.SubscriptionPlan.list(); 
            plan = plans.find(p => p.id === org.plan_id);
          } catch (e) { console.error(e); }
      }
      return { org, plan };
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5,
    retry: 3
  });

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  const isLandingPage = currentPageName === 'Home';

  if (isPublicView) {
    return (
      <main className="min-h-screen bg-slate-50">
        {children}
        <Footer />
      </main>
    );
  }

  const showSidebar = !isLandingPage && !isPublicView && currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50" dir="rtl">
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MGV7RRCB"
      height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');

        :root {
          --primary: #7c3aed;
          --primary-dark: #6d28d9;
          --accent: #ec4899;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
        }

        body {
          font-family: 'Heebo', sans-serif;
          direction: rtl;
          text-align: right;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>

      {/* Landing Page Header */}
      {isLandingPage && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-purple-100 z-50 flex items-center justify-between px-4 lg:px-10 shadow-sm">
          <a href="https://edu-manage.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 text-transparent bg-clip-text hidden sm:inline">EduManage</span>
          </a>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <Link to={createPageUrl('Dashboard')}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-4 lg:px-6 h-9 lg:h-10 text-sm">
                  לעמוד הראשי
                  <ChevronLeft className="h-4 w-4 mr-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  onClick={() => setStudentLoginOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-3 lg:px-5 h-9 lg:h-10 shadow-md text-sm"
                >
                  <UserCircle2 className="h-4 w-4 lg:ml-1.5" />
                  <span className="hidden lg:inline">כניסת תלמידים</span>
                </Button>
                <Button onClick={handleLogin} variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50 rounded-full px-3 lg:px-6 h-9 lg:h-10 text-sm">
                  <LogIn className="h-4 w-4 lg:ml-2" />
                  <span className="hidden lg:inline">התחברות</span>
                </Button>
              </>
            )}
          </div>
        </header>
      )}

      {/* App Header & Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile Header */}
          <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-purple-100 z-50 flex items-center justify-between px-4 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-bold text-slate-800">ניהול תלמידים</h1>
            <div className="w-10" />
          </header>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={'fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-white to-purple-50/30 border-l border-purple-100 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ' + (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-purple-100 bg-white/50 backdrop-blur-sm">
                <a href="https://edu-manage.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg animate-float">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-black bg-gradient-to-r from-violet-600 to-pink-600 text-transparent bg-clip-text">EduManage</span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item, idx) => {
                  if (item.name === 'AdminDashboard' && currentUser?.role !== 'admin') {
                    return null;
                  }

                  const isActive = currentPageName === item.name;

                  let badgeCount = 0;
                  if (item.name === 'Messages') badgeCount = globalStats?.messages || 0;
                  if (item.name === 'Students') badgeCount = globalStats?.students || 0;

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={createPageUrl(item.name)}
                        onClick={() => setSidebarOpen(false)}
                        className={'block rounded-2xl transition-all duration-200 ' + (isActive ? 'shadow-lg' : '')}
                      >
                        <div className={'flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 group ' + (isActive ? 'bg-gradient-to-r ' + item.activeGradient + ' text-white border-transparent shadow-xl' : 'bg-white/50 backdrop-blur-sm border-purple-100/50 hover:border-purple-200 hover:shadow-md hover:bg-gradient-to-r hover:' + item.hoverGradient)}>
                          {/* Icon Box */}
                          <div className={'w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ' + (isActive ? 'bg-white/20 backdrop-blur-sm' : item.iconBg)}>
                            <item.icon className={'h-5 w-5 ' + (isActive ? 'text-white' : item.iconColor)} />
                          </div>
                          
                          {/* Label & Badge */}
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className={'font-bold truncate ' + (isActive ? 'text-white' : 'text-slate-700')}>{item.label}</span>
                            {badgeCount > 0 && (
                              <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 h-6 px-2 min-w-[1.5rem] flex items-center justify-center text-xs font-black shadow-lg animate-pulse">
                                {badgeCount}
                              </Badge>
                            )}
                          </div>

                          {/* Active Indicator */}
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-white shadow-lg"
                            />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* User Profile Section */}
              <div className="p-4 border-t-2 border-purple-100 bg-white/30 backdrop-blur-sm">
                {isLoading ? (
                  <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                ) : currentUser ? (
                  <div className="space-y-3">
                    {/* User Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-4 border-2 border-purple-200 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12 border-2 border-violet-300 shadow-md ring-4 ring-violet-100">
                          {currentUser.picture ? (
                            <img src={currentUser.picture} alt={currentUser.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-lg">
                              {currentUser.full_name?.substring(0, 2).toUpperCase() || currentUser.email?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">
                            {currentUser.full_name || currentUser.email}
                          </p>
                          <p className="text-xs text-slate-500 truncate font-medium">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                      
                      {/* Plan Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={'w-2.5 h-2.5 rounded-full shadow-sm ' + (organizationData?.org?.subscription_status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse')}>
                        </div>
                        <span className="text-xs font-black text-slate-700">
                          {organizationData?.plan?.name || 'חבילת בסיס'}
                        </span>
                        {organizationData?.org?.subscription_status === 'active' && (
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                      
                      {/* Org Info */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600 truncate max-w-[140px]">
                          {organizationData?.org?.name || 'העסק שלי'}
                        </span>
                        <Badge className={'text-[10px] px-2 py-0.5 font-bold ' + (organizationData?.org?.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                          {organizationData?.org?.subscription_status === 'active' ? 'פעיל' : 'ניסיון'}
                        </Badge>
                      </div>
                    </motion.div>

                    {/* Upgrade CTA */}
                    {organizationData?.org?.subscription_status !== 'active' && (
                      <Link to={createPageUrl('Settings')}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gradient-to-r from-violet-500 via-purple-600 to-pink-600 animate-shimmer rounded-2xl p-4 text-white shadow-2xl hover:shadow-3xl transition-all cursor-pointer border-2 border-white/20"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm font-black">שדרג לפרימיום</p>
                            <Sparkles className="w-4 h-4 ml-auto animate-pulse" />
                          </div>
                          <p className="text-xs text-white/90 leading-tight font-semibold">
                            קבל גישה לכל התכונות המתקדמות והכלים המקצועיים
                          </p>
                        </motion.div>
                      </Link>
                    )}

                    {/* Logout Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all rounded-xl font-bold"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>התנתקות</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-600 hover:text-violet-600 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-all font-bold"
                    onClick={handleLogin}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>התחברות</span>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className={'min-h-screen flex flex-col ' + (showSidebar ? 'lg:mr-72 pt-16 lg:pt-0' : 'pt-16')}>
        <div className={'flex-1 ' + (showSidebar ? 'p-4 md:p-8' : '')}>
          {showSidebar && <Breadcrumbs currentPageName={currentPageName} />}
          {children}
        </div>
        <Footer />
      </main>

      <StudentLoginDialog open={studentLoginOpen} onClose={() => setStudentLoginOpen(false)} />
    </div>
  );
}
