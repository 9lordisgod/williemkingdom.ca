# 9lordisgod.github.io

A small Macintosh sitting in a dark room. Find the power switch on the right side of the machine, flip it, and browse everything on the little red-phosphor screen.

**Live:** https://9lordisgod.github.io/

## What's inside

- **The machine** — a compact Mac built as a real object in CSS 3D: front, side and top faces with a fixed camera (perspective + perspective-origin), chamfered bezel, CRT glass, vents, floppy slot, rocker switch and LED on the right side, a wedge keyboard with keycaps, a boxy mouse, cords, and a desk that catches the shadows. The eye drifts a little with your pointer. Once the machine is on, red light spills onto the case, the keyboard and the desk.
- **The screen is a flat layer** sitting exactly inside the bezel at z = 0, so the text is always pixel-crisp. Flipping the switch leans the camera into the screen; `Z` steps back out to admire the hardware.
- **Power-on** — relay click, CRT beam warm-up, a synthesized startup chord, Happy Mac, a geek boot log, then the desktop. Shut Down collapses the tube back to a dot.
- **9LORD OS** — a tiny operating system at the real classic-Mac resolution (512 × 342): menu bar, desktop icons, draggable/zoomable windows, dialogs.
  - `About Me`, `Projects` (live stars from the GitHub API), `Philosophy.txt`, `Links`, `X.app`, `GitHub.app`, `Trash`
  - `Terminal` — `help`, `about`, `projects`, `open 3`, `philosophy`, `fortune`, `neofetch`, `cat .secret`, `matrix`, `theme amber`, `shutdown`…
- **All audio is generated** with WebAudio — no sound files. Toggle with `M`.
- **Zero dependencies, zero trackers.** One HTML file, one stylesheet, three scripts.

## Controls

| Key | Action |
| --- | --- |
| `Enter` / `Space` / `P` | power on (or click the switch) |
| `Z` | lean in / step back from the screen |
| `T` | open a terminal |
| `M` | mute / unmute |
| `Esc` | close window → exit zoom |

URL switches: `?boot` powers the machine on immediately, `?zoom` starts zoomed in, `#text` opens the plain-text version.

## Editing content

Everything shown on screen (profile, projects, philosophy, links, boot log) lives in [`js/data.js`](js/data.js). Phosphor colours live at the top of [`css/style.css`](css/style.css).

## Run locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## License

MIT © 2026 Anon Rothschild
