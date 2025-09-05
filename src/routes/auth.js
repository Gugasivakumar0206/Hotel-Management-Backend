// server/src/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  const token = jwt.sign({ id: user._id, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res
    .cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 7*24*3600*1000 })
    .json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  res
    .cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 7*24*3600*1000 })
    .json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { sameSite: 'none', secure: true });
  res.json({ ok: true });
});

export default router;
