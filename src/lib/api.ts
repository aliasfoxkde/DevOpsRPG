// API client for Cloudflare Workers backend

import type { ApiResponse, User, Progress, Achievement, LeaderboardEntry } from '@/types';

const API_BASE = '/api';

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API
export const authApi = {
  // Get current session
  async getSession(): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiFetch('/auth/session');
  },

  // Initiate OAuth login
  login(provider: 'google' | 'github'): void {
    window.location.href = `${API_BASE}/auth/${provider}`;
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    return apiFetch('/auth/logout', { method: 'POST' });
  },

  // Handle OAuth callback (called on callback page)
  async handleCallback(provider: 'google' | 'github', code: string): Promise<ApiResponse<{ user: User }>> {
    return apiFetch(`/auth/callback?provider=${provider}&code=${code}`);
  },
};

// User API
export const userApi = {
  async getProfile(): Promise<ApiResponse<User>> {
    return apiFetch('/user');
  },

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return apiFetch('/user', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getTheme(): Promise<ApiResponse<{ theme: string }>> {
    return apiFetch('/user/theme');
  },

  async setTheme(theme: string): Promise<ApiResponse<void>> {
    return apiFetch('/user/theme', {
      method: 'POST',
      body: JSON.stringify({ theme }),
    });
  },
};

// Progress API
export const progressApi = {
  async getAll(): Promise<ApiResponse<Progress[]>> {
    return apiFetch('/progress');
  },

  async getByTechnology(technology: string): Promise<ApiResponse<Progress[]>> {
    return apiFetch(`/progress/${technology}`);
  },

  async recordProgress(progress: Omit<Progress, 'id'>): Promise<ApiResponse<Progress>> {
    return apiFetch('/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  },

  async markComplete(
    technology: string,
    topic: string,
    xpEarned: number,
    timeSpent: number
  ): Promise<ApiResponse<{ progress: Progress; xpGained: number; leveledUp: boolean }>> {
    return apiFetch('/progress/complete', {
      method: 'POST',
      body: JSON.stringify({ technology, topic, xpEarned, timeSpent }),
    });
  },
};

// Achievements API
export const achievementsApi = {
  async getAll(): Promise<ApiResponse<Achievement[]>> {
    return apiFetch('/achievements');
  },

  async checkAndAward(): Promise<ApiResponse<{ newAchievements: Achievement[] }>> {
    return apiFetch('/achievements/check', { method: 'POST' });
  },
};

// Leaderboard API
export const leaderboardApi = {
  async getTop(limit = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    return apiFetch(`/leaderboard?limit=${limit}`);
  },

  async getRank(): Promise<ApiResponse<{ rank: number; total: number }>> {
    return apiFetch('/leaderboard/rank');
  },
};

// Streak API
export const streakApi = {
  async getStreak(): Promise<ApiResponse<{ streakDays: number; lastActive: string }>> {
    return apiFetch('/streak');
  },

  async updateStreak(): Promise<ApiResponse<{ streakDays: number; bonusXP: number }>> {
    return apiFetch('/streak/update', { method: 'POST' });
  },
};
