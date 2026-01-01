import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

const routeConfig = {
  'Dashboard': { label: 'דשבורד', parent: null },
  'Courses': { label: 'קורסים', parent: 'Dashboard' },
  'CourseProfile': { label: 'פרופיל קורס', parent: 'Courses' },
  'Students': { label: 'תלמידים', parent: 'Dashboard' },
  'StudentProfile': { label: 'פרופיל תלמיד', parent: 'Students' },
  'Assignments': { label: 'מטלות', parent: 'Dashboard' },
  'AssignmentProfile': { label: 'פרופיל מטלה', parent: 'Assignments' },
  'Attendance': { label: 'נוכחות', parent: 'Dashboard' },
  'QRAttendance': { label: 'נוכחות QR', parent: 'Attendance' },
  'Calendar': { label: 'לוח שנה', parent: 'Dashboard' },
  'Materials': { label: 'חומרי לימוד', parent: 'Dashboard' },
  'Announcements': { label: 'הכרזות', parent: 'Dashboard' },
  'Messages': { label: 'הודעות', parent: 'Dashboard' },
  'AdminDashboard': { label: 'ניהול מערכת', parent: 'Dashboard' },
  'Settings': { label: 'הגדרות', parent: 'Dashboard' },
  'PublicView': { label: 'צפייה ציבורית', parent: null },
};

export default function Breadcrumbs({ currentPageName }) {
  const location = useLocation();
  
  // Build breadcrumbs path based on parent hierarchy
  const getBreadcrumbs = (pageName) => {
    const crumbs = [];
    let current = pageName;
    
    while (current && routeConfig[current]) {
      crumbs.unshift({ 
        name: current, 
        label: routeConfig[current].label,
        path: createPageUrl(current)
      });
      current = routeConfig[current].parent;
    }
    
    // Always add Home if not present and not explicit root
    if (crumbs.length > 0 && crumbs[0].name !== 'Dashboard' && routeConfig[crumbs[0].name]?.parent !== null) {
       crumbs.unshift({ 
        name: 'Dashboard', 
        label: 'בית',
        path: createPageUrl('Dashboard')
      });
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs(currentPageName);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center text-sm text-slate-500 mb-4 overflow-x-auto whitespace-nowrap pb-2" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.name} className="flex items-center">
              {index > 0 && <ChevronLeft className="w-4 h-4 mx-1 text-slate-400 rtl:rotate-180" />}
              {isLast ? (
                <span className="font-medium text-slate-800 flex items-center gap-1">
                   {index === 0 && <Home className="w-3 h-3" />}
                   {crumb.label}
                </span>
              ) : (
                <Link 
                  to={crumb.path}
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="w-3 h-3" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}