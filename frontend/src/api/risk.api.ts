import { apiClient } from './client'

export interface RiskPredictionRequest {
  age: number
  systolic_bp: number
  diastolic_bp: number
  blood_sugar: number
  body_temp: number
  bmi: number
  previous_complications: number
  preexisting_diabetes: number
  gestational_diabetes: number
  mental_health: number
  heart_rate: number
}

export interface RiskPrediction {
  id: string
  risk_level: 'Low' | 'High'
  confidence: number
  probabilities: {
    Low: number
    High: number
  }
  explanation?: string
  createdAt: string
}

export const riskApi = {
  predict: async (data: RiskPredictionRequest) => {
    // Ensure all values are numbers (not strings or NaN)
    const cleanedData = {
      age: Number(data.age),
      systolic_bp: Number(data.systolic_bp),
      diastolic_bp: Number(data.diastolic_bp),
      blood_sugar: Number(data.blood_sugar),
      body_temp: Number(data.body_temp),
      bmi: Number(data.bmi),
      previous_complications: Number(data.previous_complications) || 0,
      preexisting_diabetes: Number(data.preexisting_diabetes) || 0,
      gestational_diabetes: Number(data.gestational_diabetes) || 0,
      mental_health: Number(data.mental_health) || 0,
      heart_rate: Number(data.heart_rate),
    }

    // Validate no NaN values
    for (const [key, value] of Object.entries(cleanedData)) {
      if (isNaN(value as number)) {
        throw new Error(`Invalid value for ${key}: ${data[key as keyof RiskPredictionRequest]}`)
      }
    }

    const response = await apiClient.post<{ 
      message: string
      prediction: RiskPrediction 
    }>('/risk/predict', cleanedData)
    return response.data.prediction
  },

  predictFromDocument: async (file: File) => {
    const formData = new FormData()
    formData.append('document', file)
    const response = await apiClient.post<{
      prediction: RiskPrediction
      document: { id: string; fileName: string }
    }>('/risk/predict-from-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getHistory: async (patientId?: string, page = 1, limit = 10) => {
    const url = patientId ? `/risk/history/${patientId}` : '/risk/history'
    const response = await apiClient.get<{
      predictions: RiskPrediction[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(url, { params: { page, limit } })
    return response.data
  },

  getTrends: async (patientId?: string, days = 30) => {
    const url = patientId ? `/risk/trends/${patientId}` : '/risk/trends'
    const response = await apiClient.get<{
      trends: Array<{
        date: string
        riskLevel: string
        confidence: number
      }>
    }>(url, { params: { days } })
    return response.data
  },
}

