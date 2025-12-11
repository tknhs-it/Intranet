import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

const COMPASS_BASE_URL = process.env.COMPASS_BASE_URL || 'https://nossal-hs.compass.education';
const COMPASS_USERNAME = process.env.COMPASS_USERNAME;
const COMPASS_PASSWORD = process.env.COMPASS_PASSWORD;

interface CompassSession {
  cookies: string[];
  sessionId?: string;
  cpssid?: string;
  cpsdid?: string;
  cfClearance?: string;
  cfBm?: string;
}

interface CompassEvent {
  EventId: number;
  ActivityId: number;
  UserId: number;
  Date: string;
  StartTime: string;
  EndTime: string;
  Room?: string;
  EventType: string;
  ClassName?: string;
  Subject?: string;
  IsReplacement: boolean;
  ReplacementTeacher?: string;
  Title?: string;
  Description?: string;
}

interface CompassStaff {
  UserId: number;
  FirstName: string;
  LastName: string;
  Roles: string[];
  Departments?: string[];
  PhotoUrl?: string;
  Email?: string;
}

interface CompassLearningTask {
  TaskId: number;
  ClassCode: string;
  Teacher: string;
  Title: string;
  DueDate: string;
  Attachments: any[];
  Section?: string;
}

interface CompassFeedItem {
  FeedItemId: number;
  Title: string;
  Content: string;
  CreatedDate: string;
  Author?: string;
  Category?: string;
}

class CompassService {
  private session: CompassSession | null = null;
  private api: AxiosInstance;
  private lastAuthTime: Date | null = null;
  private readonly AUTH_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.api = axios.create({
      baseURL: COMPASS_BASE_URL,
      withCredentials: true,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Compass uses self-signed certs sometimes
      }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor to add cookies to requests
    this.api.interceptors.request.use((config) => {
      if (this.session?.cookies) {
        config.headers.Cookie = this.session.cookies.join('; ');
      }
      return config;
    });
  }

  /**
   * Authenticate with Compass and capture session cookies
   * Compass uses ASP.NET session cookies, not OAuth
   */
  private async authenticate(): Promise<void> {
    if (this.session && this.lastAuthTime) {
      const timeSinceAuth = Date.now() - this.lastAuthTime.getTime();
      if (timeSinceAuth < this.AUTH_REFRESH_INTERVAL) {
        return; // Session still valid
      }
    }

    if (!COMPASS_USERNAME || !COMPASS_PASSWORD) {
      throw new Error('Compass credentials not configured');
    }

    try {
      // Step 1: Get login page to capture initial cookies
      const loginPageResponse = await axios.get(`${COMPASS_BASE_URL}/login`, {
        withCredentials: true,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      const initialCookies = loginPageResponse.headers['set-cookie'] || [];

      // Step 2: POST to login endpoint
      // Note: Compass login endpoint structure may vary - this is a template
      const loginResponse = await axios.post(
        `${COMPASS_BASE_URL}/login`,
        new URLSearchParams({
          username: COMPASS_USERNAME,
          password: COMPASS_PASSWORD,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': initialCookies.join('; '),
          },
          withCredentials: true,
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          maxRedirects: 0,
          validateStatus: (status) => status < 400,
        }
      );

      // Extract all cookies from response
      const allCookies = loginResponse.headers['set-cookie'] || [];
      const cookieStrings = allCookies.map((cookie: string) => cookie.split(';')[0]);

      // Parse important cookies
      const sessionId = cookieStrings.find(c => c.startsWith('ASP.NET_SessionId='));
      const cpssid = cookieStrings.find(c => c.startsWith('cpssid_'));
      const cpsdid = cookieStrings.find(c => c.startsWith('cpsdid='));
      const cfClearance = cookieStrings.find(c => c.startsWith('cf_clearance='));
      const cfBm = cookieStrings.find(c => c.startsWith('__cf_bm='));

      this.session = {
        cookies: cookieStrings,
        sessionId: sessionId?.split('=')[1],
        cpssid: cpssid?.split('=')[1],
        cpsdid: cpsdid?.split('=')[1],
        cfClearance: cfClearance?.split('=')[1],
        cfBm: cfBm?.split('=')[1],
      };

      this.lastAuthTime = new Date();
    } catch (error: any) {
      console.error('Compass authentication error:', error.message);
      throw new Error(`Failed to authenticate with Compass: ${error.message}`);
    }
  }

  /**
   * Get timetable events for a user
   * POST /Services/Calendar.svc/GetEventsByUser
   */
  async getEventsByUser(userId: number, startDate: string, endDate: string): Promise<CompassEvent[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/Calendar.svc/GetEventsByUser', {
        userId,
        startDate,
        endDate,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching Compass events:', error.message);
      throw error;
    }
  }

  /**
   * Get calendar events for homepage feed
   * POST /Services/Calendar.svc/GetCalendarEventsByUser
   */
  async getCalendarEventsByUser(
    userId: number,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 25
  ): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/Calendar.svc/GetCalendarEventsByUser', {
        userId,
        homePage: true,
        startDate,
        endDate,
        page,
        start: (page - 1) * limit,
        limit,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching calendar events:', error.message);
      throw error;
    }
  }

  /**
   * Get period structure / bell times
   * POST /Services/Calendar.svc/GetPeriodsByTimePeriod
   */
  async getPeriodsByTimePeriod(startDate: string, endDate: string): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/Calendar.svc/GetPeriodsByTimePeriod', {
        startDate,
        endDate,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching periods:', error.message);
      throw error;
    }
  }

  /**
   * Get all staff
   * POST /Services/ChronicleV2.svc/GetStaff
   */
  async getStaff(): Promise<CompassStaff[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/ChronicleV2.svc/GetStaff', {});

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching staff:', error.message);
      throw error;
    }
  }

  /**
   * Get staff summary by user ID
   * POST /Services/ChronicleV2.svc/GetSummaryByUserId
   */
  async getSummaryByUserId(userId: number): Promise<CompassStaff> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/ChronicleV2.svc/GetSummaryByUserId', {
        userId,
      });

      return response.data.d || response.data;
    } catch (error: any) {
      console.error('Error fetching staff summary:', error.message);
      throw error;
    }
  }

  /**
   * Get class teacher details by student
   * POST /Services/ChronicleV2.svc/GetClassTeacherDetailsByStudent
   */
  async getClassTeacherDetailsByStudent(studentId: number): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/ChronicleV2.svc/GetClassTeacherDetailsByStudent', {
        studentId,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching class teacher details:', error.message);
      throw error;
    }
  }

  /**
   * Get user details blob (full profile)
   * POST /Services/User.svc/GetUserDetailsBlobByUserId
   */
  async getUserDetailsBlobByUserId(userId: number): Promise<any> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/User.svc/GetUserDetailsBlobByUserId', {
        userId,
      });

      return response.data.d || response.data;
    } catch (error: any) {
      console.error('Error fetching user details:', error.message);
      throw error;
    }
  }

  /**
   * Get learning tasks / assessments
   * POST /Services/LearningTasks.svc/GetTaskItems
   */
  async getTaskItems(page: number = 1, limit: number = 25): Promise<CompassLearningTask[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/LearningTasks.svc/GetTaskItems', {
        page,
        start: (page - 1) * limit,
        limit,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching learning tasks:', error.message);
      throw error;
    }
  }

  /**
   * Get feed items (notices, alerts)
   * POST /Services/Feed.svc/GetFeedItems
   */
  async getFeedItems(page: number = 1, limit: number = 25): Promise<CompassFeedItem[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/Feed.svc/GetFeedItems', {
        page,
        start: (page - 1) * limit,
        limit,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching feed items:', error.message);
      throw error;
    }
  }

  /**
   * Get relevant banners
   * POST /Services/Feed.svc/GetRelevantBanners
   */
  async getRelevantBanners(): Promise<any[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/Feed.svc/GetRelevantBanners', {
        page: 1,
        start: 0,
        limit: 25,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching banners:', error.message);
      throw error;
    }
  }

  /**
   * Get my alerts
   * POST /Services/Feed.svc/GetMyAlerts
   */
  async getMyAlerts(): Promise<any[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/Feed.svc/GetMyAlerts', {
        page: 1,
        start: 0,
        limit: 25,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching alerts:', error.message);
      throw error;
    }
  }

  /**
   * Get all campuses
   * GET /Services/ReferenceDataCache.svc/GetAllCampuses
   */
  async getAllCampuses(): Promise<any[]> {
    await this.authenticate();

    try {
      const response = await this.api.get('/Services/ReferenceDataCache.svc/GetAllCampuses');

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching campuses:', error.message);
      throw error;
    }
  }

  /**
   * Get all terms
   * GET /Services/ReferenceDataCache.svc/GetAllTerms
   */
  async getAllTerms(): Promise<any[]> {
    await this.authenticate();

    try {
      const response = await this.api.get('/Services/ReferenceDataCache.svc/GetAllTerms');

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching terms:', error.message);
      throw error;
    }
  }

  /**
   * Get active categories
   * POST /Services/ReferenceDataCache.svc/GetActiveCategories
   */
  async getActiveCategories(): Promise<any[]> {
    await this.authenticate();

    try {
      const response = await this.api.post('/Services/ReferenceDataCache.svc/GetActiveCategories', {
        page: 1,
        start: 0,
        limit: 100,
      });

      return response.data.d || response.data || [];
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }
  }

  /**
   * Transform Compass events to dashboard format
   */
  transformEventsToDashboard(events: CompassEvent[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.Date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });

    return {
      classes: todayEvents
        .filter(e => e.EventType === 'Class')
        .map(e => ({
          name: e.ClassName || '',
          subject: e.Subject || '',
          room: e.Room || '',
          startTime: e.StartTime,
          endTime: e.EndTime,
          isReplacement: e.IsReplacement,
          replacementTeacher: e.ReplacementTeacher,
        })),
      roomChanges: todayEvents.filter(e => e.EventType === 'RoomChange'),
      yardDuty: todayEvents.filter(e => e.EventType === 'Duty' || e.EventType === 'YardDuty'),
      meetings: todayEvents.filter(e => e.EventType === 'Meeting' || e.EventType === 'PD'),
      replacements: todayEvents.filter(e => e.IsReplacement),
    };
  }
}

export default new CompassService();
