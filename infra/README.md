# CodeQuest on AWS

CodeQuest is served from **https://codequest.appfront.cc**: a private S3 bucket behind CloudFront, in the `CodeQuest` stack (region us-east-1). It uses the `appfront.cc` / `*.appfront.cc` certificate, set in [`cdk.json`](cdk.json). It costs pennies a month.

This folder has its own packages, so the app's dependencies stay as they are.

## First time

From a window signed in to AWS (`aws login`):

```bash
cd infra
npm install
npx cdk deploy            # prints SiteUrl and DnsTarget
cd ..
npm run deploy            # builds CodeQuest and uploads it
```

Then at the domain registrar (Spaceship → appfront.cc → Advanced DNS), add a CNAME record with host `codequest` pointing to the `DnsTarget` value.

## Every update after that

```bash
npm run deploy            # from the repository's main folder
npm run deploy -- --dry-run
```

Hashed files are cached for a year, images for a day, and everything else (the page, the service worker, the manifest, the lessons in `content/`) is checked on every visit, so learners see new lessons right away.

## The old address

The GitHub Pages copy at `ubuntu-apps.github.io/code-quest` keeps deploying from `main`, built with `CODEQUEST_BASE=/code-quest/` and a "CodeQuest has moved" banner (`VITE_MOVED_TO`). Progress lives in each browser under the site's address, so learners back it up there (Settings) and restore it at the new address. Once most have moved, the Pages deploy can be switched off.

## Tests

```bash
cd infra && npm test && npm run synth
```
