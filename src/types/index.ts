export type Classification = 'SAFE' | 'SPAM' | 'PHISHING' | 'SUSPICIOUS';

export type IndicatorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DetectedIndicator {
  id: string;
  title: string;
  description: string;
  severity: IndicatorSeverity;
  category: 'url' | 'urgency' | 'credentials' | 'sender' | 'promotional' | 'content';
}

export interface DetectedUrl {
  url: string;
  isSuspicious: boolean;
  reason?: string;
}

export interface AnalysisResult {
  id: string;
  classification: Classification;
  confidence: number; // e.g. 0.92 (92%)
  score: number;      // 0-100 risk score
  explanation: string;
  reasons: string[];
  indicators: DetectedIndicator[];
  sender: string;
  subject: string;
  bodySnippet: string;
  rawContent: string;
  timestamp: string;
  urlsFound: DetectedUrl[];
  recommendations: string[];
}

export interface EmailAnalysisInput {
  sender?: string;
  subject?: string;
  body: string;
  rawContent?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSettings {
  theme: 'cyber-dark' | 'light-slate' | 'enterprise-blue';
  notifyPhishingAlerts: boolean;
  notifyWeeklyDigest: boolean;
  sensitivityLevel: 'conservative' | 'balanced' | 'aggressive';
  autoSaveHistory: boolean;
}

export interface DashboardStats {
  totalAnalyzed: number;
  safeCount: number;
  spamCount: number;
  phishingCount: number;
  suspiciousCount: number;
  avgConfidence: number;
}
