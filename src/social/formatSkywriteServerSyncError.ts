/** User-facing copy for failed Skywrite server sync (upload or publish). */
export function formatSkywriteServerSyncError(code: string): string {
  switch (code) {
    case 'not_signed_in':
      return 'Sign in again to publish — your draft and media are still here.';
    case 'api_unreachable':
      return 'We couldn’t reach the Reelyou server. Check your connection and try again.';
    case 'upload_session_rejected':
      return 'The server rejected this media upload. Try a smaller file or different format.';
    case 'photo_upload_failed':
    case 'video_upload_failed':
    case 'audio_upload_failed':
      return 'We couldn’t upload your media. If you’re on localhost, confirm R2 CORS allows your dev origin (see docs).';
    case 'blob_read_failed':
      return 'We couldn’t read the selected file from this browser. Re-select the photo or video and try again.';
    case 'server_publish_failed':
      return 'Your media uploaded, but saving the Skywrite failed. Try again — we won’t duplicate the post.';
    default:
      return 'We couldn’t upload or save your Skywrite to the server. Check your connection and try again.';
  }
}
