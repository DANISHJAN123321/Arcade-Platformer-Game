// Grab audio elements from the DOM
const bgMusic = document.getElementById("bgMusic");
const jumpSound = document.getElementById("jumpSound");
bgMusic.volume = 0.4; // Set background music volume (0.0 to 1.0)
jumpSound.volume = 0.6;

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
    
    // Play background music when game starts (handled safely with user interaction)
    bgMusic.currentTime = 0;
    bgMusic.play().catch(e => console.log("Audio autoplay restricted:", e));

    loop();
}

function update() {
    if (!gameRunning) return;

    // Player Movement controls
    if (keys["ArrowRight"] || keys["KeyD"]) player.vx = player.speed;
    else if (keys["ArrowLeft"] || keys["KeyA"]) player.vx = -player.speed;
    else player.vx = 0;

    // Trigger jump sound effect
    if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && player.grounded) {
        player.vy = player.jumpPower;
        player.grounded = false;
        
        // Play jump sound effect instantly
        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log("Audio play error:", e));
    }

    // ... rest of your update logic ...
}

function endGame() {
    gameRunning = false;
    
    // Pause background music on game over
    bgMusic.pause();

    finalScore.innerText = Math.floor(score);
    if (Math.floor(score) > highScore) {
        highScore = Math.floor(score);
        localStorage.setItem("redrunner_highscore", highScore);
        highScoreVal.innerText = highScore;
    }
    gameOverScreen.classList.remove("hidden");
}
