import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "691f5c690e2a2f8fef3cb215", 
  requiresAuth: true // Ensure authentication is required for all operations
});
