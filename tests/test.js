// tests/test.js
// Simple end-to-end smoke test (uses built-in fetch, Node 18+)
// Make sure the server is running first: npm run dev  OR  docker run ...

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  return { status: res.status, data };
}

function log(title, result) {
  console.log(`\n--- ${title} ---`);
  console.log('Status:', result.status);
  console.log(JSON.stringify(result.data, null, 2));
}

async function runTests() {
  console.log(`Running tests against ${BASE_URL} ...`);

  log('Test 1: Health check', await get('/health'));
  log('Test 2: List all products', await get('/products'));
  log('Test 3: Get product by id (1)', await get('/products/1'));
  log('Test 4: Get product with invalid id', await get('/products/9999'));
  log('Test 5: Search by keyword', await get('/products/search?keyword=mouse'));
  log('Test 6: Search with category + price range (v2.0 feature)', await get('/products/search?category=Electronics&minPrice=500&maxPrice=2000'));
  log('Test 7: Search with invalid price param (expect 400)', await get('/products/search?minPrice=abc'));
  log('Test 8: Unknown route (expect 404)', await get('/unknown-route'));

  console.log('\nAll tests completed.');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
