import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { availabilityTarget } from "../utils/availabilityReminderUtils.js";

let client;

export const getReminderConfig = () => {
  const minutes = Number(process.env.PRIEST_REMINDER_MINUTES || 15);
  const timeZone = process.env.PRIEST_REMINDER_TIMEZONE || "Asia/Kolkata";
  const region = process.env.SES_REGION || process.env.AWS_REGION;
  const from = process.env.SES_FROM_EMAIL;
  if (!region || !from) throw new Error("SES_FROM_EMAIL and SES_REGION (or AWS_REGION) are required");
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error("PRIEST_REMINDER_MINUTES must be positive");
  new Intl.DateTimeFormat("en-IN", { timeZone }).format(new Date());
  return { minutes, timeZone, region, from };
};

export const buildAvailabilityEmail = (availability, config) => {
  const priest = availability.priest;
  if (!priest?.priest_email) throw new Error("Priest email is missing");
  const time = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full", timeStyle: "short", timeZone: config.timeZone
  }).format(new Date(availabilityTarget(availability)));
  const action = availability.availability_status === "available"
    ? "Your current availability ends" : "Your next availability begins";
  return {
    Source: config.from,
    Destination: { ToAddresses: [priest.priest_email] },
    Message: {
      Subject: { Charset: "UTF-8", Data: "Priest availability reminder" },
      Body: { Text: { Charset: "UTF-8", Data:
        `Dear ${priest.priest_name},\n\n${action} on ${time} (${config.timeZone}).\n\nPlease update your availability if your plans have changed.` } }
    }
  };
};

export const sendAvailabilityEmail = async (availability, config = getReminderConfig()) => {
  // Lazy initialization because dotenv is loaded by app.js after imports.
  client ??= new SESClient({ region: config.region, maxAttempts: 2,
    requestHandler: { connectionTimeout: 5_000, requestTimeout: 20_000 } });
  return client.send(new SendEmailCommand(buildAvailabilityEmail(availability, config)),
    { abortSignal: AbortSignal.timeout(45_000) });
};
