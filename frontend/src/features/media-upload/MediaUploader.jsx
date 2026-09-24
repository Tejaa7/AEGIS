import { useId, useRef, useState } from "react";
import { ACCEPT_ATTRIBUTE } from "../../shared/constants/fileConfig.js";
import { analyzeMedia } from "../../shared/services/api.js";
import { formatFileSize, validateMediaFile } from "../../shared/utils/fileValidation.js";
import DetectionResult from "./DetectionResult.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import MediaPreview from "./MediaPreview.jsx";
import UploadProgress from "./UploadProgress.jsx";

const STATUS = {
  IDLE: "idle",
  READY: "ready",
  UPLOADING: "uploading",
  PROCESSING: "processing",
};

function MediaUploader() {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const submittingRef = useRef(false);

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [result, setResult] = useState(null);

  const isBusy = status === STATUS.UPLOADING || status === STATUS.PROCESSING;

  function resetInputValue() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function applyFile(nextFile) {
    setError("");
    setSuccessMessage("");
    setResult(null);
    setProgress(0);

    const validation = validateMediaFile(nextFile);
    if (!validation.ok) {
      setFile(null);
      setCategory(null);
      setStatus(STATUS.IDLE);
      setError(validation.message);
      resetInputValue();
      return;
    }

    setFile(nextFile);
    setCategory(validation.category);
    setStatus(STATUS.READY);
  }

  function handleInputChange(event) {
    const selected = event.target.files && event.target.files[0];
    if (!selected) {
      return;
    }
    applyFile(selected);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragOver(false);

    if (isBusy) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    if (files.length > 1) {
      setError("Only one file can be analyzed at a time.");
      return;
    }

    applyFile(files[0]);
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!isBusy) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    setIsDragOver(false);
  }

  function handleRemove() {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    submittingRef.current = false;
    setFile(null);
    setCategory(null);
    setStatus(STATUS.IDLE);
    setProgress(0);
    setError("");
    setSuccessMessage("");
    setResult(null);
    resetInputValue();
  }

  async function handleAnalyze() {
    if (!file || isBusy || submittingRef.current) {
      return;
    }

    const revalidation = validateMediaFile(file);
    if (!revalidation.ok) {
      setError(revalidation.message);
      return;
    }

    submittingRef.current = true;
    setError("");
    setSuccessMessage("");
    setResult(null);
    setProgress(0);
    setStatus(STATUS.UPLOADING);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const analysis = await analyzeMedia(file, {
        signal: controller.signal,
        onProgress: (percent) => {
          setProgress(percent);
          if (percent >= 100) {
            setStatus(STATUS.PROCESSING);
          }
        },
      });

      setStatus(STATUS.READY);
      setProgress(100);
      setResult(analysis);
      setSuccessMessage(
        analysis.isMock
          ? "Mock upload completed. No real detection result is available."
          : "Media analysis completed."
      );
    } catch (err) {
      if (err?.code === "ABORTED") {
        setStatus(file ? STATUS.READY : STATUS.IDLE);
        setError(err.message);
      } else {
        setStatus(STATUS.READY);
        setError(err?.message || "Media analysis failed. Try again later.");
      }
    } finally {
      submittingRef.current = false;
      abortRef.current = null;
    }
  }

  function handleCancelUpload() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }

  return (
    <section className="uploader" aria-labelledby="analyze-heading">
      <div
        className={isDragOver ? "dropzone dropzone--active" : "dropzone"}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="dropzone__input"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          disabled={isBusy}
          onChange={handleInputChange}
          aria-describedby={`${errorId} file-help`}
        />
        <label htmlFor={inputId} className="dropzone__label">
          <span className="dropzone__title">Drag &amp; Drop Your File</span>
          <span className="dropzone__or">OR</span>
          <span className="dropzone__button">Choose File</span>
          <span id="file-help" className="dropzone__hint">
            Image • Video • Audio
          </span>
        </label>
      </div>

      {file ? (
        <div className="file-meta">
          <dl>
            <div>
              <dt>Filename</dt>
              <dd>{file.name}</dd>
            </div>
            <div>
              <dt>Media type</dt>
              <dd>{category}</dd>
            </div>
            <div>
              <dt>File size</dt>
              <dd>{formatFileSize(file.size)}</dd>
            </div>
          </dl>
          <MediaPreview file={file} category={category} />
        </div>
      ) : null}

      {isBusy ? (
        <UploadProgress percent={progress} isProcessing={status === STATUS.PROCESSING} />
      ) : null}

      <ErrorMessage id={errorId} message={error} />

      {successMessage ? (
        <p className="success-message" role="status" aria-live="polite">
          {successMessage}
        </p>
      ) : null}

      <DetectionResult result={result} />

      <div className="uploader__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={handleRemove}
          disabled={!file && !isBusy}
        >
          Remove File
        </button>
        {isBusy ? (
          <button type="button" className="button button--ghost" onClick={handleCancelUpload}>
            Cancel Upload
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            onClick={handleAnalyze}
            disabled={!file || isBusy}
          >
            Analyze Media
          </button>
        )}
      </div>
    </section>
  );
}

export default MediaUploader;
