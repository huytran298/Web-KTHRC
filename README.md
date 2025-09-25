# Web-KTHRC — Run locally and behind Cloudflare Tunnel

This project is a static-site webroot with a lightweight Node static server.

Quick start

1. Install dependencies (already done):

   npm install

2. Start the server locally:

   npm start

3. Verify health:

   curl http://localhost:5000/health

Cloudflare Tunnel (cloudflared)

1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
2. Authenticate and create a tunnel on your machine:

   cloudflared tunnel login
   cloudflared tunnel create <TUNNEL_NAME>

3. Edit `.cloudflared/config.yml` to point to your tunnel credentials and hostname.

4. Run the tunnel (from project root or anywhere):

   cloudflared tunnel run <TUNNEL_NAME>

Notes
- The server serves files from the repository root. If you add API servers (e.g., the geiger backend), run them on different ports and add ingress rules in `.cloudflared/config.yml`.
