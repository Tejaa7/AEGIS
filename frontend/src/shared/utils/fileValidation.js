/**
 * Client-side file validation (UX only).
 *
 * Client-side validation is not a security boundary. The backend must
 * independently validate uploaded files (extension, MIME type, magic bytes /
 * file signature, actual media format, file size, file contents, filename,
 * and processing limits).
 *
 * Do not trust filename, file extension, or browser MIME type.
 */

import {
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_EXTENSIONS,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_SIZE_BY_CATEGORY,
  MEDIA_CATEGORIES,
} from "../constants/fileConfig.js";

const IMAGE_EXTENSION_SET = new Set(ALLOWED_IMAGE_EXTENSIONS);
const VIDEO_EXTENSION_SET = new Set(ALLOWED_VIDEO_EXTENSIONS);
const AUDIO_EXTENSION_SET = new Set(ALLOWED_AUDIO_EXTENSIONS);
const IMAGE_MIME_SET = new Set(ALLOWED_IMAGE_MIME_TYPES);
const VIDEO_MIME_SET = new Set(ALLOWED_VIDEO_MIME_TYPES);
const AUDIO_MIME_SET = new Set(ALLOWED_AUDIO_MIME_TYPES);

export function getFileExtension(filename) {
  if (typeof filename !== "string") {
    return "";
  }

  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === filename.length - 1) {
    return "";
  }

  return filename.slice(lastDot).toLowerCase();
}

export function detectMediaCategory(file) {
  if (!file || typeof file.name !== "string") {
    return null;
  }

  const extension = getFileExtension(file.name);
  const mimeType = typeof file.type === "string" ? file.type.toLowerCase() : "";

  const fromExtension = categoryFromExtension(extension);
  const fromMime = categoryFromMime(mimeType);

  if (fromExtension && fromMime && fromExtension !== fromMime) {
    return null;
  }

  return fromExtension || fromMime || null;
}

function categoryFromExtension(extension) {
  if (IMAGE_EXTENSION_SET.has(extension)) {
    return MEDIA_CATEGORIES.IMAGE;
  }
  if (VIDEO_EXTENSION_SET.has(extension)) {
    return MEDIA_CATEGORIES.VIDEO;
  }
  if (AUDIO_EXTENSION_SET.has(extension)) {
    return MEDIA_CATEGORIES.AUDIO;
  }
  return null;
}

function categoryFromMime(mimeType) {
  if (!mimeType) {
    return null;
  }
  if (IMAGE_MIME_SET.has(mimeType)) {
    return MEDIA_CATEGORIES.IMAGE;
  }
  if (VIDEO_MIME_SET.has(mimeType)) {
    return MEDIA_CATEGORIES.VIDEO;
  }
  if (AUDIO_MIME_SET.has(mimeType)) {
    return MEDIA_CATEGORIES.AUDIO;
  }
  return null;
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const decimals = size >= 10 ? 1 : 2;
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}

export function validateMediaFile(file) {
  if (!file) {
    return {
      ok: false,
      code: "NO_FILE",
      message: "Please select a media file to analyze.",
    };
  }

  if (typeof file.size !== "number" || file.size <= 0) {
    return {
      ok: false,
      code: "EMPTY_FILE",
      message: "The selected file is empty. Choose a valid media file.",
    };
  }

  const extension = getFileExtension(file.name);
  if (!extension) {
    return {
      ok: false,
      code: "INVALID_EXTENSION",
      message: "The file has no valid extension. Use a supported image, video, or audio type.",
    };
  }

  const categoryFromExt = categoryFromExtension(extension);
  if (!categoryFromExt) {
    return {
      ok: false,
      code: "UNSUPPORTED_FILE",
      message:
        "Unsupported file type. Allowed formats: JPG, JPEG, PNG, WEBP, MP4, AVI, MOV, MKV, WEBM, MP3, WAV, M4A, AAC, OGG.",
    };
  }

  const mimeType = typeof file.type === "string" ? file.type.toLowerCase() : "";

  if (mimeType) {
    const mimeCategory = categoryFromMime(mimeType);
    if (!mimeCategory) {
      return {
        ok: false,
        code: "INVALID_MIME",
        message: "The file MIME type is not on the allowlist of supported media types.",
      };
    }

    if (mimeCategory !== categoryFromExt) {
      return {
        ok: false,
        code: "TYPE_MISMATCH",
        message:
          "The file extension and MIME type do not match. Choose a genuine image, video, or audio file.",
      };
    }
  }

  const maxSize = MAX_SIZE_BY_CATEGORY[categoryFromExt];
  if (file.size > maxSize) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `This ${categoryFromExt.toLowerCase()} file exceeds the maximum size of ${formatFileSize(maxSize)}.`,
    };
  }

  return {
    ok: true,
    code: "VALID",
    message: "",
    category: categoryFromExt,
    extension,
    mimeType: mimeType || "unknown",
  };
}
