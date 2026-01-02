# Deployment Guide

This guide covers common deployment scenarios for Signet.

## Private Network (Tailscale)

Tailscale provides secure access to Signet without exposing it to the public internet. All devices on your tailnet can reach Signet via its Tailscale hostname.

### Architecture Note

The UI proxies all API requests to the daemon internally:

```
Browser → UI (:4174) → [proxy] → Daemon (:3000)
```

You only expose the UI. The daemon doesn't need direct external access - it communicates with NIP-46 clients via Nostr relays, not HTTP.

### Configuration

Set `EXTERNAL_URL` to your Tailscale hostname so that `auth_url` responses are reachable from other devices on your tailnet:

```bash
EXTERNAL_URL=http://signet.tailnet-name.ts.net:4174 docker compose up --build
```

Or in `signet.json`:

```json
{
  "baseUrl": "http://signet.tailnet-name.ts.net:4174",
  "allowedOrigins": [
    "http://signet.tailnet-name.ts.net:4174"
  ]
}
```

Replace `signet.tailnet-name.ts.net` with your actual Tailscale hostname (find it with `tailscale status`).

### HTTPS with Tailscale Serve

Some browser features (like clipboard copy) require HTTPS. Tailscale Serve provides automatic TLS certificates for `*.ts.net` domains:

```bash
# Serve the UI over HTTPS
tailscale serve https / http://localhost:4174
```

Then update your config to use HTTPS:

```json
{
  "baseUrl": "https://signet.tailnet-name.ts.net",
  "allowedOrigins": [
    "https://signet.tailnet-name.ts.net"
  ]
}
```

Note: Tailscale Serve on port 443 means you drop the port from URLs.

### When is EXTERNAL_URL needed?

| Setup | EXTERNAL_URL |
|-------|--------------|
| Single machine (Signet + apps on same device) | Not needed (localhost works) |
| Multi-device (Signet on server, apps on phone/laptop) | Required - use Tailscale hostname |

The `auth_url` sent to NIP-46 clients must be reachable from whatever device needs to approve requests. The default `localhost` only works for single-machine setups.

## Private Network (Wireguard)

Wireguard provides secure access to Signet without exposing it to the public internet. This guide assumes you already have a Wireguard VPN configured.

### Architecture Note

The UI proxies all API requests to the daemon internally:

```
Browser → UI (:4174) → [proxy] → Daemon (:3000)
```

You only expose the UI. The daemon doesn't need direct external access - it communicates with NIP-46 clients via Nostr relays, not HTTP.

### Find Your Wireguard IP

Check your Wireguard server's IP address:

```bash
# From your server's Wireguard config
grep Address /etc/wireguard/wg0.conf
# Example output: Address = 10.0.0.1/24

# Or check the active interface
ip addr show wg0
```

Use the server's Wireguard IP (e.g., `10.0.0.1`) - this is reachable from all peers on your VPN.

### Configuration

Set `EXTERNAL_URL` to your Wireguard IP so that `auth_url` responses are reachable from other devices on your VPN:

```bash
EXTERNAL_URL=http://10.0.0.1:4174 docker compose up --build
```

Or in `signet.json`:

```json
{
  "baseUrl": "http://10.0.0.1:4174",
  "allowedOrigins": [
    "http://10.0.0.1:4174"
  ]
}
```

Replace `10.0.0.1` with your actual Wireguard server IP.

### HTTPS Note

Some browser features (like clipboard copy) require HTTPS. Unlike Tailscale, Wireguard doesn't provide automatic TLS certificates. Options:

- **Accept the limitation** - Manual copy/paste still works
- **Add a reverse proxy** - Use Caddy or nginx with Let's Encrypt (requires domain + port forwarding, beyond this guide's scope)
- **Self-signed certificate** - Works but triggers browser warnings

For most private network setups, HTTP is fine.

### When is EXTERNAL_URL needed?

| Setup | EXTERNAL_URL |
|-------|--------------|
| Single machine (Signet + apps on same device) | Not needed (localhost works) |
| Multi-device (Signet on server, apps on phone/laptop) | Required - use Wireguard IP |

The `auth_url` sent to NIP-46 clients must be reachable from whatever device needs to approve requests. The default `localhost` only works for single-machine setups.
