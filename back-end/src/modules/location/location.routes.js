import { Router } from 'express';
import { createLocation, listLocations } from './location.controller.js';

const router = Router();

router.get('/', listLocations);
router.post('/', createLocation);

export default router;
