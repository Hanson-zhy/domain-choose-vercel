const { VercelKV } = require('@vercel/kv');
const LocalKV = require('./local-kv');

const isProduction = process.env.VERCEL === '1';
const kv = isProduction ? new VercelKV() : new LocalKV();

const validateButton = (btn) => {
  try {
    const url = new URL(btn.url);
    return ['http:', 'https:'].includes(url.protocol) &&
      typeof btn.name === 'string' &&
      btn.name.trim().length >= 1 &&
      btn.name.trim().length <= 30;
  } catch {
    return false;
  }
};

module.exports = async (req, res) => {
  try {
    switch (req.method) {
      case 'GET': {
        const data = await kv.get('buttons') || [];
        return res.status(200).json(data);
      }
      
      case 'POST': {
        if (!Array.isArray(req.body)) {
          throw new Error('Invalid data format');
        }
        if (!req.body.every(validateButton)) {
          throw new Error('Validation failed');
        }
        await kv.set('buttons', req.body);
        return res.status(200).json({ success: true });
      }
      
      default:
        return res.status(405).end();
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`);
    return res.status(400).json({ 
      error: error.message,
      ...(isProduction ? {} : { stack: error.stack })
    });
  }
};