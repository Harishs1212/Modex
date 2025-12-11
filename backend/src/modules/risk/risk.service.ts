import prisma from '../../config/database';
import { mlClient, MLPredictionRequest } from '../../utils/ml.client';
import { RedisClient } from '../../utils/redis.client';
import { REDIS_KEYS, REDIS_TTL } from '../../utils/constants';
import { PredictRiskInput } from './risk.types';

export class RiskService {
  /**
   * Predict risk from manual input
   */
  async predictRisk(patientId: string, data: PredictRiskInput) {
    // Prepare ML request
    const mlRequest: MLPredictionRequest = {
      age: data.age,
      systolic_bp: data.systolic_bp,
      diastolic_bp: data.diastolic_bp,
      blood_sugar: data.blood_sugar,
      body_temp: data.body_temp,
      bmi: data.bmi,
      previous_complications: data.previous_complications,
      preexisting_diabetes: data.preexisting_diabetes,
      gestational_diabetes: data.gestational_diabetes,
      mental_health: data.mental_health,
      heart_rate: data.heart_rate,
    };

    // Call ML service
    const prediction = await mlClient.predict(mlRequest);

    // Calculate derived features
    const bpDiff = data.systolic_bp - data.diastolic_bp;
    
    let bmiCat = 0;
    if (data.bmi < 18.5) {
      bmiCat = 0; // Underweight
    } else if (data.bmi < 24.9) {
      bmiCat = 1; // Normal
    } else if (data.bmi < 29.9) {
      bmiCat = 2; // Overweight
    } else {
      bmiCat = 3; // Obese
    }

    const highBp = (data.systolic_bp >= 140 || data.diastolic_bp >= 90) ? 1 : 0;
    const highHr = data.heart_rate >= 100 ? 1 : 0;
    const riskFactors = data.previous_complications + data.preexisting_diabetes +
      data.gestational_diabetes + data.mental_health;

    // Store prediction in database
    const riskPrediction = await prisma.riskPrediction.create({
      data: {
        patientId,
        age: data.age,
        systolicBp: data.systolic_bp,
        diastolicBp: data.diastolic_bp,
        bloodSugar: data.blood_sugar,
        bodyTemp: data.body_temp,
        bmi: data.bmi,
        previousComplications: data.previous_complications,
        preexistingDiabetes: data.preexisting_diabetes,
        gestationalDiabetes: data.gestational_diabetes,
        mentalHealth: data.mental_health,
        heartRate: data.heart_rate,
        bpDiff,
        bmiCat,
        highBp,
        highHr,
        riskFactors,
        riskLevel: prediction.risk_level.toUpperCase() as 'LOW' | 'HIGH',
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        explanation: prediction.explanation,
      },
    });

    // Cache result in Redis
    const timestamp = new Date().toISOString();
    await RedisClient.setCache(
      REDIS_KEYS.riskCache(patientId, timestamp),
      JSON.stringify({
        riskLevel: prediction.risk_level,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
      }),
      REDIS_TTL.riskCache
    );

    // Return prediction with normalized risk_level (ensure it's 'Low' or 'High')
    return {
      ...prediction,
      risk_level: prediction.risk_level.charAt(0).toUpperCase() + prediction.risk_level.slice(1).toLowerCase() as 'Low' | 'High',
      id: riskPrediction.id,
      createdAt: riskPrediction.createdAt,
    };
  }

  /**
   * Get risk prediction history
   */
  async getRiskHistory(patientId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      prisma.riskPrediction.findMany({
        where: { patientId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          riskLevel: true,
          confidence: true,
          probabilities: true,
          explanation: true,
          createdAt: true,
        },
      }),
      prisma.riskPrediction.count({
        where: { patientId },
      }),
    ]);

    // Normalize risk levels to 'Low' or 'High' format
    const normalizedPredictions = predictions.map((p) => ({
      ...p,
      risk_level: p.riskLevel === 'LOW' ? 'Low' : p.riskLevel === 'HIGH' ? 'High' : p.riskLevel,
    }));

    return {
      predictions: normalizedPredictions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get risk trends over time
   */
  async getRiskTrends(patientId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const predictions = await prisma.riskPrediction.findMany({
      where: {
        patientId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        riskLevel: true,
        confidence: true,
        createdAt: true,
      },
    });

    return predictions.map((p) => ({
      date: p.createdAt.toISOString(),
      riskLevel: p.riskLevel,
      confidence: p.confidence,
    }));
  }
}

export const riskService = new RiskService();

