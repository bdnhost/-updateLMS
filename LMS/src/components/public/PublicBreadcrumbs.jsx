import React from 'react';
import { ChevronRight, Home, Building } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PublicBreadcrumbs({ resource }) {
  if (!resource) return null;

  const breadcrumbs = [];

  // 1. Root: Organization Name (with link if organization_id exists)
  breadcrumbs.push({
    label: resource.organization_name || 'EduManage',
    icon: Building,
    isRoot: true,
    href: resource.organization_id ? `${window.location.pathname}?type=organization&id=${resource.organization_id}` : null
  });

  // 2. Course Level (if exists and not the course page itself, usually)
  // Actually, if it IS the course page, we want it as the last item.
  // If it's a resource INSIDE a course, we want the course as a clickable link.
  
  if (resource.type === 'course') {
      // Current page is the course
      breadcrumbs.push({
          label: resource.name,
          current: true
      });
  } else if (resource.course_id && resource.course_name) {
      // Resource belongs to a course
      breadcrumbs.push({
          label: resource.course_name,
          href: `${window.location.pathname}?type=course&id=${resource.course_id}`
      });

      // 3. Session Level (if applicable)
      if (resource.session_id && resource.session_title) {
          breadcrumbs.push({
              label: resource.session_title,
              href: `${window.location.pathname}?type=session&id=${resource.session_id}`
          });
      }
      
      // 3.5 Assignment Level (if applicable for materials)
      if (resource.type === 'Material' && resource.linked_assignments && resource.linked_assignments.length > 0) {
          const assignment = resource.linked_assignments[0];
          breadcrumbs.push({
              label: assignment.title,
              href: `${window.location.pathname}?type=assignment&id=${assignment.id}`
          });
      }
      
      // 4. Current Resource Level
      breadcrumbs.push({
          label: resource.title || resource.name || resource.full_name || 'פריט',
          current: true
      });
  } else {
      // Resource without a course context (e.g. orphan student profile or generic page)
      breadcrumbs.push({
          label: resource.title || resource.name || resource.full_name || 'פריט',
          current: true
      });
  }

  return (
    <nav className="flex items-center text-sm text-slate-500 overflow-x-auto whitespace-nowrap no-scrollbar" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => {
          const Icon = crumb.icon;
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />}
              
              {crumb.current ? (
                <span className="font-medium text-slate-800 flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-slate-200 shadow-sm">
                   {Icon && <Icon className="w-3.5 h-3.5" />}
                   {crumb.label}
                </span>
              ) : crumb.href ? (
                <a 
                  href={crumb.href}
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 hover:bg-indigo-50 px-2 py-1 rounded-md"
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {crumb.label}
                </a>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-600">
                   {Icon && <Icon className="w-3.5 h-3.5" />}
                   {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}