import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "693824c5c1ad33c1f114ebd2", 
  requiresAuth: true // Ensure authentication is required for all operations
});
