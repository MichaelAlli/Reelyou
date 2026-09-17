import { parseUserHashtags } from '@/skywrite/parseUserHashtags';

function assertEqual(actual: string[], expected: string[], label: string) {
  const pass =
    actual.length === expected.length && actual.every((tag, i) => tag === expected[i]);
  if (!pass) {
    throw new Error(`${label}: expected [${expected.join(', ')}], got [${actual.join(', ')}]`);
  }
}

assertEqual(parseUserHashtags('Starting something new today.'), [], 'no hashtags');
assertEqual(
  parseUserHashtags('Starting something new today. #courage #entrepreneurship'),
  ['courage', 'entrepreneurship'],
  'basic hashtags',
);
assertEqual(
  parseUserHashtags('Go! #courage, and #entrepreneurship.'),
  ['courage', 'entrepreneurship'],
  'punctuation',
);
assertEqual(
  parseUserHashtags('#COURAGE #courage #Courage'),
  ['courage'],
  'mixed case dedupe',
);
assertEqual(parseUserHashtags('#growth #Growth #growth'), ['growth'], 'repeated hashtags');

console.log('parseUserHashtags: all tests passed');
