import { base44 } from '@/api/base44Client';

// Feature Constants
export const FEATURES = {
  WHATSAPP: 'whatsapp',
  AI_TOOLS: 'ai_tools',
  ZOOM: 'zoom',
  BRANDING: 'branding',
  BULK_OPERATIONS: 'bulk_operations'
};

// Permission Levels
export const PERMISSIONS = {
  NONE: 'none',
  READ_ONLY: 'read_only',
  BASIC: 'basic',
  ADVANCED: 'advanced',
  FULL: 'full',
  MANUAL: 'manual',
  AUTO_SYNC: 'auto_sync'
};

/**
 * Check if an organization has access to a specific feature
 * @param {Object} plan - The subscription plan object
 * @param {String} feature - The feature key (from FEATURES)
 * @param {String|Boolean} requiredLevel - The required level or true for boolean features
 * @returns {Boolean}
 */
export const hasFeatureAccess = (plan, feature, requiredLevel = true) => {
  if (!plan) return false;
  
  // Fallback for legacy plans without permissions object
  if (!plan.permissions) {
    const planName = plan.name?.toLowerCase() || '';
    
    // Pro/Premium/Admin get full access to everything
    if (planName.includes('פרו') || planName.includes('pro') || planName.includes('premium') || planName.includes('פרימיום') || planName.includes('admin')) {
      return true;
    }
    
    // Advanced plans - use DEFAULT_PLAN_PERMISSIONS
    if (planName.includes('מתקדם') || planName.includes('advanced')) {
      const defaultPerms = DEFAULT_PLAN_PERMISSIONS['מתקדם'];
      const permission = defaultPerms[feature];
      
      if (typeof permission === 'boolean') return permission;
      if (typeof permission === 'string') {
        if (permission === 'none') return false;
        
        const hierarchy = {
          'none': 0,
          'read_only': 1,
          'manual': 1,
          'basic': 2,
          'standard': 2,
          'advanced': 3,
          'auto_sync': 3,
          'premium': 4,
          'full': 4
        };
        
        const userLevel = hierarchy[permission] || 0;
        const requiredLevelNum = hierarchy[String(requiredLevel).toLowerCase()] || 0;
        return userLevel >= requiredLevelNum;
      }
    }
    
    // Basic plan has no advanced features
    return false; 
  }

  const permission = plan.permissions[feature];

  if (typeof permission === 'boolean') {
    return permission === true;
  }

  if (typeof permission === 'string') {
    if (permission === PERMISSIONS.NONE) return false;
    
    // Define permission hierarchy
    const hierarchy = {
      'none': 0,
      'read_only': 1,
      'manual': 1,
      'basic': 2,
      'standard': 2,
      'advanced': 3,
      'auto_sync': 3,
      'premium': 4,
      'full': 4
    };
    
    const userLevel = hierarchy[permission] || 0;
    const requiredLevelNum = hierarchy[requiredLevel] || 0;
    
    return userLevel >= requiredLevelNum;
  }

  return false;
};

// Default permissions for plans (fallback)
export const DEFAULT_PLAN_PERMISSIONS = {
  'בסיסי': {
    whatsapp: 'none',
    ai_tools: 'none',
    zoom: 'manual',
    branding: false,
    bulk_operations: false
  },
  'מתקדם': {
    whatsapp: 'read_only',
    ai_tools: 'standard',
    zoom: 'auto_sync',
    branding: true,
    bulk_operations: true
  },
  'פרו': {
    whatsapp: 'full',
    ai_tools: 'premium',
    zoom: 'auto_sync',
    branding: true,
    bulk_operations: true
  }
};