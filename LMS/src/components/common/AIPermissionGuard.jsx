import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * AIPermissionGuard - רכיב לבדיקת הרשאות AI והצגת כפתורים מוגבלים
 * 
 * @param {string} requiredLevel - רמת ההרשאה הנדרשת: "basic", "standard", "premium"
 * @param {string} featureName - שם התכונה להצגה למשתמש
 * @param {ReactNode} children - הרכיב שיוצג אם יש הרשאה
 * @param {string} upgradeMessage - הודעה מותאמת אישית לשדרוג
 */
export function AIPermissionGuard({ 
    requiredLevel, 
    featureName = 'כלי AI',
    children,
    upgradeMessage,
    className 
}) {
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            try {
                return await base44.auth.me();
            } catch {
                return null;
            }
        }
    });

    const { data: planData } = useQuery({
        queryKey: ['userPlanPermissions', currentUser?.organization_id],
        queryFn: async () => {
            if (!currentUser?.organization_id) return null;
            
            try {
                const org = await base44.entities.Organization.get(currentUser.organization_id);
                if (!org?.plan_id) return null;
                
                const plans = await base44.entities.SubscriptionPlan.list();
                const plan = plans.find(p => p.id === org.plan_id);
                return plan;
            } catch (e) {
                console.error("Error fetching plan:", e);
                return null;
            }
        },
        enabled: !!currentUser
    });

    // בדיקת רמת הרשאה
    const hasPermission = React.useMemo(() => {
        if (!planData?.permissions?.ai_tools) return false;
        
        const userLevel = planData.permissions.ai_tools;
        const levels = ['none', 'basic', 'standard', 'premium'];
        const userLevelIndex = levels.indexOf(userLevel);
        const requiredLevelIndex = levels.indexOf(requiredLevel);
        
        return userLevelIndex >= requiredLevelIndex;
    }, [planData, requiredLevel]);

    // הודעות שדרוג לפי רמה
    const getUpgradeMessage = () => {
        if (upgradeMessage) return upgradeMessage;
        
        switch (requiredLevel) {
            case 'basic':
                return 'זמין בחבילת פרו ומעלה';
            case 'standard':
                return 'זמין בחבילת פרו - כולל יצירת אודיו ותמונות';
            case 'premium':
                return 'זמין בחבילת פרימיום - כולל שיבוט קול אישי';
            default:
                return 'זמין בחבילות מתקדמות';
        }
    };

    const getPlanBadge = () => {
        switch (requiredLevel) {
            case 'premium':
                return { icon: Crown, text: 'פרימיום', color: 'from-amber-500 to-orange-500' };
            case 'standard':
                return { icon: Sparkles, text: 'פרו', color: 'from-violet-500 to-purple-500' };
            case 'basic':
                return { icon: Sparkles, text: 'פרו', color: 'from-blue-500 to-indigo-500' };
            default:
                return { icon: Lock, text: 'מוגבל', color: 'from-slate-500 to-slate-600' };
        }
    };

    if (hasPermission) {
        return <>{children}</>;
    }

    // תצוגה למשתמשים ללא הרשאה
    const badge = getPlanBadge();
    const BadgeIcon = badge.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("relative", className)}>
                        {React.cloneElement(children, {
                            disabled: true,
                            className: cn(
                                children.props.className,
                                "opacity-60 cursor-not-allowed relative overflow-hidden"
                            )
                        })}
                        <div className="absolute top-1 left-1 z-10">
                            <div className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg",
                                "bg-gradient-to-r flex items-center gap-1",
                                badge.color
                            )}>
                                <BadgeIcon className="w-3 h-3" />
                                {badge.text}
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" dir="rtl">
                    <div className="text-center space-y-2">
                        <div className="font-semibold flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            {featureName}
                        </div>
                        <div className="text-sm text-slate-600">
                            {getUpgradeMessage()}
                        </div>
                        <Button
                            size="sm"
                            className={cn(
                                "w-full bg-gradient-to-r text-white shadow-md",
                                badge.color
                            )}
                            onClick={() => window.location.href = '/Settings?tab=billing'}
                        >
                            שדרג עכשיו
                        </Button>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * useAIPermission - Hook לבדיקת הרשאות AI
 */
export function useAIPermission() {
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            try {
                return await base44.auth.me();
            } catch {
                return null;
            }
        }
    });

    const { data: planData } = useQuery({
        queryKey: ['userPlanPermissions', currentUser?.organization_id],
        queryFn: async () => {
            if (!currentUser?.organization_id) return null;
            
            try {
                const org = await base44.entities.Organization.get(currentUser.organization_id);
                if (!org?.plan_id) return null;
                
                const plans = await base44.entities.SubscriptionPlan.list();
                const plan = plans.find(p => p.id === org.plan_id);
                return plan;
            } catch (e) {
                console.error("Error fetching plan:", e);
                return null;
            }
        },
        enabled: !!currentUser
    });

    const checkPermission = React.useCallback((requiredLevel) => {
        if (!planData?.permissions?.ai_tools) return false;
        
        let userLevel = planData.permissions.ai_tools;
        
        // Legacy support: map "advanced" to "premium"
        if (userLevel === 'advanced') userLevel = 'premium';
        
        const levels = ['none', 'basic', 'standard', 'premium'];
        const userLevelIndex = levels.indexOf(userLevel);
        const requiredLevelIndex = levels.indexOf(requiredLevel);
        
        return userLevelIndex >= requiredLevelIndex;
    }, [planData]);

    return {
        hasBasicAI: checkPermission('basic'),
        hasStandardAI: checkPermission('standard'),
        hasPremiumAI: checkPermission('premium'),
        aiLevel: planData?.permissions?.ai_tools || 'none',
        checkPermission,
        isLoading: !planData && !!currentUser
    };
}