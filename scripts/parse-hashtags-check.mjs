function parseUserHashtags(text) {
  const regex = /#([A-Za-z][A-Za-z0-9_]*)/g;
  const seen = new Set();
  const tags = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
}

const tests = [
  ['no tags', 'Starting something new today.', []],
  ['basic', 'Starting something new today. #courage #entrepreneurship', ['courage', 'entrepreneurship']],
  ['punct', 'Go! #courage, and #entrepreneurship.', ['courage', 'entrepreneurship']],
  ['case', '#COURAGE #courage', ['courage']],
  ['repeat', '#growth #Growth #growth', ['growth']],
];

for (const [name, text, expected] of tests) {
  const got = parseUserHashtags(text);
  if (JSON.stringify(got) !== JSON.stringify(expected)) {
    console.error('FAIL', name, got, expected);
    process.exit(1);
  }
}
console.log('parseUserHashtags OK');
