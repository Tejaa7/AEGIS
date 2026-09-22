import { useEffect, useMemo } from "react";
import { MEDIA_CATEGORIES } from "../../constants/fileConfig.js";

function MediaPreview({ file, category }) {
  const objectUrl = useMemo(() => {
    if (!file) {
      return null;
    }
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (!file || !objectUrl) {
    return null;
  }

  const filename = file.name || "Selected media";

  return (
    <div className="media-preview" aria-live="polite">
      <p className="media-preview__label">Preview</p>
      {category === MEDIA_CATEGORIES.IMAGE ? (
        <img
          className="media-preview__image"
          src={objectUrl}
          alt={`Preview of ${filename}`}
        />
      ) : null}
      {category === MEDIA_CATEGORIES.VIDEO ? (
        <video
          className="media-preview__video"
          src={objectUrl}
          controls
          controlsList="nodownload"
          preload="metadata"
        >
          Your browser does not support video preview.
        </video>
      ) : null}
      {category === MEDIA_CATEGORIES.AUDIO ? (
        <audio
          className="media-preview__audio"
          src={objectUrl}
          controls
          controlsList="nodownload"
          preload="metadata"
        >
          Your browser does not support audio preview.
        </audio>
      ) : null}
    </div>
  );
}

export default MediaPreview;
