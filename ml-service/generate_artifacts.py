"""
CRITICAL: Generate missing scaler.pkl and label_encoder.pkl files

The model requires these files for correct predictions.
Run this script to generate them from the training notebook logic.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

def generate_missing_artifacts():
    """
    Generate scaler and label encoder based on training logic
    This is a workaround - ideally these should be saved during training
    """
    print("=" * 70)
    print("🔧 GENERATING MISSING ARTIFACTS")
    print("=" * 70)
    
    base_dir = Path(__file__).parent
    
    # Check if CSV exists
    csv_path = base_dir / "medicalrisk.csv"
    if not csv_path.exists():
        print(f"❌ Error: {csv_path} not found!")
        print("   Cannot generate scaler without training data.")
        print("   Please ensure medicalrisk.csv exists in ml-service directory.")
        return False
    
    print(f"\n1️⃣ Loading training data from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"   Loaded {len(df)} records")
    
    # Feature engineering (match training notebook)
    print("\n2️⃣ Engineering features...")
    
    # Calculate derived features
    df['BP_diff'] = df['Systolic BP'] - df['Diastolic']
    
    # BMI category
    df['BMI_cat'] = 0
    df.loc[df['BMI'] >= 18.5, 'BMI_cat'] = 1
    df.loc[df['BMI'] >= 24.9, 'BMI_cat'] = 2
    df.loc[df['BMI'] >= 29.9, 'BMI_cat'] = 3
    
    # High BP
    df['High_BP'] = ((df['Systolic BP'] >= 140) | (df['Diastolic'] >= 90)).astype(int)
    
    # High HR
    df['High_HR'] = (df['Heart Rate'] >= 100).astype(int)
    
    # Risk factors
    df['Risk_Factors'] = (
        df['Previous Complications'] +
        df['Preexisting Diabetes'] +
        df['Gestational Diabetes'] +
        df['Mental Health']
    )
    
    print("   ✓ Derived features created")
    
    # Define feature columns (match training order)
    feature_cols = [
        'Age', 'Systolic BP', 'Diastolic', 'BS', 'Body Temp', 'BMI',
        'Previous Complications', 'Preexisting Diabetes', 'Gestational Diabetes',
        'Mental Health', 'Heart Rate',
        'BP_diff', 'BMI_cat', 'High_BP', 'High_HR', 'Risk_Factors'
    ]
    
    print(f"\n3️⃣ Creating StandardScaler...")
    X = df[feature_cols].values
    
    scaler = StandardScaler()
    scaler.fit(X)
    
    scaler_path = base_dir / "scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f"   ✅ Scaler saved to: {scaler_path}")
    print(f"   Scaler mean shape: {scaler.mean_.shape}")
    print(f"   Scaler scale shape: {scaler.scale_.shape}")
    
    print(f"\n4️⃣ Creating LabelEncoder...")
    # Remove rows with missing Risk Level
    df_clean = df.dropna(subset=['Risk Level']).copy()
    print(f"   Removed {len(df) - len(df_clean)} rows with missing Risk Level")
    
    # Get unique risk levels (should be ['High', 'Low'])
    unique_levels = df_clean['Risk Level'].unique()
    print(f"   Unique risk levels: {unique_levels}")
    
    label_encoder = LabelEncoder()
    label_encoder.fit(df_clean['Risk Level'].values)
    
    encoder_path = base_dir / "label_encoder.pkl"
    joblib.dump(label_encoder, encoder_path)
    print(f"   ✅ Label encoder saved to: {encoder_path}")
    print(f"   Classes: {label_encoder.classes_}")
    print(f"   Encoding: {dict(zip(label_encoder.classes_, range(len(label_encoder.classes_))))}")
    
    # Verify encoding is correct
    if len(label_encoder.classes_) != 2:
        print(f"   ⚠️  Warning: Expected 2 classes, got {len(label_encoder.classes_)}")
    if 'High' not in label_encoder.classes_ or 'Low' not in label_encoder.classes_:
        print(f"   ⚠️  Warning: Missing expected classes 'High' or 'Low'")
    
    print("\n" + "=" * 70)
    print("✅ Artifacts generated successfully!")
    print("=" * 70)
    print(f"\n📁 Files created:")
    print(f"   - {scaler_path}")
    print(f"   - {encoder_path}")
    print(f"\n⚠️  Note: These artifacts are generated from the full dataset.")
    print("   For production, use artifacts saved during training for exact match.")
    
    return True

if __name__ == "__main__":
    success = generate_missing_artifacts()
    sys.exit(0 if success else 1)

