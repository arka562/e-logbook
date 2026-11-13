// Central error handling — the single place errors become responses.
//
// Problems this replaces:
// - The old handler sent err.message to the client for EVERY error,
//   leaking internal details (driver messages, stack-derived text)
//   on genuine 500s.
// - Several controllers have no try/catch and were not wrapped, so
//   their async errors never reached this handler at all: a rejected
//   promise (e.g. a Mongoose CastError from a malformed ID) crashed
//   the whole process with an unhandled rejection. Those routes are
//   now wrapped in asyncHandler, which forwards errors here.
//
// Mapping rules:
// - CastError (malformed ObjectId)          -> 400 "Invalid ID format"
// - ValidationError                         -> 400, failing messages
// - Duplicate key (11000)                   -> 400 "Resource already exists"
//   (matches the existing "already exists" 400 responses in the API)
// - Errors with an explicit status (< 500)  -> keep status + message
// - Everything else                         -> 500, generic message only;
//   the full error is logged server-side and never sent to the client.
export const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.code === 11000) {
    statusCode = 400;
    message = "Resource already exists";
  }

  if (statusCode >= 500) {
    console.error(err.stack);
    message = "Server Error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

// JSON 404 for unmatched routes, instead of Express's default HTML
// page — this is a JSON API and clients should be able to parse it.
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
