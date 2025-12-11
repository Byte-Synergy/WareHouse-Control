const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database');
const { authenticateUser, requireAuth } = require('./auth');
const productsRouter = require('./routes/products');
const stockRouter = require('./routes/stock');
const alertsRouter = require('./routes/alerts');
const exportRouter = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'stockmaster-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Auth routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await authenticateUser(username, password);
    
    if (user) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({ message: 'Login successful', username: user.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ message: 'Logout successful' });
    }
  });
});

app.get('/api/session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected routes
app.use('/api/products', requireAuth, productsRouter);
app.use('/api/stock', requireAuth, stockRouter);
app.use('/api/alerts', requireAuth, alertsRouter);
app.use('/api/export', requireAuth, exportRouter);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Default login: admin / admin123');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
