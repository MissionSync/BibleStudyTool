/**
 * Bible Entities - People and Places
 * Used for detecting mentions in notes
 */

export interface BiblePerson {
  name: string;
  aliases: string[];
  role?: string;
}

export interface BiblePlace {
  name: string;
  aliases: string[];
  region?: string;
}

// Major Bible figures with common variations
export const BIBLE_PEOPLE: BiblePerson[] = [
  // Old Testament
  { name: 'Adam', aliases: [], role: 'First Man' },
  { name: 'Eve', aliases: [], role: 'First Woman' },
  { name: 'Noah', aliases: [], role: 'Patriarch' },
  { name: 'Abraham', aliases: ['Abram'], role: 'Patriarch' },
  { name: 'Sarah', aliases: ['Sarai'], role: 'Matriarch' },
  { name: 'Isaac', aliases: [], role: 'Patriarch' },
  { name: 'Rebekah', aliases: ['Rebecca'], role: 'Matriarch' },
  { name: 'Jacob', aliases: ['Israel'], role: 'Patriarch' },
  { name: 'Joseph', aliases: [], role: 'Patriarch' },
  { name: 'Moses', aliases: [], role: 'Prophet' },
  { name: 'Aaron', aliases: [], role: 'High Priest' },
  { name: 'Miriam', aliases: [], role: 'Prophetess' },
  { name: 'Joshua', aliases: [], role: 'Leader' },
  { name: 'Deborah', aliases: [], role: 'Judge' },
  { name: 'Gideon', aliases: [], role: 'Judge' },
  { name: 'Samson', aliases: [], role: 'Judge' },
  { name: 'Ruth', aliases: [], role: 'Ancestor of David' },
  { name: 'Samuel', aliases: [], role: 'Prophet' },
  { name: 'Saul', aliases: [], role: 'King' },
  { name: 'David', aliases: [], role: 'King' },
  { name: 'Solomon', aliases: [], role: 'King' },
  { name: 'Elijah', aliases: [], role: 'Prophet' },
  { name: 'Elisha', aliases: [], role: 'Prophet' },
  { name: 'Isaiah', aliases: [], role: 'Prophet' },
  { name: 'Jeremiah', aliases: [], role: 'Prophet' },
  { name: 'Ezekiel', aliases: [], role: 'Prophet' },
  { name: 'Daniel', aliases: [], role: 'Prophet' },
  { name: 'Jonah', aliases: [], role: 'Prophet' },
  { name: 'Esther', aliases: [], role: 'Queen' },
  { name: 'Job', aliases: [], role: 'Righteous Man' },

  // New Testament
  { name: 'Jesus', aliases: ['Christ', 'Jesus Christ', 'Messiah', 'Lord', 'Savior'], role: 'Son of God' },
  { name: 'Mary', aliases: ['Virgin Mary'], role: 'Mother of Jesus' },
  { name: 'Joseph', aliases: [], role: 'Earthly Father of Jesus' },
  { name: 'John the Baptist', aliases: ['John Baptist', 'Baptist'], role: 'Prophet' },
  { name: 'Peter', aliases: ['Simon Peter', 'Simon', 'Cephas'], role: 'Apostle' },
  { name: 'Andrew', aliases: [], role: 'Apostle' },
  { name: 'James', aliases: [], role: 'Apostle' },
  { name: 'John', aliases: [], role: 'Apostle' },
  { name: 'Philip', aliases: [], role: 'Apostle' },
  { name: 'Bartholomew', aliases: ['Nathanael'], role: 'Apostle' },
  { name: 'Matthew', aliases: ['Levi'], role: 'Apostle' },
  { name: 'Thomas', aliases: ['Doubting Thomas'], role: 'Apostle' },
  { name: 'Judas Iscariot', aliases: ['Judas'], role: 'Apostle' },
  { name: 'Paul', aliases: ['Saul of Tarsus', 'Apostle Paul', 'Saint Paul'], role: 'Apostle' },
  { name: 'Barnabas', aliases: [], role: 'Missionary' },
  { name: 'Timothy', aliases: [], role: 'Disciple' },
  { name: 'Titus', aliases: [], role: 'Disciple' },
  { name: 'Luke', aliases: [], role: 'Evangelist' },
  { name: 'Mark', aliases: ['John Mark'], role: 'Evangelist' },
  { name: 'Stephen', aliases: [], role: 'Martyr' },
  { name: 'Mary Magdalene', aliases: ['Magdalene'], role: 'Disciple' },
  { name: 'Martha', aliases: [], role: 'Disciple' },
  { name: 'Lazarus', aliases: [], role: 'Friend of Jesus' },
  { name: 'Nicodemus', aliases: [], role: 'Pharisee' },
  { name: 'Pontius Pilate', aliases: ['Pilate'], role: 'Roman Governor' },
  { name: 'Herod', aliases: ['King Herod'], role: 'King' },
];

// Major Bible places with variations
export const BIBLE_PLACES: BiblePlace[] = [
  // Regions
  { name: 'Israel', aliases: ['Land of Israel'], region: 'Holy Land' },
  { name: 'Judah', aliases: ['Judea'], region: 'Southern Kingdom' },
  { name: 'Galilee', aliases: [], region: 'Northern Israel' },
  { name: 'Samaria', aliases: [], region: 'Central Israel' },
  { name: 'Egypt', aliases: [], region: 'Africa' },
  { name: 'Babylon', aliases: ['Babylonia'], region: 'Mesopotamia' },
  { name: 'Assyria', aliases: [], region: 'Mesopotamia' },
  { name: 'Persia', aliases: [], region: 'Middle East' },
  { name: 'Rome', aliases: [], region: 'Italy' },
  { name: 'Greece', aliases: [], region: 'Europe' },

  // Cities
  { name: 'Jerusalem', aliases: ['Zion', 'City of David'], region: 'Judea' },
  { name: 'Bethlehem', aliases: [], region: 'Judea' },
  { name: 'Nazareth', aliases: [], region: 'Galilee' },
  { name: 'Capernaum', aliases: [], region: 'Galilee' },
  { name: 'Bethany', aliases: [], region: 'Judea' },
  { name: 'Jericho', aliases: [], region: 'Judea' },
  { name: 'Damascus', aliases: [], region: 'Syria' },
  { name: 'Antioch', aliases: [], region: 'Syria' },
  { name: 'Corinth', aliases: [], region: 'Greece' },
  { name: 'Ephesus', aliases: [], region: 'Asia Minor' },
  { name: 'Philippi', aliases: [], region: 'Macedonia' },
  { name: 'Thessalonica', aliases: [], region: 'Macedonia' },
  { name: 'Athens', aliases: [], region: 'Greece' },
  { name: 'Tarsus', aliases: [], region: 'Cilicia' },
  { name: 'Nineveh', aliases: [], region: 'Assyria' },

  // Geographic Features
  { name: 'Jordan River', aliases: ['River Jordan', 'Jordan'], region: 'Israel' },
  { name: 'Sea of Galilee', aliases: ['Lake Galilee', 'Galilee Sea'], region: 'Galilee' },
  { name: 'Dead Sea', aliases: ['Salt Sea'], region: 'Judea' },
  { name: 'Mount Sinai', aliases: ['Sinai', 'Horeb'], region: 'Sinai Peninsula' },
  { name: 'Mount Zion', aliases: ['Zion'], region: 'Jerusalem' },
  { name: 'Mount of Olives', aliases: ['Olivet'], region: 'Jerusalem' },
  { name: 'Garden of Eden', aliases: ['Eden'], region: 'Unknown' },
  { name: 'Garden of Gethsemane', aliases: ['Gethsemane'], region: 'Jerusalem' },
  { name: 'Calvary', aliases: ['Golgotha'], region: 'Jerusalem' },
  { name: 'Red Sea', aliases: [], region: 'Egypt' },
];

/**
 * Find people mentioned in text
 */
export function findPeopleInText(text: string): BiblePerson[] {
  const found: BiblePerson[] = [];
  const textLower = text.toLowerCase();
  const foundNames = new Set<string>();

  for (const person of BIBLE_PEOPLE) {
    // Check main name
    if (matchesWord(textLower, person.name.toLowerCase()) && !foundNames.has(person.name)) {
      found.push(person);
      foundNames.add(person.name);
      continue;
    }

    // Check aliases
    for (const alias of person.aliases) {
      if (matchesWord(textLower, alias.toLowerCase()) && !foundNames.has(person.name)) {
        found.push(person);
        foundNames.add(person.name);
        break;
      }
    }
  }

  return found;
}

/**
 * Find places mentioned in text
 */
export function findPlacesInText(text: string): BiblePlace[] {
  const found: BiblePlace[] = [];
  const textLower = text.toLowerCase();
  const foundNames = new Set<string>();

  for (const place of BIBLE_PLACES) {
    // Check main name
    if (matchesWord(textLower, place.name.toLowerCase()) && !foundNames.has(place.name)) {
      found.push(place);
      foundNames.add(place.name);
      continue;
    }

    // Check aliases
    for (const alias of place.aliases) {
      if (matchesWord(textLower, alias.toLowerCase()) && !foundNames.has(place.name)) {
        found.push(place);
        foundNames.add(place.name);
        break;
      }
    }
  }

  return found;
}

/**
 * Check if a word exists as a whole word in text (not part of another word)
 */
function matchesWord(text: string, word: string): boolean {
  // Use word boundary regex to match whole words only
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
  return regex.test(text);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
