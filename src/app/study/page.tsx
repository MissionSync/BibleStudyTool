'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Book, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { STUDY_PLAN, getCompletionPercentage } from '@/data/studyPlan';
import { useAuth } from '@/contexts/AuthContext';

export default function StudyPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const currentWeek = 1; // Can be made dynamic later

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                38-Week New Testament Study Plan
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Read through the entire New Testament in 38 weeks, 7 days per week
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {getCompletionPercentage(currentWeek)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Complete</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Week {currentWeek} of 38
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {38 - currentWeek} weeks remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${getCompletionPercentage(currentWeek)}%` }}
            ></div>
          </div>
        </div>

        {/* Study Plan Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STUDY_PLAN.map((week) => {
            const isCompleted = week.week < currentWeek;
            const isCurrent = week.week === currentWeek;

            return (
              <div
                key={week.week}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all hover:shadow-xl ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 dark:ring-blue-400'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900'
                          : isCurrent
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <span
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {week.week}
                        </span>
                      )}
                    </div>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <Book className="w-5 h-5 text-gray-400" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {week.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {week.reading}
                </p>
                {week.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 line-clamp-2">
                    {week.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/study/${week.week}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors text-center"
                  >
                    Details
                  </Link>
                  <Link
                    href={`/study/${week.week}/graph`}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors text-center"
                  >
                    Graph
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Study Plan Guidelines
              </h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Each reading is designed to be studied for 7 days</li>
                <li>• Take time to reflect, take notes, and explore connections</li>
                <li>• Use the knowledge graph to visualize relationships between passages</li>
                <li>• After completing all 38 weeks, re-read sections that need clarification</li>
                <li>• Consider studying Proverbs and Psalms during remaining weeks of the year</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
