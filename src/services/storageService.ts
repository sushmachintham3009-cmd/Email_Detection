import type { AnalysisResult, DashboardStats, UserSettings } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'emailguard_history_v1',
  SETTINGS: 'emailguard_settings_v1',
  SESSION: 'emailguard_session_v1',
  REMEMBER: 'emailguard_remember_me_v1'
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'cyber-dark',
  notifyPhishingAlerts: true,
  notifyWeeklyDigest: false,
  sensitivityLevel: 'balanced',
  autoSaveHistory: true
};

// Realistic initial pre-seeded historical analyses
const SEED_HISTORY: AnalysisResult[] = [
  {
    id: 'seed-scan-1',
    classification: 'PHISHING',
    confidence: 0.94,
    score: 92,
    explanation: 'Urgent threat of account suspension with lookalike URL and direct credential solicitation detected.',
    reasons: [
      'Deceptive link detected with hidden malicious destination',
      'Urgent request for immediate account verification',
      'Solicitation of sensitive banking credentials and PIN',
      'Sender display name impersonation targeting PayPal'
    ],
    indicators: [
      {
        id: 'seed-ind-1',
        title: 'Lookalike Domain Impersonating PAYPAL',
        description: 'Domain "paypa1-security-verification.xyz" is a typosquatting proxy.',
        severity: 'critical',
        category: 'url'
      },
      {
        id: 'seed-ind-2',
        title: 'Account Suspension Threat',
        description: 'Threatens permanent closure within 24 hours to panic victim.',
        severity: 'high',
        category: 'urgency'
      },
      {
        id: 'seed-ind-3',
        title: 'Sensitive Data Solicitation',
        description: 'Requests Social Security Number and CVV verification.',
        severity: 'critical',
        category: 'credentials'
      }
    ],
    sender: 'PayPal Security <security@paypa1-security-verification.xyz>',
    subject: 'URGENT: Your PayPal Account Has Been Suspended Within 24 Hours',
    bodySnippet: 'Dear Valued Customer, We detected unauthorized access attempts... Please verify your identity and confirm your password, SSN, and CVV immediately...',
    rawContent: 'From: PayPal Security <security@paypa1-security-verification.xyz>\nSubject: URGENT: Your PayPal Account Has Been Suspended Within 24 Hours\n...',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 mins ago
    urlsFound: [
      {
        url: 'http://45.33.32.156/paypal/verify-identity.html',
        isSuspicious: true,
        reason: 'Direct IP address destination disguising fraudulent login form'
      }
    ],
    recommendations: [
      'Do not click any embedded links or submit credentials.',
      'Report email to abuse@paypal.com.',
      'Audit your PayPal account directly from paypal.com.'
    ]
  },
  {
    id: 'seed-scan-2',
    classification: 'SAFE',
    confidence: 0.95,
    score: 6,
    explanation: 'Standard verified notification from GitHub with valid repository links and zero threat signatures.',
    reasons: [
      'No malicious indicators or deceptive links detected',
      'Standard conversational or business tone observed'
    ],
    indicators: [],
    sender: 'GitHub Notifications <notifications@github.com>',
    subject: '[acme-corp/api-gateway] Pull Request #142: Fix rate limiting middleware',
    bodySnippet: 'Hello alex, @sarah-dev has requested your review on Pull Request #142 in acme-corp/api-gateway... All 18 automated test suites have passed...',
    rawContent: 'From: GitHub Notifications <notifications@github.com>\nSubject: [acme-corp/api-gateway] Pull Request #142...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    urlsFound: [
      {
        url: 'https://github.com/acme-corp/api-gateway/pull/142',
        isSuspicious: false
      }
    ],
    recommendations: [
      'Email appears benign based on static heuristic scanning.',
      'Standard code review workflow link verified.'
    ]
  },
  {
    id: 'seed-scan-3',
    classification: 'SPAM',
    confidence: 0.91,
    score: 62,
    explanation: 'Unsolicited promotional claims with lottery jackpot triggers and obfuscated redirect link.',
    reasons: [
      'Unsolicited promotional or exaggerated marketing patterns',
      'Obfuscated URL shortener disguising final landing page',
      'Excessive uppercase formatting'
    ],
    indicators: [
      {
        id: 'seed-ind-spam-1',
        title: 'Unsolicited Prize / Winner Notification',
        description: 'Claims recipient has won $2.5 million sweepstakes.',
        severity: 'medium',
        category: 'promotional'
      },
      {
        id: 'seed-ind-spam-2',
        title: 'Obfuscated Link Shortener',
        description: 'Uses tinyurl.com redirector to mask actual destination.',
        severity: 'medium',
        category: 'url'
      }
    ],
    sender: 'Global Lottery Rewards <winner-claims@promo-rewards-central.net>',
    subject: 'CONGRATULATIONS!! YOU HAVE WON $2,500,000 IN CASH PRIZES!!!',
    bodySnippet: 'CONGRATULATIONS WINNER!! Your email address has been selected as the 1st prize winner of the International Digital Sweepstakes! You have won $2,500,000...',
    rawContent: 'From: Global Lottery Rewards <winner-claims@promo-rewards-central.net>\nSubject: CONGRATULATIONS...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    urlsFound: [
      {
        url: 'https://tinyurl.com/claim-jackpot-today-now',
        isSuspicious: true,
        reason: 'Obfuscated URL shortener disguising final landing page'
      }
    ],
    recommendations: [
      'Mark this email as Spam or Junk.',
      'Never transfer money to claim unsolicited lottery funds.'
    ]
  },
  {
    id: 'seed-scan-4',
    classification: 'SUSPICIOUS',
    confidence: 0.82,
    score: 54,
    explanation: 'Urgent wire routing update requested from unverified personal webmail address.',
    reasons: [
      'Urgent wire transfer and bank coordinate change requested',
      'Official corporate accounting title sent from personal webmail domain',
      'Artificial time urgency constraint'
    ],
    indicators: [
      {
        id: 'seed-ind-susp-1',
        title: 'Official Identity on Free Webmail',
        description: 'Sender claims to be Finance Dept but uses personal @gmail.com address.',
        severity: 'high',
        category: 'sender'
      },
      {
        id: 'seed-ind-susp-2',
        title: 'Urgent Payment Details Update',
        description: 'Classic Business Email Compromise (BEC) pattern modifying bank routing numbers.',
        severity: 'high',
        category: 'credentials'
      }
    ],
    sender: 'Finance Dept <john.doe.accounting91@gmail.com>',
    subject: 'Urgent Payment Details Update - Invoice #9482',
    bodySnippet: 'Hi Team, Please note our banking coordinates have been updated due to our recent fiscal transition. Please process invoice #9482 via direct wire transfer...',
    rawContent: 'From: Finance Dept <john.doe.accounting91@gmail.com>\nSubject: Urgent Payment Details Update...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
    urlsFound: [],
    recommendations: [
      'Inspect sender domain; legitimate finance communications originate from company domain.',
      'Verify wiring change instructions through an out-of-band phone call.',
      'Do not disburse funds without multi-party approval.'
    ]
  }
];

export const storageService = {
  getHistory(): AnalysisResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) {
        // Pre-seed with realistic data for immediate richness
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(SEED_HISTORY));
        return SEED_HISTORY;
      }
      return JSON.parse(data);
    } catch {
      return SEED_HISTORY;
    }
  },

  saveAnalysis(result: AnalysisResult): void {
    const history = this.getHistory();
    // Prepend newest scan
    const updated = [result, ...history.filter(item => item.id !== result.id)];
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  },

  deleteAnalysis(id: string): void {
    const history = this.getHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  },

  clearHistory(): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  },

  getStats(): DashboardStats {
    const history = this.getHistory();
    const total = history.length;
    const safeCount = history.filter(h => h.classification === 'SAFE').length;
    const spamCount = history.filter(h => h.classification === 'SPAM').length;
    const phishingCount = history.filter(h => h.classification === 'PHISHING').length;
    const suspiciousCount = history.filter(h => h.classification === 'SUSPICIOUS').length;

    const avgConfidence = total > 0
      ? Math.round((history.reduce((sum, h) => sum + h.confidence, 0) / total) * 100)
      : 0;

    return {
      totalAnalyzed: total,
      safeCount,
      spamCount,
      phishingCount,
      suspiciousCount,
      avgConfidence
    };
  },

  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
