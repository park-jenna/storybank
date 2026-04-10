function formatValidationDetails(issues) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function sendError(res, status, { code, message, details }) {
  const body = {
    error: message,
    code,
  };

  if (details !== undefined) {
    body.details = details;
  }

  return res.status(status).json(body);
}

function sendValidationError(res, issues) {
  return sendError(res, 400, {
    code: "VALIDATION_ERROR",
    message: "Invalid request body",
    details: formatValidationDetails(issues),
  });
}

function sendInternalError(res, error, context) {
  console.error(context, error);
  return sendError(res, 500, {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
  });
}

module.exports = {
  sendError,
  sendInternalError,
  sendValidationError,
};
