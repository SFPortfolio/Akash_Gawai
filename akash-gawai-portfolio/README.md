# Akash Gawai — Salesforce Portfolio

A static portfolio website with professional experience, project details, technical skills, contact links, and animated cloud doodles.

## What is included

| File | Purpose |
| --- | --- |
| `index.html` | Page content, layout, and cloud illustrations |
| `style.css` | Main styles and responsive layout |
| `app.js` | Project filters, detail dialogs, note tabs, mobile menu, and copy-email action |
| `cloud-motion.css` | Cloud styling and animations |
| `cloud-motion.js` | Animation toggle, saved preference, and pointer response |
| `favicon.svg` | Website icon |
| `.nojekyll` | Serve the static files without a Jekyll build |

There is no package installation or build step. The contact button opens an email app. The project cards explain professional responsibilities and personal learning projects; they are not live AI or payment services.

## 1. Open the website in VS Code

1. Extract this ZIP.
2. Open the `akash-gawai-portfolio` folder in VS Code.
3. Make sure you can see `index.html` directly in that folder.
4. You can open `index.html` in a browser for a quick preview. For a local web preview, use your existing static server or VS Code's Live Server extension.

## 2. Create an empty GitHub repository

1. Sign in to https://github.com/.
2. Select **New repository**.
3. Name it **akash-gawai-portfolio**.
4. Select **Public** for this GitHub Free publishing route.
5. Leave **Add README**, **Add .gitignore**, and **Choose a license** unchecked. This folder already contains the files you will push.
6. Create the repository and copy its HTTPS URL.

## 3. Push from the VS Code terminal

Open **Terminal → New Terminal** inside the extracted project folder. These commands assume Git is installed. If `git` is not recognized, install Git from https://git-scm.com/downloads and reopen VS Code.

Replace `YOUR_USERNAME` below with your GitHub username before running the remote command.

```bash
git init -b main
git add .
git commit -m "Publish Salesforce portfolio"
git remote add origin https://github.com/YOUR_USERNAME/akash-gawai-portfolio.git
git push -u origin main
```

Complete the GitHub sign-in prompt if one appears. Your account password is not used as a Git HTTPS password; follow GitHub's supported browser or credential-manager authentication flow.

If the commit stops with **Author identity unknown**, set your identity for this project, then repeat the commit and push steps:

```bash
git config user.name "Akash Gawai"
git config user.email "YOUR_GITHUB_VERIFIED_EMAIL"
git commit -m "Publish Salesforce portfolio"
git remote add origin https://github.com/YOUR_USERNAME/akash-gawai-portfolio.git
git push -u origin main
```

Use the email address you want on your commits, such as your verified GitHub email or your GitHub-provided noreply address. Run `git remote add origin` only once after it succeeds.

## 4. Publish with GitHub Pages

1. In your repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose **main** and **/(root)**.
4. Click **Save**.
5. Wait for deployment. It can take up to 10 minutes.
6. Return to **Settings → Pages → Visit site** to get the real published URL.

With the repository name used above, the URL will normally be:

```text
https://YOUR_USERNAME.github.io/akash-gawai-portfolio/
```

This GitHub Pages copy is public and does not require visitors to sign in to ChatGPT. It contains the portfolio contact information visible in `index.html`.

## 5. Make later updates

Edit the files in VS Code, save them, then run:

```bash
git add .
git commit -m "Update portfolio"
git push
```

Once GitHub Pages is enabled, commits pushed to the publishing branch are used to publish updates. Check the repository's **Actions** tab for deployment results.

The GitHub Pages copy and the ChatGPT-hosted copy are separate deployments. Changes to one do not automatically update the other.

## Common fixes

- **404 after publishing:** confirm `index.html` is directly at the repository root and Pages uses `main` → `/(root)`.
- **remote origin already exists:** run `git remote -v` to inspect the configured remote. This clean ZIP contains no existing Git history or remote.
- **Animations are off:** use the **Motion on/off** control. The website also respects an operating-system reduced-motion setting.
- **Styling is missing:** keep every supplied CSS and JavaScript file beside `index.html` with the same filename.

## Official instructions

- GitHub import guide: https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
- GitHub Pages publishing settings: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages setup and deployment timing: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
