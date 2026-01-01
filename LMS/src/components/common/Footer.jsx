import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { HelpCircle, Phone, MessageCircle, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function Footer() {
  const { data: appSettings } = useQuery({ 
    queryKey: ['footer_wa_status'], 
    queryFn: () => base44.entities.AppSetting.list(),
    refetchInterval: 15000
  });
  
  const waStatus = appSettings?.find(s => s.key === 'whatsapp_status')?.value || 'DISCONNECTED';

  return (
    <footer className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 border-t border-slate-200/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        {/* שורה 1: פעולות + סטטוס + מידע */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
          {/* צד ימין: כפתורי פעולה */}
          <div className="flex items-center gap-3 order-2 lg:order-1">
            <a 
              href="https://bdnhost.net/edumanage/user-guide.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-violet-50 border border-violet-200 text-violet-700 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
            >
              <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-medium">מרכז עזרה</span>
            </a>
            
            <a 
              href="https://wa.me/972544995151" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-green-50 border border-green-200 text-green-700 rounded-full transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <Phone className="w-3.5 h-3.5" />
              <span className="text-sm font-bold">05-44-99-51-51</span>
            </a>
          </div>

          {/* מרכז: לוגו + מידע */}
          <div className="flex items-center gap-3 order-1 lg:order-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-black text-slate-700">
                <a href="https://edu-manage.org/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                  EduManage
                </a>
              </span>
            </div>
            
            <span className="text-xs text-slate-400 hidden md:inline">•</span>
            
            <span className="text-xs text-slate-500 font-medium hidden md:inline">מערכת לניהול פדגוגי</span>
          </div>

          {/* צד שמאל: סטטוס WhatsApp */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm order-3">
            <MessageCircle className={`w-3.5 h-3.5 ${waStatus === 'CONNECTED' ? 'text-green-500' : 'text-slate-400'}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${waStatus === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className={`text-xs font-medium ${waStatus === 'CONNECTED' ? 'text-green-600' : 'text-slate-400'}`}>
              {waStatus === 'CONNECTED' ? 'מחובר' : 'מנותק'}
            </span>
          </div>
        </div>

        {/* שורה 2: קרדיטים + קישורים משפטיים */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/50">
          {/* קרדיטים */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()}</span>
            <span className="text-slate-300">•</span>
            <a 
              href="https://bdnhost.net/edumanage/bdtechAcademy.html" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              BD TechAcademy
            </a>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <a 
              href="https://bdnhost.net/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-indigo-600 transition-colors font-medium hidden sm:inline"
            >
              BDNHOST
            </a>
          </div>

          {/* קישורים משפטיים */}
          <div className="flex items-center gap-4 text-xs">
            <Link 
              to={createPageUrl('Terms')} 
              className="text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              תנאי שימוש
            </Link>
            <span className="text-slate-300">•</span>
            <Link 
              to={createPageUrl('Privacy')} 
              className="text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
              מדיניות פרטיות
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}