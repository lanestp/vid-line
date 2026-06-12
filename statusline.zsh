#!/bin/zsh
# vid-line: play pre-rendered ANSI video frames in the Claude Code statusline.
# Frame choice is wall-clock based, so playback stays in sync no matter how
# often Claude Code re-invokes this script.

zmodload zsh/datetime
input=$(cat)

dir="$HOME/.cache/vidline/current"
if [[ -r "$dir/manifest" ]]; then
  read -r fps nframes name < "$dir/manifest"
  secs=${EPOCHREALTIME%.*}
  frac=${EPOCHREALTIME#*.}
  ms=$(( secs * 1000 + ${frac[1,3]} ))
  idx=$(( (ms * fps / 1000) % nframes ))
  cat "$dir/$(printf 'frame_%05d.txt' $idx)"
fi

# info line (kept even with video off, so the statusline is still useful)
if command -v jq >/dev/null; then
  print -r -- "$input" | jq -r '
    "[2m🎬[0m [36m\(.model.display_name // "Claude")[0m · \((.workspace.current_dir // "~") | split("/") | last) · ctx \(.context_window.used_percentage // 0 | floor)% · $\((.cost.total_cost_usd // 0) * 100 | floor / 100)"'
fi
