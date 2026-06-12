#!/bin/bash
# vid-line installer: copies scripts to ~/.config/vidline and wires up the
# Claude Code statusline (with a backup of your settings.json).
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_DIR="$HOME/.config/vidline"
SETTINGS="$HOME/.claude/settings.json"

echo "vid-line installer"
echo

missing=()
for dep in zsh jq ffmpeg yt-dlp chafa; do
  command -v "$dep" >/dev/null || missing+=("$dep")
done
if [ ${#missing[@]} -gt 0 ]; then
  echo "Missing dependencies: ${missing[*]}"
  if command -v brew >/dev/null; then
    echo "Install with: brew install ${missing[*]}"
  else
    echo "Install them with your package manager (apt: ffmpeg yt-dlp chafa jq zsh)"
  fi
  exit 1
fi

mkdir -p "$INSTALL_DIR"
cp "$REPO_DIR/vidline" "$REPO_DIR/statusline.zsh" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/vidline" "$INSTALL_DIR/statusline.zsh"
echo "Installed scripts to $INSTALL_DIR"

STATUSLINE_CMD="zsh $INSTALL_DIR/statusline.zsh"
if [ ! -f "$SETTINGS" ]; then
  mkdir -p "$(dirname "$SETTINGS")"
  echo '{}' > "$SETTINGS"
fi
if jq -e '.statusLine' "$SETTINGS" >/dev/null 2>&1; then
  echo
  echo "You already have a statusLine configured — not touching it."
  echo "To use vid-line, set statusLine.command to:"
  echo "  $STATUSLINE_CMD"
  echo "and add \"refreshInterval\": 1 so it animates while idle."
else
  cp "$SETTINGS" "$SETTINGS.bak.vidline"
  jq --arg cmd "$STATUSLINE_CMD" \
     '.statusLine = {type: "command", command: $cmd, refreshInterval: 1, padding: 0}' \
     "$SETTINGS" > "$SETTINGS.tmp" && mv "$SETTINGS.tmp" "$SETTINGS"
  echo "Wired statusLine into $SETTINGS (backup at $SETTINGS.bak.vidline)"
fi

echo
echo "Done! Now:"
echo "  1. Add an alias:  alias vidline=\"$INSTALL_DIR/vidline\""
echo "  2. Prep a video:  vidline prep \"ytsearch1:mario maker 2\" --name mario --height 16 --width 110"
echo "  3. Open a new Claude Code session and enjoy the show."
