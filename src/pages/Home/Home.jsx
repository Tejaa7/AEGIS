import MediaUploader from "../../components/MediaUploader/MediaUploader.jsx";

function Home() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="brand">AEGIS</p>
        <p className="brand-subtitle">Multimodal Deepfake Detection System</p>
      </header>
      <main className="app-main">
        <h1 id="analyze-heading" className="page-title">
          Analyze Your Media
        </h1>
        <p className="page-lead">
          Upload one local image, video, or audio file. Analysis runs on the
          backend. This interface does not execute uploaded files.
        </p>
        <MediaUploader />
      </main>
      <footer className="app-footer">
        <p>
          Frontend security controls provide defense in depth, but backend
          validation and server-side security controls are mandatory.
        </p>
      </footer>
    </div>
  );
}

export default Home;
