/**
 * API client for AEGIS media analysis.
 *
 * Client-side validation is not a security boundary. The backend must
 * independently validate uploaded files.
 *
 * Never construct backend filesystem paths from user-controlled filenames.
 * The frontend must never determine where the backend stores a file.
 */

import { ANALYZE_TIMEOUT_MS } from "../constants/fileConfig.js";

const DEFAULT_TIMEOUT_MS = ANALYZE_TIMEOUT_MS;

function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw createApiError(
      "CONFIG_ERROR",
      "The analysis service is not configured. Set VITE_API_BASE_URL."
    );
  }

  return baseUrl.replace(/\/+$/, "");
}

function createApiError(code, message, httpStatus) {
  const error = new Error(message);
  error.code = code;
  error.httpStatus = httpStatus;
  return error;
}

function messageForHttpStatus(status) {
  switch (status) {
    case 400:
      return "The server rejected this file. Choose a supported media file and try again.";
    case 401:
      return "You are not authorized to analyze media. Sign in and try again.";
    case 403:
      return "Access to media analysis is forbidden for this request.";
    case 413:
      return "The file is too large for the server to accept.";
    case 429:
      return "Too many analysis requests. Wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "The analysis service is unavailable. Try again later.";
    default:
      return "Media analysis failed. Try again later.";
  }
}

function sanitizeResult(payload) {
  if (!payload || typeof payload !== "object") {
    throw createApiError(
      "UNEXPECTED_RESPONSE",
      "The server returned an unexpected response."
    );
  }

  const prediction =
    typeof payload.prediction === "string" ? payload.prediction : "";
  const modality =
    typeof payload.modality === "string" ? payload.modality : "";
  const confidence = Number(payload.confidence);

  if (!prediction || !modality || !Number.isFinite(confidence)) {
    throw createApiError(
      "UNEXPECTED_RESPONSE",
      "The server returned an incomplete analysis result."
    );
  }

  return {
    prediction,
    confidence,
    modality,
    isMock: payload.isMock === true,
  };
}

/**
 * Uploads one media file to POST /api/analyze as multipart/form-data.
 * Does not convert files to base64. Does not set the multipart boundary.
 *
 * @param {File} file
 * @param {{ onProgress?: (percent: number) => void, signal?: AbortSignal }} [options]
 */
export function analyzeMedia(file, options = {}) {
  const { onProgress, signal } = options;
  const useMock = import.meta.env.VITE_USE_MOCK_API === "true";

  if (useMock) {
    return runMockAnalyze(file, { onProgress, signal });
  }

  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/analyze`;

  const formData = new FormData();
  formData.append("media", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      xhr.abort();
    }, DEFAULT_TIMEOUT_MS);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
    };

    const fail = (error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };

    if (signal) {
      if (signal.aborted) {
        fail(createApiError("ABORTED", "Upload was cancelled."));
        return;
      }
      signal.addEventListener(
        "abort",
        () => {
          xhr.abort();
        },
        { once: true }
      );
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      onProgress(percent);
    };

    xhr.onerror = () => {
      fail(
        createApiError(
          "NETWORK_ERROR",
          "A network error occurred. Check your connection and try again."
        )
      );
    };

    xhr.onabort = () => {
      const abortedByUser = Boolean(signal && signal.aborted);
      fail(
        createApiError(
          abortedByUser ? "ABORTED" : "TIMEOUT",
          abortedByUser
            ? "Upload was cancelled."
            : "The request timed out. Try again with a smaller file or a more stable connection."
        )
      );
    };

    xhr.onload = () => {
      const status = xhr.status;

      if (status === 0) {
        fail(
          createApiError(
            "BACKEND_UNAVAILABLE",
            "The analysis service could not be reached."
          )
        );
        return;
      }

      let payload = null;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        payload = null;
      }

      if (status < 200 || status >= 300) {
        fail(
          createApiError(
            `HTTP_${status}`,
            messageForHttpStatus(status),
            status
          )
        );
        return;
      }

      try {
        succeed(sanitizeResult(payload));
      } catch (error) {
        fail(error);
      }
    };

    xhr.open("POST", url);
    xhr.send(formData);
  });
}

async function runMockAnalyze(file, { onProgress, signal }) {
  const steps = [12, 28, 47, 63, 81, 100];

  for (const percent of steps) {
    if (signal?.aborted) {
      throw createApiError("ABORTED", "Upload was cancelled.");
    }
    await delay(180);
    if (onProgress) {
      onProgress(percent);
    }
  }

  await delay(400);

  if (signal?.aborted) {
    throw createApiError("ABORTED", "Upload was cancelled.");
  }

  return {
    prediction: "UNAVAILABLE",
    confidence: 0,
    modality: "UNKNOWN",
    isMock: true,
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
