# Launch runbook: thatglp1girl.com from Showit to GitHub Pages

This is the manual checklist for the actual cutover. The site is already built
and deploying to a GitHub Pages preview URL on every push to `main`. This
runbook flips the public DNS from Showit to GitHub Pages and confirms the
new site is serving correctly before the old one is shut down.

**Estimated time:** 30 minutes of active work, plus up to 1 hour of waiting
for DNS to propagate and HTTPS to provision.

**You will need:**
- Admin access to whatever registrar manages `thatglp1girl.com` DNS
- Admin access to this GitHub repo
- A second device or incognito window for verification

---

## Step 0 (optional but recommended): wire the Formspree endpoint

The coaching contact form currently posts to a placeholder URL. To make it
actually deliver emails:

1. Log into Formspree, create a form, and copy its endpoint URL (looks like
   `https://formspree.io/f/abc123xyz`).
2. Open `_includes/contact-form.html` and replace the line
   `{%- assign cf_endpoint = include.endpoint | default: "https://formspree.io/f/TODO" -%}`
   with your real URL in place of `TODO`.
3. Commit and push to `main`. Wait ~2 minutes for the Actions deploy to
   finish.
4. Submit the form on `/coaching/` with your own email and confirm a test
   submission lands in Formspree.

Skipping this means the form will accept submissions but they go nowhere
until you wire it later. Do it before cutover if possible.

---

## Step 1: confirm GitHub Pages is ready

1. In GitHub: **Settings → Pages**.
2. **Build and deployment → Source:** must be set to **GitHub Actions**.
3. **Custom domain:** type `thatglp1girl.com`, click **Save**. (The repo
   already contains a `CNAME` file with this value, so GitHub auto-fills.)
4. GitHub will run a DNS check. It will currently **fail** because the
   domain still points at Showit. That is expected. Leave the value saved.
5. Check the **Enforce HTTPS** box if it's available. (It may be greyed out
   until the DNS check passes - that's fine, you'll come back in Step 5.)

---

## Step 2: note GitHub's expected DNS values

GitHub Pages needs:

- **Four A records** on the apex (`thatglp1girl.com`) pointing at:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- **One CNAME** for `www` pointing at `kylefiedler.github.io.`
  (note the trailing dot - some registrars require it, most add it for you)

---

## Step 3: update DNS at the registrar

In the DNS panel for `thatglp1girl.com`:

1. **Delete every existing A and CNAME record** that currently points
   `thatglp1girl.com` or `www.thatglp1girl.com` at Showit. (Showit's CNAME
   target usually contains the word "showit" - that's the one.)
2. **Add the four A records** from Step 2. Host: `@` (or blank, depending on
   the registrar's UI), TTL: leave at default.
3. **Add the CNAME** for `www` from Step 2.
4. **Leave MX, TXT, and any other record types alone** - those are for
   email, domain verification, etc. and shouldn't be touched.
5. Save.

---

## Step 4: wait for propagation

DNS changes typically resolve in 5-30 minutes but can take up to an hour.

Open a terminal and run:

```bash
dig +short thatglp1girl.com
```

Repeat every 5 minutes until you see GitHub's four IPs (`185.199.108-111.153`)
in the output instead of Showit's IPs.

You can also paste the domain into <https://www.whatsmydns.net> to watch
propagation across the globe.

---

## Step 5: enforce HTTPS

1. Back in GitHub **Settings → Pages**, refresh.
2. The DNS check should now show a green check.
3. GitHub will automatically provision a Let's Encrypt certificate. This
   takes 5-15 minutes after DNS resolves.
4. Once the cert is live, **Enforce HTTPS** becomes available - check it.
5. Visit <https://thatglp1girl.com> in a browser. You should see the new
   site with a valid padlock icon.

---

## Step 6: spot-check the live site

Open each of these in an incognito window and confirm the page loads and
renders correctly:

- <https://thatglp1girl.com/> (home)
- <https://thatglp1girl.com/about/>
- <https://thatglp1girl.com/coaching/>
- <https://thatglp1girl.com/guides/>
- <https://thatglp1girl.com/journal/>
- <https://thatglp1girl.com/blog/>
- 3 random blog post URLs from `/blog/` (each should be `/YYYY/MM/DD/<slug>/`)
- A made-up URL like <https://thatglp1girl.com/this-does-not-exist> - should
  show the branded 404 page

While you're there:
- Click the **Buy The Ultimate Bundle** button on the home page - should
  open Gumroad.
- Submit a test email on any newsletter form - should land in EmailOctopus.
- Submit the contact form on `/coaching/` - should land in Formspree (only
  if you completed Step 0).

---

## Step 7: cancel Showit (after 48 hours of verified uptime)

Wait **two full days** with the new site live before you cancel Showit.
This gives you a safety net in case anything breaks and you need to roll
DNS back temporarily.

After 48 hours of clean traffic:

1. Log into Showit and cancel the subscription.
2. Archive any Showit-specific assets you might want later (the Showit
   project file, any custom graphics) to local storage or a personal Drive.

---

## Rollback plan (if anything goes wrong)

The old Showit site is still online as long as the Showit subscription is
active. To roll back:

1. Restore the previous DNS records from your registrar's history (most
   registrars keep a change log) - or re-add Showit's original CNAME/A
   records.
2. DNS propagation takes the same 5-30 minutes.
3. File a ticket in the Notion project describing what broke, then iterate.

Because Showit is still running, rollback is always available until Step 7.
