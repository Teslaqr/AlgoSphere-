import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.CF_API_KEY;
const API_SECRET = process.env.CF_API_SECRET;

const BASE_URL = 'https://codeforces.com/api';
const METHOD = 'user.info';
const HANDLE = 'yuvi_768'; // Change this to your own Codeforces handle if you want

async function test() {
  const time = Math.floor(Date.now() / 1000);
  const rand = Math.random().toString(36).substring(2, 10); // 8-char random string

  // Params in strict lexicographical order!
  const query = `apiKey=${API_KEY}&handles=${HANDLE}&time=${time}`;
  const toSign = `${rand}/${METHOD}?${query}#${API_SECRET}`;
  const hash = crypto.createHash('sha512').update(toSign).digest('hex');
  const apiSig = `${rand}${hash}`;
  const url = `${BASE_URL}/${METHOD}?${query}&apiSig=${apiSig}`;

  console.log('\n✅ Signature Base:\n', toSign);
  console.log('\n✅ Full URL:\n', url);

  try {
    const res = await axios.get(url);
    console.log('\n✅ Success!\n', res.data);
  } catch (err) {
    console.error('\n❌ Failed\n', err.response?.data || err.message);
  }
}

test();
