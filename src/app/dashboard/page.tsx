'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Book, Network, FileText, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { getStudyWeek, STUDY_PLAN } from '@/data/studyPlan';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

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

  // Get current week or default to week 1
  const currentWeekNumber = 1;
  const currentWeek = getStudyWeek(currentWeekNumber) || STUDY_PLAN[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with user info */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <Book className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bible Notes Journal
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Welcome back, {user.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
          {/* Knowledge Graph */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Network className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Knowledge Graph
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Visualize connections between passages, themes, people, and places
              in an interactive graph
            </p>
            <Link
              href="/study/1/graph"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Explore Graph
            </Link>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Study Notes
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create rich study notes with automatic Bible reference detection
              and theme tagging
            </p>
            <Link
              href="/notes"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              View Notes
            </Link>
          </div>

          {/* Study Plans */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Study Plans
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Follow pre-configured study plans or create your own personalized
              Bible study journey
            </p>
            <Link
              href="/study/1"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Start Studying
            </Link>
          </div>
        </div>

        {/* Current Study Plan */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Week {currentWeek.week}: {currentWeek.title}
            </h2>
            <Link
              href="/study"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View All 38 Weeks &rarr;
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {currentWeek.description || currentWeek.reading}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{currentWeek.week}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Current Week</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">38</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Weeks</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">7</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Days per Week</div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">NT</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Testament</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href={`/study/${currentWeek.week}/graph`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all text-center"
            >
              View Knowledge Graph
            </Link>
            <Link
              href={`/study/${currentWeek.week}`}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold px-8 py-3 rounded-lg transition-colors text-center"
            >
              Week Details
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-600 dark:text-gray-400">
          <p>Powered by Appwrite Cloud &bull; Built with Next.js</p>
        </footer>
      </div>
    </div>
  );
}
