/**
 * Microsoft Graph API Type Definitions
 */

export interface GraphUser {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

export interface GraphTeam {
  id: string;
  displayName: string;
  description?: string;
  visibility: string;
  webUrl: string;
}

export interface GraphChannel {
  id: string;
  displayName: string;
  description?: string;
  membershipType: string;
}

export interface GraphPresence {
  id: string;
  availability: 'Available' | 'Away' | 'Busy' | 'DoNotDisturb' | 'Offline' | 'PresenceUnknown';
  activity: string;
}

export interface GraphCalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  isAllDay: boolean;
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
}

export interface GraphDriveItem {
  id: string;
  name: string;
  webUrl: string;
  size?: number;
  lastModifiedDateTime: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
    hashes?: {
      sha1Hash: string;
    };
  };
}

export interface GraphSite {
  id: string;
  displayName: string;
  webUrl: string;
  description?: string;
}

