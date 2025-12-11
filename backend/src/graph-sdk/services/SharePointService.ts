import { GraphClient } from '../GraphClient';
import { GraphSite, GraphDriveItem } from '../types/GraphTypes';

/**
 * SharePoint Service
 * Handles SharePoint and OneDrive operations
 */
export class SharePointService {
  constructor(private graph: GraphClient) {}

  /**
   * List SharePoint sites
   */
  async listSites(search?: string): Promise<GraphSite[]> {
    const query = search ? `?search=${search}` : '?search=*';
    const response = await this.graph.api(`/sites${query}`).get();
    return response.value || [];
  }

  /**
   * Get site by ID
   */
  async getSite(siteId: string): Promise<GraphSite> {
    const response = await this.graph.api(`/sites/${siteId}`).get();
    return response as GraphSite;
  }

  /**
   * List drive root items
   */
  async listDriveRoot(siteId: string): Promise<GraphDriveItem[]> {
    const response = await this.graph.api(`/sites/${siteId}/drive/root/children`).get();
    return response.value || [];
  }

  /**
   * Get drive item children
   */
  async getDriveItemChildren(siteId: string, itemId: string): Promise<GraphDriveItem[]> {
    const response = await this.graph
      .api(`/sites/${siteId}/drive/items/${itemId}/children`)
      .get();

    return response.value || [];
  }

  /**
   * Get drive item by path
   */
  async getDriveItemByPath(siteId: string, path: string): Promise<GraphDriveItem> {
    const encodedPath = encodeURIComponent(path);
    const response = await this.graph
      .api(`/sites/${siteId}/drive/root:/${encodedPath}`)
      .get();

    return response as GraphDriveItem;
  }

  /**
   * List children by path
   */
  async listChildrenByPath(siteId: string, path: string): Promise<GraphDriveItem[]> {
    const encodedPath = encodeURIComponent(path);
    const response = await this.graph
      .api(`/sites/${siteId}/drive/root:/${encodedPath}:/children`)
      .get();

    return response.value || [];
  }

  /**
   * Get file content
   */
  async getFileContent(siteId: string, itemId: string): Promise<Buffer> {
    const content = await this.graph
      .api(`/sites/${siteId}/drive/items/${itemId}/content`)
      .responseType('arraybuffer')
      .get();

    return Buffer.from(content);
  }
}

