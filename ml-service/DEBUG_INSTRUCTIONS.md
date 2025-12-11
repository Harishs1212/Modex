# Debug Instructions for ML Prediction Issue

## Problem
When testing with LOW risk values in Python directly, predictions are correct. But when using the frontend, LOW risk values are showing as HIGH risk.

## Solution Steps

### 1. Restart ML Service with Debug Mode
The ML service now has debug logging enabled. Restart it to see detailed logs:

```bash
cd ml-service
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### 2. Check ML Service Logs
When you submit a prediction from the frontend, you should see:
- Incoming request values
- Feature engineering details
- Scaled features
- Model prediction output
- Final risk level

### 3. Test API Directly
Run the test script to verify the API works correctly:

```bash
cd ml-service
python test_api_request.py
```

This will test the API endpoint with low risk values and show you the exact response.

### 4. Check Backend Logs
The backend now logs:
- Request sent to ML service
- Response received from ML service

Check your backend console for these logs.

### 5. Verify Scaler is Loaded
When the ML service starts, you should see:
```
✅ Scaler loaded successfully
```

If you see an error about missing scaler.pkl, run:
```bash
python generate_artifacts.py
```

### 6. Common Issues

**Issue: Scaler not loaded**
- Solution: Run `python generate_artifacts.py` to generate scaler.pkl

**Issue: Wrong predictions**
- Check the debug logs to see:
  - Are features being scaled? (Should see "Scaled features" in logs)
  - What is the model output? (Should see encoded prediction: 0 or 1)
  - What is the decoded risk level? (Should see "Decoded risk level: Low" or "High")

**Issue: Version mismatch**
- If you see sklearn version warnings, they're usually safe to ignore
- But if predictions are wrong, try matching the sklearn version used during training

## Expected Behavior

For LOW risk values (normal/healthy):
- Age: 28, BP: 120/80, BS: 7.0, Temp: 98.6, BMI: 22, HR: 75
- All risk factors: 0
- Expected prediction: **Low** (displayed as **Normal** in UI)

The debug logs will show you exactly what's happening at each step.

