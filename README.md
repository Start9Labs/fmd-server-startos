<p align="center">
  <img src="icon.svg" alt="FMD Server Logo" width="21%">
</p>

# FMD Server on StartOS

> Everything not listed in this document should behave the same as upstream
> FMD Server. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[FMD Server](https://gitlab.com/fmd-foss/fmd-server) is the server for the FMD (Find My Device) Android app. Phones register accounts on it and upload encrypted locations and pictures. A web interface shows that data and sends the phones commands.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs upstream's own image, unmodified, for x86_64 and aarch64.

- **Image:** `registry.gitlab.com/fmd-foss/fmd-server` (Debian-based, runs as the image's `fmd-server` user, uid 1000).
- **Command:** `/opt/fmd-server serve --config /data/config.yml`. This replaces the image's entrypoint, which passes `--db-dir` and no config file.
- **Subcontainers:**
  - `fmd-server-sub` runs the `chown` oneshot and then the `primary` daemon.
  - `fmd-server-ctl` is a temporary subcontainer for the account actions. It runs upstream's admin CLI `/opt/fmd-server-ctl` against the same volume.

The server logs through zerolog's console writer, so log lines carry ANSI colour codes. Every start logs `Failed to connect to syslog`. That message is harmless: the container has no syslog, and upstream logs to stderr regardless.

## Volume and Data Layout

All state lives on one volume, `main`, mounted at `/data`.

| Path                                     | Contents                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/data/config.yml`                       | Upstream's config file, owned by the package (see [File Models](#file-models))                    |
| `/data/db/fmd.sqlite` (+ `-wal`, `-shm`) | The embedded SQLite database: accounts, encrypted locations, encrypted pictures, pending commands |

The `chown` oneshot hands `/data/db` to `fmd-server` on every start, because StartOS mounts volumes root-owned. There is no external database.

## File Models

`/data/config.yml` is modelled by `startos/fileModels/config.yml.ts` and is the only configuration the server reads. Nothing is passed by environment variable.

- **Re-asserted on every init:** `DatabaseDir` (`/data/db`), `PortInsecure` (`8080`), `PortSecure`, `ServerCrt`, `ServerKey` and `UnixSocketPath` (all empty, so the server neither terminates TLS nor uses a socket), `RemoteIpHeader` (`X-Forwarded-For`), and `MetricsAddrPort` (`[::1]:9100`). A hand edit to any of these reverts the next time the service's container initialises.
- **Written by actions:** `RegistrationToken` (Generate Registration Token), plus `MaxSavedLoc`, `MaxSavedPic` and `TileServerUrl` (Settings). Each defaults to upstream's value: empty, 500, 10 and empty (OpenStreetMap).
- **Left to the user:** `LogLevel` (default `info`), and any key the model does not name. These survive both hand edits and package writes.

The server reads the file only at startup. The daemon is subscribed to it, so any change, whether an action or a hand edit, restarts the service.

## Dependencies

None.

## Network Access and Interfaces

The service exposes one interface, which serves both the web interface and the API the Android app uses.

| Interface     | ID   | Type | Port | Protocol | Purpose                                                                                             |
| ------------- | ---- | ---- | ---- | -------- | --------------------------------------------------------------------------------------------------- |
| Web Interface | `ui` | `ui` | 8080 | HTTP     | Web interface, plus the `/api/v1` and `/api/v2` endpoints the FMD app registers with and uploads to |

StartOS adds `X-Forwarded-For` and strips any copy a client supplies, and `RemoteIpHeader` trusts it. The server therefore records the real client IP for sessions.

Not exposed: upstream's TLS port (8443), because StartOS terminates TLS; and the Prometheus metrics listener, which stays on the container's loopback.

The FMD app refuses plaintext HTTP. It trusts user-installed CAs, so a phone that has the server's root CA installed can use a LAN or `.local` HTTPS address. The browser UI needs a secure context for WebCrypto, so it too works only over HTTPS.

Outbound connections the server makes itself: UnifiedPush wake-ups to each registered device's push endpoint. Map tiles are fetched by the user's browser, not by the server.

## Installation and First-Run Flow

Upstream ships with registration open to anyone. The package instead blocks the first start on a critical task until a registration token exists, so the server never runs with open registration. There is no admin account. Each phone creates its own account from the FMD app, presenting the token. The web interface then signs in with that account's ID and password.

## Actions

- **Generate Registration Token** (`registration-token`) — run it on first install (the task requires it), and again whenever a user needs a token to register another device. It writes a fresh 32-character token to `RegistrationToken` and returns it masked, copyable and as a QR code. The service restarts. Every run replaces the token, so the previous one stops working for new registrations. Accounts that already exist are unaffected. Safe to repeat.
- **Settings** (`settings`) — run it to change history retention or the map tile server. It writes `MaxSavedLoc`, `MaxSavedPic` and `TileServerUrl`, and the service restarts. Lowering a limit trims a device's stored history as new data arrives, under upstream's retention logic. Safe to repeat.
- **List Accounts** (`list-accounts`) — read-only. It runs `fmd-server-ctl listusers` in a temporary subcontainer and returns each account ID with its last-seen time. A last-seen time of zero (the device never uploaded) shows as never seen. Safe while running or stopped.
- **Delete Account** (`delete-account`) — destructive, available only while stopped. Stop the service first to clear its cached sessions: the CLI cannot revoke the running daemon's sessions, which would otherwise authenticate a replacement account with the same ID. The action checks that the ID exists, then runs `fmd-server-ctl deleteusers`, which removes the account and all of its locations, pictures and commands from the database. A deleted account can no longer log in, and the phone must register again. The service remains stopped until started by the user. An unknown ID fails without changing anything.

## Tasks

- **Generate Registration Token**: a `critical` task, raised whenever `RegistrationToken` in `config.yml` is empty, which is the state after a fresh install. It blocks the service from starting. Running Generate Registration Token clears it. It returns only if the token is removed from `config.yml` by hand.

## Health Checks

- **Web Interface** (`primary`) — passes once the server is listening on port 8080. The server binds within a second or two of starting; it applies database migrations first, which are fast. A failure that persists means the server exited. Read the service logs: the usual causes are an unreadable `config.yml` (a YAML syntax error from a hand edit makes the server exit with `failed to read config file`) or a database it cannot open.

## Backups and Restore

The whole `main` volume is backed up as files: the config, including the registration token and settings, and the SQLite database with all accounts and their encrypted data. Nothing is excluded. A restored instance needs no further steps: devices keep their accounts and passwords, and the registration token is the one in the backup. StartOS may assign the interface new ports on restore. Phones registered against a port-bearing LAN address then need the new address, while domain addresses are unaffected.

## Limitations and Differences

1. Registration always requires a token. Upstream's open-registration mode is not available.
2. Upstream's built-in TLS listener, Unix socket mode and Prometheus metrics endpoint are not exposed.
3. `fmd-server-ctl pushusers`, which wakes every device, has no action.
4. The package cannot recover a device's data or reset its password. Data is encrypted on the phone with the account password, as upstream designs it.

---

## Quick Reference for AI Consumers

```yaml
package_id: fmd-server
image: registry.gitlab.com/fmd-foss/fmd-server
architectures: [x86_64, aarch64]
subcontainers: [fmd-server-sub, fmd-server-ctl]
volumes:
  main: /data
file_models:
  - /data/config.yml
startos_managed_env_vars: []
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - registration-token
  - settings
  - list-accounts
  - delete-account
tasks:
  - { action: registration-token, severity: critical }
health_checks:
  - primary
```
