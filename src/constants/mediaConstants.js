export const MAX_MEDIA_SIZE = 5 * 1024 * 1024;

// This allowlist controls both authorization and storage paths.
export const mediaContexts = {
  announcement: { role: "priest", types: ["image"], prefix: "public/announcements" },
  priest_profile: { role: "priest", types: ["image"], prefix: "public/priest_profiles" },
  user_profile: { role: "user", types: ["image"], prefix: "public/user_profiles" },
  mass_prayer: { role: "user", types: ["image"], prefix: "private/mass_prayers" },
  family_card: { role: "user", types: ["image", "pdf"], prefix: "private/family_cards" },
};

export const mediaMimeTypes = {
  "image/png": { type: "image", extension: "png" },
  "image/jpeg": { type: "image", extension: "jpg" },
  "application/pdf": { type: "pdf", extension: "pdf" },
};
