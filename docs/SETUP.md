# Setup and operation

Requires Node.js 24 or newer. On Windows, macOS, or Linux, run `npm ci` and `npm run dev` for the mock-only four-tab console. No Siva installation, model, tunnel, or secret is required.

On the Nano, clone the repository to `~/projects/zgx-console` and run `./zgx setup`, then `./zgx start`. The setup command creates random bridge secrets in ignored `.env.local`; never copy them into Git.

`./zgx stop` stops only the live node bridge, so the public site stays online and ZGX Node becomes static. `./zgx shutdown` intentionally stops the public web service. Neither command stops Siva, containers, or models.

For live Nano development use `npm run dev:nano`. For local admin access from another computer, use SSH port forwarding to 60370 and browse `/admin`. Do not bind the admin interface to the LAN.

The public deployment and Nano activation are independent: the public site stays online when the Nano is off, and ZGX Node falls back to its explanatory static panel.
