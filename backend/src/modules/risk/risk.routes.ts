import { Router } from 'express';
import { riskController, upload } from './risk.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  predictRiskSchema,
  getRiskHistoryQuerySchema,
} from './risk.types';

const router = Router();

router.post(
  '/predict',
  authenticate,
  validate(predictRiskSchema),
  riskController.predictRisk.bind(riskController)
);

router.post(
  '/predict-from-document',
  authenticate,
  upload.single('document'),
  riskController.predictFromDocument.bind(riskController)
);

router.get(
  '/history/:patientId?',
  authenticate,
  validate(getRiskHistoryQuerySchema),
  riskController.getRiskHistory.bind(riskController)
);

router.get(
  '/trends/:patientId?',
  authenticate,
  riskController.getRiskTrends.bind(riskController)
);

export default router;

