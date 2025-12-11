import axios from 'axios';
import { config } from '../config/env';
import { logger } from './logger';

export interface MLPredictionRequest {
  age: number;
  systolic_bp: number;
  diastolic_bp: number;
  blood_sugar: number;
  body_temp: number;
  bmi: number;
  previous_complications: number;
  preexisting_diabetes: number;
  gestational_diabetes: number;
  mental_health: number;
  heart_rate: number;
}

export interface MLPredictionResponse {
  risk_level: 'Low' | 'High';
  confidence: number;
  probabilities: {
    Low: number;
    High: number;
  };
  explanation?: string;
}

export class MLClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.mlService.url;
  }

  /**
   * Predict pregnancy risk from base features
   */
  async predict(features: MLPredictionRequest): Promise<MLPredictionResponse> {
    try {
      // Log the request being sent to ML service
      logger.info('Sending prediction request to ML service:', {
        age: features.age,
        systolic_bp: features.systolic_bp,
        diastolic_bp: features.diastolic_bp,
        blood_sugar: features.blood_sugar,
        body_temp: features.body_temp,
        bmi: features.bmi,
        previous_complications: features.previous_complications,
        preexisting_diabetes: features.preexisting_diabetes,
        gestational_diabetes: features.gestational_diabetes,
        mental_health: features.mental_health,
        heart_rate: features.heart_rate,
      });

      const response = await axios.post<MLPredictionResponse>(
        `${this.baseUrl}/predict`,
        features,
        {
          timeout: 10000, // 10 seconds timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the response
      logger.info('ML Service prediction response:', {
        risk_level: response.data.risk_level,
        confidence: response.data.confidence,
        probabilities: response.data.probabilities,
      });

      return response.data;
    } catch (error) {
      logger.error('ML Service prediction error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`ML Service error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Health check for ML service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error('ML Service health check failed:', error);
      return false;
    }
  }
}

export const mlClient = new MLClient();

