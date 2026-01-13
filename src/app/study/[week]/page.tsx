'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Network, FileText, Calendar } from 'lucide-react';
import { getStudyWeek, STUDY_PLAN } from '@/data/studyPlan';

interface PageProps {
  params: Promise<{ week: string }>;
}

export default function WeekDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const weekNumber = parseInt(resolvedParams.week);
  const week = getStudyWeek(weekNumber);

  if (!week) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Week Not Found
          </h1>
          <Link
            href="/study"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Study Plan
          </Link>
        </div>
      </div>
    );
  }

  const prevWeek = weekNumber > 1 ? getStudyWeek(weekNumber - 1) : null;
  const nextWeek = weekNumber < 38 ? getStudyWeek(weekNumber + 1) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/study"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Weeks
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
                  Week {week.week} of 38
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {week.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {week.reading}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Progress
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((week.week / 38) * 100)}%
                </div>
              </div>
            </div>

            {week.description && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-200">
                  {week.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* View Graph */}
            <Link
              href={`/study/${week.week}/graph`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all group"
            >
              <Network className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Knowledge Graph
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Explore visual connections between themes, passages, and people
              </p>
            </Link>

            {/* Create Notes */}
            <Link
              href="/notes"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all group"
            >
              <FileText className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400">
                Study Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Take notes with automatic Bible reference detection
              </p>
            </Link>

            {/* Reading Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                7-Day Plan
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Read this section over the next 7 days
              </p>
            </div>
          </div>

          {/* Study Guidelines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Study Guidelines
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                <span>Read the passage slowly and carefully each day</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                <span>Look for key themes and how they connect to other passages</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                <span>Take notes on insights, questions, and applications</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                <span>Use the knowledge graph to discover connections</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                <span>Pray and meditate on what God is teaching you</span>
              </li>
            </ul>
          </div>

          {/* Navigation to Next/Previous Week */}
          <div className="flex gap-4">
            {prevWeek ? (
              <Link
                href={`/study/${prevWeek.week}`}
                className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all group"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  ← Previous Week
                </div>
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Week {prevWeek.week}: {prevWeek.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextWeek ? (
              <Link
                href={`/study/${nextWeek.week}`}
                className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all group text-right"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Next Week →
                </div>
                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Week {nextWeek.week}: {nextWeek.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
