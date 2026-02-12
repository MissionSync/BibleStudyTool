import { NEW_TESTAMENT_PLAN } from './newTestament';
import { PSALMS_PLAN } from './psalms';

export interface StudyWeek {
  week: number;
  title: string;
  reading: string;
  description?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  totalWeeks: number;
  weeks: StudyWeek[];
}

export const STUDY_PLANS: StudyPlan[] = [
  NEW_TESTAMENT_PLAN,
  PSALMS_PLAN,
];

export function getStudyPlan(planId: string): StudyPlan | undefined {
  return STUDY_PLANS.find((plan) => plan.id === planId);
}

export function getAllStudyPlans(): StudyPlan[] {
  return STUDY_PLANS;
}
