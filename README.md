# St. Antony's Church, Illuppur — Backend

Backend API for the parish application of **St. Antony's Church, Illuppur (Roman Catholic Church)**. It helps parishioners check priest availability, submit sacrament and meeting requests, and follow the priest's decision. Priests have a separate login and application flow for managing availability and reviewing requests.

The product vision covers all seven sacraments. The current repository contains request modules for **six sacraments**, plus meetings and Mass prayers. **Holy Orders is a proposed addition**; it does not yet have a model, controller, or route.

This README describes the checked-in application structure and current source code. Features marked as proposed are development suggestions, and existing endpoints have known issues listed below. This repository contains the backend only; the user and priest screens belong in a separate frontend.

## Roles and workflows

### Normal user / parishioner

1. Register and log in using the user authentication endpoints.
2. Maintain a profile with contact information, prayer group, church organizations, and optional family details.
3. Upload a parish family card where required.
4. View publicly accessible priest availability.
5. Submit a sacrament request, meeting request, or Mass prayer request.
6. List submitted requests and check their status and priest response.
7. Edit or cancel requests where the current implementation permits it.

The intended permission rule is that users can access and change only their own profiles and requests. Several individual-record handlers do not yet enforce this rule consistently; see the improvement priorities.

### Priest

1. Log in through the separate priest authentication endpoint.
2. Maintain their priest profile and availability information.
3. View pending requests by category, including selected parishioner contact details and family-card information where populated.
4. Approve or reject requests and optionally provide a response.
5. Create another priest account through the protected priest endpoint, once its current validation bug is fixed.

There are two main application roles: user and priest. Priest records additionally distinguish `main_priest` and `trainee`, but these values do not currently establish separate permission levels. Priest review queues are parish-wide pending lists; requests are not assigned to a chosen priest at submission.

## Features and implementation status

| Service | Current implementation |
| --- | --- |
| Baptism | Parent and child details, birth date, preferred baptism date/time, request management, priest review |
| Eucharist / Holy Communion | Parent and recipient details, preferred date/time, family-card check on creation, priest review |
| Confirmation | Parent and recipient details, family-card checks on selected operations, priest review; no preferred date/time field yet |
| Reconciliation / Confession | Person's name and preferred date/time, request management, priest review; individual fetch route needs correction |
| Matrimony / Marriage | Bride and groom details, locations, mobile numbers, preferred date/time, family-card check on creation, priest review |
| Anointing of the Sick | Patient details, condition, address, contact number, urgency, optional relationship, visit preference, priest review |
| Holy Orders | Not implemented; proposed vocation inquiry and priest-guided follow-up workflow |
| Priest meetings | Person's name, purpose, preferred meeting date/time, priest review |
| Mass prayers | Preferred date/time, required image upload on creation, linked payment record, priest review |
| Priest availability | Public reads; priest-authenticated creation and editing of status, dates, and notes; ownership bugs need correction |
| Family cards | Authenticated upload and replacement of document metadata on the user profile |
| Payments | Payment model and Mass prayer payment records only; no payment gateway or standalone payment API |
| Upcoming activities | Empty `UpcomingActivities.js` placeholder; no working API |
| Parishioner verification | `verification_status` field exists, but no priest verification workflow is implemented |
| Announcements | Priests manage their own announcements; signed-in users see active announcements within their start/end window |

Mass prayer requests are an additional parish service, not a seventh sacrament module.

## Request lifecycle

Request models use these status values:

| Status | Meaning |
| --- | --- |
| `pending` | Submitted and awaiting review |
| `approved` | Accepted by a priest |
| `rejected` | Declined by a priest |
| `cancelled` | Cancelled through the user workflow |

The intended transitions are `pending → approved`, `pending → rejected`, and `pending → cancelled`. Most modules restrict editing or review to pending requests, but those checks are inconsistent. Approval currently updates a status; it does not reserve a calendar slot or record that a sacrament has been administered.

Models include `priest_response` and `reviewed_by`, but review controllers currently do not populate `reviewed_by`. Most models have timestamps; `MarriageRequest` currently does not.

## Technology and architecture

| Technology | Purpose |
| --- | --- |
| Node.js with ES modules | Backend runtime |
| Express 5 | HTTP API and route handling |
| MongoDB and Mongoose 9 | Database, schemas, and validation |
| bcrypt | Password hashing and comparison |
| JSON Web Tokens and cookie-parser | Separate cookie-based user and priest sessions |
| cors | Frontend origin configuration and credentialed requests |
| Multer | Local document and image uploads |
| validator | Selected email and URL validation |
| dotenv | Environment configuration |
| nodemon and cross-env | Development reload and environment selection |

Requests generally flow through **routes → authentication / upload middleware → controllers → validation helpers and Mongoose models**. Constants define allowed and required fields for most request payloads.

```text
church-backend/
├── package.json
├── package-lock.json
├── src/
│   ├── app.js                    # App configuration, route mounts, server startup
│   ├── config/                   # MongoDB connection and Multer configuration
│   ├── constants/                # Allowed and required payload fields
│   ├── controllers/              # Request, profile, availability, and review handlers
│   │   └── auth/                 # Separate user and priest authentication
│   ├── middlewares/              # Authentication and family-card checks
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API route definitions
│   │   └── auth_routes/          # Authentication routes
│   └── utils/                    # Validation and response helpers
└── uploads/
    ├── family_cards/
    └── mass_prayer_images/
```

## Setup and running

### Prerequisites

- Node.js **20.19.0 or later**, matching the minimum required by the MongoDB/Mongoose dependencies in the lockfile.
- npm.
- A running MongoDB instance or an accessible hosted MongoDB database.
- A frontend origin to use for credentialed CORS requests.

Run commands from the repository root because environment files and upload directories are resolved relative to the working directory.

### Install dependencies

```sh
npm ci
```

### Environment configuration

Create `.env.local` for development and `.env` for production. Populate each with values appropriate to that environment:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/st_antony_illuppur
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_DOMAIN=http://localhost:3000
```

These are illustrative values, not existing credentials. Both environment files are already ignored by Git.

| Variable | Purpose |
| --- | --- |
| `PORT` | Server listening port; the application has no explicit fallback |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify both roles' tokens |
| `FRONTEND_DOMAIN` | Allowed frontend origin for CORS, including scheme and port where needed |
| `NODE_ENV` | Set by npm scripts; `development` loads `.env.local`, otherwise `.env` |

Ensure `uploads/family_cards` and `uploads/mass_prayer_images` exist and are writable. Multer does not create these directories automatically.

### Start the server

```sh
# Development: NODE_ENV=development, with automatic reload
npm run dev

# Production: NODE_ENV=production
npm start
```

With the example port, the API is available at `http://localhost:5000/api`. There is no dedicated health endpoint yet. Database connection failures are logged but currently do not stop the server from starting.

### First priest account

There is no public priest signup or seed command. Creating a priest through `POST /api/priest` requires an existing priest session, and its validator currently references an undefined variable. Initial setup therefore needs a controlled seed/provisioning procedure that stores a bcrypt-hashed password and the required priest fields. Add a repeatable bootstrap script as an early improvement; do not insert a plaintext password.

## Authentication and frontend integration

User login accepts `user_email` and `user_password`; priest login accepts `priest_email` and `priest_password`. User sessions use the `userToken` cookie, and priest sessions use the `token` cookie. Tokens and login cookies have a one-day lifetime.

Protected handlers read cookies rather than an `Authorization: Bearer` header. Browser requests must include credentials:

```js
await fetch(`${API_BASE_URL}/api/auth/user/login`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_email: "parishioner@example.com",
    user_password: "your_password",
  }),
});
```

Both login handlers currently set `httpOnly: true`, `secure: true`, and `sameSite: "none"` in every environment. HTTPS is the intended transport for these cookies; local HTTP cookie behavior must be checked in the target browser. Environment-aware cookie settings and consistent logout options are recommended. The frontend also needs separate user and priest session handling and navigation flows.

## API reference

Paths below reflect the current route definitions. Authentication requirements do not guarantee that record ownership is correctly enforced; known issues are documented later.

### Authentication and profiles

| Method | Path | Access / purpose |
| --- | --- | --- |
| POST | `/api/auth/user/signup` | Public user registration |
| POST | `/api/auth/user/login` | Public user login |
| GET | `/api/auth/user/me` | User session lookup; token checked inside controller |
| POST | `/api/auth/user/logout` | Clear user cookie |
| GET | `/api/user` | Authenticated user profile |
| PATCH | `/api/user/:user_id` | User profile update; ownership check needs correction |
| POST | `/api/auth/priest` | Public priest login |
| GET | `/api/auth/priest/me` | Priest session lookup; token checked inside controller |
| POST | `/api/auth/priest/logout` | Clear priest cookie |
| POST | `/api/priest` | Priest-authenticated creation of another priest; currently broken validator |
| PUT | `/api/priest/:priest_id` | Priest-authenticated update of own name/type |

User signup requires `user_name`, `user_email`, `user_mobile_number`, `user_password`, and `prayer_group`. The signup validator requires at least eight password characters and a mobile number of length ten. It does not enforce all password complexity mentioned in its error message.

Current prayer-group values are `St.Antony prayer group`, `St.Mary prayer group`, and `Vellai mariyal prayer group`. Organization values are `Vincent de paul organization`, `Younger services group`, and `Women services group`.

### Priest availability

| Method | Path | Access / purpose |
| --- | --- | --- |
| GET | `/api/priest_availability` | Public availability list |
| GET | `/api/priest_availability/:priest_id` | Public availability lookup by priest ID |
| POST | `/api/priest_availability` | Priest-authenticated creation |
| PUT | `/api/priest_availability/:priest_availability_id` | Priest-authenticated update by availability record ID |

Availability states are `available`, `not_available`, and `not_set`. Creation requires `priest` and `availability_status`, plus `available_until` when available or `next_available` when unavailable. Notes are optional. This is a status record, not a recurring calendar or booking system.

### User request endpoints

All these route groups require a user session:

| Service | Base path | ID parameter |
| --- | --- | --- |
| Baptism | `/api/user/baptism_request` | `baptism_request_id` |
| Eucharist | `/api/user/eucharist_request` | `eucharist_request_id` |
| Confession | `/api/user/confession_request` | `confession_request_id` |
| Confirmation | `/api/user/confirmation_request` | `confirmation_request_id` |
| Marriage | `/api/user/marriage_request` | `marriage_request_id` |
| Anointing of the Sick | `/api/user/aos_request` | `aos_request_id` |
| Meeting | `/api/user/meeting_request` | `meeting_request_id` |
| Mass prayer | `/api/user/mass_prayer` | `mass_prayer_id` |

The general route pattern is:

| Method | Relative path | Purpose |
| --- | --- | --- |
| POST | `/` | Create a request |
| GET | `/` | List the signed-in user's requests in that category |
| GET | `/:id` | Fetch one request |
| PATCH | `/:id` | Update a request |
| POST | `/:id/cancel` | Cancel a request |

**Current exceptions:** Confession's individual-fetch handler is mistakenly registered as a second `PATCH /:confession_request_id`, so the expected `GET /:id` is absent. Marriage cancellation uses `/:marriage_request/cancel`, while its controller reads `marriage_request_id`, causing cancellation to fail.

### Request creation fields

Use JSON for ordinary requests and multipart form data for uploads. Preferred date/time fields should use ISO 8601 timestamps with an explicit offset or `Z`.

| Service | Required creation fields |
| --- | --- |
| Baptism | `father_name`, `mother_name`, `child_name`, `child_date_of_birth`, `preferred_baptism_date_and_time` |
| Eucharist | `father_name`, `mother_name`, `eucharist_person_name`, `preferred_eucharist_date_and_time` |
| Confession | `confession_person_name`, `preferred_confession_date_and_time` |
| Confirmation | `father_name`, `mother_name`, `confirmation_person_name` |
| Marriage | `groom_name`, `bride_name`, `groom_location`, `bride_location`, `groom_mobile_number`, `bride_mobile_number`, `preferred_marriage_date_and_time` |
| Anointing of the Sick | `patient_name`, `patient_condition`, `patient_address`, `contact_number`, `is_urgent`; `preferred_visit_date_and_time` also required when `is_urgent` is false |
| Meeting | `person_name`, `preferred_meeting_date_and_time`, `meeting_purpose` |
| Mass prayer | `mass_prayer_date_and_time`, `payment_mode`, and uploaded `mass_prayer_image` |

Anointing requests also allow `relationship_to_patient` and an optional visit timestamp for urgent requests. Send `is_urgent` as a JSON boolean. Most scheduled models validate future dates on creation, but update validation is inconsistent. Baptism birth dates must be in the past.

Family-card middleware applies to Eucharist creation, Marriage creation, and Confirmation creation, update, individual fetch, and cancellation. It checks stored document metadata, not parish membership approval or actual file existence. Confirmation list retrieval does not require this check.

### Priest review endpoints

Every endpoint below requires a priest session. For each category, `GET` lists pending requests and `POST` reviews the identified request.

| Category | Pending list (GET) | Review (POST) |
| --- | --- | --- |
| Baptism | `/api/priest/baptism_requests` | `/api/priest/baptism_requests/:baptism_request_id` |
| Eucharist | `/api/priest/eucharist_requests` | `/api/priest/eucharist_requests/:eucharist_request_id` |
| Confession | `/api/priest/confession_requests` | `/api/priest/confession_requests/:confession_request_id` |
| Confirmation | `/api/priest/confirmation_requests` | `/api/priest/confirmation_requests/:confirmation_request_id` |
| Marriage | `/api/priest/marriage_requests` | `/api/priest/marriage_requests/:marriage_request_id` |
| Anointing of the Sick | `/api/priest/aos_requests` | `/api/priest/aos_requests/:aos_request_id` |
| Meeting | `/api/priest/meeting_requests` | `/api/priest/meeting_requests/:meeting_request_id` |
| Mass prayer | `/api/priest/mass_prayers` | `/api/priest/mass_prayers/:mass_prayer_id` |

The intended review body is:

```json
{
  "status": "approved",
  "priest_response": "Please contact the parish office to confirm the arrangements."
}
```

Use `rejected` to decline. The Anointing review handler currently lacks the explicit approved/rejected check used by other categories and also omits update validators.

### Uploads and payments

- `POST /api/uploads/family_card` requires a user session and multipart field `family_card`.
- Mass prayer creation and update accept multipart field `mass_prayer_image`. The update controller currently assumes a new file is present even though the route does not require it explicitly.
- Upload configuration allows PDF, PNG, and JPEG MIME types, with a maximum size of **5 MiB per file**. The shared filter currently allows PDF for Mass prayer uploads too.
- `/api/uploads` publicly serves the entire local upload directory, including family cards. Private document access is an urgent improvement.
- Mass prayer creation writes a linked payment record with an amount of `200`. Currency is not represented in the schema, and this amount should be made configurable.
- Payment modes are `online` and `offline`; statuses are `not_opted`, `completed`, `failed`, and `pending`. No online checkout, payment confirmation, webhook, receipt, or refund workflow exists.

### Response format

Most handlers aim to return:

```json
{
  "status": "success",
  "message": "Request created successfully",
  "data": {}
}
```

Failures usually contain `status: "failure"` and a message. Some handlers return HTTP 200 on failure, omit data, misspell status values, or return the wrong value. Treat this as the intended convention until those inconsistencies are fixed.

## Improvements identified from the source code

### Priority 1: Permissions and private data

1. **Enforce ownership on every individual request operation.** Many fetch, update, and cancellation handlers look up records by ID without matching `user: req.user._id`. Scope database queries to the signed-in user and test that a second user cannot read or change those records.
2. **Correct profile authorization.** `updateUser` compares the fetched record ID with the supplied route ID, which does not establish ownership. Compare against `req.user._id` or update the signed-in user's record directly.
3. **Repair Eucharist authorization control flow.** The update handler sends an ownership error without returning, allowing subsequent update code to run.
4. **Protect family-card documents.** Replace the public static route for private files with authenticated, owner/priest-authorized downloads. Keep public images separate and define retention and replacement cleanup.
5. **Exclude password hashes from responses.** Authentication, profile, upload, and some priest handlers return full documents. Use explicit projections or response serializers consistently; only priest creation currently removes its password field explicitly.
6. **Enforce priest availability ownership.** Creation compares a JSON string directly with a Mongoose ObjectId using `!==`, rejecting normal valid requests. Use ObjectId equality and enforce ownership on updates, where it is currently absent.
7. **Standardize session handling.** Invalid or expired user sessions return HTTP 401. Normalize other authentication errors and add login throttling, environment-aware cookies, matching logout cookie options, and CSRF protection for cookie-authenticated mutations.

### Priority 2: Correctness and workflow consistency

| Area | Finding and suggested change |
| --- | --- |
| Priest account creation | `validateCreatePriestData` references undefined `createPriestAvailabilityRequestBody` and validates the wrong allowed fields. Use `createPriestAllowedFields` and add controlled first-account provisioning. |
| Confession retrieval | Change the duplicate PATCH route to GET and await `validateIdAndGiveThatDocument` in the individual-fetch controller. |
| Marriage cancellation | Align the route parameter with the controller's `marriage_request_id`. |
| Updated response data | Eucharist, Confirmation, and Meeting update handlers return the controller function instead of the updated document. Return the saved record. |
| Confirmation cancellation | Pass the request ID to `findByIdAndUpdate` instead of the fetched document. |
| Mass prayer cancellation | Replace the two-argument `res.json(...)` call with the standard response helper and include the cancelled record. |
| Mass prayer payment status | Creation checks `req.body.status === "offline"` instead of `payment_mode`; this incorrectly initializes offline payments as pending. |
| Mass prayer updates | Handle a missing replacement file safely, preserve the existing image, and clean up failed/replaced uploads. |
| Request state transitions | Apply pending-only editing, cancellation, and review rules uniformly, including Confession and Baptism/Eucharist review. Restrict Anointing review to approved/rejected. |
| Review history | Save `reviewed_by`, review time, and an audit event with each decision. |
| Concurrent actions | Use conditional updates matching the expected status so simultaneous cancellation and approval cannot overwrite one another silently. |
| Validation | Validate updates consistently with `runValidators: true`; validate types, dates, phone digits, and empty bodies. Align signup fields with the User schema: `family_card_document_url` and `is_verified` are allowed by constants but absent from that schema. |
| Upload filtering | Return immediately after rejecting a MIME type to avoid calling the Multer callback twice; inspect actual file content and separate image rules from document rules. |
| Availability retrieval | Return after the missing-priest 404 response to prevent a second response. Validate status/date combinations against the resulting record on edits. |
| Record consistency | Add Marriage timestamps and a unique priest-availability index; improve Baptism duplicate detection beyond a global name/birth-date lookup. |
| Multi-record writes | Make payment and Mass prayer creation consistent through a transaction where supported, and clean up orphaned payment records and uploaded files after failures. |

### Priority 3: Maintainability and operation

- Add a shared error handler and consistent HTTP status codes, response bodies, and safe error messages.
- Validate required environment variables at startup and stop startup when the database connection fails.
- Add readiness/health endpoints, structured logs without sensitive payloads, graceful shutdown, and monitored database/upload backups.
- Add pagination, sorting, status/date filters, and suitable user/status/date indexes to request lists and priest queues.
- Extract shared request ownership and state-transition logic while retaining service-specific fields and rules.
- Add OpenAPI documentation and a reproducible API collection with sample requests for both roles.
- Add linting and formatting, pin the supported Node runtime, and move development-only tooling to development dependencies.
- Use durable private upload storage for hosted environments and avoid committing parishioner files. The repository currently contains uploaded files and does not ignore `uploads/`.
- Move marriage guidance from the stored `frontend_message` implementation note into appropriate frontend content or a clean API validation message.

## Proposed additional features

These are roadmap ideas and are not currently implemented.

| Feature | Parish benefit / proposed scope |
| --- | --- |
| Holy Orders / vocation inquiries | Complete the seven-sacrament coverage with an inquiry, priest consultation, and guided follow-up flow; agree the parish process before defining fields. |
| Appointment calendar | Priest-specific slots, recurring availability, leave periods, service duration, capacity, and conflict prevention. |
| Priest assignment and rescheduling | Assign a request to a priest, propose an alternative time, and obtain parishioner confirmation. |
| Unified priest dashboard | Pending counts across categories, urgent Anointing requests first, search, filters, and approved/rejected history. |
| Notifications and reminders | Notify users of decisions and schedule changes; remind users and priests before confirmed appointments through consented channels. |
| Family-card verification | Priest review of uploaded cards, verification decisions and reasons, plus family/member relationships. |
| Sacrament preparation | Parish-defined document checklists, preparation sessions, sponsor/godparent details, and readiness tracking. |
| Completion records and certificates | Record completed services separately from approval and support authorized certificate requests and downloads. |
| Parish events | Extend existing announcements with structured Mass timings, feast-day activities, preparation classes, and event registrations. |
| Tamil and English support | Localized content and notifications, with parish times displayed in `Asia/Kolkata`. |
| Account recovery | Email/mobile verification, password reset, password change, and session management. |
| Mass offerings and donations | Verified online payments, configurable amount/currency, receipts, offline reconciliation, and donation reporting. |
| Urgent pastoral visits | A clear urgent-request contact flow, priest alerts, acknowledgement, and visit tracking. |
| Prayer-group and organization coordination | Announcements, event participation, and parish-approved group membership workflows. |
| Parish reporting | Aggregate request volumes, turnaround times, upcoming commitments, and restricted exports without exposing private pastoral details. |

Keep Confession functionality focused on appointment logistics; do not add fields for the content of a confession. Any financial extension should be a distinct offering/donation workflow with transparent parish-approved rules.

## Suggested delivery order

1. Fix permissions, password-field exposure, private document access, authentication failures, and the broken routes/controllers.
2. Standardize request transitions, review attribution, validation, responses, and safe uploads; add integration coverage.
3. Complete priest provisioning, family-card verification, calendar scheduling, assignment, and notifications.
4. Add the Holy Orders inquiry flow, preparation tracking, completion records, events, and Tamil/English support.
5. Extend verified payments, reporting, monitoring, and deployment automation as parish needs grow.

## Testing and verification

The announcement module has focused automated tests. Run `npm run test:announcements` (or `npm.cmd run test:announcements` in PowerShell if script execution is restricted). These tests cover validation, visibility boundaries, ownership filters, mutations, and authentication rejection paths using mocked database calls. They do not require or verify a live MongoDB connection. `npm test` remains a placeholder; the other backend modules do not yet have automated coverage.

Recommended integration coverage includes:

- User and priest login, logout, session lookup, and invalid/expired/missing cookies.
- Role separation and cross-user access attempts on profiles, documents, and every request operation.
- Request creation, valid/invalid fields, pending-only edits, cancellation, approval, and rejection.
- Simultaneous priest review and user cancellation, with only one transition allowed to succeed.
- Availability ownership, invalid dates/status combinations, and duplicate availability records.
- Upload type/size limits, replacement cleanup, and authorized document downloads.
- Mass prayer creation/update failures and consistency between requests, payments, and files.

Use an isolated test database and synthetic records. A manual development check can start with public availability retrieval, followed by user signup/login, a meeting submission, priest review, and a user status check after fixing the documented blockers.

## Announcement API

Announcements contain required `title`, `description`, `start_date`, and `end_date`; optional `image_url` and `link`; and `status`, which defaults to `active`. Status accepts only `active` or `inactive`. Each record also stores the creating priest in `created_by` and creation/update timestamps.

Dates must be ISO 8601 timestamps with an explicit timezone. The end date must be on or after the start date. Scheduled and expired announcements retain their stored status, but are automatically hidden from users by the date filter; no scheduled job is needed.

| Method | Path | Access / behavior |
| --- | --- | --- |
| POST | `/api/priest/announcements` | Priest: create an announcement |
| GET | `/api/priest/announcements` | Priest: list own announcements, including inactive, scheduled, and expired records |
| GET | `/api/priest/announcements/:announcement_id` | Priest: view own announcement |
| PATCH | `/api/priest/announcements/:announcement_id` | Priest: edit any allowed fields, deactivate, or reactivate own announcement |
| DELETE | `/api/priest/announcements/:announcement_id` | Priest: permanently delete own announcement |
| GET | `/api/user/announcements` | Signed-in user: list currently visible announcements |
| GET | `/api/user/announcements/:announcement_id` | Signed-in user: view currently visible announcement details |

Create example (JSON body):

```json
{
  "title": "Parish feast celebration",
  "description": "Join us for the parish feast Mass and community gathering.",
  "image_url": "https://example.com/parish-feast.jpg",
  "link": "https://example.com/feast-details",
  "start_date": "2026-10-10T00:00:00+05:30",
  "end_date": "2026-10-18T23:59:59+05:30",
  "status": "active"
}
```

Deactivate with `PATCH /api/priest/announcements/:announcement_id`:

```json
{ "status": "inactive" }
```

Reactivate with `{"status":"active"}`. Send an empty string to clear `image_url` or `link`. URLs must use HTTP or HTTPS; this module stores URLs and does not upload images. Unknown fields and empty updates are rejected.

Users see an announcement only when **`status === "active"` and `start_date <= now <= end_date`**. Both boundaries are inclusive, and the server uses the current instant for comparison. User detail requests return 404 for inactive, upcoming, expired, or missing announcements. Priest operations return 404 for missing records or records created by another priest. Invalid IDs or payloads return 400; simultaneous conflicting edits return 409 and should be retried after reloading the record.

## Single S3 media upload API

The existing local family-card and Mass prayer upload routes continue to use local disk. The new, separate endpoint is **`POST /api/uploads/s3`**. It accepts `multipart/form-data` with one file in field `file` and two metadata fields:

- `media_context`: which section the asset belongs to.
- `media_type`: `image` or `pdf`.

The metadata can instead be query parameters, for example `/api/uploads/s3?media_context=announcement&media_type=image`. Conflicting body/query values are rejected. Use the existing user or priest login cookies; AWS credentials are never accepted from the frontend.

| Context | Required session | Allowed media | S3 key prefix |
| --- | --- | --- | --- |
| `announcement` | Priest | PNG/JPEG image | `public/announcements/` |
| `priest_profile` | Priest | PNG/JPEG image | `public/priest_profiles/` |
| `user_profile` | User | PNG/JPEG image | `public/user_profiles/` |
| `mass_prayer` | User | PNG/JPEG image | `private/mass_prayers/` |
| `family_card` | User | PNG/JPEG image or PDF | `private/family_cards/` |

The context allowlist is defined in `src/constants/mediaConstants.js`; add future sections there. Keys include the authenticated uploader ID and a generated UUID. The backend uses the detected file type for the extension, validates file signatures against the supplied MIME type and media type, and limits uploads to **5 MiB**. File signatures identify formats; they do not constitute malware scanning.

### S3 configuration

Install dependencies with `npm ci`. Copy the required values from `.env.example` into `.env.local` for development or `.env` for production:

```dotenv
S3_BUCKET_NAME=your-church-media-bucket
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
# AWS_SESSION_TOKEN=your_session_token_if_using_temporary_credentials
# S3_PUBLIC_BASE_URL=https://your-cloudfront-domain.example.com
```

The AWS SDK uses its default credential provider chain, including environment credentials and IAM roles. AWS deployments can omit access keys and use a role instead. Missing S3 configuration affects this endpoint without preventing the rest of the backend from starting. Credentials belong only on the backend. See [AWS credential configuration](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).

Create the bucket in the configured region. Give the application's IAM identity `s3:PutObject` permission limited to the prefixes above. Example write policy, replacing the bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:PutObject",
    "Resource": [
      "arn:aws:s3:::your-church-media-bucket/public/*",
      "arn:aws:s3:::your-church-media-bucket/private/*"
    ]
  }]
}
```

Uploads do not set a public ACL or change bucket policies. The `public/` prefix is a storage convention, not an access grant. New S3 objects are private by default; a stable object URL alone does not make them readable. For announcement/profile display, configure CloudFront read access to the intended `public/*` prefixes and set `S3_PUBLIC_BASE_URL`, or deliberately configure narrowly scoped public reads. Keep `private/*` inaccessible to anonymous users. See [AWS Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html).

The optional CDN base URL is used only for `public/*` assets. Private assets return a stable S3 object URL; displaying them requires a future authorized download endpoint or short-lived presigned GET URL. Such a download endpoint is not included in this upload API. Store the stable key/URL, not an expiring signed download URL.

### Frontend upload and announcement payload example

```js
const form = new FormData();
form.append("file", selectedFile);
form.append("media_context", "announcement");
form.append("media_type", "image");

const uploadResponse = await fetch(`${API_BASE_URL}/api/uploads/s3`, {
  method: "POST",
  credentials: "include",
  body: form,
});
const upload = await uploadResponse.json();
if (!uploadResponse.ok) throw new Error(upload.message);

await fetch(`${API_BASE_URL}/api/priest/announcements`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Parish feast",
    description: "Join us for the parish feast Mass.",
    image_url: upload.data.url,
    start_date: "2026-10-10T00:00:00+05:30",
    end_date: "2026-10-18T23:59:59+05:30",
    status: "active",
  }),
});
```

Do not manually set a multipart `Content-Type`; the browser supplies the boundary. S3's SDK upload response confirms the write; the backend constructs the object URL from the bucket, region, and generated key.

Successful upload response (HTTP 201):

```json
{
  "status": "success",
  "message": "Media uploaded to S3 successfully",
  "data": {
    "url": "https://s3.ap-south-1.amazonaws.com/your-church-media-bucket/public/announcements/PRIEST_ID/UUID.jpg",
    "key": "public/announcements/PRIEST_ID/UUID.jpg",
    "media_context": "announcement",
    "media_type": "image",
    "content_type": "image/jpeg",
    "size": 12345
  }
}
```

This endpoint uploads the asset only: it does not update profiles, family-card records, Mass prayer requests, or announcements. The current announcement API already accepts `image_url`. Existing local family-card and Mass prayer APIs still require their original file fields; they have not been converted into URL-based payload APIs. Profile image fields are also not currently part of those profile schemas. Those contexts support storage now, with record association requiring a later feature change.

Invalid metadata/files return 400, missing/invalid sessions 401, a disallowed role 403, oversized files 413, missing configuration 503, and S3 upload failures 502. Each upload uses a new key. Replacing or deleting an announcement does not delete its old S3 object. Future asset association should verify ownership and context, track unused uploads, and clean up abandoned/replaced objects. Add per-account upload quotas/rate limits when deploying the endpoint.

### Backend uploads versus presigned uploads

The implemented flow is **frontend → backend → S3 → URL back to frontend → feature payload**. It keeps signature checks and size enforcement in the backend and is straightforward for the current 5 MiB limit. Concurrent uploads consume backend memory and bandwidth because files are buffered in memory.

A presigned upload flow is **frontend requests authorization/key from backend → frontend uploads directly to S3 → backend verifies completion → feature payload uses stable asset key/URL**. The frontend receives permission for a specific upload without receiving AWS credentials. This reduces backend bandwidth and memory use and is a better fit as uploads grow. See [AWS presigned upload documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html).

Presigning requires bucket CORS for direct browser uploads, short expiration, role/context authorization, generated unique keys, completion verification, and an inspection step if content validation is required. Presigned URLs can be reused until expiry and an upload to the same key can replace that object; they are not inherently single-use. See [AWS presigned URL behavior](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).

For enforcing an upload size range directly at S3, consider a presigned POST with a `content-length-range` policy rather than assuming a presigned PUT enforces your backend's 5 MiB rule. See [S3 POST policy conditions](https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sigv4-HTTPPOSTConstructPolicy.html). Presigned upload URLs and temporary download URLs should never be persisted as permanent media URLs.

Run `npm run test:s3-media` for validation, role handling, real multipart parsing, limits, and upload-response tests. S3 operations are mocked; these tests do not create objects in AWS or verify real IAM/bucket access.

## License

`package.json` declares the ISC license. A standalone license file is not currently present.
