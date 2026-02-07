const crypto = require('crypto');

function createPowMiddleware(options = {}) {
  const { difficulty = 3 } = options;

  return (req, res, next) => {
    if (difficulty === 0) {
      return next(); // POW is disabled
    }

    const {
      'x-pow-nonce': nonce,
      'x-pow-hash': hash,
      'x-pow-timestamp': timestamp
    } = req.headers;

    if (!nonce || !hash || !timestamp) {
      return res.status(401).json({ error: 'Missing POW headers' });
    }

    // Verify timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum) || Math.abs(now - timestampNum) > 300) {
      return res.status(401).json({ error: 'Timestamp expired or invalid' });
    }

    // Verify hash starts with the correct number of zeros (difficulty level)
    if (!hash.startsWith('0'.repeat(difficulty))) {
      return res.status(401).json({ error: 'Hash does not match difficulty level' });
    }

    // Build and verify challenge
    const challenge = `${req.method.toUpperCase()}|${req.originalUrl}|${timestamp}`;
    const challengeHash = crypto.createHash('sha256').update(challenge).digest('hex');
    const computed = crypto.createHash('sha256').update(challengeHash + nonce).digest('hex');

    if (computed !== hash) {
      return res.status(401).json({ error: 'Invalid proof of work' });
    }

    req.powVerified = true;
    next();
  }
}

module.exports = { createPowMiddleware };