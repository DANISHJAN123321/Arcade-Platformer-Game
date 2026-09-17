const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreVal = document.getElementById("scoreVal");
const highScoreVal = document.getElementById("highScoreVal");
const finalScore = document.getElementById("finalScore");

let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem("redrunner_highscore") || 0;
highScoreVal.innerText = highScore;

// Game Physics & Objects
const gravity = 0.6;

let player = {
    x: 100,
    y: 280,
    width: 32,
    height: 48,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpPower: -11,
    grounded: false
};

let obstacles = [];
let collectibles = [];
let keys = {};

// Input Listeners
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {
    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    score = 0;
    scoreVal.innerText = score;
    player.x = 100;
    player.y = 280;
    player.vy = 0;
    obstacles = [];
    collectibles = [];
    gameRunning = true;
    loop();
}

function spawnEntities() {
    // Spawn Obstacles
    if (Math.random() < 0.02) {
        obstacles.push({
            x: canvas.width,
            y: 310,
            width: 28,
            height: 40,
            speed: 5
        });
    }
    // Spawn Collectibles
    if (Math.random() < 0.03) {
        collectibles.push({
            x: canvas.width,
            y: Math.random() > 0.5 ? 240 : 200,
            radius: 12,
            speed: 4
        });
    }
}

function update() {
    if (!gameRunning) return;

    // Player Movement controls
    if (keys["ArrowRight"] || keys["KeyD"]) player.vx = player.speed;
    else if (keys["ArrowLeft"] || keys["KeyA"]) player.vx = -player.speed;
    else player.vx = 0;

    if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
    }

    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    // Canvas Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Ground Collision
    if (player.y + player.height > 350) {
        player.y = 350 - player.height;
        player.vy = 0;
        player.grounded = true;
    }

    spawnEntities();

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= obs.speed;

        // Collision Check (AABB)
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            endGame();
        }

        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
    }

    // Update Collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let col = collectibles[i];
        col.x -= col.speed;

        // Circle-Box Collision Check
        let dx = Math.abs(col.x - (player.x + player.width / 2));
        let dy = Math.abs(col.y - (player.y + player.height / 2));

        if (dx < (player.width / 2 + col.radius) && dy < (player.height / 2 + col.radius)) {
            score += 10;
            scoreVal.innerText = score;
            collectibles.splice(i, 1);
        } else if (col.x + col.radius < 0) {
            collectibles.splice(i, 1);
        }
    }

    score += 0.05;
    scoreVal.innerText = Math.floor(score);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ground Line
    ctx.strokeStyle = "#d93025";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(canvas.width, 350);
    ctx.stroke();

    // Draw Player (Crisp Red & White Character)
    ctx.fillStyle = "#d93025";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Player details (eyes)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x + 18, player.y + 8, 6, 6);

    // Draw Obstacles (Red Spikes/Blocks)
    ctx.fillStyle = "#c5221f";
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Draw Collectibles (Glowing White & Red Orbs)
    collectibles.forEach(col => {
        ctx.beginPath();
        ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#d93025";
        ctx.stroke();
    });
}

function loop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(loop);
}

function endGame() {
    gameRunning = false;
    finalScore.innerText = Math.floor(score);
    if (Math.floor(score) > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem("redrunner_highscore", highScore);
        highScoreVal.innerText = highScore;
    }
    gameOverScreen.classList.remove("hidden");
}
