import { UserSession, LoginCredentials, LoginResponse, LogoutResponse } from '../types/session';
import bcrypt from 'bcryptjs';

// Configurações de sessão (inativas)
const SESSION_CONFIG = {
  EXPIRY_HOURS: 24,
  CLEANUP_INTERVAL: 1000 * 60 * 60,
  MAX_SESSIONS_PER_USER: 0,
  ENFORCE_STRICT: false
};

// Gerar token dummy
const generateSessionToken = (): string => {
  return 'disabled';
};

export class SessionService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return { success: false, error: 'Backoffice desativado' };
  }

  static async validateSession(sessionId: string, token: string): Promise<UserSession | null> {
    return null;
  }

  static async logoutSession(sessionId: string): Promise<LogoutResponse> {
    return { success: true, message: 'Backoffice desativado' };
  }

  static async logoutAllUserSessions(userId: string): Promise<LogoutResponse> {
    return { success: true, message: 'Backoffice desativado' };
  }

  static async getActiveSessionsByUser(userId: string): Promise<UserSession[]> {
    return [];
  }

  static async forceCleanupAllSessions(): Promise<void> { return; }
  static async cleanupExpiredSessions(): Promise<void> { return; }
  static async closeAllUserSessions(userId: string): Promise<{ success: boolean; closedCount: number; error?: string }> {
    return { success: true, closedCount: 0 };
  }

  static startCleanupScheduler(): void { /* noop */ }
}

SessionService.startCleanupScheduler();
