import app from '../src/app.js';
import { getLanguageCode } from '../src/services/transcriptionService.js';
import { AppError } from '../src/middleware/errorHandler.js';

async function runTests() {
  console.log('🧪 Starting AI Voice Language Tutor Backend Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Test 1: Language code mapping for Indian Languages
  console.log('[1] Testing Language Code Normalization...');
  assert(getLanguageCode('English') === 'en', 'Maps "English" -> "en"');
  assert(getLanguageCode('Hindi') === 'hi', 'Maps "Hindi" -> "hi"');
  assert(getLanguageCode('Kannada') === 'kn', 'Maps "Kannada" -> "kn"');
  assert(getLanguageCode('Telugu') === 'te', 'Maps "Telugu" -> "te"');
  assert(getLanguageCode('Tamil') === 'ta', 'Maps "Tamil" -> "ta"');
  assert(getLanguageCode('Marathi') === 'mr', 'Maps "Marathi" -> "mr"');
  assert(getLanguageCode('Bengali') === 'bn', 'Maps "Bengali" -> "bn"');
  assert(getLanguageCode('Malayalam') === 'ml', 'Maps "Malayalam" -> "ml"');
  assert(getLanguageCode('Gujarati') === 'gu', 'Maps "Gujarati" -> "gu"');
  assert(getLanguageCode('Punjabi') === 'pa', 'Maps "Punjabi" -> "pa"');

  // Test 2: AppError custom class
  console.log('\n[2] Testing AppError Class & Error Structure...');
  const testError = new AppError('NO_AUDIO', 'No audio provided', 400);
  assert(testError.code === 'NO_AUDIO', 'AppError contains code "NO_AUDIO"');
  assert(testError.statusCode === 400, 'AppError contains statusCode 400');
  assert(testError.message === 'No audio provided', 'AppError contains user message');

  // Test 3: Health Endpoint via Express Handler
  console.log('\n[3] Testing Express Health Endpoint...');
  const mockReq = { method: 'GET', url: '/api/health' };
  let mockResData = null;
  let mockStatusCode = 200;
  const mockRes = {
    status(code) {
      mockStatusCode = code;
      return this;
    },
    json(data) {
      mockResData = data;
      return this;
    },
    headersSent: false,
  };

  // Test route dispatcher
  const server = app.listen(0, async () => {
    const port = server.address().port;
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      const body = await response.json();

      assert(response.status === 200, 'Health endpoint returns HTTP 200');
      assert(body.success === true, 'Health endpoint returns { success: true }');
      assert(body.message.includes('running'), 'Health endpoint returns status message');

      // Test 4: Missing Audio File Validation on POST /api/tutor/analyze
      console.log('\n[4] Testing Missing Audio Handling on POST /api/tutor/analyze...');
      const emptyPostRes = await fetch(`http://localhost:${port}/api/tutor/analyze`, {
        method: 'POST',
      });
      const emptyPostBody = await emptyPostRes.json();

      assert(emptyPostRes.status === 400, 'Missing audio returns HTTP 400');
      assert(emptyPostBody.success === false, 'Missing audio returns { success: false }');
      assert(emptyPostBody.error.code === 'NO_AUDIO', 'Missing audio returns error code "NO_AUDIO"');

      // Test 5: Direct Text Analysis Endpoint validation
      console.log('\n[5] Testing Empty Text Handling on POST /api/tutor/analyze-text...');
      const emptyTextRes = await fetch(`http://localhost:${port}/api/tutor/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' }),
      });
      const emptyTextBody = await emptyTextRes.json();

      assert(emptyTextRes.status === 400, 'Empty text returns HTTP 400');
      assert(emptyTextBody.error.code === 'NO_SPEECH', 'Empty text returns error code "NO_SPEECH"');

      console.log('\n==================================================');
      console.log(`📊 Test Suite Completed: ${passed} Passed, ${failed} Failed`);
      console.log('==================================================\n');

      server.close();
      if (failed > 0) {
        process.exit(1);
      }
    } catch (err) {
      console.error('Test run error:', err);
      server.close();
      process.exit(1);
    }
  });
}

runTests();
