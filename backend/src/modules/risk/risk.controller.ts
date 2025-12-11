import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { riskService } from './risk.service';
import { extractFeaturesFromOCR, validateExtractedFeatures } from '../../utils/ocr.client';
import { mlClient } from '../../utils/ml.client';
import prisma from '../../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../../config/env';
import Tesseract from 'tesseract.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = config.upload.uploadDir;
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
});

export class RiskController {
  async predictRisk(req: AuthRequest, res: Response): Promise<void> {
    const prediction = await riskService.predictRisk(req.userId!, req.body);
    res.json({
      message: 'Risk prediction completed',
      prediction,
    });
  }

  async predictFromDocument(req: AuthRequest, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        req.file.path,
        'eng',
        { logger: () => {} }
      );

      // Extract features from OCR text
      const extractedFeatures = extractFeaturesFromOCR(text);
      const validation = validateExtractedFeatures(extractedFeatures);

      if (!validation.valid) {
        // Save document even if extraction incomplete
        const document = await prisma.document.create({
          data: {
            patientId: req.userId!,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: path.extname(req.file.originalname).slice(1),
            fileSize: req.file.size,
            ocrData: text,
            extractedFeatures: extractedFeatures as any,
          },
        });

        res.status(400).json({
          error: 'Could not extract all required features from document',
          missing: validation.missing,
          documentId: document.id,
          extractedFeatures,
        });
        return;
      }

      // Call ML service with extracted features
      const mlRequest = {
        age: extractedFeatures.age!,
        systolic_bp: extractedFeatures.systolic_bp!,
        diastolic_bp: extractedFeatures.diastolic_bp!,
        blood_sugar: extractedFeatures.blood_sugar!,
        body_temp: extractedFeatures.body_temp!,
        bmi: extractedFeatures.bmi!,
        previous_complications: extractedFeatures.previous_complications,
        preexisting_diabetes: extractedFeatures.preexisting_diabetes,
        gestational_diabetes: extractedFeatures.gestational_diabetes,
        mental_health: extractedFeatures.mental_health,
        heart_rate: extractedFeatures.heart_rate!,
      };

      const prediction = await mlClient.predict(mlRequest);

      // Calculate derived features
      const bpDiff = mlRequest.systolic_bp - mlRequest.diastolic_bp;
      let bmiCat = 0;
      if (mlRequest.bmi < 18.5) {
        bmiCat = 0;
      } else if (mlRequest.bmi < 24.9) {
        bmiCat = 1;
      } else if (mlRequest.bmi < 29.9) {
        bmiCat = 2;
      } else {
        bmiCat = 3;
      }
      const highBp = (mlRequest.systolic_bp >= 140 || mlRequest.diastolic_bp >= 90) ? 1 : 0;
      const highHr = mlRequest.heart_rate >= 100 ? 1 : 0;
      const riskFactors = mlRequest.previous_complications + mlRequest.preexisting_diabetes +
        mlRequest.gestational_diabetes + mlRequest.mental_health;

      // Store prediction and document
      const riskPrediction = await prisma.riskPrediction.create({
        data: {
          patientId: req.userId!,
          age: mlRequest.age,
          systolicBp: mlRequest.systolic_bp,
          diastolicBp: mlRequest.diastolic_bp,
          bloodSugar: mlRequest.blood_sugar,
          bodyTemp: mlRequest.body_temp,
          bmi: mlRequest.bmi,
          previousComplications: mlRequest.previous_complications,
          preexistingDiabetes: mlRequest.preexisting_diabetes,
          gestationalDiabetes: mlRequest.gestational_diabetes,
          mentalHealth: mlRequest.mental_health,
          heartRate: mlRequest.heart_rate,
          bpDiff,
          bmiCat,
          highBp,
          highHr,
          riskFactors,
          riskLevel: prediction.risk_level.toUpperCase() as 'LOW' | 'HIGH',
          confidence: prediction.confidence,
          probabilities: prediction.probabilities as any,
          explanation: prediction.explanation,
        },
      });

      const document = await prisma.document.create({
        data: {
          patientId: req.userId!,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileType: path.extname(req.file.originalname).slice(1),
          fileSize: req.file.size,
          ocrData: text,
          extractedFeatures: extractedFeatures as any,
          riskPredictionId: riskPrediction.id,
        },
      });

      // Normalize risk_level to ensure consistent format
      const normalizedRiskLevel = prediction.risk_level.charAt(0).toUpperCase() + 
                                   prediction.risk_level.slice(1).toLowerCase() as 'Low' | 'High';
      
      res.json({
        message: 'Risk prediction from document completed',
        prediction: {
          ...prediction,
          risk_level: normalizedRiskLevel,
          id: riskPrediction.id,
          createdAt: riskPrediction.createdAt,
        },
        document: {
          id: document.id,
          fileName: document.fileName,
        },
      });
    } catch (error) {
      // Clean up uploaded file on error
      await fs.unlink(req.file.path).catch(() => {});
      throw error;
    }
  }

  async getRiskHistory(req: AuthRequest, res: Response): Promise<void> {
    const patientId = req.params.patientId || req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await riskService.getRiskHistory(patientId, page, limit);
    res.json(result);
  }

  async getRiskTrends(req: AuthRequest, res: Response): Promise<void> {
    const patientId = req.params.patientId || req.userId!;
    const days = parseInt(req.query.days as string) || 30;

    const trends = await riskService.getRiskTrends(patientId, days);
    res.json({ trends });
  }
}

export const riskController = new RiskController();
export { upload };

