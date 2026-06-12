#!/usr/bin/env python3
"""Convert vidline ANSI frames into a JSON color grid for the Remotion demo.

Each frame becomes rows of [top, bottom] hex color pairs (one pair per
terminal cell, since vidline uses half-block characters = 2 pixels per cell).

Usage: ansi2json.py <frames-dir> <start-frame> <count> <out.json>
"""
import json
import pathlib
import re
import sys

SGR = re.compile(r"\x1b\[([0-9;]*)m")
BASE16 = [
    "#000000", "#cd0000", "#00cd00", "#cdcd00", "#0000ee", "#cd00cd", "#00cdcd", "#e5e5e5",
    "#7f7f7f", "#ff0000", "#00ff00", "#ffff00", "#5c5cff", "#ff00ff", "#00ffff", "#ffffff",
]


def xterm256(n):
    if n < 16:
        return BASE16[n]
    if n < 232:
        n -= 16
        levels = [0, 95, 135, 175, 215, 255]
        r, g, b = levels[n // 36], levels[n % 36 // 6], levels[n % 6]
    else:
        r = g = b = 8 + (n - 232) * 10
    return f"#{r:02x}{g:02x}{b:02x}"


def parse_frame(text):
    rows = []
    for line in text.split("\n"):
        if not line.strip("\x1b[0m \t"):
            continue
        fg, bg = "#000000", "#000000"
        cells = []
        pos = 0
        for m in SGR.finditer(line):
            for ch in line[pos:m.start()]:
                if ch == "▄":
                    cells.append([bg, fg])
                elif ch == "▀":
                    cells.append([fg, bg])
                elif ch == "█":
                    cells.append([fg, fg])
                else:
                    cells.append([bg, bg])
            pos = m.end()
            params = [int(x) for x in m.group(1).split(";") if x] or [0]
            i = 0
            while i < len(params):
                p = params[i]
                if p == 0:
                    fg, bg = "#000000", "#000000"
                elif p in (38, 48) and i + 2 < len(params) and params[i + 1] == 5:
                    color = xterm256(params[i + 2])
                    if p == 38:
                        fg = color
                    else:
                        bg = color
                    i += 2
                elif p in (38, 48) and i + 4 < len(params) and params[i + 1] == 2:
                    color = f"#{params[i+2]:02x}{params[i+3]:02x}{params[i+4]:02x}"
                    if p == 38:
                        fg = color
                    else:
                        bg = color
                    i += 4
                i += 1
        if cells:
            rows.append(cells)
    return rows


def main():
    frames_dir, start, count, out = pathlib.Path(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    frames = []
    for i in range(start, start + count):
        text = (frames_dir / f"frame_{i:05d}.txt").read_text()
        frames.append(parse_frame(text))
    pathlib.Path(out).write_text(json.dumps(frames))
    print(f"{len(frames)} frames, {len(frames[0])} rows x {len(frames[0][0])} cols -> {out}")


if __name__ == "__main__":
    main()
