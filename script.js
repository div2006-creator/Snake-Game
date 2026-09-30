// Main Game Controller & UI Bindings

// DOM Elements
const board = document.getElementById("game-board");
const gameContainer = document.getElementById("game-container");
const scoreVal = document.getElementById("score-val");
const highScoreVal = document.getElementById("high-score-val");
const foodVal = document.getElementById("food-val");

const finalScore = document.getElementById("final-score");
const modalFoodCount = document.getElementById("modal-food-count");
const modalHighScore = document.getElementById("modal-high-score");
const modalTitle = document.getElementById("modal-title");
const modalSubtitle = document.getElementById("modal-subtitle");
const modalIcon = document.getElementById("modal-icon");
const newHighScoreMsg = document.getElementById("new-high-score-msg");
const gameOverModal = document.getElementById("game-over-modal");
const pauseOverlay = document.getElementById("pause-overlay");

const startPauseBtn = document.getElementById("start-pause-btn");
const startPauseIcon = document.getElementById("start-pause-icon");
const startPauseText = document.getElementById("start-pause-text");
const resetBtn = document.getElementById("reset-btn");
const restartBtn = document.getElementById("restart-btn");
const speedSelect = document.getElementById("speed-select");
const wallModeBtn = document.getElementById("wall-mode-btn");
const wallModeStatus = document.getElementById("wall-mode-status");

const soundToggleBtn = document.getElementById("sound-toggle-btn");
const soundIcon = document.getElementById("sound-icon");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");

const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnCenter = document.getElementById("btn-center");

let grid = [];

// ==========================================================================
// Web Audio API Synthesizer (Zero external dependencies)
// ==========================================================================
let audioCtx = null;
let isMuted = false;

const initAudio = () => {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
};

const playSound = (type) => {
    if (isMuted) return;
    try {
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        if (type === "eat") {
            // Pleasant upward chime (two rapid notes)
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.16);
        } else if (type === "golden") {
            // Sparkling golden 3-tone arpeggio
            [587.33, 739.99, 880].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const startTime = now + i * 0.06;
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.22, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.19);
            });
        } else if (type === "die") {
            // Gentle descending retro buzz
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } else if (type === "win") {
            // Triumphant Fanfare
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const startTime = now + i * 0.1;
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.2, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime);
                osc.stop(startTime + 0.3);
            });
        } else if (type === "click") {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(400, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {
        // AudioContext fallback
    }
};

// ==========================================================================
// Theme & Sound Settings
// ==========================================================================
const initSettings = () => {
    // Sound setting
    const savedSound = localStorage.getItem("checkbox_snake_sound");
    if (savedSound === "muted") {
        isMuted = true;
        soundIcon.textContent = "🔇";
    }

    // Theme setting
    const savedTheme = localStorage.getItem("checkbox_snake_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";
};

const toggleSound = () => {
    isMuted = !isMuted;
    soundIcon.textContent = isMuted ? "🔇" : "🔊";
    localStorage.setItem("checkbox_snake_sound", isMuted ? "muted" : "unmuted");
    if (!isMuted) playSound("click");
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
    localStorage.setItem("checkbox_snake_theme", newTheme);
    playSound("click");
};

const toggleWallMode = () => {
    wrapWalls = !wrapWalls;
    wallModeStatus.textContent = wrapWalls ? "Wrap" : "Solid";
    wallModeBtn.title = wrapWalls 
        ? "Snake will wrap around the grid edges" 
        : "Hitting grid edges is Game Over";
    playSound("click");
};

// ==========================================================================
// Grid Initialization & Board Construction
// ==========================================================================
const createBoard = () => {
    board.innerHTML = "";
    grid = [];

    for (let y = 0; y < GRID_SIZE; y++) {
        const row = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("cell-checkbox");
            checkbox.dataset.x = x;
            checkbox.dataset.y = y;
            checkbox.tabIndex = -1; // Keep board focusable, not individual checkboxes

            // Prevent manual desync via click/change
            checkbox.addEventListener("click", (e) => {
                e.preventDefault();
                initAudio();
            });

            checkbox.addEventListener("change", (e) => {
                e.preventDefault();
                Render();
            });

            board.appendChild(checkbox);
            row.push(checkbox);
        }
        grid.push(row);
    }
};

// ==========================================================================
// Render Cycle
// ==========================================================================
const Render = () => {
    // Reset all cells
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cb = grid[y][x];
            cb.checked = false;
            cb.className = "cell-checkbox";
        }
    }

    // Render snake segments
    snake.forEach((segment, index) => {
        if (segment.x >= 0 && segment.x < GRID_SIZE && segment.y >= 0 && segment.y < GRID_SIZE) {
            const cb = grid[segment.y][segment.x];
            cb.checked = true;
            cb.classList.add("snake");
            if (index === 0) {
                cb.classList.add("snake-head");
            }
        }
    });

    // Render normal food
    if (food && food.x >= 0 && food.x < GRID_SIZE && food.y >= 0 && food.y < GRID_SIZE) {
        const cb = grid[food.y][food.x];
        cb.checked = true;
        cb.classList.add("food");
    }

    // Render special golden food if present
    if (specialFood && specialFood.x >= 0 && specialFood.x < GRID_SIZE && specialFood.y >= 0 && specialFood.y < GRID_SIZE) {
        const cb = grid[specialFood.y][specialFood.x];
        cb.checked = true;
        cb.classList.add("special-food");
    }

    // Update Scoreboard metrics
    scoreVal.textContent = score;
    highScoreVal.textContent = highScore;
    foodVal.textContent = foodEatenCount;
};

// ==========================================================================
// Game Lifecycle Callbacks
// ==========================================================================
const triggerGameOver = (reason) => {
    isGameOver = true;
    stopGameLoop();
    playSound("die");

    finalScore.textContent = score;
    modalFoodCount.textContent = foodEatenCount;
    modalHighScore.textContent = highScore;

    modalIcon.textContent = "💀";
    modalTitle.textContent = "Game Over!";

    if (reason === "wall") {
        modalSubtitle.textContent = "You crashed into the wall!";
    } else if (reason === "self") {
        modalSubtitle.textContent = "You collided with your own tail!";
    } else {
        modalSubtitle.textContent = "Game ended";
    }

    // High Score notification
    if (score === highScore && score > 0) {
        newHighScoreMsg.classList.remove("hidden");
    } else {
        newHighScoreMsg.classList.add("hidden");
    }

    gameOverModal.classList.remove("hidden");
    pauseOverlay.classList.add("hidden");

    startPauseIcon.textContent = "▶";
    startPauseText.textContent = "Start";
};

const triggerVictory = () => {
    isVictory = true;
    stopGameLoop();
    playSound("win");

    finalScore.textContent = score;
    modalFoodCount.textContent = foodEatenCount;
    modalHighScore.textContent = highScore;

    modalIcon.textContent = "🏆";
    modalTitle.textContent = "Victory!";
    modalSubtitle.textContent = "Incredible! You filled the entire grid!";

    newHighScoreMsg.classList.remove("hidden");
    newHighScoreMsg.textContent = "🌟 PERFECT CLEAR! 🌟";

    gameOverModal.classList.remove("hidden");
    pauseOverlay.classList.add("hidden");
};

const handleEatFood = (foodType, headPos, points) => {
    if (foodType === "golden") {
        playSound("golden");
    } else {
        playSound("eat");
    }

    // Visual bump effect on score
    scoreVal.classList.remove("score-bump");
    void scoreVal.offsetWidth; // Trigger reflow
    scoreVal.classList.add("score-bump");

    // Ripple flash on eaten cell
    if (headPos && grid[headPos.y] && grid[headPos.y][headPos.x]) {
        const cell = grid[headPos.y][headPos.x];
        cell.classList.add("cell-flash");
        setTimeout(() => cell.classList.remove("cell-flash"), 300);
    }
};

const getGameCallbacks = () => ({
    onRender: Render,
    onGameOver: triggerGameOver,
    onEatFood: handleEatFood,
    onWin: triggerVictory
});

const resetGame = () => {
    isGameOver = false;
    isVictory = false;
    isPaused = false;
    score = 0;

    gameOverModal.classList.add("hidden");
    pauseOverlay.classList.add("hidden");

    startPauseIcon.textContent = "⏸";
    startPauseText.textContent = "Pause";

    initSnake();
    resetFood();
    spawnFood();
    Render();

    startGameLoop(getGameCallbacks());
};

const togglePause = () => {
    initAudio();

    if (isGameOver || isVictory) {
        resetGame();
        return;
    }

    isPaused = !isPaused;
    if (isPaused) {
        stopGameLoop();
        pauseOverlay.classList.remove("hidden");
        startPauseIcon.textContent = "▶";
        startPauseText.textContent = "Resume";
    } else {
        pauseOverlay.classList.add("hidden");
        startPauseIcon.textContent = "⏸";
        startPauseText.textContent = "Pause";
        startGameLoop(getGameCallbacks());
    }
    playSound("click");
};

// ==========================================================================
// Input Handlers (Keyboard, Touch/Swipe, D-Pad)
// ==========================================================================
document.addEventListener("keydown", (e) => {
    initAudio();

    // Prevent default scrolling for game keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            changeDirection({ x: 0, y: -1 });
            break;
        case "ArrowDown":
        case "s":
        case "S":
            changeDirection({ x: 0, y: 1 });
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            changeDirection({ x: -1, y: 0 });
            break;
        case "ArrowRight":
        case "d":
        case "D":
            changeDirection({ x: 1, y: 0 });
            break;
        case " ":
            togglePause();
            break;
        case "r":
        case "R":
            resetGame();
            break;
        case "m":
        case "M":
            toggleSound();
            break;
        case "t":
        case "T":
            toggleTheme();
            break;
    }
});

// Virtual D-Pad bindings
btnUp.addEventListener("click", () => { initAudio(); changeDirection({ x: 0, y: -1 }); });
btnDown.addEventListener("click", () => { initAudio(); changeDirection({ x: 0, y: 1 }); });
btnLeft.addEventListener("click", () => { initAudio(); changeDirection({ x: -1, y: 0 }); });
btnRight.addEventListener("click", () => { initAudio(); changeDirection({ x: 1, y: 0 }); });
btnCenter.addEventListener("click", togglePause);

// Touch Swipe Detection on Game Board Container
let touchStartX = 0;
let touchStartY = 0;

gameContainer.addEventListener("touchstart", (e) => {
    initAudio();
    if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

gameContainer.addEventListener("touchend", (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const minSwipeDist = 25;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDist) {
            if (deltaX > 0) {
                changeDirection({ x: 1, y: 0 }); // Swipe right
            } else {
                changeDirection({ x: -1, y: 0 }); // Swipe left
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDist) {
            if (deltaY > 0) {
                changeDirection({ x: 0, y: 1 }); // Swipe down
            } else {
                changeDirection({ x: 0, y: -1 }); // Swipe up
            }
        }
    }
}, { passive: true });

// Controls buttons
startPauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", () => { initAudio(); resetGame(); });
restartBtn.addEventListener("click", () => { initAudio(); resetGame(); });
soundToggleBtn.addEventListener("click", toggleSound);
themeToggleBtn.addEventListener("click", toggleTheme);
wallModeBtn.addEventListener("click", toggleWallMode);

speedSelect.addEventListener("change", (e) => {
    initAudio();
    const newSpeed = parseInt(e.target.value, 10);
    setGameSpeed(newSpeed, getGameCallbacks());
});

// ==========================================================================
// App Initialization
// ==========================================================================
const init = () => {
    initSettings();
    createBoard();
    highScoreVal.textContent = highScore;
    resetGame();
};

init();