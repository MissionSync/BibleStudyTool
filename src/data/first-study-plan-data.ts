// Example data structure for First Study Plan: 1 John

export const firstStudyPlan = {
  id: '1',
  name: 'New Testament Foundation',
  description: '38 readings to build a strong biblical foundation',
  duration_weeks: 38,
  readings: [
    {
      day: 1,
      reading: '1 John',
      chapters: [1, 2, 3, 4, 5],
      key_themes: ['love', 'fellowship', 'truth', 'sin', 'eternal_life'],
      key_people: ['john_apostle', 'jesus_christ', 'antichrist'],
      overview: 'Letter emphasizing God\'s love, Christian fellowship, and assurance of salvation',
      suggested_focus: [
        'God is light and love',
        'Walking in fellowship',
        'Confession of sin',
        'Love one another',
        'Assurance of eternal life'
      ]
    },
    // ... additional readings would follow
  ]
};

// Example pre-populated themes for 1 John
export const johnThemes = [
  {
    id: 'theme-1',
    name: 'God\'s Love',
    description: 'The nature and expression of God\'s love',
    color: '#FF8C94',
    key_verses: [
      '1 John 4:8 - God is love',
      '1 John 4:9 - God sent His Son',
      '1 John 4:10 - Love defined by sacrifice'
    ],
    connections: ['sacrificial_love', 'divine_nature', 'salvation']
  },
  {
    id: 'theme-2',
    name: 'Walking in Light',
    description: 'Living in truth and fellowship with God',
    color: '#FFD93D',
    key_verses: [
      '1 John 1:5 - God is light',
      '1 John 1:7 - Walk in the light',
      '1 John 2:9-10 - Love and light'
    ],
    connections: ['truth', 'fellowship', 'holiness']
  },
  {
    id: 'theme-3',
    name: 'Confession and Forgiveness',
    description: 'How to handle sin through confession',
    color: '#A8E6CF',
    key_verses: [
      '1 John 1:9 - If we confess our sins',
      '1 John 2:1 - Jesus our advocate',
      '1 John 2:2 - Propitiation for sins'
    ],
    connections: ['sin', 'grace', 'atonement']
  },
  {
    id: 'theme-4',
    name: 'Brotherly Love',
    description: 'Loving fellow believers as evidence of faith',
    color: '#4ECDC4',
    key_verses: [
      '1 John 3:16 - Lay down lives',
      '1 John 4:20 - Cannot love God without loving brother',
      '1 John 4:11 - We ought to love one another'
    ],
    connections: ['fellowship', 'community', 'evidence_of_faith']
  },
  {
    id: 'theme-5',
    name: 'Assurance of Salvation',
    description: 'Confidence in eternal life through Christ',
    color: '#95E1D3',
    key_verses: [
      '1 John 5:13 - That you may know',
      '1 John 5:11-12 - Life in the Son',
      '1 John 3:14 - Passed from death to life'
    ],
    connections: ['eternal_life', 'faith', 'testimony']
  }
];

// Example initial graph nodes for 1 John study
export const initialGraphNodes = [
  // Book node
  {
    id: 'book-1john',
    type: 'book',
    data: {
      label: '1 John',
      description: 'Letter of love and fellowship',
      author: 'John the Apostle',
      date: '90-95 AD',
      purpose: 'Assurance and fellowship'
    },
    position: { x: 0, y: 0 }
  },
  
  // Chapter nodes
  {
    id: 'passage-1john-1',
    type: 'passage',
    data: {
      label: '1 John 1',
      reference: '1 John 1',
      summary: 'God is light, fellowship, confession'
    },
    position: { x: -200, y: 100 }
  },
  {
    id: 'passage-1john-2',
    type: 'passage',
    data: {
      label: '1 John 2',
      reference: '1 John 2',
      summary: 'Jesus our advocate, love one another'
    },
    position: { x: -100, y: 100 }
  },
  {
    id: 'passage-1john-3',
    type: 'passage',
    data: {
      label: '1 John 3',
      reference: '1 John 3',
      summary: 'Children of God, love in deed'
    },
    position: { x: 0, y: 100 }
  },
  {
    id: 'passage-1john-4',
    type: 'passage',
    data: {
      label: '1 John 4',
      reference: '1 John 4',
      summary: 'God is love, testing spirits'
    },
    position: { x: 100, y: 100 }
  },
  {
    id: 'passage-1john-5',
    type: 'passage',
    data: {
      label: '1 John 5',
      reference: '1 John 5',
      summary: 'Faith overcomes, eternal life'
    },
    position: { x: 200, y: 100 }
  },
  
  // Theme nodes
  {
    id: 'theme-love',
    type: 'theme',
    data: {
      label: 'Love',
      description: 'God\'s love and brotherly love',
      color: '#FF8C94',
      verseCount: 27
    },
    position: { x: -300, y: 250 }
  },
  {
    id: 'theme-light',
    type: 'theme',
    data: {
      label: 'Light/Truth',
      description: 'Walking in God\'s light',
      color: '#FFD93D',
      verseCount: 12
    },
    position: { x: -150, y: 250 }
  },
  {
    id: 'theme-sin',
    type: 'theme',
    data: {
      label: 'Sin/Confession',
      description: 'Dealing with sin',
      color: '#A8E6CF',
      verseCount: 15
    },
    position: { x: 0, y: 250 }
  },
  {
    id: 'theme-fellowship',
    type: 'theme',
    data: {
      label: 'Fellowship',
      description: 'Community with God and believers',
      color: '#4ECDC4',
      verseCount: 8
    },
    position: { x: 150, y: 250 }
  },
  {
    id: 'theme-eternal-life',
    type: 'theme',
    data: {
      label: 'Eternal Life',
      description: 'Assurance of salvation',
      color: '#95E1D3',
      verseCount: 6
    },
    position: { x: 300, y: 250 }
  },
  
  // Person nodes
  {
    id: 'person-john',
    type: 'person',
    data: {
      label: 'John the Apostle',
      description: 'Author, disciple whom Jesus loved',
      role: 'author'
    },
    position: { x: -200, y: -100 }
  },
  {
    id: 'person-jesus',
    type: 'person',
    data: {
      label: 'Jesus Christ',
      description: 'The Word, Son of God',
      role: 'savior'
    },
    position: { x: 0, y: -100 }
  }
];

// Example edges showing relationships
export const initialGraphEdges = [
  // Book to chapters
  { id: 'e1', source: 'book-1john', target: 'passage-1john-1', type: 'contains', animated: false },
  { id: 'e2', source: 'book-1john', target: 'passage-1john-2', type: 'contains', animated: false },
  { id: 'e3', source: 'book-1john', target: 'passage-1john-3', type: 'contains', animated: false },
  { id: 'e4', source: 'book-1john', target: 'passage-1john-4', type: 'contains', animated: false },
  { id: 'e5', source: 'book-1john', target: 'passage-1john-5', type: 'contains', animated: false },
  
  // Chapters to themes
  { id: 'e6', source: 'passage-1john-1', target: 'theme-light', type: 'theme_connection', animated: false },
  { id: 'e7', source: 'passage-1john-1', target: 'theme-sin', type: 'theme_connection', animated: false },
  { id: 'e8', source: 'passage-1john-1', target: 'theme-fellowship', type: 'theme_connection', animated: false },
  
  { id: 'e9', source: 'passage-1john-2', target: 'theme-love', type: 'theme_connection', animated: false },
  { id: 'e10', source: 'passage-1john-2', target: 'theme-sin', type: 'theme_connection', animated: false },
  
  { id: 'e11', source: 'passage-1john-3', target: 'theme-love', type: 'theme_connection', animated: false },
  { id: 'e12', source: 'passage-1john-3', target: 'theme-eternal-life', type: 'theme_connection', animated: false },
  
  { id: 'e13', source: 'passage-1john-4', target: 'theme-love', type: 'theme_connection', animated: false, label: 'primary' },
  { id: 'e14', source: 'passage-1john-4', target: 'theme-fellowship', type: 'theme_connection', animated: false },
  
  { id: 'e15', source: 'passage-1john-5', target: 'theme-eternal-life', type: 'theme_connection', animated: false, label: 'primary' },
  
  // Author relationship
  { id: 'e16', source: 'person-john', target: 'book-1john', type: 'authored', animated: false },
  { id: 'e17', source: 'book-1john', target: 'person-jesus', type: 'about', animated: false }
];
