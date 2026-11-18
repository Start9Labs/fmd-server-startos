# FMD Server

## Documentation

- [FMD Android documentation](https://fmd-foss.org/docs/fmd-android/*) — using the FMD app, locating your device, and setting up push
- [FMD FAQ](https://fmd-foss.org/docs/faq/*) — answers to common problems with background operation and permissions

## What you get on StartOS

- A **Web Interface**. It is where you sign in to locate, ring, lock, or photograph a device. It is also the address the FMD app on your phone registers with.
- A **registration token** that keeps your server private. A device can register only if it presents the token, so strangers who find your server's address cannot create accounts on it.
- Actions to list and delete device accounts, and to set how much location and picture history the server keeps.

## Getting set up

1. Run the **Generate Registration Token** action, which the service asks for before it first starts. Keep the token it shows you, or run the action again later to get a new one.
2. Start the service.
3. Decide how your phone will reach the server. A lost phone is rarely on your home network, so give the **Web Interface** an address the phone can reach from anywhere, such as a public domain or a StartTunnel address. A LAN or `.local` address only works while the phone is at home.
4. The FMD app only connects over HTTPS. If you use an address whose certificate is signed by your server's root CA rather than a public certificate authority, install that root CA on the phone first.
5. On your phone, install a UnifiedPush distributor app (for example Sunup or ntfy). Without one, FMD Server cannot send commands to the phone. See the FMD Android documentation on push.
6. In the FMD app, open the FMD Server settings and register with the **Web Interface** address, your registration token, and a password of your choice. The app shows the account ID it registered.
7. Open the **Web Interface** and sign in with that account ID and password.

## Using FMD Server

### Web interface

Sign in with a device's account ID and password to see its last locations and pictures and to send it commands. Your location data is encrypted on the phone with that password, so neither the server nor this package can recover it if you forget the password.

### Actions

- **Generate Registration Token** — creates a new token. Run it whenever you need the token to register another device. A new token replaces the old one for future registrations only; devices that are already registered keep working.
- **Settings** — how many locations and pictures the server keeps for each device, and an optional custom map tile server for the web interface. The service restarts to apply changes.
- **List Accounts** — every registered device account and when the server last heard from it. An account that has never uploaded anything shows as never seen.
- **Delete Account** — permanently deletes an account and everything stored for it. Stop the service first, delete the account, then start the service again. Use it to remove an old device. The phone has to register again to use this server afterwards.

### Keeping your home IP private

FMD Server sends push messages to the push server your phone's distributor app uses, and that push server can see the address they come from. If you publish FMD Server through a tunnel to keep your home IP private, send the service's outbound traffic through that tunnel too. If you use a tunnel for another reason, such as a port your router cannot forward, you have nothing to change.
