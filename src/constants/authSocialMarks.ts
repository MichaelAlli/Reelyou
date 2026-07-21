import type { AuthSocialProvider } from '@/constants/auth';

/** Official brand SVG paths — embedded locally for crisp, production-quality social marks. */
const GOOGLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.56 2.93-2.26 5.41-4.82 7.07l7.72 6.01c4.52-4.18 7.09-10.33 7.09-17.66z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.72-6.01c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000000" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`;

const FACEBOOK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#1877F2"/><path fill="#FFFFFF" d="M26.5 38V25.5h4.2l.6-4.9H26.5v-3.1c0-1.4.4-2.4 2.5-2.4h2.6V11.2c-.5-.1-2.2-.2-4.1-.2-4.1 0-7 2.5-7 7.1v4.5h-4.7v4.9h4.7V38h5.6z"/></svg>`;

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const AuthSocialMarkUris: Record<AuthSocialProvider, string> = {
  google: svgDataUri(GOOGLE_SVG),
  apple: svgDataUri(APPLE_SVG),
  facebook: svgDataUri(FACEBOOK_SVG),
};
