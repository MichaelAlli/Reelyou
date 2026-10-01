export function isLikelyLocalEphemeralAudioUri(uri: string): boolean {
  return (
    uri.startsWith('blob:') ||
    uri.startsWith('data:') ||
    uri.startsWith('file:') ||
    uri.startsWith('content:')
  );
}
