const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const speedEl = document.getElementById("speed");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const GRID_SIZE = 20;
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;

let snake;
let direction;
let nextDirection;
let food;
let score;
let speedLevel;
let gameInterval;
let gameState;
let lockDirection;

function resetGame() {
  const initialX = Math.floor(COLS / 2);
  const initialY = Math.floor(ROWS / 2);

  snake = [
    { x: initialX - 1, y: initialY },
    { x: initialX, y: initialY },
    { x: initialX + 1, y: initialY },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  speedLevel = 1;
  gameState = "ready";
  lockDirection = false;

  placeFood();
  updateUI();
  render();

  clearInterval(gameInterval);
  gameInterval = null;

  pauseBtn.disabled = true;
  startBtn.disabled = false;
}

function placeFood() {
  const occupied = new Set(snake.map(p => `${p.x},${p.y}`));
  let x, y;
  do {
    x = Math.floor(Math.random() * COLS);
    y = Math.floor(Math.random() * ROWS);
  } while (occupied.has(`${x},${y}`));
  food = { x, y };
}

function updateUI() {
  scoreEl.textContent = score;
  speedEl.textContent = speedLevel;
  statusEl.textContent = gameState === "ready" ? "尚未開始" : gameState;
}

function render() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#222";
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }

  ctx.fillStyle = "#e91e63";
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

  ctx.fillStyle = "#4caf50";
  snake.forEach((p, idx) => {
    ctx.fillStyle = idx === snake.length - 1 ? "#a5d6a7" : "#4caf50";
    ctx.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });
}

function setGameState(newState) {
  gameState = newState;
  updateUI();
}

function gameTick() {
  if (gameState !== "遊戲中") return;

  const head = snake[snake.length - 1];
  direction = nextDirection;

  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (newHead.x < 0 || newHead.y < 0 || newHead.x >= COLS || newHead.y >= ROWS) {
    setGameState("結束");
    stopGame();
    return;
  }

  if (snake.some(part => part.x === newHead.x && part.y === newHead.y)) {
    setGameState("結束");
    stopGame();
    return;
  }

  snake.push(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    if (score % 50 === 0) {
      speedLevel += 1;
      restartInterval();
    }
    placeFood();
  } else {
    snake.shift();
  }

  lockDirection = false;
  updateUI();
  render();
}

function startGame() {
  if (gameState === "running") return;

  if (gameState === "結束") {
    resetGame();
  }

  setGameState("遊戲中");
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  if (!gameInterval) {
    gameInterval = setInterval(gameTick, 250 - (speedLevel - 1) * 20);
  }
}

function stopGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  pauseBtn.disabled = true;
  startBtn.disabled = false;
}

function pauseGame() {
  if (gameState !== "遊戲中") return;
  setGameState("暫停");
  stopGame();
}

function restartInterval() {
  if (!gameInterval) return;
  clearInterval(gameInterval);
  gameInterval = setInterval(gameTick, Math.max(80, 250 - (speedLevel - 1) * 20));
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "p") {
    if (gameState === "遊戲中") pauseGame();
    else if (gameState !== "結束") startGame();
    return;
  }
  if (key === "r") {
    resetGame();
    return;
  }

  if (lockDirection || gameState === "結束") return;

  let dx = 0;
  let dy = 0;
  switch (key) {
    case "arrowup": dy = -1; break;
    case "arrowdown": dy = 1; break;
    case "arrowleft": dx = -1; break;
    case "arrowright": dx = 1; break;
    default: return;
  }

  if (dx === -direction.x && dy === -direction.y) return;
  if (dx === direction.x && dy === direction.y) return;

  nextDirection = { x: dx, y: dy };
  lockDirection = true;
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resetBtn.addEventListener("click", resetGame);

resetGame();
