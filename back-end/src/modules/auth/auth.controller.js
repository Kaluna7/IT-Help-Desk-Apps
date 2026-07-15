import bcrypt from 'bcryptjs';
import { User } from './auth.model.js';
import { authRequired, signToken, toPublicUser } from './auth.utils.js';

export async function signup(req, res) {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken(user._id.toString());

    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id.toString());
    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof req.body?.name === 'string' && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }

    if (typeof req.body?.avatar === 'string') {
      user.avatar = req.body.avatar;
    }

    await user.save();
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { authRequired };
