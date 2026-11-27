// Gobble Dash — HUD, title screen, end screens and buttons.
// One job: every word and meter the player reads, drawn on canvas.

import { RUN, VIEW } from './config.js';

export function drawHud(ctx, game) {
  const { score, distance, lives } = game;
  ctx.fillStyle = 'rgba(20,16,10,0.55)';
  ctx.fillRect(0, 0, VIEW.width, 54);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${score}`, 16, 34);
  ctx.fillText(`${Math.floor(distance)} m / ${RUN.totalDistance} m`, 220, 34);
  // Lives as little turkey heads.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < lives ? '#e05a4e' : 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.arc(560 + i * 30, 26, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`CORN ${game.corn}`, 660, 32);
  // Progress bar to freedom.
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(16, 44, 300, 6);
  ctx.fillStyle = '#7fae4c';
  ctx.fillRect(16, 44, 300 * Math.min(1, distance / RUN.totalDistance), 6);
  // Farmer proximity warning: a red pill below the bar, so it never
  // collides with the CORN counter; otherwise a quiet distance readout.
  const gap = game.farmer.gap;
  if (gap < 120) {
    ctx.fillStyle = '#d93a1e';
    ctx.fillRect(VIEW.width - 268, 62, 252, 26);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ THE FARMER IS CLOSE!', VIEW.width - 142, 80);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`FARMER ${Math.round(gap)}px BEHIND`, VIEW.width - 16, 34);
    ctx.textAlign = 'left';
  }
  // Stage flash banner.
  if (game.world.stageFlash > 0) {
    ctx.globalAlpha = Math.min(1, game.world.stageFlash);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.world.stageFlashText, VIEW.width / 2, 120);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20,14,8,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = accent;
  ctx.fillRect(VIEW.width / 2 - 260, 92, 520, 6);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(title, VIEW.width / 2, 170);
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, VIEW.width / 2, 220 + i * 32));
  ctx.textAlign = 'left';
}

export function button(ctx, label, x, y, w, h, hot) {
  ctx.fillStyle = hot ? '#ffd23e' : '#f7c948';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.fillStyle = '#3a2408';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 8);
  ctx.textAlign = 'left';
  return { x, y, w, h };
}

export function drawTitle(ctx, best) {
  panel(ctx, 'GOBBLE DASH', [
    'Thanksgiving is coming — and YOU are the dinner.',
    'Outrun the farmer, jump the fences, slide under the knives,',
    'dodge the oven, hide in the hay — and reach the woods!',
    '',
    'SPACE / ↑  jump      ↓  slide      H  hide in hay',
    'Click or press ENTER to run.  P pause · M mute',
  ], '#f7c948');
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  if (best > 0) ctx.fillText(`BEST SCORE: ${best}`, VIEW.width / 2, 414);
  ctx.textAlign = 'left';
  return button(ctx, '▶  START THE ESCAPE', VIEW.width / 2 - 160, 432, 320, 56, true);
}

export function drawEnd(ctx, game) {
  const escaped = game.outcome === 'escaped';
  const title = escaped ? 'YOU ESCAPED!' : 'CAUGHT!';
  const accent = escaped ? '#7fae4c' : '#d94f3d';
  const lines = escaped
    ? ['The turkey made it to the woods — Thanksgiving is cancelled!', `Final score ${game.score} · ${Math.floor(game.distance)} m · ${game.corn} corn`, 'The farmer is still searching the haystacks.']
    : ['The farmer caught the turkey… dinner is served.', `Final score ${game.score} · ${Math.floor(game.distance)} m · ${game.corn} corn`, 'Tip: hide in a haystack when the farmer closes in.'];
  panel(ctx, title, lines, accent);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`BEST SCORE: ${game.best}`, VIEW.width / 2, 380);
  ctx.textAlign = 'left';
  return button(ctx, '↻  RUN AGAIN', VIEW.width / 2 - 140, 410, 280, 56, true);
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20,14,8,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', VIEW.width / 2, VIEW.height / 2);
  ctx.font = '20px sans-serif';
  ctx.fillText('Press P or click to keep running', VIEW.width / 2, VIEW.height / 2 + 40);
  ctx.textAlign = 'left';
}
