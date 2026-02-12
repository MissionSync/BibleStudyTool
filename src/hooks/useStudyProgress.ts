'use client';

import { useState, useEffect, useCallback } from 'react';

interface StudyProgress {
  currentWeek: number;
  completedWeeks: number[];
}

const OLD_STORAGE_KEY = 'studyProgress';

function storageKey(planId: string) {
  return `studyProgress_${planId}`;
}

const DEFAULTS: StudyProgress = {
  currentWeek: 1,
  completedWeeks: [],
};

export function useStudyProgress(planId = 'nt', totalWeeks = 38) {
  const [progress, setProgress] = useState<StudyProgress>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const key = storageKey(planId);
      let stored = localStorage.getItem(key);

      // Migrate old key for NT plan
      if (!stored && planId === 'nt') {
        const old = localStorage.getItem(OLD_STORAGE_KEY);
        if (old) {
          stored = old;
          localStorage.setItem(key, old);
          localStorage.removeItem(OLD_STORAGE_KEY);
        }
      }

      if (stored) {
        const parsed = JSON.parse(stored) as StudyProgress;
        setProgress(parsed);
      } else {
        setProgress(DEFAULTS);
      }
    } catch {
      setProgress(DEFAULTS);
    }
    setMounted(true);
  }, [planId]);

  const persist = useCallback((next: StudyProgress) => {
    try {
      localStorage.setItem(storageKey(planId), JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }, [planId]);

  const markWeekComplete = useCallback((weekNumber: number) => {
    setProgress((prev) => {
      if (prev.completedWeeks.includes(weekNumber)) return prev;
      const completedWeeks = [...prev.completedWeeks, weekNumber].sort((a, b) => a - b);
      let nextCurrent = prev.currentWeek;
      if (weekNumber === prev.currentWeek) {
        for (let w = prev.currentWeek + 1; w <= totalWeeks; w++) {
          if (!completedWeeks.includes(w)) {
            nextCurrent = w;
            break;
          }
        }
        if (nextCurrent === prev.currentWeek && completedWeeks.includes(nextCurrent)) {
          nextCurrent = Math.min(prev.currentWeek + 1, totalWeeks);
        }
      }
      const next = { currentWeek: nextCurrent, completedWeeks };
      try {
        localStorage.setItem(storageKey(planId), JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [planId, totalWeeks]);

  const unmarkWeekComplete = useCallback((weekNumber: number) => {
    setProgress((prev) => {
      if (!prev.completedWeeks.includes(weekNumber)) return prev;
      const completedWeeks = prev.completedWeeks.filter((w) => w !== weekNumber);
      const currentWeek = weekNumber < prev.currentWeek ? weekNumber : prev.currentWeek;
      const next = { currentWeek, completedWeeks };
      try {
        localStorage.setItem(storageKey(planId), JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [planId]);

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
