#!/usr/bin/env bash
# Usage: ./push.sh "commit message"
# First run: asks for YOUR GitHub repo URL (the fork), keeps GBAS-BCN as "upstream".
set -e
cd "$(dirname "$0")"

url=$(git remote get-url origin 2>/dev/null || true)
if [[ -z "$url" || "$url" == *GBAS-BCN* ]]; then
  [[ -n "$url" ]] && git remote rename origin upstream
  read -rp "Your GitHub repo URL (e.g. https://github.com/USER/vTools-Helper.git): " url
  git remote add origin "$url"
fi

msg="${1:-Update}"
git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "$msg"
fi
git push -u origin "$(git branch --show-current)"
