/**
 * CORS origin callback for express cors middleware.
 * - Production: only origins listed in CORS_ORIGINS (comma-separated). No list => deny browser cross-origin.
 * - Non-production: localhost/127.0.0.1 + any origin in CORS_ORIGINS; if CORS_ORIGINS unset, allow all (dev convenience).
 */
function createCorsOriginValidator() {
  const parseList = () =>
    (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

  return function corsOrigin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const allowed = parseList();
    const isProd = process.env.NODE_ENV === "production";

    if (isProd) {
      if (allowed.length === 0) {
        return callback(null, false);
      }
      return callback(null, allowed.includes(origin));
    }

    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    if (localhostPattern.test(origin)) {
      return callback(null, true);
    }
    if (allowed.length === 0) {
      return callback(null, true);
    }
    return callback(null, false);
  };
}

module.exports = { createCorsOriginValidator };
