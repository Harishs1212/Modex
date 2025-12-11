from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
import os
from app.models.predictor import PregnancyRiskPredictor

app = FastAPI(
    title="NeoCareSync ML Service",
    description="Pregnancy Risk Prediction ML Microservice",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor (set debug=True for detailed logging)
predictor = PregnancyRiskPredictor(debug=True)  # Set to True for debugging

class PredictionRequest(BaseModel):
    age: float = Field(..., ge=15, le=50, description="Patient age in years")
    systolic_bp: float = Field(..., ge=80, le=180, description="Systolic blood pressure (mmHg)")
    diastolic_bp: float = Field(..., ge=40, le=120, description="Diastolic blood pressure (mmHg)")
    blood_sugar: float = Field(..., ge=3, le=15, description="Blood sugar level (mg/dL)")
    body_temp: float = Field(..., ge=95, le=104, description="Body temperature (°F)")
    bmi: float = Field(..., ge=10, le=50, description="Body Mass Index")
    previous_complications: int = Field(..., ge=0, le=1, description="Previous complications (0=No, 1=Yes)")
    preexisting_diabetes: int = Field(..., ge=0, le=1, description="Preexisting diabetes (0=No, 1=Yes)")
    gestational_diabetes: int = Field(..., ge=0, le=1, description="Gestational diabetes (0=No, 1=Yes)")
    mental_health: int = Field(..., ge=0, le=1, description="Mental health issues (0=No, 1=Yes)")
    heart_rate: float = Field(..., ge=40, le=120, description="Heart rate (bpm)")

class PredictionResponse(BaseModel):
    risk_level: str = Field(..., description="Risk level: Low or High")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence")
    probabilities: dict = Field(..., description="Probability for each risk level")
    explanation: Optional[str] = Field(None, description="Explanation of the prediction")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "ml-service",
        "model_loaded": predictor.is_loaded(),
        "model_type": str(type(predictor.model).__name__) if predictor.model else None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_risk(request: PredictionRequest):
    """
    Predict pregnancy risk level from patient vitals
    
    Accepts 11 base features and returns risk prediction with confidence scores.
    """
    try:
        # Log incoming request for debugging
        print("\n" + "=" * 70)
        print("📥 INCOMING PREDICTION REQUEST")
        print("=" * 70)
        print(f"Age: {request.age}")
        print(f"Systolic BP: {request.systolic_bp}")
        print(f"Diastolic BP: {request.diastolic_bp}")
        print(f"Blood Sugar: {request.blood_sugar}")
        print(f"Body Temp: {request.body_temp}")
        print(f"BMI: {request.bmi}")
        print(f"Previous Complications: {request.previous_complications}")
        print(f"Preexisting Diabetes: {request.preexisting_diabetes}")
        print(f"Gestational Diabetes: {request.gestational_diabetes}")
        print(f"Mental Health: {request.mental_health}")
        print(f"Heart Rate: {request.heart_rate}")
        print("=" * 70)
        
        result = predictor.predict(
            age=float(request.age),
            systolic_bp=float(request.systolic_bp),
            diastolic_bp=float(request.diastolic_bp),
            blood_sugar=float(request.blood_sugar),
            body_temp=float(request.body_temp),
            bmi=float(request.bmi),
            previous_complications=int(request.previous_complications),
            preexisting_diabetes=int(request.preexisting_diabetes),
            gestational_diabetes=int(request.gestational_diabetes),
            mental_health=int(request.mental_health),
            heart_rate=float(request.heart_rate)
        )
        
        print("\n" + "=" * 70)
        print("📤 PREDICTION RESULT")
        print("=" * 70)
        print(f"Risk Level: {result['risk_level']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Probabilities: {result['probabilities']}")
        print("=" * 70 + "\n")
        
        return PredictionResponse(**result)
    except Exception as e:
        print(f"\n❌ PREDICTION ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

