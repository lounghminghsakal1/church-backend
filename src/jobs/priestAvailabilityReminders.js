import { randomUUID } from "node:crypto";
import PriestAvailability from "../models/PriestAvailability.js";
import "../models/Priest.js";
import { availabilityTarget } from "../utils/availabilityReminderUtils.js";
import { getReminderConfig, sendAvailabilityEmail } from "../services/availabilityEmail.js";

export const dueReminderFilter = (now, minutes) => ({
  "reminder.sent_at": null,
  $and: [
    { $or: [{ "reminder.lease_until": null }, { "reminder.lease_until": { $lte: now } }] },
    { $or: [{ "reminder.retry_at": null }, { "reminder.retry_at": { $lte: now } }] },
    { $or: [
      { availability_status: "available", available_until: { $gt: now, $lte: new Date(+now + minutes * 60_000) } },
      { availability_status: "not_available", next_available: { $gt: now, $lte: new Date(+now + minutes * 60_000) } }
    ] }
  ]
});

export const processAvailabilityReminders = async ({
  model = PriestAvailability, send = sendAvailabilityEmail, config = getReminderConfig(),
  clock = () => new Date(), logger = console, batchSize = 50
} = {}) => {
  for (let i = 0; i < batchSize; i++) {
    const now = clock();
    const token = randomUUID();
    // A persisted lease allows multiple app instances and recovers abandoned work on restart.
    const availability = await model.findOneAndUpdate(dueReminderFilter(now, config.minutes), {
      $set: { "reminder.token": token, "reminder.lease_until": new Date(+now + 5 * 60_000) },
      $inc: { "reminder.attempts": 1 }
    }, { new: true, timestamps: false }).select("+reminder").populate("priest", "priest_name priest_email");
    if (!availability) break;
    const owned = { _id: availability._id, "reminder.token": token };
    try {
      // Edits clear the token, invalidating work claimed for an earlier schedule.
      if (new Date(availabilityTarget(availability)) <= clock() || !await model.exists(owned)) continue;
      await send(availability, config);
      await model.updateOne(owned, { $set: {
        "reminder.sent_at": clock(), "reminder.token": null,
        "reminder.lease_until": null, "reminder.retry_at": null
      } }, { timestamps: false });
    } catch (error) {
      const delay = Math.min(5, 2 ** Math.min(availability.reminder.attempts - 1, 3)) * 60_000;
      await model.updateOne(owned, { $set: {
        "reminder.token": null, "reminder.lease_until": null,
        "reminder.retry_at": new Date(+clock() + delay)
      } }, { timestamps: false });
      logger.error(`Availability reminder failed for ${availability._id}: ${error.name}`);
    }
  }
};

export const startAvailabilityReminderWorker = () => {
  if (process.env.PRIEST_REMINDERS_ENABLED !== "true") return () => {};
  let config;
  try { config = getReminderConfig(); }
  catch (error) {
    console.error(`Availability reminders disabled: ${error.message}`);
    return () => {};
  }
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try { await processAvailabilityReminders({ config }); }
    catch (error) { console.error(`Availability reminder worker failed: ${error.name}`); }
    finally { running = false; }
  };
  const timer = setInterval(tick, 60_000);
  timer.unref();
  void tick();
  console.log(`Availability reminders enabled (${config.minutes} minutes before, checking every minute)`);
  return () => clearInterval(timer);
};
