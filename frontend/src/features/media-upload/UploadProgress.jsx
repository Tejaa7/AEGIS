function UploadProgress({ percent, isProcessing }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const label = isProcessing ? "Processing media" : "Uploading media";

  return (
    <div
      className="upload-progress"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="upload-progress__header">
        <span>{label}</span>
        <span>{isProcessing ? "…" : `${clamped}%`}</span>
      </div>
      <div
        className="upload-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isProcessing ? undefined : clamped}
        aria-valuetext={isProcessing ? "Processing" : `${clamped} percent`}
      >
        <div
          className={
            isProcessing
              ? "upload-progress__bar upload-progress__bar--indeterminate"
              : "upload-progress__bar"
          }
          style={isProcessing ? undefined : { width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default UploadProgress;
