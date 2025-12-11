import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import {
  ClientSecretCredential,
  ChainedTokenCredential,
  ManagedIdentityCredential,
} from '@azure/identity';

/**
 * Microsoft Graph Client
 * Handles authentication and provides base API access
 * Supports both Client Secret and Managed Identity authentication
 */
export class GraphClient {
  private client: Client;

  constructor(tenantId: string, clientId: string, clientSecret?: string) {
    // Use Client Secret if provided, otherwise use Managed Identity
    const creds = clientSecret
      ? new ClientSecretCredential(tenantId, clientId, clientSecret)
      : new ChainedTokenCredential(
          new ManagedIdentityCredential(),
          new ManagedIdentityCredential(clientId)
        );

    const authProvider = new TokenCredentialAuthenticationProvider(creds, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    this.client = Client.initWithMiddleware({
      authProvider,
    });
  }

  /**
   * Get Graph API client for making requests
   */
  api(path: string) {
    return this.client.api(path);
  }

  /**
   * Get the underlying client (for advanced usage)
   */
  getClient(): Client {
    return this.client;
  }
}

