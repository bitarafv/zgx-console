# Setup and operation

Requires Node.js 24 or newer. On the Nano, clone the repository and run `./zgx setup`, then `./zgx start`. The setup command creates random bridge secrets in ignored `.env.local`; never copy them into Git.

`./zgx stop` owns only the console, simulation, bridge, and optional tunnel processes recorded under `.run`. It refuses occupied foreign ports and does not stop Siva, containers, or models.

For development use `./zgx dev`. For local admin access from another computer, use SSH port forwarding to 60370 and browse `/admin`. Do not bind the admin interface to the LAN.

The public deployment and Nano activation are independent: the public site stays online when the Nano is off, and ZGX Node falls back to its explanatory static panel.
