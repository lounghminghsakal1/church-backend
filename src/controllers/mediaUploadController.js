import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";
import { getS3Client, getS3Config, getS3ObjectUrl } from "../config/s3.js";
import { getMediaOptions, validateDetectedMedia } from "../utils/mediaUploadUtils.js";
import { failureResponse, successResponse } from "../utils/generalHelpers.js";

// Factory permits testing upload behavior without AWS credentials or network calls.
export const createS3MediaUploadHandler = ({
  detectType = fileTypeFromBuffer, configForUpload = getS3Config, clientForUpload = getS3Client,
} = {}) => async (req, res) => {
  let options;
  let type;
  try {
    options = getMediaOptions(req.body, req.query);
    if (!req.mediaActors[options.context.role]) {
      return res.status(403).json(failureResponse(`This media context requires a ${options.context.role} session`));
    }
    if (!req.file || !req.file.buffer.length) throw new Error("A non-empty file is required in multipart field 'file'");
    const detected = await detectType(req.file.buffer);
    type = validateDetectedMedia(req.file, detected, options.media_type);
  } catch (err) {
    return res.status(400).json(failureResponse(err.message));
  }

  let config;
  let client;
  let url;
  const actor = req.mediaActors[options.context.role].toString();
  const key = `${options.context.prefix}/${actor}/${randomUUID()}.${type.extension}`;
  try {
    config = configForUpload();
    url = getS3ObjectUrl(config, key);
    client = clientForUpload();
  } catch {
    return res.status(503).json(failureResponse("S3 upload is not configured correctly"));
  }
  try {
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ContentLength: req.file.size,
      // No public ACL: access is managed by your bucket/CloudFront policy.
      Metadata: { media_context: options.media_context, media_type: options.media_type, uploaded_by: actor },
    }), { abortSignal: AbortSignal.timeout(30_000) });
    return res.status(201).json(successResponse("Media uploaded to S3 successfully", {
      url, key, media_context: options.media_context, media_type: options.media_type,
      content_type: req.file.mimetype, size: req.file.size,
    }));
  } catch {
    return res.status(502).json(failureResponse("Failed to upload media to S3"));
  }
};

export const uploadS3Media = createS3MediaUploadHandler();
