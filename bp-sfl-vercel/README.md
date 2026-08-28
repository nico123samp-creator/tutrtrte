# BP-SFL Vercel Clone

UI clone + Node.js Vercel Function backend.

## Deploy
1. Upload repository to GitHub.
2. Import it in Vercel.
3. Add `BYPASS_API_URL` in Project Settings > Environment Variables.
4. Optional: add `BYPASS_API_KEY`.
5. Redeploy.

The backend expects the upstream API to accept:
`POST { "url": "https://..." }`
and return JSON containing one of:
`result`, `url`, `link`, `destination`, or `data.url`.

No bypass provider is hardcoded. Configure your own authorized API endpoint.
