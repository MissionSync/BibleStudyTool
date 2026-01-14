'use client';

import { Network, FileText, Sparkles, BookOpen, Users, Lightbulb } from 'lucide-react';

const features = [
  {
    icon: Network,
    title: 'Knowledge Graph',
    description:
      'Visualize connections between passages, themes, people, and places in an interactive graph. See how Scripture interconnects in ways you never noticed before.',
    color: 'purple',
  },
  {
    icon: FileText,
    title: 'Study Notes',
    description:
      'Create rich study notes with automatic Bible reference detection and theme tagging. Keep all your insights organized and searchable.',
    color: 'green',
  },
  {
    icon: Sparkles,
    title: 'Study Plans',
    description:
      'Follow pre-configured study plans covering the entire New Testament. Each week includes focused readings with thematic connections.',
    color: 'blue',
  },
  {
    icon: BookOpen,
    title: 'Scripture Integration',
    description:
      'Seamlessly reference any Bible passage. Links are automatically detected and connected to your knowledge graph.',
    color: 'amber',
  },
  {
    icon: Users,
    title: 'Personal & Private',
    description:
      'Your notes and graphs are private to you. Study at your own pace without distractions.',
    color: 'pink',
  },
  {
    icon: Lightbulb,
    title: 'Theme Discovery',
    description:
      'Explore major biblical themes like Love, Grace, Faith, and Redemption. See how they weave through different books and passages.',
    color: 'cyan',
  },
];

const colorClasses: Record<string, { bg: string; text: string; lightBg: string }> = {
  purple: {
    bg: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
    lightBg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  green: {
    bg: 'bg-green-600',
    text: 'text-green-600 dark:text-green-400',
    lightBg: 'bg-green-100 dark:bg-green-900/30',
  },
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    lightBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  amber: {
    bg: 'bg-amber-600',
    text: 'text-amber-600 dark:text-amber-400',
    lightBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  pink: {
    bg: 'bg-pink-600',
    text: 'text-pink-600 dark:text-pink-400',
    lightBg: 'bg-pink-100 dark:bg-pink-900/30',
  },
  cyan: {
    bg: 'bg-cyan-600',
    text: 'text-cyan-600 dark:text-cyan-400',
    lightBg: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
};

export function Features() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Deep Bible Study
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful tools designed to help you understand Scripture better and grow in your faith.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => {
            const colors = colorClasses[feature.color];
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg ${colors.lightBg} mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
