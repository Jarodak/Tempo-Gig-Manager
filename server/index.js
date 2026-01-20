import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 5174);

// In-memory demo data (replace with a DB later)
let gigs = [
  {
    id: 'gig_1',
    title: 'Friday Night Set',
    venue: 'Tempo Lounge',
    location: 'Downtown',
    date: '2026-01-24',
    time: '20:00',
    price: '$200',
    genre: 'Rock',
    isVerified: true,
    image: '',
    status: 'open',
  },
];

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'tempo-backend', time: new Date().toISOString() });
});

app.get('/api/gigs', (_req, res) => {
  res.json({ gigs });
});

app.post('/api/gigs', (req, res) => {
  const gig = req.body;
  if (!gig || typeof gig !== 'object') {
    return res.status(400).json({ error: 'Invalid gig payload' });
  }
  if (!gig.id) {
    gig.id = `gig_${Date.now()}`;
  }
  gigs = [gig, ...gigs];
  return res.status(201).json({ gig });
});

// Simple placeholder auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body ?? {};
  if (!email || !role) {
    return res.status(400).json({ error: 'email and role are required' });
  }
  return res.json({
    user: { id: `user_${Date.now()}`, email, role },
    token: 'dev-token',
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});
