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
          Upload one local image, video, or audio file.
        </p>
        <MediaUploader />
      </main>
    </div>
  );
}

export default Home;
