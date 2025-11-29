module.exports = async (req, res) => {
  console.log('=== WEBHOOK TEST ===');
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  // Простой ответ
  res.status(200).json({ 
    ok: true, 
    message: 'Webhook is working',
    timestamp: new Date().toISOString()
  });
};
