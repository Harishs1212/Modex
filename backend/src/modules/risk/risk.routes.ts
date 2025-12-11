import { Router } from 'express';
import { riskController, upload } from './risk.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { USER_ROLES } from '../../utils/constants';
import {
  predictRiskSchema,
  getRiskHistoryQuerySchema,
} from './risk.types';

const router = Router();

// Risk prediction is only accessible to DOCTOR and PATIENT (not ADMIN)
router.post(
  '/predict',
  authenticate,
  authorize(USER_ROLES.DOCTOR, USER_ROLES.PATIENT),
  validate(predictRiskSchema),
  riskController.predictRisk.bind(riskController)
);

router.post(
  '/predict-from-document',
  authenticate,
  authorize(USER_ROLES.DOCTOR, USER_ROLES.PATIENT),
  upload.single('document'),
  riskController.predictFromDocument.bind(riskController)
);

router.get(
  '/history/:patientId?',
  authenticate,
  authorize(USER_ROLES.DOCTOR, USER_ROLES.PATIENT),
  validate(getRiskHistoryQuerySchema),
  riskController.getRiskHistory.bind(riskController)
);

router.get(
  '/trends/:patientId?',
  authenticate,
  authorize(USER_ROLES.DOCTOR, USER_ROLES.PATIENT),
  riskController.getRiskTrends.bind(riskController)
);

export default router;

