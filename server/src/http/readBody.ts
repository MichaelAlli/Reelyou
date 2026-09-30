import type { IncomingMessage } from 'node:http';

export async function readBodyWithLimit(
  req: IncomingMessage,
  maxBytes: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = chunk as Buffer;
    total += buf.length;
    if (total > maxBytes) {
      throw new Error('body_too_large');
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}
