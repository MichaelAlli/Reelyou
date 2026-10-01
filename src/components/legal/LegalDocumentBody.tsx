import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';

function cleanLine(line: string): string {
  return line
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\\([_*[\]()#+.!-])/g, '$1')
    .trim();
}

function isHeading(line: string): boolean {
  return /^\d+\.\s/.test(line) || /^DRAFT —/.test(line);
}

function isTableRow(line: string): boolean {
  return line.includes('|') && !line.startsWith('---');
}

function formatTableRow(line: string): string {
  return line
    .split('|')
    .map((cell) => cleanLine(cell))
    .filter(Boolean)
    .join(' — ');
}

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'table'; rows: string[] };

function parseBlocks(body: string): Block[] {
  const lines = body.split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let table: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  };

  const flushTable = () => {
    if (table.length === 0) return;
    blocks.push({ kind: 'table', rows: table.map(formatTableRow) });
    table = [];
  };

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line || line === '---') {
      flushParagraph();
      flushTable();
      continue;
    }
    if (isTableRow(raw)) {
      flushParagraph();
      table.push(raw);
      continue;
    }
    flushTable();
    if (isHeading(line)) {
      flushParagraph();
      blocks.push({ kind: 'heading', text: line });
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushTable();
  return blocks;
}

export function LegalDocumentBody({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <View style={styles.root}>
      {blocks.map((block, index) => {
        if (block.kind === 'heading') {
          return (
            <Text key={`h-${index}`} style={styles.heading}>
              {block.text}
            </Text>
          );
        }
        if (block.kind === 'table') {
          return (
            <View key={`t-${index}`} style={styles.table}>
              {block.rows.map((row, rowIndex) => (
                <Text key={`tr-${index}-${rowIndex}`} style={styles.tableRow}>
                  {row}
                </Text>
              ))}
            </View>
          );
        }
        return (
          <Text key={`p-${index}`} style={styles.paragraph}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.sm,
  },
  heading: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#FFF8F0',
    marginTop: Spacing.sm,
  },
  paragraph: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(248,244,236,0.88)',
  },
  table: {
    gap: 6,
    paddingVertical: 4,
  },
  tableRow: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(248,244,236,0.85)',
  },
});
