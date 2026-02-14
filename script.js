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
let gameHasBeenPlayed = true;

let spawnLoop = null;
let activeDuckIntervals = [];

document.addEventListener("DOMContentLoaded", function () {

  const startButton = document.getElementById("startButton");
  const bgMusic = document.getElementById("bgMusic");

  //rest duck. This was to remove issue with page 3 needing 2 clicks after going to page 4

const skipButton = document.getElementById("skipGame");

skipButton.addEventListener("click", function () {
  gameRunning = false;
    gameHasBeenPlayed = true;   // 👈 mark as played
    stopGame();
  setTimeout(() => {
    goToPage(3, false);
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
          goToPage(6);
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

      const page0 = document.getElementById("page0");
const page1 = document.getElementById("page1");

page0.classList.remove("active");

setTimeout(() => {
  page1.classList.add("active");
}, 1000);  // slight delay allows smoother crossfade

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

function goToPage(pageNumber, playSound = true) {

  console.log("Play sound flag:", playSound);

  console.log("Switching to page:", pageNumber);

  const clickSound = document.getElementById("clickSound");
  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }

if (clickSound && playSound)  {

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

  console.log("Switched to:", pageNumber);

  resetDuckState();

  const pages = document.querySelectorAll(".page");
  pages.forEach(page => page.classList.remove("active"));

  const next = document.getElementById("page" + pageNumber);
  next.classList.add("active");

  currentPage = pageNumber;

  if (pageNumber === 2) {
    startGame();
  }

if (pageNumber === 4) {
  startRPG();
}

  if (pageNumber === 5) {
    console.log("Triggering fireworks");
    startFireworks();
  }
}


function startGame() {

  const skipButton = document.getElementById("skipGame");

  const overlay = document.getElementById("winOverlay");
if (overlay) overlay.classList.remove("active");

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
    activeDuckIntervals.push(fallInterval);

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

 spawnLoop = setInterval(() => {
    if (!gameRunning) {
      clearInterval(spawnLoop);
      return;
    }
    spawnDuck();
  }, 1200);

function checkWin() {
  if (score >= targetScore) {

    stopGame();
    gameHasBeenPlayed = true;

    const overlay = document.getElementById("winOverlay");
    overlay.classList.add("active");

    const winSound = document.getElementById("winSound");
    const bgMusic = document.getElementById("bgMusic");

    if (bgMusic) {
      fadeAudio(bgMusic, 0.15, 600); // 🔥 reduce further
    }

    if (winSound) {
  winSound.volume = 1.0;
      winSound.currentTime = 0;

      const handleEnd = () => {
  winSound.removeEventListener("ended", handleEnd);

  if (bgMusic) {
    fadeAudio(bgMusic, 1.0, 800); // restore volume
  }

  setTimeout(() => {
    overlay.classList.remove("active");
    goToPage(3, false);
  }, 800);  // wait for fade up to finish
};

      winSound.addEventListener("ended", handleEnd);
      winSound.play().catch(() => {});

    } else {
      setTimeout(() => {
        overlay.classList.remove("active");
        goToPage(3, false);
      }, 3000);
    }
  }
}
}

function stopGame() {

  gameRunning = false;

  // Stop spawning ducks
  if (spawnLoop) {
    clearInterval(spawnLoop);
    spawnLoop = null;
  }

  // Stop all falling ducks
  activeDuckIntervals.forEach(interval => clearInterval(interval));
  activeDuckIntervals = [];

  // Remove all duck elements
  document.querySelectorAll(".duck-falling").forEach(duck => duck.remove());
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
let rpgVisitedStages = {};

let rpgState = {
  stage: 0,
  triedDuck: false,
  triedMagic: false,
  triedPanic: false
};

//to temp add skip
let rpgSkipEnabled = true;

function startRPG() {

  const skipBtn = document.getElementById("rpgSkip");

  if (skipBtn) {
    skipBtn.style.display = rpgSkipEnabled ? "block" : "none";
  }

  rpgState = {
    stage: 0,
    triedDuck: false,
    triedMagic: false,
    triedPanic: false
  };

  rpgVisitedStages = {};

  showRPGStage();
}
function showRPGStage() {

  const text = document.getElementById("rpgText");
  const choices = document.getElementById("rpgChoices");

  choices.innerHTML = "";   // 🔥 ALWAYS clear old options first

  switch (rpgState.stage) {

    case 0:
      showStageText(
        0,
        text,
        "Paul awakes with a start. The hangover from last night's stag do hits him hard. He slumps over and checks his phone. It's late. He almost forgot, he needs to be in Dundee for the gig tonight! What should he bring with him?",
        () => {

          createChoice("Plastic Ducks 🦆", () => {
            rpgState.stage = 1;
            showRPGStage();
          }, 0);

          createChoice("His Laptop", wrongItem, 300);
          createChoice("A Tesco Meal Deal", wrongItem, 600);
          createChoice("A Single Sock", wrongItem, 900);
        }
      );
      break;

    case 1:
      showStageText(
        1,
        text,
        "Now that he has the essentials, he makes his way outside and thinks to himself, how the hell am I going to get there?",
        () => {

          createChoice("Drive 🚗", () => {
            typeWriter(
              text,
              "Drive? Do you think that's wise with 13 minors and a hangover? Let's maybe rethink that.",
              25,
              () => {
                setTimeout(showRPGStage, 1500);
              }
            );
          }, 0);

          createChoice("Take the Train 🚆", () => {
            rpgState.stage = 2;
            showRPGStage();
          }, 300);

        }
      );
      break;

    case 2:
      showStageText(
        2,
        text,
        "Arriving in Dundee, Paul tries to contact his friends but to no success. Godamnit, where is this gig again?",
        () => {

          createChoice("Church ⛪", () => {
            typeWriter(
              text,
              "This looks like the place.",
              25,
              () => {
                rpgState.stage = 3;
                setTimeout(showRPGStage, 1000);
              }
            );
          }, 0);

          createChoice("Music Hall 🎵", () => {
            typeWriter(
              text,
              "Paul confidently walks into the Music Hall... It's empty. Very empty. Perhaps not.",
              25,
              () => {
                setTimeout(showRPGStage, 1500);
              }
            );
          }, 400);

        }
      );
      break;

    case 3:
      showStageText(
        3,
        text,
        "The gig is class. Everyone is having a great time, but what is that catching Paul's eye? A beautiful woman. Should he go talk to her... why not...",
        () => {
          showFinalChoices();
        }
      );
      break;

 case 4:

  typeWriter(
    text,
    "She sighs... \"Ok then... why not... Do you want my number?\"",
    25,
    () => {

      setTimeout(() => {

        typeWriter(
          text,
          "The rest is history.",
          25,
          () => {

            setTimeout(() => {

              const overlay = document.getElementById("fadeOverlay");
              overlay.classList.add("active");   // fade to black

              setTimeout(() => {
                goToPage(5, false);              // move to fireworks
                overlay.classList.remove("active");  // fade back in
              }, 1200);

            }, 1500);

          }
        );

      }, 1500);

    }
  );

  break;
  }
}
function wrongItem() {
  const text = document.getElementById("rpgText");
  text.textContent = "That won't help Paul on this adventure. Try again.";
  setTimeout(showRPGStage, 1500);
}

function showTrainChoice() {
  rpgState.stage = 2;
  showRPGStage();
}

function showFinalChoices() {

  const text = document.getElementById("rpgText");
  const choices = document.getElementById("rpgChoices");
  choices.innerHTML = "";

  if (!rpgState.triedDuck) {
    createChoice("Offer her a Tiny Duck 🦆", () => {
      rpgState.triedDuck = true;
      typeWriter(
        text,
        "\"Why would I want your duck?\" she says, confused.",
        25,
        checkFinalAttempts
      );
    }, 0);
  }

  if (!rpgState.triedMagic) {
    createChoice("Try a Magic Trick 🃏", () => {
      rpgState.triedMagic = true;
      typeWriter(
        text,
        "Paul pulls out a card. \"Is this your card?\" \nShe looks unimpressed. \"No.\" Try again.",
        25,
        checkFinalAttempts
      );
    }, 400);
  }

  if (!rpgState.triedPanic) {
    createChoice("Panic 😰", () => {
      rpgState.triedPanic = true;
      typeWriter(
        text,
        "Paul panics. The girl feels sorry for him and gives him another shot.",
        25,
        checkFinalAttempts
      );
    }, 800);
  }
}

function checkFinalAttempts() {

  if (rpgState.triedDuck && rpgState.triedMagic && rpgState.triedPanic) {
    setTimeout(() => {
      rpgState.stage = 4;
      showRPGStage();
    }, 2000);
  } else {
    setTimeout(showFinalChoices, 2000);
  }
}

function createChoice(label, action, delay = 0) {

  const button = document.createElement("button");
  button.textContent = label;
  button.style.opacity = "0";
  button.onclick = action;

  document.getElementById("rpgChoices").appendChild(button);

  setTimeout(() => {
    button.style.transition = "opacity 0.5s ease";
    button.style.opacity = "1";
  }, delay);
}


function typeWriter(element, text, speed = 25, callback) {

  const choices = document.getElementById("rpgChoices");
  if (choices) {
    choices.innerHTML = "";   // 🔥 clear buttons immediately
  }

  element.textContent = "";
  let i = 0;

  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    } else {
      if (callback) callback();
    }
  }

  typing();
}

document.addEventListener("DOMContentLoaded", () => {

  const skipBtn = document.getElementById("rpgSkip");

  if (skipBtn) {
    skipBtn.addEventListener("click", () => {

      const overlay = document.getElementById("fadeOverlay");

      overlay.classList.add("active");

      setTimeout(() => {
        goToPage(5, false);   // fireworks page
        overlay.classList.remove("active");
      }, 1000);

    });
  }

});

function showStageText(stageNumber, element, text, callback) {

  if (!rpgVisitedStages[stageNumber]) {
    rpgVisitedStages[stageNumber] = true;
    typeWriter(element, text, 25, callback);
  } else {
    element.textContent = text;
    if (callback) callback();
  }
}

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

function fadeAudio(audio, targetVolume, duration = 500) {
  if (!audio) return;

  const startVolume = audio.volume;
  const volumeDiff = targetVolume - startVolume;
  const steps = 20;
  const stepTime = duration / steps;
  let currentStep = 0;

  const fade = setInterval(() => {
    currentStep++;
    audio.volume = startVolume + (volumeDiff * (currentStep / steps));

    if (currentStep >= steps) {
      audio.volume = targetVolume;
      clearInterval(fade);
    }
  }, stepTime);
}

document.addEventListener("visibilitychange", function () {

  const bgMusic = document.getElementById("bgMusic");
  if (!bgMusic) return;

  if (document.hidden) {
    bgMusic.pause();
  } else {
    bgMusic.play().catch(() => {});
  }

});