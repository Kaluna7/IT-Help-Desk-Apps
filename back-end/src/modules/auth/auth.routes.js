import { Router } from 'express';
import {
  authRequired,
  login,
  me,
  signup,
  updateProfile,
} from './auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authRequired, me);
router.patch('/profile', authRequired, updateProfile);

export default router;
