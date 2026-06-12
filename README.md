# vid-line 🎬

**Watch videos in your Claude Code statusline while your agents grind.**

vid-line converts any video into ANSI half-block pixel art and plays it in
[Claude Code's statusline](https://code.claude.com/docs/en/statusline) —
~3fps while Claude is working, 1fps while idle. Mario Maker during the long
tool calls. A nature documentary during the big refactor. You deserve this.

> Yes, this is a deeply stupid idea. It is also fully working software with
> wall-clock-synced playback and a worst-case-bytes-per-line analysis behind
> it. We contain multitudes.

## Install

Requires macOS or Linux with `zsh`, `jq`, `ffmpeg`, `yt-dlp`, and `chafa`
(all available via `brew install` / your package manager), plus Python 3.

```sh
git clone https://github.com/lanestp/vid-line
cd vid-line
./install.sh
```

The installer copies the scripts to `~/.config/vidline`, backs up your
`~/.claude/settings.json`, and wires in the statusline (it won't touch an
existing custom statusline — it prints instructions instead).

## Usage

```sh
vidline prep "https://youtube.com/watch?v=..." --name mario   # any URL yt-dlp eats
vidline prep "ytsearch1:mario maker 2 endless" --name mario   # or search YouTube
vidline prep ~/Movies/cat.mp4 --name cat                      # or a local file

vidline list            # what's prepped, * marks the active one
vidline use cat         # switch videos
vidline off             # back to a boring (but informative) statusline
vidline resize mario --height 16 --width 110   # re-render bigger/smaller, no re-download
```

Prep options: `--width 80 --height 8 --fps 3 --max-secs 600 --colors 256`.
Each text row is 2 pixels tall (half-blocks), and chafa preserves aspect
ratio inside the width×height box. Start small; `resize` is cheap.

## How it works

- `vidline prep`: yt-dlp downloads → ffmpeg extracts frames at 3fps → chafa
  converts each frame to ANSI art → text files cached in `~/.cache/vidline/`.
- `statusline.zsh`: Claude Code runs it on every UI refresh; it picks the
  frame by **wall-clock time** (`epoch_ms × fps ÷ 1000 mod nframes`), so
  playback stays smooth no matter how erratically the statusline refreshes,
  then prints the frame plus an info line (model · dir · context % · cost).
- The script runs in ~10ms. Your statusline stays snappy.

## Troubleshooting

**Glitchy frames / stray white lines?** Claude Code truncates oversized
statusline lines and can cut mid-ANSI-escape
([anthropics/claude-code#42382](https://github.com/anthropics/claude-code/issues/42382)).
Keep raw bytes per line roughly under ~1.2KB: prefer `--colors 256` (the
default) over `--colors full`, or render smaller. `--colors 16` is
bulletproof and appropriately retro.

**Video frozen?** It only animates when the statusline refreshes — during
activity that's ~3fps, idle is 1fps (`refreshInterval`). If it's fully
frozen, check that `~/.cache/vidline/current` points at a prepped video.

**Disk usage:** ~15–70MB per 10-minute video depending on size, plus the
kept source file (which makes `resize` instant). Delete
`~/.cache/vidline/<name>` when you're done with one.

Only download videos you have the right to use.

## Uninstall

Remove the `statusLine` block from `~/.claude/settings.json` (or restore
`settings.json.bak.vidline`), then `rm -rf ~/.config/vidline ~/.cache/vidline`.

## License

MIT. Built with [Claude Code](https://claude.com/claude-code), naturally.
