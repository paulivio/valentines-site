let currentPage = 0;
let fireworksStarted = false;



/* -------------------------
   PAGE SWITCHING
------------------------- */
let holdTimer = null;
let holdTriggered = false;
let isHolding = false;

// GAME VARIABLES
let score = 0;
let gameRunning = false;
const targetScore = 10;
let gameHasBeenPlayed = false;
document.addEventListener("DOMContentLoaded", function () {

  const startButton = document.getElementById("startButton");
  const bgMusic = document.getElementById("bgMusic");

  //rest duck. This was to remove issue with page 3 needing 2 clicks after going to apge 4

const skipButton = document.getElementById("skipGame");

skipButton.addEventListener("click", function () {
  gameRunning = false;
    gameHasBeenPlayed = true;   // 👈 mark as played
  setTimeout(() => {
    goToPage(3);
  }, 300);
});

 
// LONG PRESS SECRET LOGIC
const finalDuck = document.getElementById("finalDuck");


if (finalDuck) {

  const startHold = (e) => {
    e.preventDefault();

    if (isHolding) return;

    isHolding = true;
    holdTriggered = false;

    finalDuck.classList.add("charging");

    holdTimer = setTimeout(() => {
      if (isHolding) {
        holdTriggered = true;
        finalDuck.classList.remove("charging");
        finalDuck.classList.add("unlocked");

        setTimeout(() => {
          goToPage(5);
        }, 200);
      }
    }, 1000);
  };

  const endHold = () => {

    // 🔒 DO NOTHING if we never started holding
    if (!isHolding) return;

    clearTimeout(holdTimer);
    finalDuck.classList.remove("charging");
    isHolding = false;

    if (!holdTriggered) {
      goToPage(1);
    }
  };

  // Desktop
  finalDuck.addEventListener("mousedown", startHold);
  finalDuck.addEventListener("mouseup", endHold);

  // Mobile
  finalDuck.addEventListener("touchstart", startHold);
  finalDuck.addEventListener("touchend", endHold);
}



//Start button logic. Wait for click. Play music and move to apge 1
  if (startButton) {
    startButton.addEventListener("click", function () {

      console.log("Intro clicked");

      if (bgMusic) {
        bgMusic.play().catch(() => {});
      }

      document.getElementById("page0").classList.remove("active");
      document.getElementById("page1").classList.add("active");

      currentPage = 1;
    });
  }

});

function resetDuckState() {
  const finalDuck = document.getElementById("finalDuck");
  if (!finalDuck) return;

  isHolding = false;
  holdTriggered = false;
  clearTimeout(holdTimer);

  finalDuck.classList.remove("charging");
  finalDuck.classList.remove("unlocked");
}

function goToPage(pageNumber) {

  console.log("Switching to page:", pageNumber);

  const clickSound = document.getElementById("clickSound");
  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }

  if (clickSound) {

    clickSound.currentTime = 0;

    const handleEnd = () => {
      clickSound.removeEventListener("ended", handleEnd);
      switchPage(pageNumber);
    };

    clickSound.addEventListener("ended", handleEnd);

    clickSound.play().catch(() => {
      clickSound.removeEventListener("ended", handleEnd);
      switchPage(pageNumber);
    });

  } else {
    switchPage(pageNumber);
  }
}

function switchPage(pageNumber) {

  // Reset duck state whenever leaving page 3
  resetDuckState();

  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const next = document.getElementById("page" + pageNumber);
  next.classList.add("active");

  currentPage = pageNumber;

  if (pageNumber === 2) {
  startGame();

  if (pageNumber === 4 && !fireworksStarted) {
    startFireworks();
    fireworksStarted = true;
  }


}
}

function startGame() {

  const skipButton = document.getElementById("skipGame");

if (skipButton) {
  if (gameHasBeenPlayed) {
    skipButton.style.display = "block";
  } else {
    skipButton.style.display = "none";
  }
}
  score = 0;
  document.getElementById("score").textContent = score;
  gameRunning = true;
  document.getElementById("progressBar").style.width = "0%";
  const gameArea = document.getElementById("gameArea");
  const catcher = document.getElementById("catcher");

  let catcherX = window.innerWidth / 2;

  document.addEventListener("mousemove", (e) => {
    if (!gameRunning) return;
    catcherX = e.clientX;
    catcher.style.left = catcherX - 60 + "px";
  });

  document.addEventListener("touchmove", (e) => {
    if (!gameRunning) return;
    catcherX = e.touches[0].clientX;
    catcher.style.left = catcherX - 60 + "px";
  });

 function spawnDuck() {

  if (!gameRunning) return;

  const duck = document.createElement("img");
  duck.src = "assets/duck.png";
  duck.classList.add("duck-falling");

  duck.style.left = Math.random() * (window.innerWidth - 60) + "px";
  duck.style.top = "0px";

  gameArea.appendChild(duck);

  let fallInterval = setInterval(() => {

    let top = parseFloat(duck.style.top);
    const speed = 5 + score * 0.5;
    duck.style.top = top + speed + "px";

    const duckRect = duck.getBoundingClientRect();
    const catcherRect = catcher.getBoundingClientRect();

    // 🎯 CATCH
    if (
      duckRect.bottom >= catcherRect.top &&
      duckRect.left < catcherRect.right &&
      duckRect.right > catcherRect.left
    ) {
      clearInterval(fallInterval);
      duck.remove();

      score++;
      document.getElementById("score").textContent = score;

      const catchSound = document.getElementById("clickSound");
      if (catchSound) {
        catchSound.currentTime = 0;
        catchSound.play().catch(() => {});
      }

      showFloatingPoint(duckRect.left, duckRect.top);
      updateProgressBar();
      checkWin();
    }

    // ❌ MISS
    if (duckRect.top > window.innerHeight) {
      clearInterval(fallInterval);
      duck.remove();

      score = Math.max(0, score - 1);
      document.getElementById("score").textContent = score;
      updateProgressBar();
    }

  }, 20);
}

  const spawnLoop = setInterval(() => {
    if (!gameRunning) {
      clearInterval(spawnLoop);
      return;
    }
    spawnDuck();
  }, 1200);

function checkWin() {
  if (score >= targetScore) {
    gameRunning = false;
    gameHasBeenPlayed = true;   // 👈 mark complete

    setTimeout(() => {
      goToPage(3);
    }, 800);
  }
}
}

function showFloatingPoint(x, y) {

  const point = document.createElement("div");
  point.className = "floating-point";
  point.textContent = "+1";

  point.style.left = x + "px";
  point.style.top = y + "px";

  document.body.appendChild(point);

  setTimeout(() => {
    point.remove();
  }, 800);
}

function updateProgressBar() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;

  const progress = (score / targetScore) * 100;
  bar.style.width = progress + "%";
}
/* -------------------------
   FIREWORKS (ONLY PAGE 3)
------------------------- */

function startFireworks() {

  const canvas = document.getElementById("fireworks");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let particles = [];

  function createFirework() {

    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height * 0.7;

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 100,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`
      });
    }
  }

  function update() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    });

    particles = particles.filter(p => p.life > 0);

    if (Math.random() < 0.03) {
      createFirework();
    }

    requestAnimationFrame(update);
  }

  update();
}