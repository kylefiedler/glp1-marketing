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

## Step 0: confirm the Formspree endpoint

The "Contact Jess" form (on every page) and the coaching application form
both post to `formspree_endpoint` in `_config.yml`. To change where they
deliver, update that one value. Before cutover, submit a test message from
the preview site and confirm it lands in Formspree (the first submission
also triggers Formspree's one-time confirmation email). A successful submit
should land on `/thanks/` (contact) or `/coaching/thanks/` (coaching); if you
see Formspree's generic "Thanks!" page instead, `assets/js/forms.js` didn't run.

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
- 2 guide detail pages, e.g. <https://thatglp1girl.com/glp-1-beginner-survival-kit/>
  and <https://thatglp1girl.com/wean-off-glp-2/> - "Buy the guide" should open
  the matching Gumroad product
- <https://thatglp1girl.com/category/protein-on-glp1/> - should redirect to
  `/blog/`
- 3 random blog post URLs from `/blog/` (each should be `/YYYY/MM/DD/<slug>/`)
- A made-up URL like <https://thatglp1girl.com/this-does-not-exist> - should
  show the branded 404 page

While you're there:
- Click the **Buy The Ultimate Bundle** button on the home page - should
  open Gumroad.
- Submit a test email on any newsletter form - should land in EmailOctopus.
- Submit the coaching form on `/coaching/` and the "Contact Jess" form on
  any page - both should land in Formspree.

---

## Step 6b: tell Google about the new site

1. In [Google Search Console](https://search.google.com/search-console),
   open (or add) the `thatglp1girl.com` property.
2. **Sitemaps** → submit `https://thatglp1girl.com/sitemap.xml`. The old
   Yoast sitemaps (`post-sitemap.xml` etc.) will start 404ing - that's
   expected; remove them from the list if they're there.
3. Check **Pages → Not found (404)** once a week for the next two weeks and
   add a `redirect_from` for any old URL that still gets traffic.

The RSS feed moves from `/feed/` to `/feed.xml`. Browsers get redirected,
but feed readers won't follow the redirect - update anything (Pinterest,
EmailOctopus RSS campaigns, etc.) that pulls from the old feed URL.

---

## Step 7: cancel Showit (after 48 hours of verified uptime)

Wait **two full days** with the new site live before you cancel Showit.
This gives you a safety net in case anything breaks and you need to roll
DNS back temporarily.

After 48 hours of clean traffic:

1. **Back up the WordPress blog first.** The old blog runs on the WordPress
   install that comes with Showit, and it's deleted when the subscription
   ends. In WP admin: **Tools → Export → All content** (saves an XML file),
   and download the **Media Library** (`wp-content/uploads`) via Showit
   support or a backup plugin. Save both somewhere safe.
2. Log into Showit and cancel the subscription.
3. Archive any Showit-specific assets you might want later (the Showit
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
