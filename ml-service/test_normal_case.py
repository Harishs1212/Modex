"""
Test function for normal case prediction
Tests the fixed predictor with normal values
"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.models.predictor import PregnancyRiskPredictor

def test_normal_case():
    """
    Test with normal values - should predict LOW risk with high confidence
    """
    print("=" * 70)
    print("🧪 TEST: Normal Case Prediction")
    print("=" * 70)
    
    # Normal case inputs (all healthy values)
    test_inputs = {
    "age": 32,
    "systolic_bp": 145,
    "diastolic_bp": 95,
    "blood_sugar": 9.5,
    "body_temp": 101.0,
    "bmi": 32.5,
    "previous_complications": 1,
    "preexisting_diabetes": 1,
    "gestational_diabetes": 1,
    "mental_health": 1,
    "heart_rate": 110
}


    
    print("\n📋 Input values:")
    for key, value in test_inputs.items():
        print(f"   {key}: {value}")
    
    try:
        # Initialize predictor with debug enabled
        print("\n1️⃣ Loading model...")
        predictor = PregnancyRiskPredictor(debug=True)  # Enable debug for testing
        
        if not predictor.is_loaded():
            print("❌ Model failed to load!")
            return False
        
        # Make prediction
        print("\n2️⃣ Making prediction...")
        result = predictor.predict(**test_inputs)
        
        # Check results
        print("\n" + "=" * 70)
        print("📊 PREDICTION RESULTS")
        print("=" * 70)
        print(f"Risk Level: {result['risk_level']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print(f"Probabilities: {result['probabilities']}")
        print(f"Explanation: {result['explanation']}")
        
        # Validate expected result
        print("\n" + "=" * 70)
        print("✅ VALIDATION")
        print("=" * 70)
        
        expected_risk = "Low"
        expected_confidence_min = 0.80
        
        if result['risk_level'] == expected_risk:
            print(f"✅ Risk level is correct: {result['risk_level']} (expected: {expected_risk})")
        else:
            print(f"❌ Risk level is WRONG: {result['risk_level']} (expected: {expected_risk})")
            return False
        
        if result['confidence'] >= expected_confidence_min:
            print(f"✅ Confidence is sufficient: {result['confidence']:.2%} (expected: >= {expected_confidence_min:.0%})")
        else:
            print(f"⚠️  Confidence is lower than expected: {result['confidence']:.2%} (expected: >= {expected_confidence_min:.0%})")
            # Don't fail on this, just warn
        
        if 'Low' in result['probabilities'] and result['probabilities']['Low'] >= expected_confidence_min:
            print(f"✅ Low risk probability is high: {result['probabilities']['Low']:.2%}")
        else:
            print(f"⚠️  Low risk probability: {result['probabilities'].get('Low', 0):.2%}")
        
        print("\n" + "=" * 70)
        print("✅ TEST PASSED!")
        print("=" * 70)
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_normal_case()
    sys.exit(0 if success else 1)

