import validator from "validator";
import { checkIsthereInvalidFields } from "./generalHelpers.js";

export const announcementAllowedFields = [
  "title", "description", "image_url", "link", "start_date", "end_date", "status"
];

export const isAnnouncementUrl = (value) => typeof value === "string" && (
  value === "" || validator.isURL(value, {
    protocols: ["http", "https"],
    require_protocol: true,
    require_valid_protocol: true,
    disallow_auth: true,
  })
);

export const validateAnnouncementPayload = (payload, existingAnnouncement) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Announcement payload must be an object");
  }
  checkIsthereInvalidFields(announcementAllowedFields, payload);
  if (Object.keys(payload).length === 0) throw new Error("At least one field is required");

  const normalized = { ...payload };
  const resulting = { ...existingAnnouncement, ...payload };
  for (const field of ["title", "description"]) {
    if (typeof resulting[field] !== "string" || !resulting[field].trim()) {
      throw new Error(`${field} must be a non-empty string`);
    }
    if (field in normalized) normalized[field] = normalized[field].trim();
  }
  for (const field of ["image_url", "link"]) {
    if (field in normalized) {
      if (typeof normalized[field] === "string") normalized[field] = normalized[field].trim();
      if (!isAnnouncementUrl(normalized[field])) {
        throw new Error(`${field} must be an HTTP/HTTPS URL or an empty string`);
      }
    }
  }
  for (const field of ["start_date", "end_date"]) {
    if (field in normalized) {
      // Require an explicit timezone so the visibility window is unambiguous.
      if (typeof normalized[field] !== "string" ||
          !validator.isISO8601(normalized[field], { strict: true, strictSeparator: true }) ||
          !/(Z|[+-]\d{2}:\d{2})$/i.test(normalized[field])) {
        throw new Error(`${field} must be an ISO 8601 timestamp with a timezone`);
      }
      normalized[field] = new Date(normalized[field]);
    }
    resulting[field] = normalized[field] ?? resulting[field];
    if (!(resulting[field] instanceof Date) || Number.isNaN(resulting[field].getTime())) {
      throw new Error(`${field} is required and must be a valid date`);
    }
  }
  if (resulting.end_date < resulting.start_date) {
    throw new Error("end_date must be on or after start_date");
  }
  if (resulting.status !== undefined && !["active", "inactive"].includes(resulting.status)) {
    throw new Error("status must be active or inactive");
  }
  return normalized;
};

export const visibleAnnouncementFilter = (now = new Date()) => ({
  status: "active",
  start_date: { $lte: now },
  end_date: { $gte: now },
});
