'use client';

import Link from 'next/link';
import { Book, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-6">
          <Book className="w-16 h-16 text-blue-600 dark:text-blue-400 mr-4" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
            Bible Notes Journal
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Discover deeper connections in Scripture with interactive knowledge graphs,
          organized notes, and guided study plans.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg border border-gray-300 dark:border-gray-600"
          >
            Sign In
          </Link>
        </div>

        {/* Social Proof */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Join thousands of believers deepening their Bible study
        </p>
      </div>
    </section>
  );
}
