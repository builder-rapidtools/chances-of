# Cloudflare Deployment Guide

This guide explains how to deploy the chances-of UI and API to Cloudflare.

## Architecture

- **Cloudflare Pages**: Hosts the static UI (Vite build)
- **Cloudflare Workers**: Hosts the API endpoint at `/api/run`
- The UI calls the Worker API via the `VITE_API_BASE_URL` environment variable

## Prerequisites

1. Cloudflare account: `jamesredwards89@gmail.com`
2. Organization: **Tailored Tools** (NOT RapidTools)
3. Install Wrangler CLI globally:
   ```bash
   npm install -g wrangler
   ```
4. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

## Step 1: Deploy the Worker API

The Worker provides the `/api/run` endpoint for probability calculations.

### Build and Deploy

```bash
# From project root
npm run build:worker

# Deploy to Cloudflare Workers
npm run worker:deploy
```

This will:
1. Install dependencies in `cf/worker/`
2. Build the TypeScript Worker code
3. Deploy to Cloudflare Workers

### Test the Worker

After deployment, Wrangler will output your Worker URL:
```
https://chances-of-api.your-subdomain.workers.dev
```

Test it with curl:
```bash
curl -X POST https://chances-of-api.your-subdomain.workers.dev/api/run \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "dice",
    "params": {"dice": 2, "sides": 6, "condition": "sum>=7"},
    "options": {"seed": 42, "trials": 100000}
  }'
```

You should get a JSON response with probability results.

### Worker Configuration

Edit `cf/worker/wrangler.toml` if needed:
- Account email: `jamesredwards89@gmail.com`
- Worker name: `chances-of-api`
- Organization: Tailored Tools

## Step 2: Deploy the UI to Cloudflare Pages

The UI is a static Vite build that calls the Worker API.

### Option A: Deploy via GitHub (Recommended)

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Connect to your GitHub account
4. Select the `builder-rapidtools/chances-of` repository
5. Configure the build:
   - **Framework preset**: Vite
   - **Build command**: `vite build`
   - **Build output directory**: `ui/dist`
   - **Root directory**: `/`
6. Add environment variable:
   - **Variable name**: `VITE_API_BASE_URL`
   - **Value**: `https://chances-of-api.your-subdomain.workers.dev` (use your actual Worker URL from Step 1)
7. Click "Save and Deploy"

### Option B: Deploy via CLI

```bash
# Build the UI
npm run build

# Deploy to Pages (first time)
cd ui
npx wrangler pages deploy dist --project-name=chances-of

# Set environment variable
npx wrangler pages deployment set-env VITE_API_BASE_URL=https://chances-of-api.your-subdomain.workers.dev
```

### Verify Deployment

After deployment, Cloudflare Pages will provide a URL:
```
https://chances-of.pages.dev
```

Open this URL on your phone or desktop. Try running a simulation like:
- "roll 2d6, sum at least 7"

If it works, you should see probability results!

## Step 3: Configure Custom Domain (Optional)

1. In Cloudflare Pages dashboard, go to your project
2. Click "Custom domains"
3. Add your domain (e.g., `chances-of.tailoredtools.com`)
4. Follow DNS configuration instructions

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Verify the Worker is deployed and accessible
- Check that `VITE_API_BASE_URL` is set correctly in Pages environment variables
- The Worker includes CORS headers for all origins (`Access-Control-Allow-Origin: *`)

### API Not Found (404)

If `/api/run` returns 404:
- Verify the Worker URL is correct
- Test the Worker directly with curl (see Step 1)
- Check that the UI is using the correct `VITE_API_BASE_URL`

### Build Failures

If the Worker build fails:
- Ensure TypeScript compiles: `npm run build` from project root
- Check that simulation code in `src/` is error-free
- The Worker imports from `../../../src/` - paths must be correct

### Pages Build Failures

If Pages deployment fails:
- Verify build command: `vite build`
- Verify output directory: `ui/dist`
- Check that environment variables are set in Pages dashboard

## Local Development

For local development, continue using the existing setup:

```bash
# Run both API and UI locally
npm run dev
```

This uses:
- Express API on `localhost:3001`
- Vite UI on `localhost:3000`
- Vite proxy forwards `/api` to the Express server
- `VITE_API_BASE_URL` is empty (uses same-origin)

## Updating Deployments

### Update Worker

```bash
npm run worker:deploy
```

### Update Pages

If using GitHub integration, push to `main` branch:
```bash
git push origin main
```

Cloudflare Pages will automatically rebuild and deploy.

If using CLI:
```bash
npm run build
cd ui
npx wrangler pages deploy dist
```

## Cost

Both Cloudflare Workers and Pages have generous free tiers:
- **Workers**: 100,000 requests/day free
- **Pages**: Unlimited static requests, 500 builds/month

For this application, you should stay well within free tier limits.

## Security Notes

- The Worker allows all origins (`*`) for CORS - suitable for a public demo
- No authentication is implemented - anyone can call the API
- Rate limiting is handled by Cloudflare's default protections
- For production, consider adding API keys or rate limiting

---

**Quick Reference:**

```bash
# Deploy Worker
npm run worker:deploy

# Test Worker
curl -X POST https://your-worker.workers.dev/api/run \
  -H "Content-Type: application/json" \
  -d '{"scenario":"dice","params":{"dice":2,"sides":6,"condition":"sum>=7"},"options":{}}'

# Deploy Pages (GitHub integration - automatic on push to main)
git push origin main

# Or deploy Pages manually
cd ui && npx wrangler pages deploy dist --project-name=chances-of
```
