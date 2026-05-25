import { apiClient } from './api';
import { FavoriteTeam, NotificationPreference, Notification, ContentArticle } from '@/types';

export const favoriteService = {
  async addFavorite(teamId: number): Promise<FavoriteTeam> {
    return apiClient.post<FavoriteTeam>('/favorites', { teamId });
  },

  async removeFavorite(teamId: number): Promise<void> {
    return apiClient.delete(`/favorites/${teamId}`);
  },

  async getUserFavorites(): Promise<FavoriteTeam[]> {
    return apiClient.get<FavoriteTeam[]>('/favorites');
  },

  async isFavorite(teamId: number): Promise<boolean> {
    try {
      await apiClient.get(`/favorites/${teamId}`);
      return true;
    } catch {
      return false;
    }
  },
};

export const notificationService = {
  async getNotifications(limit?: number): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications', { limit });
  },

  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.put(`/notifications/${notificationId}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.put('/notifications/read-all', {});
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  async getPreferences(): Promise<NotificationPreference> {
    return apiClient.get<NotificationPreference>('/notifications/preferences');
  },

  async updatePreferences(preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return apiClient.put<NotificationPreference>('/notifications/preferences', preferences);
  },

  async subscribePush(subscription: PushSubscription): Promise<void> {
    return apiClient.post('/notifications/subscribe-push', subscription);
  },
};

export const contentService = {
  async getArticles(params?: {
    type?: string;
    language?: string;
    teamId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<ContentArticle[]> {
    return apiClient.get<ContentArticle[]>('/content/articles', params);
  },

  async getArticle(articleId: string): Promise<ContentArticle> {
    return apiClient.get<ContentArticle>(`/content/articles/${articleId}`);
  },

  async getTeamProfile(teamId: number, language?: string): Promise<ContentArticle> {
    return apiClient.get<ContentArticle>(`/content/team/${teamId}`, { language });
  },

  async getNewsForFavorites(language?: string): Promise<ContentArticle[]> {
    return apiClient.get<ContentArticle[]>('/content/favorites-news', { language });
  },

  async searchArticles(query: string, language?: string): Promise<ContentArticle[]> {
    return apiClient.get<ContentArticle[]>('/content/search', { q: query, language });
  },
};

export const systemService = {
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return apiClient.get('/health');
  },

  async getConfig(): Promise<any> {
    return apiClient.get('/config');
  },
};

export default {
  favoriteService,
  notificationService,
  contentService,
  systemService,
};
