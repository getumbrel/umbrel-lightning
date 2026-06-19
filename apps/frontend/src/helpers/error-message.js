const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

function getHeader(headers, name) {
  if (!headers) return "";

  const lowerName = name.toLowerCase();
  const headerName = Object.keys(headers).find(
    key => key.toLowerCase() === lowerName
  );

  return headerName ? headers[headerName] : "";
}

function isHtmlResponse(response) {
  const contentType = getHeader(response.headers, "content-type");
  if (
    typeof contentType === "string" &&
    contentType.toLowerCase().includes("text/html")
  ) {
    return true;
  }

  if (typeof response.data !== "string") return false;

  const start = response.data.trim().slice(0, 512);
  return (
    /^(<!doctype html|<html[\s>]|<head[\s>]|<body[\s>])/i.test(start) ||
    /<\/?[a-z][a-z0-9-]*(\s|>|\/)/i.test(start)
  );
}

function messageFromData(data) {
  if (typeof data === "string") {
    return data.trim();
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  if (typeof data.message === "string") {
    return data.message.trim();
  }

  if (Array.isArray(data.validationErrors)) {
    return data.validationErrors.join("\n");
  }

  if (typeof data.error === "string") {
    return data.error.trim();
  }

  if (data.error && typeof data.error === "object") {
    const message = messageFromData(data.error);
    const details =
      data.error.error &&
      typeof data.error.error.details === "string" &&
      data.error.error.details.trim();

    if (message && details) {
      return `${message} - ${details}.`;
    }

    return message;
  }

  return "";
}

export default function getErrorMessage(
  error,
  fallback = DEFAULT_ERROR_MESSAGE
) {
  if (!error) return fallback;

  if (error.response) {
    if (isHtmlResponse(error.response)) {
      return fallback;
    }

    return messageFromData(error.response.data) || fallback;
  }

  if (error.request) {
    return fallback;
  }

  return error.message || fallback;
}
