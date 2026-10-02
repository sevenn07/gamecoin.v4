/* =====================================================
   TANGKAP KOIN V4
   GAME ENGINE
===================================================== */


/* =====================================================
   ELEMENT
===================================================== */

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const pauseScreen = document.getElementById("pauseScreen");
const resultScreen = document.getElementById("resultScreen");
const leaderboardScreen = document.getElementById("leaderboardScreen");
const statsScreen = document.getElementById("statsScreen");

const playerNameInput = document.getElementById("playerName");

const startBtn = document.getElementById("startBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const statsBtn = document.getElementById("statsBtn");

const soundBtn = document.getElementById("soundBtn");
const vibrationBtn = document.getElementById("vibrationBtn");

const target = document.getElementById("target");
const gameArea = document.getElementById("gameArea");

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("comboDisplay");
const feverDisplay = document.getElementById("feverDisplay");

const livesDisplay = document.getElementById("lives");
const accuracyDisplay = document.getElementById("accuracy");

const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const resultPlayer = document.getElementById("resultPlayer");
const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");
const finalCombo = document.getElementById("finalCombo");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalHits = document.getElementById("finalHits");

const achievementBox = document.getElementById("achievementBox");
const achievementText = document.getElementById("achievementText");

const playAgainBtn = document.getElementById("playAgainBtn");
const resultMenuBtn = document.getElementById("resultMenuBtn");

const leaderboardList = document.getElementById("leaderboardList");
const leaderboardBackBtn = document.getElementById("leaderboardBackBtn");

const totalGamesDisplay = document.getElementById("totalGames");
const bestScoreDisplay = document.getElementById("bestScore");
const bestComboDisplay = document.getElementById("bestCombo");
const totalCoinsDisplay = document.getElementById("totalCoins");

const statsBackBtn = document.getElementById("statsBackBtn");


/* =====================================================
   GAME STATE
===================================================== */

const GAME_DURATION = 60;
const MAX_LIVES = 3;

let score = 0;
let time = GAME_DURATION;

let level = 1;

let combo = 0;
let bestCombo = 0;

let hits = 0;
let misses = 0;

let lives = MAX_LIVES;

let playerName = "Player";

let gameRunning = false;
let gamePaused = false;

let muted = false;
let vibrationEnabled = true;

let timerInterval = null;
let targetTimeout = null;

let fever = false;
let feverTimeout = null;


/* =====================================================
   LEVEL SETTINGS
===================================================== */

const levels = {

    1: {
        size: 65,
        moveTime: 1400
    },

    2: {
        size: 58,
        moveTime: 1000
    },

    3: {
        size: 52,
        moveTime: 750
    }

};


/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEYS = {
    player: "tangkapKoin_player",
    leaderboard: "tangkapKoin_leaderboard",
    stats: "tangkapKoin_stats",
    sound: "tangkapKoin_sound",
    vibration: "tangkapKoin_vibration"
};


/* =====================================================
   AUDIO
===================================================== */

let audioContext = null;

function playSound(frequency = 600, duration = 0.08) {

    if (muted) {
        return;
    }

    try {

        if (!audioContext) {
            audioContext =
                new (window.AudioContext ||
                    window.webkitAudioContext)();
        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.08,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        // Audio tidak tersedia
    }
}


/* =====================================================
   VIBRATION
===================================================== */

function vibrate(pattern = 30) {

    if (!vibrationEnabled) {
        return;
    }

    if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}


/* =====================================================
   SCREEN CONTROL
===================================================== */

function showScreen(screen) {

    const screens = [
        menuScreen,
        gameScreen,
        pauseScreen,
        resultScreen,
        leaderboardScreen,
        statsScreen
    ];

    screens.forEach(item => {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


/* =====================================================
   PLAYER
===================================================== */

function loadPlayer() {

    const savedName =
        localStorage.getItem(STORAGE_KEYS.player);

    if (savedName) {
        playerNameInput.value = savedName;
    }

}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    playerName =
        playerNameInput.value.trim() || "Player";

    localStorage.setItem(
        STORAGE_KEYS.player,
        playerName
    );

    score = 0;
    time = GAME_DURATION;

    level = 1;

    combo = 0;
    bestCombo = 0;

    hits = 0;
    misses = 0;

    lives = MAX_LIVES;

    fever = false;

    gameRunning = true;
    gamePaused = false;

    clearIntervals();

    updateUI();

    showScreen(gameScreen);

    spawnTarget();

    timerInterval = setInterval(() => {

        if (!gameRunning || gamePaused) {
            return;
        }

        time--;

        updateUI();

        if (time <= 0) {
            endGame();
        }

    }, 1000);

}


/* =====================================================
   SPAWN TARGET
===================================================== */

function spawnTarget() {

    if (!gameRunning || gamePaused) {
        return;
    }

    const currentLevel =
        levels[level];

    const size =
        currentLevel.size;

    target.style.width = `${size}px`;
    target.style.height = `${size}px`;

    const areaWidth =
        gameArea.clientWidth;

    const areaHeight =
        gameArea.clientHeight;

    const maxX =
        Math.max(0, areaWidth - size);

    const maxY =
        Math.max(0, areaHeight - size);

    const x =
        Math.random() * maxX;

    const y =
        Math.random() * maxY;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    clearTimeout(targetTimeout);

    targetTimeout = setTimeout(() => {

        if (!gameRunning || gamePaused) {
            return;
        }

        misses++;

        combo = 0;

        updateUI();

        spawnTarget();

    }, currentLevel.moveTime);

}


/* =====================================================
   HIT TARGET
===================================================== */

function hitTarget(event) {

    if (event) {
        event.preventDefault();
    }

    if (!gameRunning || gamePaused) {
        return;
    }

    hits++;

    combo++;

    if (combo > bestCombo) {
        bestCombo = combo;
    }

    let points = 1;

    /* Combo bonus */

    if (combo >= 5) {
        points += 1;
    }

    if (combo >= 10) {
        points += 2;
    }

    /* Fever */

    if (combo >= 10 && !fever) {
        activateFever();
    }

    if (fever) {
        points *= 2;
    }

    score += points;

    playSound(
        500 + Math.min(combo * 25, 500),
        0.07
    );

    vibrate(20);

    updateLevel();

    updateUI();

    spawnTarget();

}


/* =====================================================
   FEVER
===================================================== */

function activateFever() {

    fever = true;

    feverDisplay.classList.remove("hidden");

    playSound(900, 0.15);

    clearTimeout(feverTimeout);

    feverTimeout =
        setTimeout(() => {

            fever = false;

            feverDisplay.classList.add("hidden");

        }, 8000);

}


/* =====================================================
   LEVEL
===================================================== */

function updateLevel() {

    let newLevel = 1;

    if (score >= 150) {
        newLevel = 3;

    } else if (score >= 50) {
        newLevel = 2;
    }

    if (newLevel !== level) {

        level = newLevel;

        playSound(1000, 0.2);

        vibrate([40, 40, 80]);

        target.style.transform =
            "scale(1.3)";

        setTimeout(() => {
            target.style.transform =
                "scale(1)";
        }, 180);

    }

}


/* =====================================================
   UPDATE UI
===================================================== */

function updateUI() {

    scoreDisplay.textContent =
        score;

    timeDisplay.textContent =
        time;

    levelDisplay.textContent =
        level;

    comboDisplay.textContent =
        `COMBO x${combo}`;

    livesDisplay.textContent =
        lives;

    const attempts =
        hits + misses;

    const accuracy =
        attempts === 0
            ? 100
            : Math.round(
                (hits / attempts) * 100
            );

    accuracyDisplay.textContent =
        `${accuracy}%`;

    if (time <= 10) {
        timeDisplay.style.color =
            "#ef4444";
    } else {
        timeDisplay.style.color =
            "";
    }

}


/* =====================================================
   PAUSE
===================================================== */

function pauseGame() {

    if (!gameRunning) {
        return;
    }

    gamePaused = true;

    clearTimeout(targetTimeout);

    showScreen(pauseScreen);

}


/* =====================================================
   RESUME
===================================================== */

function resumeGame() {

    if (!gameRunning) {
        return;
    }

    gamePaused = false;

    showScreen(gameScreen);

    spawnTarget();

}


/* =====================================================
   RESTART
===================================================== */

function restartGame() {

    clearIntervals();

    startGame();

}


/* =====================================================
   END GAME
===================================================== */

function endGame() {

    if (!gameRunning) {
        return;
    }

    gameRunning = false;
    gamePaused = false;

    clearIntervals();

    saveResult();

    showResult();

}


/* =====================================================
   SAVE RESULT
===================================================== */

function saveResult() {

    /* Leaderboard */

    let leaderboard =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.leaderboard
            )
        ) || [];

    leaderboard.push({
        name: playerName,
        score: score,
        level: level,
        date: new Date().toLocaleDateString("id-ID")
    });

    leaderboard.sort(
        (a, b) => b.score - a.score
    );

    leaderboard =
        leaderboard.slice(0, 10);

    localStorage.setItem(
        STORAGE_KEYS.leaderboard,
        JSON.stringify(leaderboard)
    );


    /* Statistics */

    let stats =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.stats
            )
        ) || {
            totalGames: 0,
            bestScore: 0,
            bestCombo: 0,
            totalCoins: 0
        };

    stats.totalGames++;

    stats.bestScore =
        Math.max(
            stats.bestScore,
            score
        );

    stats.bestCombo =
        Math.max(
            stats.bestCombo,
            bestCombo
        );

    stats.totalCoins += hits;

    localStorage.setItem(
        STORAGE_KEYS.stats,
        JSON.stringify(stats)
    );

}


/* =====================================================
   RESULT SCREEN
===================================================== */

function showResult() {

    resultPlayer.textContent =
        playerName;

    finalScore.textContent =
        score;

    finalLevel.textContent =
        level;

    finalCombo.textContent =
        bestCombo;

    finalHits.textContent =
        hits;

    const attempts =
        hits + misses;

    const accuracy =
        attempts === 0
            ? 100
            : Math.round(
                (hits / attempts) * 100
            );

    finalAccuracy.textContent =
        `${accuracy}%`;

    let achievement = "";

    if (score >= 150) {
        achievement =
            "🔥 Master Koin — skor 150+!";
    } else if (score >= 100) {
        achievement =
            "⚡ Speed Hunter — skor 100+!";
    } else if (score >= 50) {
        achievement =
            "⭐ Rising Player — skor 50+!";
    } else if (bestCombo >= 10) {
        achievement =
            "🔥 Combo Master — combo 10+!";
    }

    if (achievement) {

        achievementText.textContent =
            achievement;

        achievementBox.classList.remove(
            "hidden"
        );

    } else {

        achievementBox.classList.add(
            "hidden"
        );

    }

    showScreen(resultScreen);

}


/* =====================================================
   LEADERBOARD
===================================================== */

function showLeaderboard() {

    const leaderboard =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.leaderboard
            )
        ) || [];

    if (leaderboard.length === 0) {

        leaderboardList.innerHTML =
            `<p style="text-align:center;color:#94a3b8;">
                Belum ada skor.
            </p>`;

    } else {

        leaderboardList.innerHTML =
            leaderboard
                .map((item, index) => {

                    let medal = index + 1;

                    if (index === 0) medal = "🥇";
                    if (index === 1) medal = "🥈";
                    if (index === 2) medal = "🥉";

                    return `
                        <div class="leaderboard-item">

                            <div class="leaderboard-rank">
                                ${medal}
                            </div>

                            <div class="leaderboard-name">
                                ${escapeHTML(item.name)}
                            </div>

                            <div class="leaderboard-score">
                                ${item.score}
                            </div>

                        </div>
                    `;

                })
                .join("");

    }

    showScreen(leaderboardScreen);

}


/* =====================================================
   STATS
===================================================== */

function showStats() {

    const stats =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.stats
            )
        ) || {
            totalGames: 0,
            bestScore: 0,
            bestCombo: 0,
            totalCoins: 0
        };

    totalGamesDisplay.textContent =
        stats.totalGames;

    bestScoreDisplay.textContent =
        stats.bestScore;

    bestComboDisplay.textContent =
        stats.bestCombo;

    totalCoinsDisplay.textContent =
        stats.totalCoins;

    showScreen(statsScreen);

}


/* =====================================================
   CLEAR INTERVALS
===================================================== */

function clearIntervals() {

    clearInterval(timerInterval);

    clearTimeout(targetTimeout);

    clearTimeout(feverTimeout);

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =====================================================
   SETTINGS
===================================================== */

function loadSettings() {

    const savedSound =
        localStorage.getItem(
            STORAGE_KEYS.sound
        );

    const savedVibration =
        localStorage.getItem(
            STORAGE_KEYS.vibration
        );

    if (savedSound !== null) {
        muted = savedSound === "true";
    }

    if (savedVibration !== null) {
        vibrationEnabled =
            savedVibration === "true";
    }

    updateSettingButtons();

}


function updateSettingButtons() {

    soundBtn.textContent =
        muted ? "🔇" : "🔊";

    vibrationBtn.textContent =
        vibrationEnabled ? "📳" : "📴";

}


/* =====================================================
   BUTTON EVENTS
===================================================== */

startBtn.addEventListener(
    "click",
    startGame
);


leaderboardBtn.addEventListener(
    "click",
    showLeaderboard
);


statsBtn.addEventListener(
    "click",
    showStats
);


target.addEventListener(
    "pointerdown",
    hitTarget
);


pauseBtn.addEventListener(
    "click",
    pauseGame
);


resumeBtn.addEventListener(
    "click",
    resumeGame
);


restartBtn.addEventListener(
    "click",
    restartGame
);


menuBtn.addEventListener(
    "click",
    () => {

        clearIntervals();

        gameRunning = false;

        showScreen(menuScreen);

    }
);


playAgainBtn.addEventListener(
    "click",
    startGame
);


resultMenuBtn.addEventListener(
    "click",
    () => {

        showScreen(menuScreen);

    }
);


leaderboardBackBtn.addEventListener(
    "click",
    () => {

        showScreen(menuScreen);

    }
);


statsBackBtn.addEventListener(
    "click",
    () => {

        showScreen(menuScreen);

    }
);


/* =====================================================
   SOUND BUTTON
===================================================== */

soundBtn.addEventListener(
    "click",
    () => {

        muted = !muted;

        localStorage.setItem(
            STORAGE_KEYS.sound,
            muted
        );

        updateSettingButtons();

    }
);


/* =====================================================
   VIBRATION BUTTON
===================================================== */

vibrationBtn.addEventListener(
    "click",
    () => {

        vibrationEnabled =
            !vibrationEnabled;

        localStorage.setItem(
            STORAGE_KEYS.vibration,
            vibrationEnabled
        );

        updateSettingButtons();

    }
);


/* =====================================================
   ENTER KEY
===================================================== */

playerNameInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            startGame();
        }

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

loadPlayer();

loadSettings();

showScreen(menuScreen);
