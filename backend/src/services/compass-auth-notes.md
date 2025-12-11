# Compass Authentication Notes

## Important Implementation Notes

The Compass authentication flow in `compass.ts` is a template implementation. The actual login endpoint structure may vary depending on:

1. **Compass version** - Different versions may have different login endpoints
2. **School configuration** - Some schools may have SSO or custom authentication
3. **Cloudflare protection** - May require additional headers or browser-like requests

## Testing Authentication

To test the authentication flow:

1. **Inspect Network Tab**:
   - Open Compass in browser
   - Open DevTools → Network tab
   - Log in manually
   - Find the login POST request
   - Note the exact endpoint, headers, and payload format

2. **Cookie Inspection**:
   - After login, check Application → Cookies
   - Note all cookie names and values
   - Verify which cookies are required for API calls

3. **Request Headers**:
   - Check what headers Compass sends
   - May need User-Agent, Referer, or other headers

## Alternative Approaches

If direct authentication fails, consider:

1. **Browser Automation** (Puppeteer/Playwright):
   - Use headless browser to log in
   - Extract cookies from browser session
   - More reliable but heavier

2. **Session Sharing**:
   - If staff already logged into Compass
   - Extract cookies from their browser session
   - Use those cookies for API calls

3. **Proxy Service**:
   - Create a service account that stays logged in
   - Share session cookies securely
   - Refresh periodically

## Security Considerations

- **Never log credentials** in production
- **Store credentials** in environment variables only
- **Rotate credentials** if compromised
- **Monitor session expiry** and refresh automatically
- **Handle Cloudflare challenges** gracefully

## Debugging Tips

1. Log the login response to see what Compass returns
2. Check if cookies are being set correctly
3. Verify cookie format matches what browser sends
4. Test with a simple GET request first (e.g., GetAllCampuses)
5. Check for Cloudflare challenges in responses

