"""
Test the ML service API endpoint with low risk values
This mimics exactly what the frontend sends
"""

import requests
import json

def test_low_risk_api():
    """Test API with low risk values"""
    print("=" * 70)
    print("🧪 TEST: API Request with Low Risk Values")
    print("=" * 70)
    
    # Low risk values (normal/healthy)
    test_data = {
        "age": 28,
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
    
    print("\n📋 Sending request to ML service:")
    print(json.dumps(test_data, indent=2))
    
    try:
        response = requests.post(
            "http://localhost:8000/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n📊 PREDICTION RESULT:")
            print(f"Risk Level: {result['risk_level']}")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"Probabilities: {result['probabilities']}")
            print(f"Explanation: {result.get('explanation', 'N/A')}")
            
            # Validate
            if result['risk_level'] == 'Low':
                print("\n✅ CORRECT: Predicted Low risk (should be Normal in UI)")
            else:
                print(f"\n❌ WRONG: Predicted {result['risk_level']} (expected Low)")
                return False
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to ML service at http://localhost:8000")
        print("   Make sure the ML service is running:")
        print("   uvicorn app.main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = test_low_risk_api()
    exit(0 if success else 1)

