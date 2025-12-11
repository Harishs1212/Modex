import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { riskApi, RiskPredictionRequest } from '../api/risk.api'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Activity, Save, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'

export default function RiskPrediction() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<RiskPredictionRequest>({
    age: 25,
    systolic_bp: 120,
    diastolic_bp: 80,
    blood_sugar: 7.0,
    body_temp: 98.6,
    bmi: 22.0,
    previous_complications: 0,
    preexisting_diabetes: 0,
    gestational_diabetes: 0,
    mental_health: 0,
    heart_rate: 75,
  })

  const [file, setFile] = useState<File | null>(null)

  const [predictionResult, setPredictionResult] = useState<{
    risk_level: string
    explanation?: string
  } | null>(null)

  const predictMutation = useMutation({
    mutationFn: (data: RiskPredictionRequest) => riskApi.predict(data),
    onSuccess: (data) => {
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['risk-history'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      
      // Normalize risk level (handle both 'Low'/'High' and 'LOW'/'HIGH')
      const riskLevel = data.risk_level || ''
      const normalizedRisk = riskLevel.toLowerCase() === 'low' ? 'Low' : 
                            riskLevel.toLowerCase() === 'high' ? 'High' : riskLevel
      
      // Map Low to Normal for display
      const displayRisk = normalizedRisk === 'Low' ? 'Normal' : normalizedRisk
      
      console.log('Prediction result:', { 
        original: data.risk_level, 
        normalized: normalizedRisk, 
        display: displayRisk,
        explanation: data.explanation 
      })
      
      setPredictionResult({
        risk_level: displayRisk,
        explanation: data.explanation
      })
      
      // Auto-navigate after 3 seconds to show result
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    },
  })

  const predictFromDocMutation = useMutation({
    mutationFn: (file: File) => riskApi.predictFromDocument(file),
    onSuccess: (data) => {
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['risk-history'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      
      // Map Low to Normal for display
      const displayRisk = data.prediction.risk_level === 'Low' ? 'Normal' : data.prediction.risk_level
      
      setPredictionResult({
        risk_level: displayRisk,
        explanation: data.prediction.explanation
      })
      
      // Auto-navigate after 3 seconds to show result
      setTimeout(() => {
        navigate('/dashboard')
      }, 3000)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate and clean form data
    const cleanedData: RiskPredictionRequest = {
      age: Number(formData.age) || 0,
      systolic_bp: Number(formData.systolic_bp) || 0,
      diastolic_bp: Number(formData.diastolic_bp) || 0,
      blood_sugar: Number(formData.blood_sugar) || 0,
      body_temp: Number(formData.body_temp) || 0,
      bmi: Number(formData.bmi) || 0,
      previous_complications: formData.previous_complications || 0,
      preexisting_diabetes: formData.preexisting_diabetes || 0,
      gestational_diabetes: formData.gestational_diabetes || 0,
      mental_health: formData.mental_health || 0,
      heart_rate: Number(formData.heart_rate) || 0,
    }

    // Basic validation
    if (cleanedData.age < 15 || cleanedData.age > 50) {
      alert('Age must be between 15 and 50 years')
      return
    }
    if (cleanedData.systolic_bp < 80 || cleanedData.systolic_bp > 180) {
      alert('Systolic BP must be between 80 and 180 mmHg')
      return
    }
    if (cleanedData.diastolic_bp < 40 || cleanedData.diastolic_bp > 120) {
      alert('Diastolic BP must be between 40 and 120 mmHg')
      return
    }
    if (cleanedData.blood_sugar < 3 || cleanedData.blood_sugar > 15) {
      alert('Blood sugar must be between 3 and 15 mmol/L')
      return
    }
    if (cleanedData.body_temp < 95 || cleanedData.body_temp > 104) {
      alert('Body temperature must be between 95 and 104 °F')
      return
    }
    if (cleanedData.bmi < 10 || cleanedData.bmi > 50) {
      alert('BMI must be between 10 and 50')
      return
    }
    if (cleanedData.heart_rate < 40 || cleanedData.heart_rate > 120) {
      alert('Heart rate must be between 40 and 120 bpm')
      return
    }

    predictMutation.mutate(cleanedData)
  }

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      predictFromDocMutation.mutate(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Activity className="w-6 h-6 mr-3 text-blue-600" />
          Risk Prediction Assessment
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manual Input Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Manual Data Entry
              </h3>
              <p className="text-sm text-gray-500 mt-1">Enter patient vitals manually for prediction</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age (Years)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bmi}
                      onChange={(e) => setFormData({ ...formData, bmi: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={formData.systolic_bp}
                      onChange={(e) => setFormData({ ...formData, systolic_bp: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={formData.diastolic_bp}
                      onChange={(e) => setFormData({ ...formData, diastolic_bp: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Sugar (mmol/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.blood_sugar}
                      onChange={(e) => setFormData({ ...formData, blood_sugar: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.body_temp}
                      onChange={(e) => setFormData({ ...formData, body_temp: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={formData.heart_rate}
                      onChange={(e) => setFormData({ ...formData, heart_rate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Risk Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.previous_complications === 1}
                        onChange={(e) => setFormData({ ...formData, previous_complications: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">Previous Complications</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.preexisting_diabetes === 1}
                        onChange={(e) => setFormData({ ...formData, preexisting_diabetes: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">Preexisting Diabetes</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.gestational_diabetes === 1}
                        onChange={(e) => setFormData({ ...formData, gestational_diabetes: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">Gestational Diabetes</span>
                    </label>
                    
                    <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.mental_health === 1}
                        onChange={(e) => setFormData({ ...formData, mental_health: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">Mental Health Issues</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={predictMutation.isPending}
                    className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    {predictMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Predict Risk Level
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-500" />
                Upload Report
              </h3>
              <p className="text-sm text-gray-500 mt-1">AI extract from medical records</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleFileSubmit} className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, PNG, JPG up to 10MB
                  </p>
                  {file && (
                    <div className="mt-4 p-2 bg-blue-50 text-blue-700 text-sm rounded flex items-center justify-center">
                      <Save className="w-4 h-4 mr-2" />
                      {file.name}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!file || predictFromDocMutation.isPending}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {predictFromDocMutation.isPending ? 'Processing...' : 'Analyze Document'}
                </button>
              </form>
              
              <div className="mt-6 text-xs text-gray-500">
                <h4 className="font-medium text-gray-700 mb-2">Supported Documents:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Blood Test Reports</li>
                  <li>Ultrasound Summaries</li>
                  <li>Clinical Vitals Sheets</li>
                  <li>Prescription Notes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Result Display - Hospital Style */}
      {predictionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className={`p-8 ${
              predictionResult.risk_level === 'High'
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-b-4 border-red-500'
                : 'bg-gradient-to-r from-green-50 to-green-100 border-b-4 border-green-500'
            }`}>
              <div className="flex items-center justify-center space-x-6">
                <div className={`p-6 rounded-full shadow-lg ${
                  predictionResult.risk_level === 'High'
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {predictionResult.risk_level === 'High' ? (
                    <AlertTriangle className="w-16 h-16" />
                  ) : (
                    <CheckCircle className="w-16 h-16" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-2">Risk Assessment Result</p>
                  <h2 className={`text-6xl font-bold ${
                    predictionResult.risk_level === 'High'
                      ? 'text-red-700'
                      : 'text-green-700'
                  }`}>
                    {predictionResult.risk_level}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">Pregnancy Risk Status</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white">
              {predictionResult.explanation && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Clinical Indicators</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                    {predictionResult.explanation}
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-lg border-l-4 ${
                predictionResult.risk_level === 'High'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <p className="text-sm font-semibold text-gray-900 mb-1">Medical Recommendation</p>
                <p className="text-sm text-gray-700">
                  {predictionResult.risk_level === 'High'
                    ? 'Please consult with your healthcare provider immediately for further evaluation and monitoring.'
                    : 'Continue with regular prenatal care and follow your healthcare provider\'s guidelines.'}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setPredictionResult(null)
                  navigate('/dashboard')
                }}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {predictMutation.error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md z-50">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Assessment Failed</h4>
              <p className="text-sm">
                {predictMutation.error instanceof Error 
                  ? predictMutation.error.message 
                  : 'An error occurred while predicting risk. Please check your input values and try again.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
