"""
Feature engineering utilities for pregnancy risk prediction
Matches the feature engineering logic from the training notebook
"""

import numpy as np

def calculate_bp_diff(systolic_bp: float, diastolic_bp: float) -> float:
    """Calculate blood pressure difference"""
    return systolic_bp - diastolic_bp

def categorize_bmi(bmi: float) -> int:
    """
    Categorize BMI into classes:
    0 = Underweight (< 18.5)
    1 = Normal (18.5 - 24.9)
    2 = Overweight (25 - 29.9)
    3 = Obese (>= 30)
    """
    if bmi < 18.5:
        return 0
    elif bmi < 24.9:
        return 1
    elif bmi < 29.9:
        return 2
    else:
        return 3

def is_high_bp(systolic_bp: float, diastolic_bp: float) -> int:
    """Check if blood pressure is high (1 if high, 0 otherwise)"""
    return 1 if (systolic_bp >= 140 or diastolic_bp >= 90) else 0

def is_high_hr(heart_rate: float) -> int:
    """Check if heart rate is high (1 if >= 100, 0 otherwise)"""
    return 1 if heart_rate >= 100 else 0

def count_risk_factors(
    previous_complications: int,
    preexisting_diabetes: int,
    gestational_diabetes: int,
    mental_health: int
) -> int:
    """Count total number of risk factors"""
    return (
        previous_complications +
        preexisting_diabetes +
        gestational_diabetes +
        mental_health
    )

def engineer_features(
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
) -> np.ndarray:
    """
    Engineer all features (base + derived) in the same order as training
    
    Returns: numpy array of 16 features
    """
    # Base features (11)
    base_features = np.array([
        age,
        systolic_bp,
        diastolic_bp,
        blood_sugar,
        body_temp,
        bmi,
        previous_complications,
        preexisting_diabetes,
        gestational_diabetes,
        mental_health,
        heart_rate,
    ])
    
    # Derived features (5)
    bp_diff = calculate_bp_diff(systolic_bp, diastolic_bp)
    bmi_cat = categorize_bmi(bmi)
    high_bp = is_high_bp(systolic_bp, diastolic_bp)
    high_hr = is_high_hr(heart_rate)
    risk_factors = count_risk_factors(
        previous_complications,
        preexisting_diabetes,
        gestational_diabetes,
        mental_health
    )
    
    derived_features = np.array([
        bp_diff,
        bmi_cat,
        high_bp,
        high_hr,
        risk_factors,
    ])
    
    # Combine all features
    all_features = np.concatenate([base_features, derived_features])
    
    return all_features

