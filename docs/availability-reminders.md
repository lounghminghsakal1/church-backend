# Priest availability email reminders

The backend runs a worker immediately at startup and every minute thereafter. It sends
an SES email when an `available` record's `available_until`, or a `not_available`
record's `next_available`, is within the reminder window (15 minutes by default).
`not_set`, already-sent and expired records are skipped. A time entered inside the
window is eligible immediately on the next check. Existing records work without migration.

## Enable

Add the following to `.env.local` for development or `.env` for production, then restart:

```dotenv
PRIEST_REMINDERS_ENABLED=true
SES_FROM_EMAIL=your-verified-sender@example.com
AWS_REGION=ap-south-1
PRIEST_REMINDER_MINUTES=15
PRIEST_REMINDER_TIMEZONE=Asia/Kolkata
```

Use `SES_REGION` if SES is configured in a different region from S3. The SDK uses
the existing AWS credential environment variables or the deployment IAM role.
The identity must be verified in that SES region and the role/user needs
`ses:SendEmail`. In the SES sandbox, recipients must also be verified.
See the [AWS SES setup requirements](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/ses-examples-sending-email.html).
An invalid or missing configuration disables the worker with a startup error log.
Reminders are disabled unless `PRIEST_REMINDERS_ENABLED=true`.

Send API dates with an explicit timezone, for example `2030-01-01T18:00:00+05:30`
or an ISO UTC timestamp ending in `Z`. MongoDB stores UTC instants; the configured
timezone controls email formatting. The API rejects invalid, missing and newly
changed dates in the past. Date-only edits use the existing availability status.
Changing status clears the inactive date, and the new status needs a corresponding date.

## Delivery and recovery

The backend must remain running for reminders to be sent. This worker is for an
always-running Node deployment, rather than a serverless request handler. Polling
normally sends within a minute after the reminder becomes due; email delivery adds
its own delay. A stopped server catches up on restart only while the availability
time is still in the future. It does not send expired reminders.

MongoDB stores sent markers, retry times and a five-minute claim lease. Failed
sends retry after one, two, four, then five minutes, until the target time expires.
Claims prevent concurrent instances from processing the same reminder. Crashed
workers' claims become eligible after their leases expire. A tick processes up to
50 reminders; extra work continues on the next tick.

Changing the effective status/time resets the reminder and invalidates old claims;
editing notes or resubmitting the same time preserves delivery state. Editing is
restricted to the owning priest. Internal reminder fields are excluded from queries
returned by the public availability endpoints and cannot be set by API clients.

Delivery is best effort, not exactly once: a crash after SES accepts a message but
before MongoDB records success can cause a duplicate. A schedule edited just as an
email is submitted may still receive the earlier email. `sent_at` means SES accepted
the request, not that the recipient opened or received it. SES delivery/bounce events
are outside this worker's scope.

## Verification

Run `npm run test:availability-reminders`. Tests use an in-memory collection and a
stub email sender; they do not connect to a real MongoDB instance or send email.
For a live smoke test after configuring SES, set your own priest's availability
time 5–10 minutes ahead and wait for the next worker tick. Confirm one email arrives
and no additional email arrives on subsequent ticks. Move the time to a new future
value to check that the reminder resets.
