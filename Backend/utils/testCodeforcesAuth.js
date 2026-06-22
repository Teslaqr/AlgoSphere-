const dotenv = require('dotenv');
const codeforces = require('./codeforcesClient');

dotenv.config();

const HANDLE = process.env.CF_TEST_HANDLE || 'tourist';

async function test() {
  const credentials = codeforces.getCredentials();
  if (!credentials.apiKey || !credentials.apiSecret) {
    console.error('Missing Codeforces API key or secret in Backend/.env');
    process.exit(1);
  }

  try {
    const users = await codeforces.getUserInfo(HANDLE);
    console.log('Success:', users[0]);
  } catch (err) {
    console.error('Failed:', err.codeforces || err.message);
  }
}

test();
