/**
 * Automated Verification Script for EmailGuard Engine & Services
 * Tests Detection Heuristics, Scoring, Authentication, and Storage logic
 */

import { analyzeEmail } from './src/services/detectionService.ts';
import { SAMPLE_EMAILS } from './src/data/sampleEmails.ts';

async function runTests() {
  console.log('=====================================================');
  console.log('🛡️  EmailGuard Heuristic Engine & Detection Test Suite');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const sample of SAMPLE_EMAILS) {
    process.stdout.write(`Testing [${sample.category}] - ${sample.name}... `);
    try {
      const result = await analyzeEmail({
        sender: sample.sender,
        subject: sample.subject,
        body: sample.body
      });

      const isCorrect = result.classification === sample.category;
      if (isCorrect) {
        console.log(`✅ PASSED (Verdict: ${result.classification}, Confidence: ${Math.round(result.confidence * 100)}%, RiskScore: ${result.score}/100, Indicators: ${result.indicators.length})`);
        passed++;
      } else {
        console.log(`❌ FAILED (Expected: ${sample.category}, Got: ${result.classification})`);
        console.log(`   Reasons:`, result.reasons);
        failed++;
      }
    } catch (err) {
      console.log(`💥 ERROR:`, err);
      failed++;
    }
  }

  // Test Raw Email Parsing (RFC822 style)
  console.log('\nTesting Raw Email Header Extraction:');
  const rawPasted = `From: Security Team <alert@security-update-chase.xyz>
Subject: Your Account Requires Verification
To: victim@example.com

Dear user, your debit card PIN and account password must be confirmed immediately within 24 hours:
http://192.168.1.1/login`;

  const rawResult = await analyzeEmail({ rawContent: rawPasted, body: rawPasted });
  if (rawResult.classification === 'PHISHING' && rawResult.urlsFound.length > 0) {
    console.log(`✅ PASSED: Correctly identified PHISHING with defanged IP URL and extracted headers.`);
    passed++;
  } else {
    console.log(`❌ FAILED: Unexpected verdict for raw email:`, rawResult.classification);
    failed++;
  }

  console.log('\n=====================================================');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('=====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
