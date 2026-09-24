function formatConfidence(value) {
  if (!Number.isFinite(value)) {
    return "Unavailable";
  }

  const percent = value <= 1 ? value * 100 : value;
  return `${Math.round(percent)}%`;
}

function DetectionResult({ result }) {
  if (!result) {
    return null;
  }

  if (result.isMock) {
    return (
      <section className="detection-result detection-result--mock" aria-live="polite">
        <h2 className="detection-result__title">Development mock only</h2>
        <p className="detection-result__note">
          No real AI prediction is shown. This response is a clearly marked mock
          used because the backend is not connected. Do not treat it as a
          deepfake detection result.
        </p>
        <p className="detection-result__models">
          Future pipelines: EfficientNet-B0 (image), EfficientNet-B0 + Temporal
          Transformer (video), ResNet-18 (audio), Grad-CAM explainability. Models
          run on the backend, not in the browser.
        </p>
      </section>
    );
  }

  return (
    <section className="detection-result" aria-live="polite">
      <h2 className="detection-result__title">Detection result</h2>
      <dl className="detection-result__grid">
        <div>
          <dt>Prediction</dt>
          <dd>{result.prediction}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{formatConfidence(result.confidence)}</dd>
        </div>
        <div>
          <dt>Modality</dt>
          <dd>{result.modality}</dd>
        </div>
      </dl>
    </section>
  );
}

export default DetectionResult;
