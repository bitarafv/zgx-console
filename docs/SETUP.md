# Beginner Git and Windows setup

## Keep the two GitHub identities separate

First confirm that company policy permits a work laptop and the `wade_hpi` Copilot subscription to be used with a public personal project. Copilot authentication and Git authentication are separate: sign into the VS Code Copilot extension as `wade_hpi`, but authenticate Git operations as `bitarafv`.

On Windows, create a personal SSH key in PowerShell:

```powershell
ssh-keygen -t ed25519 -C "YOUR_PERSONAL_EMAIL" -f $env:USERPROFILE\.ssh\id_ed25519_bitarafv
Get-Content $env:USERPROFILE\.ssh\id_ed25519_bitarafv.pub
```

Add the public key to the `bitarafv` GitHub account. Add this entry to `%USERPROFILE%\.ssh\config`:

```text
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_bitarafv
  IdentitiesOnly yes
```

Clone and configure identity only inside this repository:

```powershell
git clone git@github-personal:bitarafv/zgx-console.git
cd zgx-console
git config user.name "bitarafv"
git config user.email "YOUR_PERSONAL_EMAIL"
git remote -v
git config --get user.name
git config --get user.email
Copy-Item .env.example .env.local
npm install
npm run dev
```

## Everyday contribution flow

```powershell
git switch main
git pull --ff-only
git switch -c feature/short-description
git status
git add path\to\changed-file
git diff --staged
git commit -m "feat: describe the change"
git push -u origin feature/short-description
```

Open the GitHub URL printed by `git push`, create a pull request, wait for checks, and merge through GitHub. Then update locally:

```powershell
git switch main
git pull --ff-only
git branch -d feature/short-description
```

Do not copy company code, slides, credentials, internal URLs, customer data, model files, or `.env.local` into this public repository.

