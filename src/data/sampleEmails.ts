export interface SampleEmail {
  id: string;
  name: string;
  category: 'PHISHING' | 'SPAM' | 'SUSPICIOUS' | 'SAFE';
  sender: string;
  subject: string;
  body: string;
}

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    id: 'sample-phish-1',
    name: 'PayPal Urgent Account Suspension (Phishing)',
    category: 'PHISHING',
    sender: 'PayPal Security Team <support@paypa1-security-verification.xyz>',
    subject: 'URGENT: Your PayPal Account Has Been Suspended Within 24 Hours',
    body: `Dear Valued Customer,

We detected unauthorized access attempts to your PayPal account from an unrecognized IP address (192.168.1.104) in Moscow, Russia.

For your protection, immediate action is required. Your account will be permanently closed within 24 hours failure to comply with our security audit.

Please verify your identity and confirm your password, Social Security Number, and debit card CVV immediately by visiting our secure gateway:
http://45.33.32.156/paypal/verify-identity.html

Failure to verify now will result in permanent account termination and forfeiture of remaining balances.

Sincerely,
PayPal Security & Fraud Detection Division`
  },
  {
    id: 'sample-phish-2',
    name: 'Microsoft 365 Password Expiration (Phishing)',
    category: 'PHISHING',
    sender: 'Microsoft IT Helpdesk <admin-support@secure-login-portal.top>',
    subject: 'Security Alert: Your Microsoft 365 Password Expires Today',
    body: `Notice from Office 365 Administration:

Your corporate email password is scheduled to expire in 2 hours. To maintain access to your mailbox and shared company drives, you must retain your existing credentials.

Click below to verify your current password and prevent email disruption:
https://micros0ft-corporation-auth.xyz/signin?flow=reauth

Do not ignore this warning. Unverified accounts will be disconnected from the Exchange server immediately.

IT Systems Administrator
Microsoft Global Support Services`
  },
  {
    id: 'sample-spam-1',
    name: 'Mega Millions Winner Notification (Spam)',
    category: 'SPAM',
    sender: 'Global Lottery Rewards <winner-claims@promo-rewards-central.net>',
    subject: 'CONGRATULATIONS!! YOU HAVE WON $2,500,000 IN CASH PRIZES!!!',
    body: `CONGRATULATIONS WINNER!!

Your email address has been selected as the 1st prize winner of the International Digital Sweepstakes! You have won a guaranteed cash payout of $2,500,000.00!

This is 100% free with no risk! Act now and save your claim code!
Claim code: WIN-99482-USA

Claim your reward immediately:
https://tinyurl.com/claim-jackpot-today-now

Make money fast from home! Limited time offer, act now!

Terms apply. Unsubscribe by replying REMOVE.`
  },
  {
    id: 'sample-suspicious-1',
    name: 'Urgent Wire Invoice Update (Suspicious)',
    category: 'SUSPICIOUS',
    sender: 'Finance Dept <john.doe.accounting91@gmail.com>',
    subject: 'Urgent Payment Details Update - Invoice #9482',
    body: `Hi Team,

Please note our banking coordinates have been updated due to our recent fiscal transition. Please process invoice #9482 via direct wire transfer to our new partner account rather than the previous account on file.

Please act today as the vendor deadline is closing before 5:00 PM.

Attached are the revised wiring instructions. Please confirm receipt as soon as possible.

Thanks,
John Doe
Head of Accounts Receivable`
  },
  {
    id: 'sample-safe-1',
    name: 'GitHub Security Advisory / Pull Request (Safe)',
    category: 'SAFE',
    sender: 'GitHub Notifications <notifications@github.com>',
    subject: '[acme-corp/api-gateway] Pull Request #142: Fix rate limiting middleware',
    body: `Hello alex,

@sarah-dev has requested your review on Pull Request #142 in acme-corp/api-gateway:
"Fix token bucket refill rate under heavy concurrency loads"

Branch: feature/token-bucket-patch -> main
Changes: +42 / -18 lines across 3 files.

You can view the diff and leave comments directly in the web interface:
https://github.com/acme-corp/api-gateway/pull/142

All 18 automated test suites have passed on GitHub Actions.

—
You are receiving this notification because you are a code owner on this repository.`
  },
  {
    id: 'sample-safe-2',
    name: 'Stripe Monthly Invoice Receipt (Safe)',
    category: 'SAFE',
    sender: 'Stripe Billing <invoices@stripe.com>',
    subject: 'Your receipt for Invoice #INV-2026-0814 ($49.00 USD)',
    body: `Hi there,

Thanks for using Acme Analytics! Your monthly subscription invoice #INV-2026-0814 for the Pro Plan ($49.00 USD) has been successfully paid using Visa ending in 4242.

A PDF receipt is stored in your customer portal. You can view your invoice history anytime:
https://stripe.com/receipts/inv-2026-0814

If you have questions about this charge, visit our help docs or contact support at support@acme.com.

Stripe, Inc.
510 Townsend St, San Francisco, CA 94103`
  }
];
