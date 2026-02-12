/**
 * Legacy re-exports — use `@/data/studyPlans` directly for new code.
 */
export type { StudyWeek } from './studyPlans';
import { getStudyPlan } from './studyPlans';

const ntPlan = getStudyPlan('nt')!;

export const STUDY_PLAN = ntPlan.weeks;

export function getStudyWeek(weekNumber: number) {
  return ntPlan.weeks.find((w) => w.week === weekNumber);
}

export function getAllStudyWeeks() {
  return ntPlan.weeks;
}

export function getCurrentWeek(startDate?: Date): number {
  const start = startDate || new Date('2026-01-01');
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.min(diffWeeks, ntPlan.totalWeeks);
}

export function getCompletionPercentage(currentWeek: number): number {
  return Math.round((currentWeek / ntPlan.totalWeeks) * 100);
}
