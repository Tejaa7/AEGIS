# AEGIS Frontend Security Notes

Frontend security controls provide defense in depth, but backend validation and server-side security controls are mandatory.

**Frontend validation is not a security boundary.**

This React application is a media-upload client. It does not claim to be 100% secure. Anything shipped to the browser can be inspected or bypassed by the user.

## 1. Client-side validation

The browser checks:

- Allowlisted file extensions
- Allowlisted MIME types (when the browser reports them)
- Empty files
- Category-specific size limits
- Extension / MIME category consistency

These checks exist for user experience. An attacker can skip them. Do not treat them as authorization, integrity, or malware protection.

## 2. Backend validation requirements

The backend must independently validate:

- File extension (allowlist)
- Declared MIME type
- Magic bytes / file signature
- Actual media format after decoding
- File size against server limits
- File contents (reject polyglots, embedded scripts, and non-media payloads)
- Filename (never use it as a filesystem path)
- Processing limits (duration, resolution, sample rate, frame count)

Reject files that fail any of these checks.

## 3. Allowed file types (allowlist)

Images: `.jpg`, `.jpeg`, `.png`, `.webp`

Videos: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`

Audio: `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`

HTML, JavaScript, EXE, ZIP, SVG, PDF, and TXT are not accepted by this client and must also be rejected by the server.

## 4. File size limits

Defined once in `src/constants/fileConfig.js`:

- Image: 10 MB (`MAX_IMAGE_SIZE`)
- Audio: 50 MB (`MAX_AUDIO_SIZE`)
- Video: 200 MB (`MAX_VIDEO_SIZE`)

The backend must enforce the same or stricter limits, plus HTTP request size limits.

## 5. XSS prevention

- User-controlled filenames are rendered as React text, not HTML.
- `dangerouslySetInnerHTML` is not used.
- Uploaded files are previewed only as `<img>`, `<video>`, or `<audio>` via `URL.createObjectURL`.
- Uploaded content is never executed or rendered as HTML/JavaScript.

## 6. CSRF considerations

React itself does not provide CSRF protection.

If the backend authenticates with cookies, it must implement CSRF defenses (for example SameSite cookies plus a CSRF token or equivalent). Bearer tokens in request headers from a SPA are a different model and still require careful CORS and origin checks.

## 7. CORS configuration

Do not use `Access-Control-Allow-Origin: *` as a security shortcut for this authenticated or trusted-origin API.

Allow only trusted frontend origins. Do not reflect arbitrary `Origin` headers.

## 8. SSRF prevention

This application accepts local file uploads only. There is no “enter media URL” feature. The backend must not fetch user-supplied URLs for analysis.

## 9. DoS / resource exhaustion protection

The UI allows one file at a time, disables Analyze while a request is in flight, and supports cancelling an in-progress upload.

The backend should additionally implement:

- Rate limiting
- Request size limits
- Processing timeouts
- Concurrent job limits
- Media-processing isolation

## 10. Path traversal protection

Never use the original filename as a server filesystem path. Never construct backend paths from user-controlled filenames (`../../etc/passwd`, `..\..\file`, and similar).

Store uploads using server-generated identifiers. The frontend must never decide storage location.

## 11. Media-processing sandboxing

Decode and analyze media in an isolated worker/process with limited privileges, CPU, memory, and filesystem access. Treat media parsers as untrusted-input handlers.

## 12. Secrets management

Do not put database passwords, API secret keys, JWT secrets, cloud credentials, or private keys in the React frontend or in `VITE_*` variables.

`VITE_API_BASE_URL` is public configuration. Anything prefixed with `VITE_` is exposed to the browser.

## 13. Dependency security

Keep dependencies minimal (`react`, `react-dom`, Vite). Review updates, pin versions for production, and scan for known vulnerabilities.

## 14. Production deployment recommendations

- Serve the SPA over HTTPS.
- Restrict CORS to the production origin.
- Put request size limits and rate limits at the reverse proxy and application layers.
- Disable `VITE_USE_MOCK_API` in production.
- Log security-relevant events without storing file contents or secrets.
- Keep analysis models and credentials only on the server.

Future AI pipelines (EfficientNet-B0, temporal transformer, ResNet-18, Grad-CAM) belong on the backend, not in the browser.
