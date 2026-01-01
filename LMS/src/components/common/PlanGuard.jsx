import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasFeatureAccess } from './planPermissions';
import { Link } from 'react-router-dom';

/**
 * A wrapper component that checks for plan permissions.
 * If access is granted, it renders the children.
 * If access is denied, it renders a fallback (lock state) or nothing.
 * 
 * @param {Object} plan - The user's subscription plan
 * @param {String} feature - The feature key to check
 * @param {String|Boolean} requiredLevel - The required permission level
 * @param {ReactNode} children - The content to protect
 * @param {Boolean} showFallback - Whether to show the lock UI or just hide content
 * @param {String} fallbackMessage - Custom message for the lock state
 */
export default function PlanGuard({ 
  plan, 
  feature, 
  requiredLevel = true, 
  children, 
  showFallback = true,
  fallbackMessage = "פיצ'ר זה זמין בחבילות מתקדמות בלבד"
}) {
  const hasAccess = hasFeatureAccess(plan, feature, requiredLevel);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showFallback) {
    return null;
  }

  return (
    <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
      <div className="bg-slate-100 p-3 rounded-full mb-3">
        <Lock className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-slate-900 font-medium mb-1">גישה מוגבלת</h3>
      <p className="text-sm text-slate-500 mb-4 max-w-xs">
        {fallbackMessage}
      </p>
      <Link to="/Settings?tab=billing">
        <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
          שדרג חבילה
        </Button>
      </Link>
    </div>
  );
}