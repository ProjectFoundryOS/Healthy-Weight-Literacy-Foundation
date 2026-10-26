export type BmiUnits = "us" | "metric";
export type BmiInputs = { feet: string; inches: string; cm: string; weight: string };
export type BmiErrors = Partial<Record<keyof BmiInputs | "adult", string>>;
export const emptyBmiInputs: BmiInputs = { feet: "", inches: "", cm: "", weight: "" };
export function bmiCategory(bmi: number) {
  if (!Number.isFinite(bmi) || bmi <= 0) throw new Error("BMI must be positive and finite");
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy weight";
  if (bmi < 30) return "Overweight";
  return "Obesity";
}
export function bmiClass(bmi: number) {
  return bmi >= 40 ? "Class 3" : bmi >= 35 ? "Class 2" : bmi >= 30 ? "Class 1" : null;
}
export function calculateBmi(units: BmiUnits, values: BmiInputs, adult: boolean) {
  const errors: BmiErrors = {};
  const number = (value: string) => /^\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : NaN;
  const weight = number(values.weight);
  let height = 0;
  if (!adult) errors.adult = "Confirm this calculation is for an adult aged 20 or older.";
  if (units === "metric") {
    height = number(values.cm);
    if (!Number.isFinite(height) || height < 91.44 || height > 274.32)
      errors.cm = "Enter height in centimeters, from 91.44 to 274.32.";
    if (!Number.isFinite(weight) || weight < 24.947 || weight > 453.592)
      errors.weight = "Enter weight in kilograms, from 24.947 to 453.592.";
  } else {
    const feet = number(values.feet);
    const inches = values.inches.trim() === "" ? 0 : number(values.inches);
    if (!Number.isInteger(feet) || feet < 3 || feet > 9)
      errors.feet = "Enter whole feet, from 3 to 9.";
    if (!Number.isFinite(inches) || inches < 0 || inches >= 12)
      errors.inches = "Enter inches from 0 to less than 12. Leave blank for zero.";
    height = feet * 12 + inches;
    if (height > 108) errors.feet = "This tool supports heights up to 9 feet, 0 inches.";
    if (!Number.isFinite(weight) || weight < 55 || weight > 1000)
      errors.weight = "Enter weight in pounds, from 55 to 1,000 (without a comma).";
  }
  if (Object.keys(errors).length) return { errors, result: null };
  // CDC's published formulas; category uses the full result, not its display rounding.
  const bmi = units === "metric" ? weight / (height / 100) ** 2 : weight / height ** 2 * 703;
  const display = bmi.toFixed(1);
  return { errors, result: { bmi, display, category: bmiCategory(bmi), className: bmiClass(bmi),
    nearBoundary: bmiCategory(Number(display)) !== bmiCategory(bmi) || bmiClass(Number(display)) !== bmiClass(bmi),
    calculation: units === "metric"
      ? `${weight} kg ÷ (${height / 100} m × ${height / 100} m)`
      : `${weight} lb ÷ (${height} in × ${height} in) × 703`,
  } };
}
