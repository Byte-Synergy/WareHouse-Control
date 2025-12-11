const bcrypt = require('bcryptjs');
const { db } = require('./database');

function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, user) => {
        if (err) {
          reject(err);
        } else if (!user) {
          resolve(null);
        } else {
          const isValid = bcrypt.compareSync(password, user.password_hash);
          resolve(isValid ? user : null);
        }
      }
    );
  });
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { authenticateUser, requireAuth };
