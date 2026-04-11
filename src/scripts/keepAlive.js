const cron = require('node-cron');
const https = require('https');
const http = require('http');

const SERVER_URL = process.env.SERVER_URL;

// Ping server every 14 minutes to keep it awake on free-tier hosting
cron.schedule('*/14 * * * *', () => {
  if (!SERVER_URL) {
    return; // Skip in local development
  }

  const url = `${SERVER_URL}/api/health`;
  const client = url.startsWith('https') ? https : http;

  client.get(url, (res) => {
    console.log(`🏓 [KEEP-ALIVE] Pinged server — Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('❌ [KEEP-ALIVE] Ping failed:', err.message);
  });
});
