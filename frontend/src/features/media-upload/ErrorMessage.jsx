function ErrorMessage({ message, id = "upload-error" }) {
  if (!message) {
    return null;
  }

  return (
    <div
      id={id}
      className="error-message"
      role="alert"
      aria-live="assertive"
    >
      <span className="error-message__mark" aria-hidden="true">
        !
      </span>
      <p className="error-message__text">{message}</p>
    </div>
  );
}

export default ErrorMessage;
