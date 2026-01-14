/**
 * Initial data for 1 John study (Week 1)
 * Includes themes, passages, people, and relationships
 */

export interface SeedTheme {
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
}

export interface SeedPassage {
  label: string;
  description: string;
  chapter: string;
  verses: string;
  themeConnections: string[]; // Theme names
}

export interface SeedPerson {
  label: string;
  role: string;
  description: string;
}

export const ONE_JOHN_THEMES: SeedTheme[] = [
  {
    name: 'Love',
    description: 'God\'s love for us and our love for one another',
    color: '#ec4899', // Pink
    isSystem: true,
  },
  {
    name: 'Light',
    description: 'God is light, walking in the light vs darkness',
    color: '#fbbf24', // Amber/Yellow
    isSystem: true,
  },
  {
    name: 'Fellowship',
    description: 'Fellowship with God and with believers',
    color: '#3b82f6', // Blue
    isSystem: true,
  },
  {
    name: 'Truth',
    description: 'Walking in truth and rejecting deception',
    color: '#06b6d4', // Cyan
    isSystem: true,
  },
  {
    name: 'Sin',
    description: 'The reality of sin and God\'s forgiveness',
    color: '#ef4444', // Red
    isSystem: true,
  },
  {
    name: 'Forgiveness',
    description: 'God\'s forgiveness through Jesus Christ',
    color: '#10b981', // Green
    isSystem: true,
  },
  {
    name: 'Eternal Life',
    description: 'The promise and assurance of eternal life',
    color: '#8b5cf6', // Purple
    isSystem: true,
  },
  {
    name: 'Antichrist',
    description: 'Warning against false teachers and the spirit of antichrist',
    color: '#64748b', // Gray
    isSystem: true,
  },
];

export const ONE_JOHN_PASSAGES: SeedPassage[] = [
  {
    label: '1 John 1',
    description: 'The Word of Life - Walking in the Light',
    chapter: '1',
    verses: '1-10',
    themeConnections: ['Light', 'Fellowship', 'Sin', 'Forgiveness'],
  },
  {
    label: '1 John 2',
    description: 'Christ Our Advocate - Knowing God',
    chapter: '2',
    verses: '1-29',
    themeConnections: ['Love', 'Truth', 'Antichrist', 'Eternal Life'],
  },
  {
    label: '1 John 3',
    description: 'Children of God - Love in Action',
    chapter: '3',
    verses: '1-24',
    themeConnections: ['Love', 'Sin', 'Truth'],
  },
  {
    label: '1 John 4',
    description: 'God is Love - Testing the Spirits',
    chapter: '4',
    verses: '1-21',
    themeConnections: ['Love', 'Truth', 'Antichrist'],
  },
  {
    label: '1 John 5',
    description: 'Faith and Eternal Life - Confidence in Prayer',
    chapter: '5',
    verses: '1-21',
    themeConnections: ['Eternal Life', 'Love', 'Truth'],
  },
];

export const ONE_JOHN_PEOPLE: SeedPerson[] = [
  {
    label: 'John the Apostle',
    role: 'Author',
    description: 'The beloved disciple who wrote this epistle, emphasizing love and truth',
  },
  {
    label: 'Jesus Christ',
    role: 'Central Figure',
    description: 'The Son of God, our advocate with the Father, and the atoning sacrifice for our sins',
  },
  {
    label: 'Antichrist',
    role: 'Opposition',
    description: 'False teachers and the spirit of opposition to Christ mentioned as a warning',
  },
];

export const ONE_JOHN_BOOK = {
  label: '1 John',
  description: 'An epistle about love, light, fellowship, and eternal life in Christ',
  author: 'John the Apostle',
  date: '90-95 AD',
  chapters: 5,
};
