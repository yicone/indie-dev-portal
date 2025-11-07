#!/usr/bin/env tsx
/**
 * API endpoint diagnostic script
 * Tests all API endpoints to ensure they're working correctly
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

type TestResult = {
  endpoint: string;
  status: 'pass' | 'fail';
  message: string;
};

const results: TestResult[] = [];

async function testEndpoint(name: string, url: string, options?: RequestInit): Promise<void> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      results.push({
        endpoint: name,
        status: 'fail',
        message: `HTTP ${response.status}: ${await response.text()}`,
      });
      return;
    }

    const data = await response.json();
    results.push({
      endpoint: name,
      status: 'pass',
      message: `Success - ${JSON.stringify(data).slice(0, 100)}...`,
    });
  } catch (error) {
    results.push({
      endpoint: name,
      status: 'fail',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function runTests() {
  console.log('🧪 Running API endpoint tests...\n');

  // Test health endpoint
  await testEndpoint('GET /health', `${API_BASE_URL}/health`);

  // Test repos endpoint
  await testEndpoint('GET /repos', `${API_BASE_URL}/repos`);

  // Test single repo endpoint
  await testEndpoint('GET /repos/:slug', `${API_BASE_URL}/repos/epsilon`);

  // Test commits endpoint
  await testEndpoint(
    'GET /commits?repoSlug=epsilon',
    `${API_BASE_URL}/commits?repoSlug=epsilon&limit=5`
  );

  // Test update notes endpoint
  await testEndpoint('PATCH /repos/:slug/notes', `${API_BASE_URL}/repos/epsilon/notes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Test note from diagnostic script' }),
  });

  // Print results
  console.log('\n📊 Test Results:\n');
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.endpoint}`);
    console.log(`   ${result.message}\n`);
  });

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
