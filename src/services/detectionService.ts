import type {
  AnalysisResult,
  Classification,
  DetectedIndicator,
  DetectedUrl,
  EmailAnalysisInput
} from '../types';

// Regular expressions and keyword dictionaries for transparent heuristic detection
const SUSPICIOUS_TLDS = [
  'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'click', 'buzz',
  'rest', 'country', 'stream', 'download', 'bid', 'loan', 'review', 'party'
];

const BRAND_NAMES = [
  'paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix',
  'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'facebook',
  'instagram', 'linkedin', 'dropbox', 'dhl', 'fedex', 'usps'
];

const URGENCY_PATTERNS = [
  { regex: /\b(immediate(ly)? action (required|needed))\b/i, label: 'Demands immediate action' },
  { regex: /\b(account (will be|has been) (suspended|locked|terminated|disabled|closed))\b/i, label: 'Account suspension threat' },
  { regex: /\b(within (24|48|12|1) (hours?|hrs?))\b/i, label: 'Artificial time urgency constraint' },
  { regex: /\b(unauthorized (access|activity|transaction|login|attempt))\b/i, label: 'Alerts of unauthorized account activity' },
  { regex: /\b(security (alert|breach|warning|compromise))\b/i, label: 'Alarmist security notification tone' },
  { regex: /\b(verify (your (account|identity|email|credentials|information)|now|immediately))\b/i, label: 'Direct prompt to verify account immediately' },
  { regex: /\b(failure to (comply|respond|verify) will result)\b/i, label: 'Coercive threat of service loss' },
  { regex: /\b(act (now|fast|today)|don't delay|urgent attention)\b/i, label: 'High pressure urgency wording' }
];

const CREDENTIAL_PATTERNS = [
  { regex: /\b(enter|confirm|provide|submit|update) your (password|pin|passcode|secret)\b/i, label: 'Direct request for password or PIN' },
  { regex: /\b(social security|ssn|identity number)\b/i, label: 'Solicitation of Social Security or national identity number' },
  { regex: /\b(credit card|debit card|cvv|cvc|card expiration|billing details)\b/i, label: 'Request for sensitive payment card details' },
  { regex: /\b(two-factor|2fa|otp|verification code|one-time password)\b/i, label: 'Attempt to harvest 2FA/OTP authentication code' },
  { regex: /\b(crypto wallet|seed phrase|private key|recovery phrase)\b/i, label: 'Request for cryptocurrency private key or seed phrase' }
];

const FINANCIAL_BEC_PATTERNS = [
  { regex: /\b(wire transfer|banking coordinates|wiring instructions|partner account)\b/i, label: 'Wire transfer or revised banking coordinates requested' },
  { regex: /\b(gift card|western union|moneygram)\b/i, label: 'Untraceable voucher or gift card payment requested' }
];

const SPAM_PATTERNS = [
  { regex: /\b(congratulations|you have (been selected|won)|winner)\b/i, label: 'Unsolicited prize or winner notification' },
  { regex: /\b(100% free|risk[- ]free|no cost|guaranteed return)\b/i, label: 'Exaggerated risk-free commercial claims' },
  { regex: /\b(exclusive deal|limited time offer|act now and save|claim your reward)\b/i, label: 'High-frequency marketing spam phrase' },
  { regex: /\b(make money (fast|online|from home)|earn \$[0-9]+(\/day|\/hr)?)\b/i, label: 'Get-rich-quick or work-from-home scheme' },
  { regex: /\b(viagra|cialis|enhancement|casino|jackpot|free spins)\b/i, label: 'High-spam commercial category' },
  { regex: /\b(weight loss miracle|lose belly fat|diet breakthrough)\b/i, label: 'Miracle cure promotional claim' }
];

const FREE_WEBMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'proton.me', 'protonmail.com', 'icloud.com', 'zoho.com', 'mail.com'
];

/**
 * Parses raw email text if pasted as standard RFC822/header format
 */
export function parseRawEmail(rawText: string): { sender: string; subject: string; body: string } {
  const lines = rawText.split(/\r?\n/);
  let sender = '';
  let subject = '';
  let bodyStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      bodyStartIndex = i + 1;
      break;
    }
    const fromMatch = line.match(/^from:\s*(.*)$/i);
    if (fromMatch) sender = fromMatch[1].trim();

    const subjectMatch = line.match(/^subject:\s*(.*)$/i);
    if (subjectMatch) subject = subjectMatch[1].trim();
  }

  const body = bodyStartIndex !== -1 && bodyStartIndex < lines.length
    ? lines.slice(bodyStartIndex).join('\n')
    : rawText;

  return {
    sender: sender || '',
    subject: subject || '',
    body: body.trim()
  };
}

/**
 * Extracts and inspects URLs from text and HTML-style fragments
 */
function extractAndAnalyzeUrls(text: string): {
  urls: DetectedUrl[];
  hasSuspiciousUrl: boolean;
  hasMismatchUrl: boolean;
  indicators: DetectedIndicator[];
} {
  const detectedUrls: DetectedUrl[] = [];
  const indicators: DetectedIndicator[] = [];

  // Match standard URLs
  const urlRegex = /(https?:\/\/[^\s<>"'`]+)/gi;
  const matches = text.match(urlRegex) || [];

  // Check for HTML link mismatches: <a href="evil.com">paypal.com</a>
  const htmlLinkRegex = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let htmlMatch;
  let hasMismatchUrl = false;

  while ((htmlMatch = htmlLinkRegex.exec(text)) !== null) {
    const actualHref = htmlMatch[1];
    const displayText = htmlMatch[2].trim();

    // If display text looks like a URL but points elsewhere
    if (displayText.match(/^https?:\/\//i) || displayText.includes('.com') || displayText.includes('.org')) {
      const cleanDisplay = displayText.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
      try {
        const actualDomain = new URL(actualHref).hostname.toLowerCase();
        if (cleanDisplay && !actualDomain.includes(cleanDisplay) && !cleanDisplay.includes(actualDomain)) {
          hasMismatchUrl = true;
          indicators.push({
            id: 'ind-url-mismatch',
            title: 'Deceptive Link Text Mismatch',
            description: `Link displays "${displayText}" but secretly points to untrusted destination "${actualHref}".`,
            severity: 'critical',
            category: 'url'
          });
        }
      } catch {
        // Ignore invalid URL parse
      }
    }
  }

  // Deduplicate URLs
  const uniqueUrls = Array.from(new Set(matches));

  for (const rawUrl of uniqueUrls) {
    let isSuspicious = false;
    let reason = '';

    try {
      const parsed = new URL(rawUrl);
      const hostname = parsed.hostname.toLowerCase();

      // Check 1: IP address as hostname (common in drive-by malware / phishing)
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        isSuspicious = true;
        reason = 'Direct IP address used instead of legitimate domain name';
        indicators.push({
          id: `ind-url-ip-${hostname}`,
          title: 'Direct IP Hostname',
          description: `URL uses bare IP address (${hostname}) to disguise destination.`,
          severity: 'critical',
          category: 'url'
        });
      }

      // Check 2: High-risk TLD
      const tld = hostname.split('.').pop();
      if (tld && SUSPICIOUS_TLDS.includes(tld)) {
        isSuspicious = true;
        reason = `Uses high-risk, low-reputation top-level domain (.${tld})`;
        indicators.push({
          id: `ind-tld-${tld}`,
          title: `Suspicious Top-Level Domain (.${tld})`,
          description: `Domain ends with .${tld}, frequently utilized in fraudulent campaigns.`,
          severity: 'high',
          category: 'url'
        });
      }

      // Check 3: Brand impersonation / typo-squatting
      for (const brand of BRAND_NAMES) {
        if (hostname.includes(brand)) {
          // If it contains the brand name, verify it's an official subdomain
          const isOfficial = hostname === `${brand}.com` ||
                             hostname.endsWith(`.${brand}.com`) ||
                             hostname === `${brand}.co.uk` ||
                             hostname.endsWith(`.${brand}.co.uk`);

          if (!isOfficial) {
            isSuspicious = true;
            reason = `Spoofed or lookalike domain targeting "${brand}" (${hostname})`;
            indicators.push({
              id: `ind-brand-spoof-${brand}`,
              title: `Lookalike Domain Impersonating ${brand.toUpperCase()}`,
              description: `Domain "${hostname}" contains brand name "${brand}" but is not an official domain.`,
              severity: 'critical',
              category: 'url'
            });
            break;
          }
        }
      }

      // Check 4: Free link shorteners in sensitive contexts
      const shorteners = ['bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 'rb.gy', 't.co'];
      if (shorteners.includes(hostname)) {
        isSuspicious = true;
        reason = 'Obfuscated URL shortener disguising final landing page';
        indicators.push({
          id: `ind-shortener-${hostname}`,
          title: 'Obfuscated Link Shortener',
          description: `Link shortener (${hostname}) conceals the true destination server.`,
          severity: 'medium',
          category: 'url'
        });
      }

      // Check 5: Excessive subdomains (e.g. login.secure.bank.attacker.com)
      const domainParts = hostname.split('.');
      if (domainParts.length > 4) {
        isSuspicious = true;
        reason = 'Excessive subdomain nesting commonly used in phishing kits';
        indicators.push({
          id: `ind-subdomains-${hostname}`,
          title: 'Excessive Subdomain Nesting',
          description: `Hostname "${hostname}" contains suspicious multi-level subdomain routing.`,
          severity: 'medium',
          category: 'url'
        });
      }
    } catch {
      // Malformed URL
      isSuspicious = true;
      reason = 'Malformed or deceptive URL syntax';
    }

    detectedUrls.push({
      url: rawUrl,
      isSuspicious,
      reason: reason || undefined
    });
  }

  const hasSuspiciousUrl = detectedUrls.some(u => u.isSuspicious);

  return {
    urls: detectedUrls,
    hasSuspiciousUrl,
    hasMismatchUrl,
    indicators
  };
}

/**
 * Analyzes the sender address and display name for spoofing signals
 */
function analyzeSender(sender: string): {
  isSuspicious: boolean;
  indicators: DetectedIndicator[];
} {
  const indicators: DetectedIndicator[] = [];
  if (!sender || !sender.trim()) {
    return { isSuspicious: false, indicators };
  }

  const senderClean = sender.trim();
  const emailRegex = /<([^>]+)>|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  const match = senderClean.match(emailRegex);
  const actualEmail = (match ? (match[1] || match[2]) : senderClean).toLowerCase();

  // Extract display name if present
  let displayName = '';
  if (senderClean.includes('<')) {
    displayName = senderClean.substring(0, senderClean.indexOf('<')).trim().replace(/['"]/g, '');
  }

  // Check 1: Brand name in display name, but free webmail in email address
  if (displayName) {
    const lowerDisplay = displayName.toLowerCase();
    for (const brand of BRAND_NAMES) {
      if (lowerDisplay.includes(brand)) {
        const domain = actualEmail.split('@')[1] || '';
        const isOfficialDomain = domain.includes(brand);

        if (!isOfficialDomain) {
          indicators.push({
            id: 'ind-sender-impersonation',
            title: `Sender Display Name Impersonation`,
            description: `Display name claims to be "${displayName}" but email address is hosted on "${domain}".`,
            severity: 'critical',
            category: 'sender'
          });
          break;
        }
      }
    }
  }

  // Check 2: Financial or corporate claims using free mail providers
  const domain = actualEmail.split('@')[1] || '';
  if (FREE_WEBMAIL_DOMAINS.includes(domain)) {
    const lowerSender = senderClean.toLowerCase();
    if (lowerSender.includes('security') || lowerSender.includes('support') ||
        lowerSender.includes('billing') || lowerSender.includes('official') ||
        lowerSender.includes('bank') || lowerSender.includes('admin')) {
      indicators.push({
        id: 'ind-freemail-official',
        title: 'Official Identity on Free Webmail',
        description: `Official administrative or security title sent from personal webmail domain (${domain}).`,
        severity: 'high',
        category: 'sender'
      });
    }
  }

  // Check 3: Suspicious random characters or hex sequences in email username
  const localPart = actualEmail.split('@')[0] || '';
  if (/^[a-z0-9]{12,}$/i.test(localPart) && /\d{4,}/.test(localPart)) {
    indicators.push({
      id: 'ind-sender-random-chars',
      title: 'Automated / Pseudorandom Sender Address',
      description: `Sender account username contains randomized alphanumeric sequence (${localPart}).`,
      severity: 'low',
      category: 'sender'
    });
  }

  return {
    isSuspicious: indicators.length > 0,
    indicators
  };
}

/**
 * Main analysis execution function
 */
export async function analyzeEmail(input: EmailAnalysisInput): Promise<AnalysisResult> {
  // Simulate network/AI processing latency (350-700ms) for realistic UX
  await new Promise(resolve => setTimeout(resolve, 450));

  const parsed = input.rawContent
    ? parseRawEmail(input.rawContent)
    : {
        sender: input.sender || '',
        subject: input.subject || '',
        body: input.body || ''
      };

  const sender = parsed.sender || input.sender || 'Unknown Sender';
  const subject = parsed.subject || input.subject || '(No Subject)';
  const body = parsed.body || input.body || '';
  const fullText = `${sender}\n${subject}\n${body}`;

  const allIndicators: DetectedIndicator[] = [];
  const reasons: string[] = [];

  let phishingScore = 0;
  let spamScore = 0;
  let safeScore = 0;

  // 1. Analyze URLs
  const urlAnalysis = extractAndAnalyzeUrls(fullText);
  allIndicators.push(...urlAnalysis.indicators);
  if (urlAnalysis.hasMismatchUrl) {
    phishingScore += 45;
    reasons.push('Deceptive link detected with hidden malicious destination');
  }
  const hasCriticalUrl = urlAnalysis.indicators.some(i => i.severity === 'critical');
  const hasHighUrl = urlAnalysis.indicators.some(i => i.severity === 'high');
  if (hasCriticalUrl) {
    phishingScore += 40;
    reasons.push('Direct IP or brand-spoofing lookalike domain found in message');
  } else if (hasHighUrl) {
    phishingScore += 25;
    reasons.push('Suspicious or untrusted top-level domain identified');
  } else if (urlAnalysis.hasSuspiciousUrl) {
    spamScore += 20;
    reasons.push('Obfuscated link shortener detected');
  }

  // 2. Analyze Sender
  const senderAnalysis = analyzeSender(sender);
  allIndicators.push(...senderAnalysis.indicators);
  if (senderAnalysis.indicators.some(i => i.severity === 'critical')) {
    phishingScore += 40;
    reasons.push('Sender identity spoofing detected (display name does not match source domain)');
  } else if (senderAnalysis.isSuspicious) {
    phishingScore += 20;
    reasons.push('Unusual or unverified sender domain');
  }

  // 3. Analyze Urgency & Coercion
  let urgencyTriggered = false;
  for (const pattern of URGENCY_PATTERNS) {
    if (pattern.regex.test(fullText)) {
      urgencyTriggered = true;
      allIndicators.push({
        id: `ind-urgency-${pattern.label.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'Urgent Threat / Coercive Language',
        description: pattern.label,
        severity: 'high',
        category: 'urgency'
      });
      reasons.push(pattern.label);
      break;
    }
  }

  // 4. Analyze Credential & Sensitive Data Solicitation (Critical Phishing vectors)
  let credentialTheftTriggered = false;
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.regex.test(fullText)) {
      credentialTheftTriggered = true;
      allIndicators.push({
        id: `ind-cred-${pattern.label.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'Sensitive Data / Credential Request',
        description: pattern.label,
        severity: 'critical',
        category: 'credentials'
      });
      reasons.push(pattern.label);
      break;
    }
  }

  // 4b. Analyze Financial / BEC (Business Email Compromise) vectors
  let financialBecTriggered = false;
  for (const pattern of FINANCIAL_BEC_PATTERNS) {
    if (pattern.regex.test(fullText)) {
      financialBecTriggered = true;
      allIndicators.push({
        id: `ind-bec-${pattern.label.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'Financial Routing / Transfer Request',
        description: pattern.label,
        severity: 'high',
        category: 'credentials'
      });
      reasons.push(pattern.label);
      break;
    }
  }

  // 5. Analyze Promotional Spam Patterns
  let spamMatchesCount = 0;
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.regex.test(fullText)) {
      spamMatchesCount++;
      allIndicators.push({
        id: `ind-spam-${pattern.label.toLowerCase().replace(/\s+/g, '-')}`,
        title: 'Promotional Spam Trigger',
        description: pattern.label,
        severity: 'medium',
        category: 'promotional'
      });
    }
  }

  if (spamMatchesCount > 0) {
    spamScore += spamMatchesCount * 25;
    reasons.push('Unsolicited promotional or exaggerated marketing patterns');
  }

  // Check for excessive capitalization in subject
  if (subject && subject.length > 8 && subject === subject.toUpperCase() && /[A-Z]/.test(subject)) {
    spamScore += 20;
    allIndicators.push({
      id: 'ind-all-caps-subject',
      title: 'ALL-CAPS Subject Line',
      description: 'Subject written entirely in capital letters to force attention.',
      severity: 'low',
      category: 'promotional'
    });
    reasons.push('Excessive uppercase formatting');
  }

  // Check for excessive exclamation marks
  const exclamationMatches = (fullText.match(/!{2,}/g) || []).length;
  if (exclamationMatches > 1) {
    spamScore += 15;
    allIndicators.push({
      id: 'ind-excessive-punctuation',
      title: 'Excessive Punctuation',
      description: 'Multiple exclamation marks detected throughout the message.',
      severity: 'low',
      category: 'content'
    });
  }

  // Calculate indicators
  const hasCriticalIndicators = allIndicators.some(i => i.severity === 'critical');
  const hasHighIndicators = allIndicators.some(i => i.severity === 'high');

  if (credentialTheftTriggered) phishingScore += 40;
  if (urgencyTriggered && !credentialTheftTriggered && !urlAnalysis.indicators.some(i => i.severity === 'critical')) {
    phishingScore += 15;
  }

  // Safe signals
  if (allIndicators.length === 0) {
    safeScore += 60;
  }
  if (body.length > 30 && !urlAnalysis.hasSuspiciousUrl && allIndicators.length === 0) {
    safeScore += 30;
  }

  // Deduplicate reasons
  const uniqueReasons = Array.from(new Set(reasons));

  // Determine Classification and Confidence
  let classification: Classification = 'SAFE';
  let confidence = 0.85;
  let finalRiskScore = 0;
  let explanation = '';
  const recommendations: string[] = [];

  // Classification priority hierarchy
  if (hasCriticalIndicators || phishingScore >= 50) {
    classification = 'PHISHING';
    finalRiskScore = Math.min(98, Math.max(75, phishingScore + 10));
    confidence = Math.min(0.98, 0.86 + (finalRiskScore / 500));
    explanation = 'This email exhibits high-confidence characteristics of a targeted phishing or credential harvesting attack.';
    recommendations.push(
      'Do NOT click any links, open attachments, or reply to this sender.',
      'Report this email directly to your IT security or email provider.',
      'If you already entered credentials, immediately change your password from a clean browser.'
    );
  } else if (spamScore >= 35) {
    classification = 'SPAM';
    finalRiskScore = Math.min(65, Math.max(35, spamScore));
    confidence = Math.min(0.95, 0.80 + (finalRiskScore / 350));
    explanation = 'This message matches bulk promotional, marketing spam, or unsolicited mass email criteria.';
    recommendations.push(
      'Mark this email as Spam or Junk to train your filter.',
      'Do not click unsubscribe links in untrusted spam messages, as this may confirm your address is active.',
      'Block the sender domain if messages persist.'
    );
  } else if (financialBecTriggered || hasHighIndicators || phishingScore >= 20 || senderAnalysis.isSuspicious) {
    classification = 'SUSPICIOUS';
    finalRiskScore = Math.min(68, Math.max(45, (financialBecTriggered ? 52 : 40) + phishingScore * 0.4));
    confidence = Math.min(0.88, 0.74 + (finalRiskScore / 400));
    explanation = 'This email contains caution indicators such as urgent financial instructions, unverified domains, or link discrepancies.';
    recommendations.push(
      'Inspect the actual sender address carefully before interacting.',
      'Verify wiring change instructions through an out-of-band trusted phone call.',
      'Contact the supposed sender via a known trusted channel to verify legitimacy.'
    );
  } else {
    classification = 'SAFE';
    finalRiskScore = Math.max(4, 18 - safeScore / 5);
    confidence = Math.min(0.96, 0.88 + (safeScore / 800));
    explanation = 'No significant indicators of phishing, credential theft, or malicious intent were identified.';
    uniqueReasons.push('No malicious indicators or deceptive links detected');
    uniqueReasons.push('Standard conversational or business tone observed');
    recommendations.push(
      'Email appears benign based on static heuristic scanning.',
      'Always exercise standard caution when downloading unexpected file attachments.'
    );
  }

  // Snippet preview
  const bodySnippet = body.length > 220 ? `${body.substring(0, 220)}...` : body;

  const result: AnalysisResult = {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    classification,
    confidence: Number(confidence.toFixed(2)),
    score: Math.round(finalRiskScore),
    explanation,
    reasons: uniqueReasons.length > 0 ? uniqueReasons : ['Standard legitimate communication patterns identified'],
    indicators: allIndicators,
    sender,
    subject,
    bodySnippet,
    rawContent: fullText,
    timestamp: new Date().toISOString(),
    urlsFound: urlAnalysis.urls,
    recommendations
  };

  return result;
}
