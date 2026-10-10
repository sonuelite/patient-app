export type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export interface BMIResult {
  bmi: number | null;
  bmi_category: BMICategory | '';
  bmi_percent: 0 | 25 | 50 | 75 | 100;
  bmiColorClass: '' | 'badge-underweight' | 'badge-normal' | 'badge-overweight' | 'badge-obese';
}

/** Height is in centimetres; weight is in kilograms. */
export function calculateBMI(
  height: string | number | null | undefined,
  weight: string | number | null | undefined,
): BMIResult {
  const h = Number(height);
  const w = Number(weight);
  const empty: BMIResult = {bmi: null, bmi_category: '', bmi_percent: 0, bmiColorClass: ''};
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
    return empty;
  }

  const heightInMeters = h / 100;
  const bmi = Number((w / (heightInMeters * heightInMeters)).toFixed(1));
  if (!Number.isFinite(bmi)) { return empty; }
  if (bmi < 18.5) {
    return {bmi, bmi_category: 'Underweight', bmiColorClass: 'badge-underweight', bmi_percent: 25};
  }
  if (bmi < 25) {
    return {bmi, bmi_category: 'Normal', bmiColorClass: 'badge-normal', bmi_percent: 50};
  }
  if (bmi < 30) {
    return {bmi, bmi_category: 'Overweight', bmiColorClass: 'badge-overweight', bmi_percent: 75};
  }
  return {bmi, bmi_category: 'Obese', bmiColorClass: 'badge-obese', bmi_percent: 100};
}
