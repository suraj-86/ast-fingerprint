// Falls back to the local backend during development so `npm run dev`
// actually exercises the server you're running on :5000, instead of always
// hitting production. Set VITE_API_URL in a .env file (or your host's
// environment variables) to point at a deployed backend, e.g.:
//   VITE_API_URL=https://ast-fingerprint-api.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
