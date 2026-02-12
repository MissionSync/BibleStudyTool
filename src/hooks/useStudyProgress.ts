'use client';

import { useState, useEffect, useCallback } from 'react';

interface StudyProgress {
  currentWeek: number;
  completedWeeks: number[];
}

const STORAGE_KEY = 'studyProgress';

const DEFAULTS: StudyProgress = {
  currentWeek: 1,
  completedWeeks: [],
};

export function useStudyProgress() {
  const [progress, setProgress] = useState<StudyProgress>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StudyProgress;
        setProgress(parsed);
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    setMounted(true);
  }, []);

  const persist = useCallback((next: StudyProgress) => {
    setProgress(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const markWeekComplete = useCallback((weekNumber: number) => {
    setProgress((prev) => {
      if (prev.completedWeeks.includes(weekNumber)) return prev;
      const completedWeeks = [...prev.completedWeeks, weekNumber].sort((a, b) => a - b);
      // Advance currentWeek to next incomplete week
      let nextCurrent = prev.currentWeek;
      if (weekNumber === prev.currentWeek) {
        for (let w = prev.currentWeek + 1; w <= 38; w++) {
          if (!completedWeeks.includes(w)) {
            nextCurrent = w;
            break;
          }
        }
        // If all remaining are complete, stay at last
        if (nextCurrent === prev.currentWeek && completedWeeks.includes(nextCurrent)) {
          nextCurrent = Math.min(prev.currentWeek + 1, 38);
        }
      }
      const next = { currentWeek: nextCurrent, completedWeeks };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const unmarkWeekComplete = useCallback((weekNumber: number) => {
    setProgress((prev) => {
      if (!prev.completedWeeks.includes(weekNumber)) return prev;
      const completedWeeks = prev.completedWeeks.filter((w) => w !== weekNumber);
      // If unmarked week is before current, move current back
      const currentWeek = weekNumber < prev.currentWeek ? weekNumber : prev.currentWeek;
      const next = { currentWeek, completedWeeks };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const isWeekCompleted = useCallback((weekNumber: number) => {
    return progress.completedWeeks.includes(weekNumber);
  }, [progress.completedWeeks]);

  return {
    currentWeek: mounted ? progress.currentWeek : DEFAULTS.currentWeek,
    completedWeeks: mounted ? progress.completedWeeks : DEFAULTS.completedWeeks,
    markWeekComplete,
    unmarkWeekComplete,
    isWeekCompleted,
  };
}
