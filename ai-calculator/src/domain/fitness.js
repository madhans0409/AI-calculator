const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export function calculateFitnessPlan({ weight, height, age, sex, activity, goal }) {
  const kilograms = Number(weight);
  const centimeters = Number(height);
  const years = Number(age);
  if (![kilograms, centimeters, years].every(Number.isFinite) || kilograms <= 0 || centimeters <= 0 || years <= 0) return null;

  const resting = 10 * kilograms + 6.25 * centimeters - 5 * years + (sex === "male" ? 5 : -161);
  const maintenance = resting * ACTIVITY_FACTORS[activity];
  const adjustment = goal === "gain" ? 300 : -400;
  const calories = Math.round(maintenance + adjustment);
  const weeklyChange = Math.round((Math.abs(adjustment) * 7 / 7700) * 100) / 100;
  return {
    maintenance: Math.round(maintenance),
    calories: Math.max(1200, calories),
    protein: Math.round(kilograms * 1.8),
    weeklyChange,
  };
}
