export const availabilityTarget = (availability) => {
  if (availability.availability_status === "available") return availability.available_until;
  if (availability.availability_status === "not_available") return availability.next_available;
  return null;
};

// Normalize inactive dates and reset delivery state only when the effective schedule changes.
export const prepareAvailabilityUpdate = (previous, updates, now = new Date()) => {
  const merged = { ...previous, ...updates };
  if (!["available", "not_available", "not_set"].includes(merged.availability_status)) {
    throw new Error("Invalid availability status");
  }
  const target = availabilityTarget(merged);
  const oldTarget = availabilityTarget(previous);
  const changed = previous.availability_status !== merged.availability_status ||
    new Date(oldTarget).getTime() !== new Date(target).getTime();
  if (merged.availability_status !== "not_set" &&
      (!target || !Number.isFinite(new Date(target).getTime()))) {
    throw new Error("A valid date is required for the selected availability status");
  }
  if (changed && target && new Date(target) <= now) {
    throw new Error("Availability time must be in the future");
  }
  const result = { ...updates };
  if (merged.availability_status !== "available") result.available_until = null;
  if (merged.availability_status !== "not_available") result.next_available = null;
  if (changed) result.reminder = {};
  return result;
};
