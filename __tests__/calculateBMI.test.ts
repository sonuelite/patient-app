import {calculateBMI} from '../src/utils/calculateBMI';

test.each([
  [18.4, 'Underweight', 25],
  [18.5, 'Normal', 50],
  [24.9, 'Normal', 50],
  [25, 'Overweight', 75],
  [29.9, 'Overweight', 75],
  [30, 'Obese', 100],
])('classifies BMI %s at category boundaries', (weight, category, percent) => {
  expect(calculateBMI(100, weight)).toMatchObject({bmi: weight, bmi_category: category, bmi_percent: percent});
});

test('uses centimetres and kilograms and rounds before classification', () => {
  expect(calculateBMI('175', '84.5')).toEqual({
    bmi: 27.6, bmi_category: 'Overweight', bmi_percent: 75, bmiColorClass: 'badge-overweight',
  });
  expect(calculateBMI(100, 24.96).bmi_category).toBe('Overweight');
});

test.each([null, undefined, '', 'invalid', 0, -1, Infinity, NaN])('clears BMI for invalid input %s', value => {
  const empty = {bmi: null, bmi_category: '', bmi_percent: 0, bmiColorClass: ''};
  expect(calculateBMI(value, 70)).toEqual(empty);
  expect(calculateBMI(175, value)).toEqual(empty);
});
