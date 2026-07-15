import { Router } from 'express';
import {
  completeReport,
  createReport,
  getChecklistTemplate,
  getReportById,
  listReports,
  reopenReport,
  updateReport,
  uploadCheckPhoto,
} from './report.controller.js';

const router = Router();

router.get('/template/checklist', getChecklistTemplate);
router.get('/', listReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.patch('/:id', updateReport);
router.post('/:id/units/:unitId/checks/:key/photo', uploadCheckPhoto);
router.post('/:id/complete', completeReport);
router.post('/:id/reopen', reopenReport);

export default router;
