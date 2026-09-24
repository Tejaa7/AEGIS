import { validateMediaFile } from "../frontend/src/shared/utils/fileValidation.js";
import { MAX_IMAGE_SIZE } from "../frontend/src/shared/constants/fileConfig.js";

function fakeFile({ name, type, size }) {
  return { name, type, size };
}

const cases = [
  ["JPG", fakeFile({ name: "a.jpg", type: "image/jpeg", size: 1024 }), true],
  ["JPEG", fakeFile({ name: "a.jpeg", type: "image/jpeg", size: 1024 }), true],
  ["PNG", fakeFile({ name: "a.png", type: "image/png", size: 1024 }), true],
  ["WEBP", fakeFile({ name: "a.webp", type: "image/webp", size: 1024 }), true],
  ["MP4", fakeFile({ name: "a.mp4", type: "video/mp4", size: 2048 }), true],
  ["WEBM", fakeFile({ name: "a.webm", type: "video/webm", size: 2048 }), true],
  ["MP3", fakeFile({ name: "a.mp3", type: "audio/mpeg", size: 2048 }), true],
  ["WAV", fakeFile({ name: "a.wav", type: "audio/wav", size: 2048 }), true],
  ["EXE", fakeFile({ name: "a.exe", type: "application/octet-stream", size: 1024 }), false],
  ["JS", fakeFile({ name: "a.js", type: "text/javascript", size: 1024 }), false],
  ["HTML", fakeFile({ name: "a.html", type: "text/html", size: 1024 }), false],
  ["ZIP", fakeFile({ name: "a.zip", type: "application/zip", size: 1024 }), false],
  ["PDF", fakeFile({ name: "a.pdf", type: "application/pdf", size: 1024 }), false],
  ["SVG", fakeFile({ name: "a.svg", type: "image/svg+xml", size: 1024 }), false],
  ["TXT", fakeFile({ name: "a.txt", type: "text/plain", size: 1024 }), false],
  ["empty", fakeFile({ name: "a.jpg", type: "image/jpeg", size: 0 }), false],
  ["exact image limit", fakeFile({ name: "a.jpg", type: "image/jpeg", size: MAX_IMAGE_SIZE }), true],
  ["over image limit", fakeFile({ name: "a.jpg", type: "image/jpeg", size: MAX_IMAGE_SIZE + 1 }), false],
  ["unicode", fakeFile({ name: "фото.webp", type: "image/webp", size: 100 }), true],
  ["special chars", fakeFile({ name: "file (1) [copy].png", type: "image/png", size: 100 }), true],
  ["long name", fakeFile({ name: `${"n".repeat(300)}.jpg`, type: "image/jpeg", size: 100 }), true],
  ["mismatch", fakeFile({ name: "a.jpg", type: "audio/mpeg", size: 100 }), false],
];

let failed = 0;
for (const [label, file, expectedOk] of cases) {
  const result = validateMediaFile(file);
  if (result.ok !== expectedOk) {
    failed += 1;
    console.error("FAIL", label, result);
  } else {
    console.log("PASS", label, result.code);
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log("All validation cases passed.");
