"""
Quick test script to verify the ML model is loaded and working
Run this from ml-service directory: python test_model.py
"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.models.predictor import PregnancyRiskPredictor

def test_model():
    print("=" * 60)
    print("🧪 Testing Pregnancy Risk Prediction Model")
    print("=" * 60)
    
    try:
        # Initialize predictor (loads model)
        print("\n1️⃣ Loading model...")
        predictor = PregnancyRiskPredictor()
        
        if not predictor.is_loaded():
            print("❌ Model failed to load!")
            return False
        
        print("✅ Model loaded successfully!")
        
        # Test prediction
        print("\n2️⃣ Testing prediction with sample data...")
        test_data = {
    "age": 23,
    "systolic_bp": 108,
    "diastolic_bp": 70,
    "blood_sugar": 6.2,
    "body_temp": 98.2,
    "bmi": 21.0,
    "previous_complications": 0,
    "preexisting_diabetes": 0,
    "gestational_diabetes": 0,
    "mental_health": 0,
    "heart_rate": 72
}

        
        result = predictor.predict(**test_data)
        
        print(f"\n✅ Prediction successful!")
        print(f"   Risk Level: {result['risk_level']}")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   Probabilities: {result['probabilities']}")
        print(f"   Explanation: {result['explanation']}")
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Model is working correctly.")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model()
    sys.exit(0 if success else 1)

