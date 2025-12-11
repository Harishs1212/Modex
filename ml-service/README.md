# NeoCareSync ML Service

FastAPI microservice for pregnancy risk prediction using trained ML model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure model file exists:
- `pregnancy_risk_model.pkl` in the root directory
- Optional: `scaler.pkl` and `label_encoder.pkl` in artifacts/ directory

3. Run development server:
```bash
# IMPORTANT: Run from ml-service directory, NOT from app directory
cd ml-service
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `POST /predict` - Predict pregnancy risk

## Prediction Request

```json
{
  "age": 25,
  "systolic_bp": 120,
  "diastolic_bp": 80,
  "blood_sugar": 7.0,
  "body_temp": 98.6,
  "bmi": 22.0,
  "previous_complications": 0,
  "preexisting_diabetes": 0,
  "gestational_diabetes": 0,
  "mental_health": 0,
  "heart_rate": 75
}
```

## Response

```json
{
  "risk_level": "Low",
  "confidence": 0.95,
  "probabilities": {
    "Low": 0.95,
    "High": 0.05
  },
  "explanation": "Risk Factors: 0 | BP Status: Normal | HR Status: Normal | BMI Category: Normal"
}
```

## Testing the Model

Test if the model loads and works correctly:

```bash
cd ml-service
python test_model.py
```

This will:
- Load the model from `pregnancy_risk_model.pkl`
- Test a sample prediction
- Verify everything is working

## Model Files

The service looks for model files in this order:
1. `artifacts/pregnancy_risk_model.pkl` (preferred)
2. `pregnancy_risk_model.pkl` (root directory)

Optional files (improve accuracy):
- `scaler.pkl` - Feature scaler (recommended)
- `label_encoder.pkl` - Label encoder (recommended)

If scaler/encoder are missing, the service will still work but may have reduced accuracy.

## Common Issues

### ModuleNotFoundError: No module named 'app'
**Solution**: Make sure you're running from the `ml-service` directory, not from `ml-service/app` directory.

```bash
# Correct:
cd ml-service
uvicorn app.main:app --reload

# Wrong:
cd ml-service/app
uvicorn app.main:app --reload  # This will fail
```

### Model file not found
**Solution**: Ensure `pregnancy_risk_model.pkl` exists in the `ml-service` directory. This file should be generated from the training notebook.
