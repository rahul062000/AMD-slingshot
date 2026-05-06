/* ============================================================
   NutriSense — Nutrition Calculator
   TDEE, BMR, macro targets, calorie math
   ============================================================ */
const NutriCalc = (() => {
  'use strict';

  // Mifflin-St Jeor BMR
  function calcBMR(weight, height, age, gender) {
    // weight in kg, height in cm, age in years
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    }
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  function calcTDEE(bmr, activityLevel) {
    const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
    return Math.round(bmr * mult);
  }

  // Goal adjustments
  function calcTargetCalories(tdee, goal) {
    switch (goal) {
      case 'lose': return Math.round(tdee * 0.8); // 20% deficit
      case 'mildLose': return Math.round(tdee * 0.9); // 10% deficit
      case 'gain': return Math.round(tdee * 1.15); // 15% surplus
      case 'mildGain': return Math.round(tdee * 1.1); // 10% surplus
      default: return tdee; // maintain
    }
  }

  // Macro split (grams) based on goal
  function calcMacros(targetCalories, goal, weightKg) {
    let proteinRatio, carbRatio, fatRatio;
    switch (goal) {
      case 'lose':
      case 'mildLose':
        proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
        break;
      case 'gain':
      case 'mildGain':
        proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25;
        break;
      default:
        proteinRatio = 0.30; carbRatio = 0.40; fatRatio = 0.30;
    }
    return {
      protein: Math.round((targetCalories * proteinRatio) / 4),
      carbs: Math.round((targetCalories * carbRatio) / 4),
      fat: Math.round((targetCalories * fatRatio) / 9),
      fiber: Math.round(weightKg * 0.35) // ~14g per 1000cal approx
    };
  }

  // Full profile calculation
  function calculateProfile(profile) {
    const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calcTDEE(bmr, profile.activityLevel);
    const targetCalories = calcTargetCalories(tdee, profile.goal);
    const macros = calcMacros(targetCalories, profile.goal, profile.weight);
    return { bmr: Math.round(bmr), tdee, targetCalories, macros };
  }

  // BMI calculator
  function calcBMI(weightKg, heightCm) {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return { label: 'Underweight', color: 'var(--clr-info)' };
    if (bmi < 25) return { label: 'Normal', color: 'var(--clr-success)' };
    if (bmi < 30) return { label: 'Overweight', color: 'var(--clr-warning)' };
    return { label: 'Obese', color: 'var(--clr-danger)' };
  }

  // Water intake recommendation (ml)
  function calcWaterTarget(weightKg, activityLevel) {
    let base = weightKg * 33; // 33ml per kg
    if (activityLevel === 'active' || activityLevel === 'veryActive') base *= 1.2;
    return Math.round(base / 250) * 250; // round to nearest 250ml
  }

  // Calories from macros
  function macrosToCalories(protein, carbs, fat) {
    return Math.round(protein * 4 + carbs * 4 + fat * 9);
  }

  // Grade calculation (0-100 score based on how close to targets)
  function calcNutritionScore(consumed, targets) {
    const metrics = ['calories', 'protein', 'carbs', 'fat'];
    let totalScore = 0;
    metrics.forEach(m => {
      const target = targets[m === 'calories' ? 'targetCalories' : m] || 1;
      const ratio = (consumed[m] || 0) / target;
      // Perfect = 1.0, penalize over/under equally
      const deviation = Math.abs(1 - ratio);
      const score = Math.max(0, 100 - deviation * 100);
      totalScore += score;
    });
    return Math.round(totalScore / metrics.length);
  }

  function scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  return {
    calcBMR, calcTDEE, calcTargetCalories, calcMacros, calculateProfile,
    calcBMI, getBMICategory, calcWaterTarget, macrosToCalories,
    calcNutritionScore, scoreToGrade, ACTIVITY_MULTIPLIERS
  };
})();
