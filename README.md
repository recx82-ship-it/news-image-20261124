# A Single Picture of the Morning — 24 November 2026

An entry for make.fun's ["Sum up 24 November's world news in one image" bounty](https://make.fun/bounty/news-image-20261124) — a $100 prize for boiling the day's news down to one picture.

## What the picture shows

`entry.png` is one illustrated panel that pulls together the stories that
broke overnight into the morning of Tuesday 24 November 2026:

- **Markets roar back** — Nvidia restores Jensen Huang as CEO; the shares
  climb about 31%, and the rally carries the S&P 500 up roughly 4.7% and
  the Nasdaq roughly 6.5%.
- **Climate talks fall apart** — COP31 in Antalya ends without any deal.
- **A warship goes down** — Ukrainian sea drones sink the Russian corvette
  Merkury off the Libyan coast.
- **NATO scrambles** — AWACS surveillance planes head for Poland after
  Russian missiles strike Polish ground.
- **A blockade is challenged** — Iran promises to resist the US naval
  blockade.
- **A big win in Washington** — the Democrats secure their largest House
  majority since 1992.
- **A cartel arrest** — Mexico takes "El Chapo Isidro" into custody.
- **A court fight over AI** — US states take Musk's companies to court
  over sexualised images from Grok.

## How to run it

```sh
node main.ts
```

The script needs Node 22 or newer and nothing else — it uses only the
standard library. It reads `entry.png` from the same folder, checks it
against the bounty's rules (a complete PNG or JPEG, at most 1 MiB, no
edge over 1024 pixels), and copies it to
`$MAKEFUN_OUTPUT_DIR/entry.png` (or `/output/entry.png` when that
variable is not set), printing a one-line summary of what it accepted.

## What's in here

- `entry.png` — the picture itself (JPEG data, 1024 by 1024 pixels,
  300,445 bytes, inside the size limit).
- `main.ts` — the checker and copier described above.
- `LICENSE` — the licence for this entry.

## Morning edition

This picture was put together from the overnight news only, so it covers
the morning's headlines. A fresh version built from the whole day's news
will follow this evening.
