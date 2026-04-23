# Flight Tracker

TypeScript full-stack flight tracker with:

- `backend/`: Express API, Prisma, PostgreSQL, JWT admin auth
- `frontend/`: Vite + React + TypeScript client with Zustand auth state

## Local setup

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Production builds

```bash
cd backend
npm run build
npm start
```

```bash
cd frontend
npm run build
```

## Key flows

1. Create a booking on `/`
2. View the boarding pass at `/boarding/:ref`
3. Track a booking on `/track`
4. Sign in at `/admin/login`
5. Update status, gate, and delay from `/admin/booking/:ref`

## Test commands

```bash
cd backend
npm test
```

```bash
cd frontend
npm test
```

## GitHub CLI quick reference

### Where to run `gh` commands on your machine

For this project, use one of these:

1. VS Code integrated terminal opened at the repo root.
2. Windows PowerShell opened anywhere, then `cd` into the repo.

Recommended default for you: `PowerShell`, either inside VS Code or as a normal Windows terminal window. Your current setup already uses PowerShell, and this repo is on Windows.

Use `gh` from the repo root when you want GitHub CLI to automatically detect this repository:

```powershell
cd C:\Users\USER\Desktop\flight-tracker
gh repo view
```

Use `gh` from anywhere for account-level commands:

```powershell
gh auth status
gh config list
gh alias list
```

Shell guidance:

- `VS Code terminal`: best for day-to-day work because you're already in the project folder.
- `PowerShell`: best standalone choice on your laptop for this repo.
- `Command Prompt`: works for many `gh` commands, but it is less pleasant for modern dev work.
- `Git Bash`: also works, but commands like paths and file-copy syntax differ from PowerShell.

If a command in this README uses Windows syntax like `copy`, run it in `PowerShell` or `Command Prompt`.
If a command uses Unix-style syntax like `cp`, `export`, `./script.sh`, or `&&`, it is usually meant for `Git Bash` or another bash shell.

### Core idea

- `git` manages code history, branches, commits, merges, and remotes.
- `gh` manages GitHub objects and actions like pull requests, issues, workflow runs, releases, and API calls.
- `gh` works best when you run it inside a repo folder, because it can infer the current GitHub repository automatically.

### Commands to know first

Check install and auth:

```powershell
gh --version
gh auth status
gh config list
gh help
```

Get help on anything:

```powershell
gh <command> --help
gh pr --help
gh run --help
```

### Repo commands for this project

Run these from `C:\Users\USER\Desktop\flight-tracker`:

```powershell
gh repo view
gh repo view --web
gh repo view --json name,defaultBranchRef,url
gh status
```

### Pull request workflow

Typical flow after you create a branch, make changes, commit, and push:

```powershell
gh pr status
gh pr create --fill
gh pr view
gh pr diff
gh pr checks --watch
```

Useful extras:

```powershell
gh pr list
gh pr checkout 12
gh pr merge --squash --delete-branch
```

### Issues

```powershell
gh issue list
gh issue view 5
gh issue create
gh issue comment 5 --body "I am working on this."
```

### GitHub Actions and CI

```powershell
gh workflow list
gh run list
gh run view <run-id>
gh run watch <run-id>
gh run download <run-id>
gh pr checks --watch
```

### Power-user commands

Structured JSON output:

```powershell
gh repo view --json name,url,defaultBranchRef
gh pr list --json number,title,headRefName
```

Filter with built-in `jq` support:

```powershell
gh pr list --json number,title,headRefName --jq ".[] | {number, title, branch: .headRefName}"
```

Direct API access:

```powershell
gh api repos/textbooknarcissist/flight-tracker
gh api graphql -f query="query { viewer { login } }"
```

### Handy aliases

Set these once:

```powershell
gh alias set pv "pr view"
gh alias set ps "pr status"
gh alias set pc "pr checks"
gh alias set rv "repo view"
gh alias set prd "pr create --draft"
```

Then use:

```powershell
gh pv
gh ps
gh pc --watch
gh rv --web
gh prd
```

### Best practices for your setup

- Keep using `ssh` with GitHub for this repo, because the remote is `git@github.com:textbooknarcissist/flight-tracker.git`.
- Prefer running `gh` in the repo root so you do not need to keep passing `OWNER/REPO`.
- Use `gh auth status` whenever something feels off with permissions or account selection.
- Use `gh <command> --help` constantly. That is normal, even for experienced users.
- Learn `--json` and `--jq` early. That is where `gh` becomes scriptable and genuinely powerful.

### Docs to read

- GitHub CLI docs: <https://docs.github.com/en/github-cli>
- Quickstart: <https://docs.github.com/en/github-cli/github-cli/quickstart>
- Full manual: <https://cli.github.com/manual/>
- `gh auth`: <https://cli.github.com/manual/gh_auth>
- `gh pr`: <https://cli.github.com/manual/gh_pr>
- `gh repo`: <https://cli.github.com/manual/gh_repo>
- `gh api`: <https://cli.github.com/manual/gh_api>
- Formatting with `--json` and `--jq`: <https://cli.github.com/manual/gh_help_formatting>
- Environment variables: <https://cli.github.com/manual/gh_help_environment>
- Using `gh` in GitHub Actions: <https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/using-github-cli-in-workflows>

### Suggested practice path

1. Run `gh auth status`, `gh repo view`, and `gh pr status` until they feel familiar.
2. Create your next pull request with `gh pr create --fill`.
3. Check CI with `gh pr checks --watch` or `gh run watch <run-id>`.
4. Start using `--json` and `--jq` on `repo`, `pr`, and `run` commands.
5. Add a few aliases that match your workflow.
