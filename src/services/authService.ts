import type { User } from '../types';

const AUTH_STORAGE_KEY = 'emailguard_session_v1';
const USERS_STORAGE_KEY = 'emailguard_users_v1';
const REMEMBER_KEY = 'emailguard_remember_creds_v1';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

interface SessionData {
  user: User;
  token: string;
  expiresAt: number;
}

/**
 * Utility to compute cryptographic SHA-256 hash using the native browser Web Crypto API
 * This ensures passwords are NEVER stored in plaintext.
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt + 'EmailGuard_Secure_Pepper_9491');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate secure random salt
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default initial demo user credentials (admin@emailguard.io / Password123!)
const DEFAULT_SALT = 'e5b7a1f2c90d48123fa46b';
const DEFAULT_DEMO_HASH = '4fb08d4ae010fe6ebf39e3ecba09440623a85ae76b701264b38dcb92ad7c3ee4';

const INITIAL_USERS: StoredUser[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@emailguard.io',
    name: 'Alex Vance',
    role: 'Security Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:00:00.000Z',
    salt: DEFAULT_SALT,
    // Will be initialized with properly computed hash on first run
    passwordHash: DEFAULT_DEMO_HASH
  }
];

export const authService = {
  /**
   * Initializes mock user store with salted hashes if not already present
   */
  async init(): Promise<void> {
    const existing = localStorage.getItem(USERS_STORAGE_KEY);
    if (!existing) {
      // Compute hash for 'Password123!'
      const hash = await hashPassword('Password123!', DEFAULT_SALT);
      INITIAL_USERS[0].passwordHash = hash;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    }
  },

  getStoredUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string, rememberMe = false): Promise<User> {
    await this.init();
    // Simulate realistic auth response time
    await new Promise(r => setTimeout(r, 650));

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getStoredUsers();
    const userMatch = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!userMatch) {
      throw new Error('No account found with this email address.');
    }

    const testHash = await hashPassword(password, userMatch.salt);
    if (testHash !== userMatch.passwordHash) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    // Sanitize user object (omit salt and passwordHash)
    const authenticatedUser: User = {
      id: userMatch.id,
      email: userMatch.email,
      name: userMatch.name,
      role: userMatch.role,
      avatarUrl: userMatch.avatarUrl,
      createdAt: userMatch.createdAt
    };

    // Session token with 24h or 14-day expiry
    const ttlHours = rememberMe ? 24 * 14 : 24;
    const session: SessionData = {
      user: authenticatedUser,
      token: `eg-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: Date.now() + (ttlHours * 60 * 60 * 1000)
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: cleanEmail }));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    return authenticatedUser;
  },

  /**
   * Sign out the active session
   */
  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * Check if current session exists and is unexpired
   */
  getCurrentUser(): User | null {
    try {
      const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!sessionStr) return null;

      const session: SessionData = JSON.parse(sessionStr);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session.user;
    } catch {
      this.logout();
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  getRememberedEmail(): string {
    try {
      const rem = localStorage.getItem(REMEMBER_KEY);
      if (rem) {
        const parsed = JSON.parse(rem);
        return parsed.email || '';
      }
      return '';
    } catch {
      return '';
    }
  },

  /**
   * Update profile details
   */
  updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'role'>>): User {
    const users = this.getStoredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const updatedUser: User = {
      id: users[idx].id,
      email: users[idx].email,
      name: users[idx].name,
      role: users[idx].role,
      avatarUrl: users[idx].avatarUrl,
      createdAt: users[idx].createdAt
    };

    // Update active session
    const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionStr) {
      const session: SessionData = JSON.parse(sessionStr);
      session.user = updatedUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }

    return updatedUser;
  },

  /**
   * Change password securely
   */
  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const users = this.getStoredUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    const user = users[idx];
    const currentHash = await hashPassword(currentPass, user.salt);
    if (currentHash !== user.passwordHash) {
      throw new Error('Current password is incorrect.');
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPass, newSalt);

    users[idx].salt = newSalt;
    users[idx].passwordHash = newHash;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
};
