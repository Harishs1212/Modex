"""
Pregnancy Risk Prediction Model - FIXED VERSION
CRITICAL FIX: Model requires SCALED features - cannot work without scaler!
"""

import os
import joblib
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
from app.utils.feature_engineering import engineer_features

class PregnancyRiskPredictor:
    def __init__(self, debug=False):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.feature_columns = None
        self.debug = debug
        self._load_model()
    
    def _load_model(self):
        """Load the trained model and preprocessing artifacts"""
        try:
            # Get the base directory (ml-service)
            base_dir = Path(__file__).parent.parent.parent
            
            # Try to load from artifacts directory first
            artifacts_dir = base_dir / "artifacts"
            model_path = artifacts_dir / "pregnancy_risk_model.pkl"
            scaler_path = artifacts_dir / "scaler.pkl"
            encoder_path = artifacts_dir / "label_encoder.pkl"
            
            # If artifacts don't exist, try root directory
            if not model_path.exists():
                model_path = base_dir / "pregnancy_risk_model.pkl"
                scaler_path = base_dir / "scaler.pkl"
                encoder_path = base_dir / "label_encoder.pkl"
            
            # Load model - REQUIRED
            if model_path.exists():
                print(f"Loading model from: {model_path}")
                self.model = joblib.load(model_path)
                print("✅ Model loaded successfully")
                
                if self.debug:
                    print(f"   Model type: {type(self.model).__name__}")
                    if hasattr(self.model, 'classes_'):
                        print(f"   Model classes: {self.model.classes_}")
            else:
                raise FileNotFoundError(
                    f"Model file not found. Tried:\n"
                    f"  - {artifacts_dir / 'pregnancy_risk_model.pkl'}\n"
                    f"  - {base_dir / 'pregnancy_risk_model.pkl'}\n"
                    f"Please ensure the model file exists in one of these locations."
                )
            
            # CRITICAL: Load scaler - REQUIRED for correct predictions
            # The model was trained on SCALED features (StandardScaler)
            # Without the scaler, predictions will be completely wrong!
            if scaler_path.exists():
                print(f"Loading scaler from: {scaler_path}")
                self.scaler = joblib.load(scaler_path)
                print("✅ Scaler loaded successfully")
                
                if self.debug:
                    print(f"   Scaler type: {type(self.scaler).__name__}")
                    print(f"   Scaler mean shape: {self.scaler.mean_.shape if hasattr(self.scaler, 'mean_') else 'N/A'}")
                    print(f"   Scaler scale shape: {self.scaler.scale_.shape if hasattr(self.scaler, 'scale_') else 'N/A'}")
            else:
                raise FileNotFoundError(
                    f"❌ CRITICAL ERROR: Scaler file not found at {scaler_path}\n"
                    f"   The model was trained on SCALED features and REQUIRES the scaler.\n"
                    f"   Without it, predictions will be incorrect!\n"
                    f"   Please ensure scaler.pkl exists in the same directory as the model.\n"
                    f"   Tried locations:\n"
                    f"     - {artifacts_dir / 'scaler.pkl'}\n"
                    f"     - {base_dir / 'scaler.pkl'}"
                )
            
            # Load label encoder (if available)
            if encoder_path.exists():
                print(f"Loading label encoder from: {encoder_path}")
                self.label_encoder = joblib.load(encoder_path)
                print("✅ Label encoder loaded successfully")
                
                if self.debug:
                    print(f"   Label encoder classes: {self.label_encoder.classes_}")
                    print(f"   Encoding mapping: {dict(zip(self.label_encoder.classes_, range(len(self.label_encoder.classes_))))}")
            else:
                print(f"⚠️  Warning: Label encoder not found at {encoder_path}")
                print("   Creating default encoder with correct mapping: High=0, Low=1")
                # CRITICAL FIX: Match training encoding exactly
                # From notebook: LabelEncoder encodes alphabetically -> High=0, Low=1
                self.label_encoder = LabelEncoder()
                self.label_encoder.classes_ = np.array(['High', 'Low'])  # Alphabetical order
                if self.debug:
                    print(f"   Default encoding: High=0, Low=1")
            
            print(f"\n🎯 Model ready for predictions!")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None and self.scaler is not None
    
    def predict(
        self,
        age: float,
        systolic_bp: float,
        diastolic_bp: float,
        blood_sugar: float,
        body_temp: float,
        bmi: float,
        previous_complications: int,
        preexisting_diabetes: int,
        gestational_diabetes: int,
        mental_health: int,
        heart_rate: float
    ) -> dict:
        """
        Predict pregnancy risk level
        
        Returns:
            dict with keys: risk_level, confidence, probabilities, explanation
        """
        if not self.is_loaded():
            raise RuntimeError("Model or scaler not loaded")
        
        # Engineer features (16 features total: 11 base + 5 derived)
        # Order MUST match training: [age, sbp, dbp, bs, temp, bmi, prev_comp, pre_diab, 
        #                             ges_diab, mental, hr, bp_diff, bmi_cat, high_bp, high_hr, risk_factors]
        features = engineer_features(
            age=age,
            systolic_bp=systolic_bp,
            diastolic_bp=diastolic_bp,
            blood_sugar=blood_sugar,
            body_temp=body_temp,
            bmi=bmi,
            previous_complications=previous_complications,
            preexisting_diabetes=preexisting_diabetes,
            gestational_diabetes=gestational_diabetes,
            mental_health=mental_health,
            heart_rate=heart_rate
        )
        
        if self.debug:
            print(f"\n🔍 DEBUG: Feature vector shape: {features.shape}")
            print(f"   Raw features: {features}")
            print(f"   Feature ranges: min={features.min():.2f}, max={features.max():.2f}, mean={features.mean():.2f}")
        
        # Reshape for model input (1 sample, 16 features)
        features_2d = features.reshape(1, -1)
        
        # CRITICAL: Scale features - REQUIRED!
        # The model was trained on StandardScaler-transformed features
        # Without scaling, feature values are in wrong ranges and predictions will be wrong
        try:
            features_scaled = self.scaler.transform(features_2d)
            
            if self.debug:
                print(f"\n🔍 DEBUG: After scaling:")
                print(f"   Scaled features: {features_scaled[0]}")
                print(f"   Scaled ranges: min={features_scaled.min():.2f}, max={features_scaled.max():.2f}")
                print(f"   Scaled mean: {features_scaled.mean():.4f} (should be ~0)")
                print(f"   Scaled std: {features_scaled.std():.4f} (should be ~1)")
        except Exception as e:
            raise RuntimeError(f"Scaler transform failed: {e}. This is critical - model requires scaled features!")
        
        # Predict - model returns encoded class (0=High, 1=Low)
        prediction_encoded = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        if self.debug:
            print(f"\n🔍 DEBUG: Raw model output:")
            print(f"   Encoded prediction: {prediction_encoded}")
            print(f"   Probability array: {probabilities}")
            print(f"   Probability array shape: {probabilities.shape}")
            print(f"   Label encoder classes: {self.label_encoder.classes_}")
        
        # CRITICAL FIX: Decode prediction using label encoder
        # The model outputs encoded class: 0=High, 1=Low (from training)
        if hasattr(self.label_encoder, 'inverse_transform'):
            try:
                risk_level = self.label_encoder.inverse_transform([prediction_encoded])[0]
                if self.debug:
                    print(f"   Decoded risk level: {risk_level}")
            except Exception as e:
                if self.debug:
                    print(f"⚠️  Warning: inverse_transform failed: {e}")
                # Fallback: Based on training encoding High=0, Low=1
                risk_level = 'High' if prediction_encoded == 0 else 'Low'
                if self.debug:
                    print(f"   Using fallback: {risk_level}")
        else:
            # Fallback if encoder doesn't have inverse_transform
            # CRITICAL: Match training encoding exactly
            risk_level = 'High' if prediction_encoded == 0 else 'Low'
            if self.debug:
                print(f"   Using fallback mapping: {risk_level}")
        
        # CRITICAL FIX: Get confidence from correct probability index
        # probabilities array is ordered by label_encoder.classes_ order
        # classes_ = ['High', 'Low'] -> probabilities[0] = P(High), probabilities[1] = P(Low)
        confidence = float(probabilities[prediction_encoded])
        if self.debug:
            print(f"   Confidence (P(class={prediction_encoded})): {confidence:.4f}")
        
        # CRITICAL FIX: Create probabilities dict with correct mapping
        # probabilities array index corresponds to label_encoder.classes_ index
        prob_dict = {}
        for i, class_name in enumerate(self.label_encoder.classes_):
            prob_dict[class_name] = float(probabilities[i])
            if self.debug:
                print(f"   P({class_name}) = {probabilities[i]:.4f}")
        
        # Generate explanation (doesn't affect prediction, just for display)
        bp_diff = systolic_bp - diastolic_bp
        high_bp = 1 if (systolic_bp >= 140 or diastolic_bp >= 90) else 0
        high_hr = 1 if heart_rate >= 100 else 0
        risk_factors = previous_complications + preexisting_diabetes + gestational_diabetes + mental_health
        
        bmi_cat_names = ['Underweight', 'Normal', 'Overweight', 'Obese']
        if bmi < 18.5:
            bmi_cat = 0
        elif bmi < 24.9:
            bmi_cat = 1
        elif bmi < 29.9:
            bmi_cat = 2
        else:
            bmi_cat = 3
        
        explanation = (
            f"Risk Factors: {risk_factors} | "
            f"BP Status: {'High' if high_bp else 'Normal'} | "
            f"HR Status: {'Elevated' if high_hr else 'Normal'} | "
            f"BMI Category: {bmi_cat_names[bmi_cat]}"
        )
        
        result = {
            'risk_level': risk_level,
            'confidence': confidence,
            'probabilities': prob_dict,
            'explanation': explanation
        }
        
        if self.debug:
            print(f"\n✅ Final prediction: {risk_level} (confidence: {confidence:.2%})")
        
        return result
