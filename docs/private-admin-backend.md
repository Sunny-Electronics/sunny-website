# SunnyKR Private Admin Backend

The Sunny admin/backend is private Sunny-only infrastructure.

## Admin URLs

Active owner-only admin URL now:

```text
https://sunnykr.com/admin.sunny.j0hn
```

Local active URL:

```text
http://127.0.0.1:5000/admin.sunny.j0hn
```

The plain `/admin.sunny.john` route is intentionally not active. The URL is only an entry point. Real protection still comes from the private login credentials and server session cookie.

## Access Rule

- You first, as owner.
- Sunny members can be added later, but they do not have active admin URLs now.
- No public, customer, or vendor access.
- No real passwords or secrets in GitHub.

## Adding Members Later

Use private environment config, not committed code:

```env
ADMIN_USERS_JSON=[{"username":"john","name":"John","password":"private-password-1","role":"owner"},{"username":"paul","name":"Paul","password":"private-password-2","role":"member"}]
```

When Paul is ready later, add the route pattern:

```text
https://sunnykr.com/admin.sunny.paul
```
