# Tirthstal Admin Panel

React + Vite admin panel for the Tirthstal Express/MongoDB backend.

## Setup

```sh
npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_URL` is the API root **including `/api`**. Local development defaults to `http://localhost:3000/api`; production builds intentionally fail when `VITE_API_URL` is missing. For the hosted backend, use `https://backend-tirthsthal.onrender.com/api`. The backend must also allow the deployed panel origin through its `CLIENT_URL` setting.

The separately maintained login flow stores its bearer token in `localStorage.token` (`adminToken` and `authToken` are also accepted). Protected requests send `Authorization: Bearer <token>`. A 401 clears that session and navigates to `/login`; 400 and 429 responses display the backend message without logging out.

## Temple data

Temple records are managed at `/temple`. Image fields accept public URLs because the API expects string URLs, not multipart uploads. Deactivation is a soft delete; deactivated records can be restored during the same admin session. The public list endpoint does not expose inactive records after a reload.

The 34-temple seed is a **server operation only**:

```sh
npm run seed:temples
```

Run that command in the backend deployment/server environment, not in this repository. “Needs data” badges identify temples with no morning timing or no images.

## Checks

```sh
npm run lint
npm test
VITE_API_URL=https://backend-tirthsthal.onrender.com/api npm run build
```

The automated API tests use mocked responses. Live create/edit/deactivate/reactivate, profile, and password verification requires an authenticated admin session and a safe test account.
