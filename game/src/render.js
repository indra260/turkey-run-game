// Gobble Dash — all canvas drawing: turkey, farmer, farm, kitchen.
// One job: turn game state into pictures. Original art, drawn here
// with canvas paths only — no image files anywhere.

import { VIEW } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawBackground(ctx, stage, distance, t) {
  ctx.fillStyle = stage.sky;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Sun and drifting clouds.
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath(); ctx.arc(830, 74, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 340 - distance * 12) % 1100 + 1100) % 1100 - 80;
    ellipse(ctx, cx, 70 + i * 38, 46, 16, 'rgba(255,255,255,0.85)');
    ellipse(ctx, cx + 30, 76 + i * 38, 34, 13, 'rgba(255,255,255,0.85)');
  }
  // Distant hills / rooftops, parallax.
  ctx.fillStyle = 'rgba(120,70,30,0.35)';
  for (let i = 0; i < 4; i++) {
    const hx = ((i * 300 - distance * 30) % 1200 + 1200) % 1200 - 120;
    ctx.beginPath();
    ctx.moveTo(hx, 330); ctx.lineTo(hx + 130, 210); ctx.lineTo(hx + 260, 330);
    ctx.closePath(); ctx.fill();
  }
  // Decorative background fence: deliberately pale and thin, so it
  // never reads as an obstacle (v3: obstacle fences are red-brown
  // with a white top rail; this one stays muted by design).
  ctx.fillStyle = 'rgba(150,105,60,0.55)';
  const off = (distance * 28) % 90;
  for (let x = -off; x < VIEW.width; x += 90) {
    ctx.fillRect(x, 392, 6, 60);
    ctx.fillRect(x + 6, 410, 84, 5);
    ctx.fillRect(x + 6, 432, 84, 5);
  }
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, VIEW.groundY, VIEW.width, VIEW.height - VIEW.groundY);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, VIEW.groundY, VIEW.width, 14);
  // Scattered autumn leaves.
  ctx.fillStyle = 'rgba(214,120,40,0.7)';
  for (let i = 0; i < 12; i++) {
    const lx = ((i * 173 - distance * 28) % 1000 + 1000) % 1000;
    ellipse(ctx, lx, VIEW.groundY + 24 + ((i * 37) % 50), 7, 3, 'rgba(214,120,40,0.7)');
  }
  void t;
}

export function drawCorn(ctx, e) {
  const bob = Math.sin(e.bobPhase || 0) * 3;
  ctx.save();
  ctx.translate(e.x + 13, e.y + 15 + bob);
  ctx.fillStyle = '#3f7a2e';
  ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(0, 16); ctx.lineTo(8, -12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f7c948';
  ellipse(ctx, 0, 0, 11, 14, '#f7c948');
  ctx.strokeStyle = '#d9a521'; ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 5, -11); ctx.lineTo(i * 5, 11); ctx.stroke(); }
  ctx.restore();
}

export function drawObstacle(ctx, e, stage) {
  if (e.kind === 'corn') { drawCorn(ctx, e); return; }
  if (e.kind === 'fence') {
    // Obstacle fence: red-brown with a white top rail and dark outline,
    // unmistakable against the pale background fence (v3 contrast fix).
    ctx.fillStyle = '#a03d1e';
    ctx.fillRect(e.x, e.y, 6, e.h); ctx.fillRect(e.x + e.w - 6, e.y, 6, e.h);
    ctx.fillRect(e.x - 4, e.y + 12, e.w + 8, 8);
    ctx.fillRect(e.x - 4, e.y + 34, e.w + 8, 8);
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(e.x - 4, e.y + 12, e.w + 8, 3);
    ctx.strokeStyle = '#5a1e0c'; ctx.lineWidth = 1.5;
    ctx.strokeRect(e.x - 4, e.y + 12, e.w + 8, 8);
    ctx.strokeRect(e.x - 4, e.y + 34, e.w + 8, 8);
    return;
  }
  if (e.kind === 'pumpkin') {
    ellipse(ctx, e.x + 23, e.y + 24, 23, 18, '#e07b2a');
    ellipse(ctx, e.x + 23, e.y + 24, 14, 18, '#ef8f3a');
    ctx.fillStyle = '#4e7a2e'; ctx.fillRect(e.x + 20, e.y - 6, 6, 10);
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.moveTo(e.x + 14, e.y + 18); ctx.lineTo(e.x + 20, e.y + 24); ctx.lineTo(e.x + 14, e.y + 30); ctx.fill();
    ctx.beginPath(); ctx.moveTo(e.x + 32, e.y + 18); ctx.lineTo(e.x + 26, e.y + 24); ctx.lineTo(e.x + 32, e.y + 30); ctx.fill();
    return;
  }
  if (e.kind === 'oven') {
    ctx.fillStyle = '#3c3c46'; rr(ctx, e.x, e.y, e.w, e.h, 8); ctx.fill();
    ctx.fillStyle = '#20202a'; rr(ctx, e.x + 10, e.y + 14, e.w - 20, 44, 5); ctx.fill();
    // Fire licking out of the oven door.
    const fl = 10 + Math.sin((e.bobPhase || 0) * 6) * 4;
    ctx.fillStyle = '#ff7b1c';
    ctx.beginPath();
    ctx.moveTo(e.x + 16, e.y + 58); ctx.quadraticCurveTo(e.x + 30, e.y + 58 - fl - 14, e.x + 42, e.y + 58);
    ctx.quadraticCurveTo(e.x + 54, e.y + 58 - fl - 8, e.x + 68, e.y + 58); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath(); ctx.arc(e.x + 42, e.y + 52, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7b1c';
    ctx.font = 'bold 15px sans-serif'; ctx.fillText('HOT!', e.x + 26, e.y + 88);
    void stage;
    return;
  }
  if (e.kind === 'knife') {
    // Blade pivots near the top of its hitbox (e.y + 15) so what the
    // player sees is what can hit them: v1 pivoted at e.y + 40, below
    // the hitbox, so the visible blade never matched the danger zone.
    // v3: thicker blade with a dark outline + red handle, so the knife
    // reads instantly at contact-sheet size instead of a grey sliver.
    const swing = Math.sin(e.swing || 0) * 0.35;
    ctx.save();
    ctx.translate(e.x + 29, e.y + 15);
    ctx.rotate(swing);
    ctx.fillStyle = '#dfe3e8';
    ctx.beginPath(); ctx.moveTo(-28, -9); ctx.lineTo(14, -9); ctx.lineTo(28, 0); ctx.lineTo(14, 9); ctx.lineTo(-28, 9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a3f46'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#c0392b'; ctx.fillRect(-38, -11, 12, 22);
    ctx.strokeStyle = '#7a1e12'; ctx.lineWidth = 1.5; ctx.strokeRect(-38, -11, 12, 22);
    ctx.restore();
    // Warning triangle above the knife: the danger is easy to miss at
    // speed, so flag it (drawn unrotated so it always reads upright).
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.moveTo(e.x + 29, e.y - 16); ctx.lineTo(e.x + 41, e.y + 2); ctx.lineTo(e.x + 17, e.y + 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#3a2408'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('!', e.x + 29, e.y - 1); ctx.textAlign = 'left';
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(e.x + 24, e.y + 15, 6, VIEW.groundY - e.y - 15);
    return;
  }
  if (e.kind === 'haystack') {
    ctx.fillStyle = '#d9a83e';
    ctx.beginPath(); ctx.moveTo(e.x, e.y + e.h); ctx.quadraticCurveTo(e.x + e.w / 2, e.y - 18, e.x + e.w, e.y + e.h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b98a26'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(e.x + 10 + i * 14, e.y + e.h - 6); ctx.lineTo(e.x + 16 + i * 14, e.y + 12); ctx.stroke();
    }
    ctx.fillStyle = '#5a3a16'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText('HIDE!', e.x + 14, e.y + e.h - 10);
  }
}

export function drawTurkey(ctx, turkey, t) {
  const b = turkey.bounds;
  const bob = turkey.onGround && !turkey.sliding ? Math.sin(turkey.runTime * 11) * 3 : 0;
  ctx.save();
  ctx.translate(b.x + 32, b.y + 58 + bob * 0.4);
  if (turkey.hidden) { ctx.globalAlpha = 0.25; }
  if (turkey.stumbleLeft > 0 && Math.floor(t * 12) % 2 === 0) ctx.globalAlpha = 0.45;
  // Tail feathers.
  ctx.fillStyle = '#8a4b1f';
  for (let i = -2; i <= 2; i++) {
    ctx.save(); ctx.rotate(i * 0.35 - 0.5); ellipse(ctx, -26, -14, 7, 20, i % 2 ? '#a55a24' : '#7a3d16'); ctx.restore();
  }
  // Body.
  ellipse(ctx, 0, -8, 30, 24, '#b06a2e');
  ellipse(ctx, -4, -4, 26, 18, '#c07f3a');
  // Wing.
  ellipse(ctx, -4, -8, 16, 10, '#8a4b1f');
  // Head + snood + beak.
  ellipse(ctx, 22, -30, 13, 12, '#c07f3a');
  ctx.fillStyle = '#e05a4e'; ellipse(ctx, 26, -20, 4, 8, '#e05a4e');
  ctx.fillStyle = '#f7c948';
  ctx.beginPath(); ctx.moveTo(32, -32); ctx.lineTo(44, -28); ctx.lineTo(32, -25); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1c1c1c'; ctx.beginPath(); ctx.arc(26, -33, 2.6, 0, Math.PI * 2); ctx.fill();
  // Legs, running.
  ctx.strokeStyle = '#e07b2a'; ctx.lineWidth = 4;
  const legSwing = turkey.onGround ? Math.sin(turkey.runTime * 11) * 10 : 6;
  ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(-8 + legSwing, 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(6 - legSwing, 30); ctx.stroke();
  ctx.restore();
}

export function drawFarmer(ctx, farmer, t) {
  const x = farmer.x;
  const y = VIEW.groundY - 96;
  const bob = Math.sin(farmer.runTime * 9) * 3;
  ctx.save();
  ctx.translate(x + 36, y + 96 + bob * 0.4);
  // Legs.
  ctx.strokeStyle = '#3a4a6b'; ctx.lineWidth = 7;
  const swing = Math.sin(farmer.runTime * 9) * 12;
  ctx.beginPath(); ctx.moveTo(-8, -34); ctx.lineTo(-8 + swing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -34); ctx.lineTo(8 - swing, 0); ctx.stroke();
  // Overalls + shirt.
  ctx.fillStyle = '#3a5a8a'; rr(ctx, -20, -62, 40, 32, 6); ctx.fill();
  ctx.fillStyle = '#d94f3d'; rr(ctx, -22, -88, 44, 30, 6); ctx.fill();
  // Arms reaching forward, clutching a carving knife.
  ctx.strokeStyle = '#d94f3d'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(10, -80); ctx.lineTo(34, -62); ctx.stroke();
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath(); ctx.moveTo(34, -66); ctx.lineTo(56, -66); ctx.lineTo(64, -62); ctx.lineTo(56, -58); ctx.lineTo(34, -58); ctx.closePath(); ctx.fill();
  // Head, hat, moustache.
  ellipse(ctx, 0, -96, 15, 14, '#f0c49a');
  ctx.fillStyle = '#7a5a2e'; ctx.fillRect(-18, -108, 36, 7);
  ctx.fillRect(-10, -122, 20, 16);
  ctx.fillStyle = '#5a3a16'; ctx.fillRect(-12, -92, 24, 5);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif';
  ctx.fillText('!', 26, -118);
  ctx.restore();
  if (farmer.state === 'searching') {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText('? ? ?', x + 18, y - 14);
  }
  void t;
}

export function drawSpeech(ctx, text, x, y) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  rr(ctx, x, y, 190, 34, 10); ctx.fill();
  ctx.fillStyle = '#333'; ctx.font = 'bold 14px sans-serif';
  ctx.fillText(text, x + 12, y + 22);
}
