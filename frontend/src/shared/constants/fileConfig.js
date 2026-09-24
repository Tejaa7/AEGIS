/**
 * Allowlisted media configuration for AEGIS.
 * Client-side validation is not a security boundary. The backend must
 * independently validate uploaded files.
 */

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB

export const ALLOWED_IMAGE_EXTENSIONS = Object.freeze([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export const ALLOWED_VIDEO_EXTENSIONS = Object.freeze([
  ".mp4",
  ".avi",
  ".mov",
  ".mkv",
  ".webm",
]);

export const ALLOWED_AUDIO_EXTENSIONS = Object.freeze([
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
]);

export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_VIDEO_MIME_TYPES = Object.freeze([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
  "video/x-matroska",
  "video/mkv",
]);

export const ALLOWED_AUDIO_MIME_TYPES = Object.freeze([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/vorbis",
]);

export const MEDIA_CATEGORIES = Object.freeze({
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
});

export const ANALYZE_TIMEOUT_MS = 120000;

export const ACCEPT_ATTRIBUTE = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_VIDEO_EXTENSIONS,
  ...ALLOWED_AUDIO_EXTENSIONS,
].join(",");

export const MAX_SIZE_BY_CATEGORY = Object.freeze({
  [MEDIA_CATEGORIES.IMAGE]: MAX_IMAGE_SIZE,
  [MEDIA_CATEGORIES.VIDEO]: MAX_VIDEO_SIZE,
  [MEDIA_CATEGORIES.AUDIO]: MAX_AUDIO_SIZE,
});
