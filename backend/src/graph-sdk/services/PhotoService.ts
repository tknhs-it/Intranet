import { GraphClient } from '../GraphClient';

/**
 * Photo Service
 * Handles user photo operations
 */
export class PhotoService {
  constructor(private graph: GraphClient) {}

  /**
   * Get user photo as Buffer
   */
  async getUserPhoto(userId: string): Promise<Buffer | null> {
    try {
      const photo = await this.graph
        .api(`/users/${userId}/photo/$value`)
        .responseType('arraybuffer')
        .get();

      return Buffer.from(photo);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null; // No photo available
      }
      throw error;
    }
  }

  /**
   * Get user photo as base64 data URL
   */
  async getUserPhotoDataUrl(userId: string): Promise<string | null> {
    try {
      const photo = await this.getUserPhoto(userId);
      if (!photo) return null;

      const base64 = photo.toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user has a photo
   */
  async hasPhoto(userId: string): Promise<boolean> {
    try {
      await this.graph.api(`/users/${userId}/photo`).get();
      return true;
    } catch (error: any) {
      return false;
    }
  }
}

