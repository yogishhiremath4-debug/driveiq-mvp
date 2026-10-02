# Phase 10A: Deployment Readiness Audit

## 1. Deployment readiness status

**Conditionally ready for static hosting at a domain root.** The project installs from its lockfile, the test suite passes, and the production bundle builds. No application runtime secrets or backend configuration are required by the Vite app.

There are no build blockers for root-path static hosting. Complete the repository/security and hosting checks below before publishing. Subpath hosting is not configured.

## 2. Commands verified

| Command/check | Result |
| --- | --- |
| `npm ci` in an isolated clean copy | Passed; 69 packages installed and npm reported 0 vulnerabilities. |
| `npm test` in clean copy | Passed: 15 tests, 0 failed. |
| `npm run build` in clean copy | Passed; TypeScript check and Vite production build completed. |
| `npm test` in current workspace | Passed: 15 tests, 0 failed. |
| `npm run build` in current workspace | Passed; 45 modules transformed and production assets emitted. |
| Browser at 390px, 768px, 1280px | App loaded at all widths; no horizontal overflow and approved values remained visible. |
| Credential-pattern and `.env` file scan | No matching literal credentials or `.env*` files found in the workspace. |

The clean-install check used a temporary copy and did not replace the workspace's `node_modules`. npm emitted an install-script policy warning for `esbuild@0.25.12`; tests and build nevertheless completed successfully. Review/allow that script if the deployment environment enforces an install-script allowlist.

## 3. Build result

`npm run build` runs `tsc --noEmit && vite build` and succeeds. Vite emits `dist/index.html` and hashed CSS/JavaScript under `dist/assets/`. `npm run preview` is available for local production-bundle preview.

## 4. Environment and configuration requirements

- `package.json` requires Node.js 20 or newer; the audited environment uses Node.js 24.21.0 and npm 11.19.0.
- The lockfile is present (`lockfileVersion: 3`); use `npm ci` for reproducible deployment installs.
- No runtime environment variables are required by the Vite application.
- `vite.config.ts` is minimal and does not set `base`; generated asset URLs are root-absolute (`/assets/...`). Deploy at the domain root. A subpath deployment requires configuring Vite's `base` and reviewing the app's root link.
- No `public/` directory or referenced local image/font assets were found. A root-level `file.jpe` exists but is not referenced and is not emitted into `dist`.
- `src/styles.css` imports DM Sans and Manrope from Google Fonts. Production clients need access to Google Fonts endpoints, and a restrictive CSP must allow them. Offline or self-contained hosting would need an approved local-font change.
- README instructions (`npm install`, `npm run dev`, `npm run build`) are accurate for local development. For deployment, prefer `npm ci` followed by tests/build and publish only `dist/`.

## 5. Secrets and security check

No credential-shaped literals, private-key blocks, or `.env*` files were found in the scanned workspace. No real API key was found.

Two unused Python starter files, `src/Untitled-1.py` and `src/Untitled-2.py`, refer to `OPENAI_API_KEY` and the OpenAI API base URL through environment-variable defaults. They contain no key and are not imported or bundled by the Vite application, but should be excluded from a frontend-only deployment artifact if they are unrelated.

`.gitignore` currently excludes `node_modules/`, `dist/`, and `*.local`, but does not exclude `.env` or `.env.production`. No environment files are currently present; add an env-file ignore rule before introducing secrets. The workspace has no `.git` metadata and Git tooling is unavailable here, so this audit cannot verify the Git index, remote branches, or commit history for previously committed secrets. Perform a repository-history/secret scan in the actual deployment repository before release.

## 6. Blockers and findings

- **No build or clean-install blocker** was observed for root-path static hosting.
- **Root path required:** subdirectory hosting is not supported by the current Vite base/path configuration.
- **Repository secret verification remains outstanding:** no `.git` metadata was available for commit-history inspection.
- **Preventive security action:** `.env` and `.env.production` are not ignored, even though none were found.
- **External font dependency:** Google Fonts must be reachable or explicitly permitted by deployment CSP.
- **Install-script warning:** npm reported the esbuild postinstall script is not covered by the current install-script allowlist; the audited clean build passed.
- **Unreferenced files:** the root `file.jpe` and two Python starter files are not part of the Vite bundle. Confirm whether they belong in any source-package deliverable.

## 7. Recommended deployment steps

1. In the deployment repository, run a Git-history secret scan and confirm no real credentials were committed.
2. Add `.env*` to `.gitignore` (with an explicit allow exception only if a non-secret example file is intentionally committed).
3. Confirm the target is hosted at the domain root; if not, approve and configure a Vite base path and test the app's root link.
4. Decide whether Google Fonts is acceptable under network and CSP policy; otherwise approve a local-font asset change.
5. From a clean checkout, run `npm ci`, `npm test`, and `npm run build`.
6. Publish the generated `dist/` directory to the static host. Use `npm run preview` locally to inspect the production bundle before release.
7. Exclude unused Python starter files and the unreferenced `file.jpe` from a frontend-only release package unless they are intentionally part of the deliverable.