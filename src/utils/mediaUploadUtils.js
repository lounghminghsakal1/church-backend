import { mediaContexts, mediaMimeTypes } from "../constants/mediaConstants.js";

export const getMediaOptions = (body = {}, query = {}) => {
  const result = {};
  for (const name of ["media_context", "media_type"]) {
    if (body[name] !== undefined && query[name] !== undefined && body[name] !== query[name]) {
      throw new Error(`Conflicting ${name} in body and query`);
    }
    const value = body[name] ?? query[name];
    if (typeof value !== "string" || !value) throw new Error(`${name} is required`);
    result[name] = value;
  }
  if (!Object.hasOwn(mediaContexts, result.media_context)) throw new Error("Unsupported media_context");
  const context = mediaContexts[result.media_context];
  if (!context.types.includes(result.media_type)) throw new Error("media_type is not allowed for this context");
  return { ...result, context };
};

export const validateDetectedMedia = (file, detected, mediaType) => {
  const type = detected && mediaMimeTypes[detected.mime];
  if (!type || type.type !== mediaType || detected.mime !== file.mimetype) {
    throw new Error("File content does not match its MIME type or media_type");
  }
  return type;
};
