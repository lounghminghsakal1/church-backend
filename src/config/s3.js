import { S3Client } from "@aws-sdk/client-s3";

let client;

export const getS3Config = () => {
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) throw new Error("S3_BUCKET_NAME and AWS_REGION must be configured");
  if (Boolean(process.env.AWS_ACCESS_KEY_ID) !== Boolean(process.env.AWS_SECRET_ACCESS_KEY)) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be configured together");
  }
  return { bucket, region, publicBaseUrl: process.env.S3_PUBLIC_BASE_URL };
};

export const getS3Client = () => {
  const { region } = getS3Config();
  // Lazy initialization: app.js loads dotenv after importing modules.
  // The SDK reads AWS_* environment credentials or the deployment's IAM role.
  client ??= new S3Client({ region });
  return client;
};

export const getS3ObjectUrl = (config, key) => {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  if (key.startsWith("public/") && config.publicBaseUrl) {
    const base = new URL(config.publicBaseUrl);
    if (base.protocol !== "https:" || base.search || base.hash || base.username || base.password) {
      throw new Error("S3_PUBLIC_BASE_URL must be an HTTPS base URL without credentials, query or fragment");
    }
    return `${base.href.replace(/\/$/, "")}/${encodedKey}`;
  }
  const domain = config.region.startsWith("cn-") ? "amazonaws.com.cn" : "amazonaws.com";
  return `https://s3.${config.region}.${domain}/${encodeURIComponent(config.bucket)}/${encodedKey}`;
};
