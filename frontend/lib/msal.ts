import { PublicClientApplication, Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL Configuration
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || ''}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

/**
 * Login request configuration
 * IMPORTANT: The scope must match the backend API app ID
 * Format: api://<backend-app-id>/access_as_user
 */
export const loginRequest = {
  scopes: [
    process.env.NEXT_PUBLIC_AZURE_API_SCOPE || 'api://d8ecaa47-a809-4a7d-b494-d66301d005c4/access_as_user',
    'User.Read',
  ],
};

/**
 * MSAL instance
 */
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
if (typeof window !== 'undefined') {
  msalInstance.initialize().then(() => {
    // Handle redirect response
    msalInstance.handleRedirectPromise().then((response) => {
      if (response) {
        console.log('Login successful:', response);
      }
    });
  });
}

