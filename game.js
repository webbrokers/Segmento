const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const heartsEl = document.getElementById('hearts');
const coinEl = document.getElementById('coinCounter');

const gravity = 0.6;
const ground = canvas.height - 40;
const keys = {};

const player = {
  x: 50,
  y: ground - 40,
  width: 30,
  height: 40,
  vx: 0,
  vy: 0,
  speed: 3,
  jumpForce: 12,
  jumpCount: 0,
  lives: 3,
  coins: 0,
  shots: 0,
  reloading: false
};

const bullets = [];
const enemies = [
  { x: 300, y: ground - 30, width: 30, height: 30, vx: 1 },
  { x: 500, y: ground - 30, width: 30, height: 30, vx: -1 }
];
const coins = [];
for (let i = 0; i < 20; i++) {
  coins.push({ x: 80 + i * 25, y: ground - 60, r: 8, collected: false });
}

function updateHUD() {
  heartsEl.textContent = '❤'.repeat(player.lives);
  coinEl.textContent = 'Монеты: ' + player.coins;
}

function keyHandler(e) {
  keys[e.code] = e.type === 'keydown';
  if (e.type === 'keydown') {
    if (e.code === 'Space' && player.jumpCount < 2) {
      player.vy = -player.jumpForce;
      player.jumpCount++;
    }
    if ((e.code === 'ControlLeft' || e.code === 'ControlRight')) {
      shoot();
    }
  }
}

document.addEventListener('keydown', keyHandler);
document.addEventListener('keyup', keyHandler);

function shoot() {
  if (player.reloading || player.shots >= 5) return;
  const dir = keys['ArrowRight'] ? 1 : keys['ArrowLeft'] ? -1 : 1;
  bullets.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, vx: 6 * dir });
  player.shots++;
  if (player.shots >= 5) {
    player.reloading = true;
    setTimeout(() => {
      player.shots = 0;
      player.reloading = false;
    }, 3000);
  }
}

function resetPlayer() {
  player.x = 50;
  player.y = ground - player.height;
  player.vx = 0;
  player.vy = 0;
  player.jumpCount = 0;
}

function endGame(message) {
  alert(message);
  document.location.reload();
}

function gameLoop() {
  // movement
  if (keys['ArrowLeft']) player.vx = -player.speed;
  else if (keys['ArrowRight']) player.vx = player.speed;
  else player.vx = 0;

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  if (player.y + player.height >= ground) {
    player.y = ground - player.height;
    player.vy = 0;
    player.jumpCount = 0;
  }

  // bullets
  bullets.forEach((b, i) => {
    b.x += b.vx;
    if (b.x < 0 || b.x > canvas.width) bullets.splice(i, 1);
  });

  // enemies
  enemies.forEach((en) => {
    en.x += en.vx;
    if (en.x <= 0 || en.x + en.width >= canvas.width) en.vx *= -1;
  });

  // collisions player-enemy
  enemies.forEach((en, ei) => {
    if (
      player.x < en.x + en.width &&
      player.x + player.width > en.x &&
      player.y < en.y + en.height &&
      player.y + player.height > en.y
    ) {
      if (player.vy > 0 && player.y + player.height - player.vy <= en.y) {
        enemies.splice(ei, 1);
        player.vy = -player.jumpForce;
      } else {
        player.lives--;
        updateHUD();
        resetPlayer();
        if (player.lives <= 0) endGame('Вы проиграли');
      }
    }
  });

  // bullet-enemy
  bullets.forEach((b, bi) => {
    enemies.forEach((en, ei) => {
      if (b.x > en.x && b.x < en.x + en.width && b.y > en.y && b.y < en.y + en.height) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
      }
    });
  });

  // coins
  coins.forEach((c) => {
    if (!c.collected && player.x < c.x + c.r && player.x + player.width > c.x - c.r && player.y < c.y + c.r && player.y + player.height > c.y - c.r) {
      c.collected = true;
      player.coins++;
      updateHUD();
      if (player.coins >= 20) endGame('Вы собрали все монеты!');
    }
  });

  draw();
  requestAnimationFrame(gameLoop);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ground
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, ground, canvas.width, 40);

  // player
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // enemies
  ctx.fillStyle = 'red';
  enemies.forEach((en) => ctx.fillRect(en.x, en.y, en.width, en.height));

  // coins
  ctx.fillStyle = 'gold';
  coins.forEach((c) => {
    if (!c.collected) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // bullets
  ctx.fillStyle = 'black';
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, 4, 2));
}

updateHUD();
resetPlayer();
requestAnimationFrame(gameLoop);
