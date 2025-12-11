import { logger } from './logger';

export interface ExtractedFeatures {
  age: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  blood_sugar: number | null;
  body_temp: number | null;
  bmi: number | null;
  previous_complications: number;
  preexisting_diabetes: number;
  gestational_diabetes: number;
  mental_health: number;
  heart_rate: number | null;
}

/**
 * Extract medical features from OCR text using regex patterns
 */
export function extractFeaturesFromOCR(ocrText: string): ExtractedFeatures {
  const text = ocrText.toLowerCase();
  
  // Initialize with defaults
  const features: ExtractedFeatures = {
    age: null,
    systolic_bp: null,
    diastolic_bp: null,
    blood_sugar: null,
    body_temp: null,
    bmi: null,
    previous_complications: 0,
    preexisting_diabetes: 0,
    gestational_diabetes: 0,
    mental_health: 0,
    heart_rate: null,
  };

  // Age patterns
  const agePatterns = [
    /age[:\s]*(\d+)/i,
    /(\d+)\s*years?\s*old/i,
    /(\d+)\s*y\.?o\.?/i,
  ];
  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) {
      features.age = parseInt(match[1], 10);
      break;
    }
  }

  // Blood Pressure patterns
  const bpPatterns = [
    /bp[:\s]*(\d+)\s*\/\s*(\d+)/i,
    /blood\s*pressure[:\s]*(\d+)\s*\/\s*(\d+)/i,
    /(\d+)\s*\/\s*(\d+)\s*mmhg/i,
    /(\d+)\s*\/\s*(\d+)\s*mm\s*hg/i,
  ];
  for (const pattern of bpPatterns) {
    const match = text.match(pattern);
    if (match) {
      features.systolic_bp = parseFloat(match[1]);
      features.diastolic_bp = parseFloat(match[2]);
      break;
    }
  }

  // Blood Sugar patterns
  const bsPatterns = [
    /blood\s*sugar[:\s]*(\d+\.?\d*)/i,
    /bs[:\s]*(\d+\.?\d*)/i,
    /glucose[:\s]*(\d+\.?\d*)/i,
    /sugar[:\s]*(\d+\.?\d*)\s*mg\/dl/i,
  ];
  for (const pattern of bsPatterns) {
    const match = text.match(pattern);
    if (match) {
      features.blood_sugar = parseFloat(match[1]);
      break;
    }
  }

  // Body Temperature patterns
  const tempPatterns = [
    /temperature[:\s]*(\d+\.?\d*)/i,
    /temp[:\s]*(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*°?\s*f/i,
    /(\d+\.?\d*)\s*degrees?\s*fahrenheit/i,
  ];
  for (const pattern of tempPatterns) {
    const match = text.match(pattern);
    if (match) {
      features.body_temp = parseFloat(match[1]);
      break;
    }
  }

  // BMI patterns
  const bmiPatterns = [
    /bmi[:\s]*(\d+\.?\d*)/i,
    /body\s*mass\s*index[:\s]*(\d+\.?\d*)/i,
  ];
  for (const pattern of bmiPatterns) {
    const match = text.match(pattern);
    if (match) {
      features.bmi = parseFloat(match[1]);
      break;
    }
  }

  // Heart Rate patterns
  const hrPatterns = [
    /heart\s*rate[:\s]*(\d+)/i,
    /hr[:\s]*(\d+)/i,
    /pulse[:\s]*(\d+)/i,
    /(\d+)\s*bpm/i,
  ];
  for (const pattern of hrPatterns) {
    const match = text.match(pattern);
    if (match) {
      features.heart_rate = parseFloat(match[1]);
      break;
    }
  }

  // Binary flags - check for keywords
  const complicationKeywords = [
    'complication', 'previous complication', 'history of complication',
    'prior complication', 'past complication',
  ];
  if (complicationKeywords.some(keyword => text.includes(keyword))) {
    features.previous_complications = 1;
  }

  const preexistingDiabetesKeywords = [
    'preexisting diabetes', 'pre-existing diabetes', 'type 1 diabetes',
    'type 2 diabetes', 'diabetes mellitus', 'diabetic',
  ];
  if (preexistingDiabetesKeywords.some(keyword => text.includes(keyword))) {
    features.preexisting_diabetes = 1;
  }

  const gestationalDiabetesKeywords = [
    'gestational diabetes', 'gdm', 'gestational diabetes mellitus',
  ];
  if (gestationalDiabetesKeywords.some(keyword => text.includes(keyword))) {
    features.gestational_diabetes = 1;
  }

  const mentalHealthKeywords = [
    'mental health', 'depression', 'anxiety', 'mental disorder',
    'psychological', 'psychiatric', 'bipolar', 'ptsd',
  ];
  if (mentalHealthKeywords.some(keyword => text.includes(keyword))) {
    features.mental_health = 1;
  }

  logger.debug('Extracted features from OCR:', features);
  return features;
}

/**
 * Validate that all required features are extracted
 */
export function validateExtractedFeatures(features: ExtractedFeatures): {
  valid: boolean;
  missing: string[];
} {
  const required = [
    'age',
    'systolic_bp',
    'diastolic_bp',
    'blood_sugar',
    'body_temp',
    'bmi',
    'heart_rate',
  ];

  const missing: string[] = [];
  for (const field of required) {
    if (features[field as keyof ExtractedFeatures] === null) {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

