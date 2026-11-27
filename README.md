# Gobble Dash — Turkey Escape

[![turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/indra260/turkey-run-game/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/indra260/turkey-run-game/reward.svg)](https://make.fun/c/turkey-run-game-01)

Thanksgiving is coming — and **you** are the dinner. **Gobble Dash** is a
2D canvas escape game built for the [make.fun turkey escape game
competition](https://make.fun/c/turkey-run-game-01): a turkey sprints
1,000 metres from the farmyard, through the barn and the kitchen, to the
freedom of the woods — while the farmer chases him with a carving knife.

## How to play

- **SPACE / ↑ / W** — jump (fences, pumpkins, the oven)
- **↓ / S** — slide under the swinging carving knives
- **H** — hide in a haystack when the farmer closes in (he stops to search)
- **Mouse** — click the upper half to jump, the lower half to slide; click
  the buttons on the title and end screens
- **P** — pause · **M** — mute · **Enter** — start / run again

Grab corn for points, clear obstacles for bonus points, and watch the
farmer: every stumble lets him surge forward, and if he catches you,
dinner is served. Three lives. Reach 1,000 m and you escape.

## What is in the game

- A complete game: title screen, a run with a HUD (score, distance,
  lives, corn, farmer proximity), and end screens for both **caught**
  and **escaped**, with restart.
- Three stages that grow harder — farmyard, barn, kitchen — with the
  oven only appearing once you reach the kitchen.
- A farmer AI that chases, surges on your stumbles, searches haystacks
  and corners you.
- Original canvas-drawn art (turkey, farmer, farm, kitchen, autumn
  palette) and synthesized WebAudio sounds and music — no copied assets,
  no network requests, no build step.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

Or serve `game/` with any static server and open `game/index.html`.

Screenshots are deterministic: `?shot=start|play|end&seed=1` renders a
fixed title, mid-run, or end state (see `shots.json`).

## Layout

- `game/index.html` — the page; `game/src/` — one module per job
  (`config`, `random`, `input`, `audio`, `turkey`, `farmer`, `world`,
  `render`, `hud`, `shots`, `main`).
- `main.ts` — hands the game in: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` (Node 22, stdlib only).
- `screenshots/` — real renders of the game in a browser.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## License

MIT — see [LICENSE](LICENSE).
