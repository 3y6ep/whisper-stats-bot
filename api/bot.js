module.exports = async (req, res) => {
  console.log('✅ Webhook called');
  
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.json({ status: 'Bot is running', timestamp: new Date().toISOString() });
  }
  
  if (req.method === 'POST') {
    console.log('POST data:', req.body);
    return res.json({ ok: true, received: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
