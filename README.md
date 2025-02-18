## Orbiter Frontend

![cover](https://orbiter.host/og.png)

Official repo for Orbiter's Front End App.

This app acts as the main entrypoint for all users and featues:
- Supabase Auth
- Site creation and management
- Analytics
- Version History
- Billing
- API Keys
- ENS Linking
- Probably more I can't remember right now

## Development

Clone this repo and install dependencies

```bash
git clone https://github.com/orbiterhost/orbiter-frontend
cd orbiter-frontend
npm install
```

Rename the `.env.example` file to `.env` and fill out the following variables:

```
# General Site Info
VITE_BASE_URL= # API Server URL https://github.com/orbiterhost/orbiter-backend
VITE_GROUP_ID= # Pinata Group ID for file uploads
VITE_SITE_URL= # Site URL e.g. http://localhost:5173
# Supabase Auth
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# ENS
VITE_WRAPPER_ADDRESS= # ENS Name Wrapper Address
VITE_REGISTRY_ADDRESS= # ENS Registry Address
VITE_PUBLIC_RESOLVER= # ENS Public Resolver
VITE_ORBITER_RESOLVER= # Orbiter Custom ENS Resolver https://github.com/orbiterhost/orbiter-resolver
# Loop Subscription Product IDs
VITE_LOOP_LAUNCH_MONTHLY=
VITE_LOOP_LAUNCH_YEARLY=
VITE_LOOP_ORBIT_MONTHLY=
VITE_LOOP_ORBIT_YEARLY=
# Stripe Product IDs
VITE_STRIPE_LAUNCH_MONTHLY=
VITE_STRIPE_ORBIT_MONTHLY=
VITE_STRIPE_LAUNCH_YEARLY=
VITE_STRIPLE_ORBIT_YEARLY=
```

Then start up the dev server and open up the host at http://localhost:5173

```bash
npm run dev
```

## Contact

Questions? [Shoot us an email!](mailto:steve@orbiter.host,justin@orbiter.host)
