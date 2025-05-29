import { ActivityType, DifficultyGrade } from '../types';

// Renaming for clarity and adding order
export const V_SCALE_GRADE_DEFINITIONS = [
  { label: 'V0-V2', value: DifficultyGrade.V0_V2, min: 'V0', max: 'V2', order: 0 },
  { label: 'V3-V5', value: DifficultyGrade.V3_V5, min: 'V3', max: 'V5', order: 1 },
  { label: 'V6-V7', value: DifficultyGrade.V6_V7, min: 'V6', max: 'V7', order: 2 },
  { label: 'V8+', value: DifficultyGrade.V8_PLUS, min: 'V8', max: 'V8+', order: 3 },
  { label: 'V-Open (不限)', value: DifficultyGrade.V_OPEN, min: 'V-Open', max: 'V-Open', order: 4 },
];

export const YDS_GRADE_DEFINITIONS = [
  { label: '5.5-5.8', value: DifficultyGrade.YDS_5_5_5_8, min: '5.5', max: '5.8', order: 0 },
  { label: '5.9-5.10d', value: DifficultyGrade.YDS_5_9_5_10D, min: '5.9', max: '5.10d', order: 1 },
  { label: '5.11a-5.11d', value: DifficultyGrade.YDS_5_11A_5_11D, min: '5.11a', max: '5.11d', order: 2 },
  { label: '5.12a-5.12d', value: DifficultyGrade.YDS_5_12A_5_12D, min: '5.12a', max: '5.12d', order: 3 },
  { label: '5.13+', value: DifficultyGrade.YDS_5_13_PLUS, min: '5.13', max: '5.13+', order: 4 },
  { label: 'YDS-Open (不限)', value: DifficultyGrade.YDS_OPEN, min: 'YDS-Open', max: 'YDS-Open', order: 5 },
];

// Keep original V_SCALE_GRADES and YDS_GRADES for compatibility where min/max not needed
export const V_SCALE_GRADES = V_SCALE_GRADE_DEFINITIONS.map(({label, value}) => ({label, value}));
export const YDS_GRADES = YDS_GRADE_DEFINITIONS.map(({label, value}) => ({label, value}));

export const activityTypeDetails: Record<ActivityType, { label: string; gradeSystem: 'VScale' | 'YDS' | 'None' | 'Both'; associatedGrades: Array<{label: string, value: string}> }> = {
  [ActivityType.BOULDERING]: { label: '抱石', gradeSystem: 'VScale', associatedGrades: V_SCALE_GRADES },
  [ActivityType.TOP_ROPE_AUTO_BELAY]: { label: '顶绳-自动保护', gradeSystem: 'YDS', associatedGrades: YDS_GRADES },
  [ActivityType.TOP_ROPE_MANUAL_BELAY]: { label: '顶绳-需保护', gradeSystem: 'YDS', associatedGrades: YDS_GRADES },
  [ActivityType.LEAD_CLIMBING]: { label: '先锋', gradeSystem: 'YDS', associatedGrades: YDS_GRADES },
  [ActivityType.OUTDOOR]: { label: '户外', gradeSystem: 'Both', associatedGrades: [...V_SCALE_GRADES, ...YDS_GRADES] },
  [ActivityType.TRAINING]: { label: '训练', gradeSystem: 'None', associatedGrades: [] },
};

export const activityTypeOptions = Object.entries(activityTypeDetails).map(([value, { label }]) => ({
  label,
  value: value as ActivityType,
}));

// Helper function to get grade label from its value (simple lookup)
export const getGradeLabel = (gradeValue: string): string => {
  const allGradeDefs = [...V_SCALE_GRADE_DEFINITIONS, ...YDS_GRADE_DEFINITIONS];
  const foundGrade = allGradeDefs.find(g => g.value === gradeValue);
  return foundGrade ? foundGrade.label : gradeValue;
};

// New function to get displayable grade strings with merging
export const getDisplayableGradeStrings = (selectedGrades: DifficultyGrade[]): string[] => {
  if (!selectedGrades || selectedGrades.length === 0) return [];

  const selectedDefs = selectedGrades
    .map(sg => V_SCALE_GRADE_DEFINITIONS.find(def => def.value === sg) || YDS_GRADE_DEFINITIONS.find(def => def.value === sg))
    .filter(def => !!def) as Array<typeof V_SCALE_GRADE_DEFINITIONS[0] | typeof YDS_GRADE_DEFINITIONS[0]>; 

  if (selectedDefs.length === 0) return [];

  const sortedSelectedDefs = selectedDefs.sort((a, b) => a.order - b.order);

  const resultLabels: string[] = [];
  let currentMergedMinLabel = sortedSelectedDefs[0].label;
  let currentRangeType = sortedSelectedDefs[0].value.startsWith('V') ? 'VScale' : 'YDS';

  for (let i = 1; i < sortedSelectedDefs.length; i++) {
    const currentDef = sortedSelectedDefs[i];
    const prevDef = sortedSelectedDefs[i-1];
    const currentType = currentDef.value.startsWith('V') ? 'VScale' : 'YDS';

    if (currentDef.order === prevDef.order + 1 && currentType === currentRangeType) {
      // Potentially merge or extend range here - currently does nothing, forms part of next else if no merge
    } else {
      if (currentMergedMinLabel === prevDef.label) {
        resultLabels.push(currentMergedMinLabel);
      } else {
        resultLabels.push(`${currentMergedMinLabel}-${prevDef.label.split(' ')[0]}`);
      }
      currentMergedMinLabel = currentDef.label;
      currentRangeType = currentType;
    }
  }

  // Add the last merged or single grade
  const lastDef = sortedSelectedDefs[sortedSelectedDefs.length - 1];
  if (currentMergedMinLabel === lastDef.label) {
    resultLabels.push(currentMergedMinLabel);
  } else {
    resultLabels.push(`${currentMergedMinLabel}-${lastDef.label.split(' ')[0]}`);
  }

  return resultLabels;
}; 