# Demo booking operations

The Console stores booking state in `ZGX_BOOKING_DATA_PATH` (default: `apps/web/data/demo-bookings.json` when the web app is started from its package directory). Keep this path on persistent Nano storage and writable by `zgx-console.service`.

Configure these values in the service environment:

- `ZGX_BOOKING_SIGNING_SECRET`: a random secret of at least 24 characters for approval and private visitor access links.
- `ZGX_PUBLIC_ORIGIN=https://zgxconsole.bncvc.com`: the externally reachable HTTPS Console origin.
- `ZGX_ADMIN_NOTIFICATION_EMAIL`: the new-request notification recipient.
- `ZGX_SMTP_HOST=mail.privateemail.com`, `ZGX_SMTP_PORT=465`, `ZGX_SMTP_USER`, and `ZGX_SMTP_PASSWORD`: Namecheap Private Email credentials using implicit TLS.
- `ZGX_BOOKING_LIMIT_EXEMPT_EMAIL=bitarafv@yahoo.com`: the only address exempt from the one-request-per-24-hours limit; availability and cooldown rules still apply.
- `ZGX_BOOKING_REPLY_TO`: optional reply mailbox; defaults to `ZGX_SMTP_USER`.
- Publish DMARC as `v=DMARC1; p=none; rua=mailto:zgxconsole@bncvc.com; adkim=s; aspf=s` while monitoring Namecheap delivery.
- `ZGX_IMAP_HOST=mail.privateemail.com` and `ZGX_IMAP_PORT=993`: visitor reply mailbox over TLS. `ZGX_IMAP_USER` and `ZGX_IMAP_PASSWORD` are optional and default to the SMTP credentials.
- Existing `ZGX_NODE_BRIDGE_ORIGIN`, `ZGX_BRIDGE_TOKEN`, and `ZGX_ADMIN_BRIDGE_SECRET`: used by automated and manual lifecycle actions.

Approval commits before email delivery. A failed welcome email is shown in the Admin row and can be retried with **Resend welcome**. Welcome emails contain a signed Console link, never a raw workload endpoint. The link displays the confirmed time before the visit and redirects to a ready HTTPS workload only during the exact 15-minute window. The workload endpoint must remain non-public or separately protected to prevent bypassing this entry link.

Visitor replies are polled from INBOX every 60 seconds. They are accepted only when the sender matches the booking email and the message references the welcome Message-ID or includes `[ZGX:<booking-id>]`. Attachments and HTML are not stored; normalized plain text is capped at 10,000 characters. Delivery and reply changes use the same complete Admin SSE snapshots as booking and schedule changes.

The scheduler checks every 30 seconds. It launches an approved, never-launched booking 15 minutes before its start and stops a launched booking 30 minutes after start. Manual lifecycle order is enforced on the server: Launch once, then Stop once. Deny replaces Release and cannot interrupt a running workload. Delete permanently removes a booking and its messages; if running, the workload must stop successfully first.

The Console must run as its persistent systemd service; serverless deployments do not provide the required scheduler lifetime or writable persistent filesystem. After configuring credentials and secrets, rebuild and restart `zgx-console.service`.
