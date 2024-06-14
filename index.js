document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const doodler = document.createElement("div");
  const backgroundMusic = document.getElementById("backgroundMusic");
  const winAudio = document.getElementById("winAudio");
  const gameOverVideo = document.getElementById("gameOverVideo");
  const startButton = document.getElementById("startButton");
  const timerDisplay = document.getElementById("timer");

  const brokenPlatformSound = new Audio('audios/broken-sound.mp3');

  let isGameOver = false;
  let speed = 3;
  let platformCount = 15;
  let platforms = [];
  let score = 0;
  let startPoint = 150;
  let doodlerLeftSpace = 50;
  let doodlerBottomSpace = startPoint;
  let isJumping = true;
  const gravity = 0.9;
  let isGoingLeft = false;
  let isGoingRight = false;
  let upTimerId;
  let downTimerId;
  let leftTimerId;
  let rightTimerId;
  let phaseTimerId;
  let timerId;
  let timeElapsed = 0;
  let currentPhase = 1;

  const startMusic = () => {
    backgroundMusic.play().catch((error) => {
      console.error("Error playing background music:", error);
    });
  };

  const stopMusic = () => {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  };

  const updateTimer = () => {
    timeElapsed++;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const winGame = () => {
    isGameOver = true;
    stopMusic();
    winAudio.play();
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
    const winMessage = document.createElement("div");
    winMessage.innerHTML = `You Win!<br>Your score: ${score}`;
    winMessage.classList.add("win-message");
    grid.appendChild(winMessage);
    clearInterval(timerId);
  };

  class Spring {
    constructor(left, bottom) {
      this.left = left;
      this.bottom = bottom;

      this.visual = document.createElement("div");
      const visual = this.visual;

      visual.style.left = left + "px";
      visual.style.bottom = bottom + "px";

      visual.classList.add("spring");
      grid.appendChild(visual);
    }
  }

  class Platform {
    constructor(newPlatBottom) {
      const platformWidth = 105;
      const springWidth = 30;
      this.left = Math.random() * (618 - platformWidth);
      this.bottom = newPlatBottom;
      this.visual = document.createElement("div");
  
      const visual = this.visual;
      const isBrokenPlatform = Math.random() > 0.9;
  
      if (isBrokenPlatform) {
        visual.classList.add("platform", "broken-platform");
      } else {
        visual.classList.add("platform");
      }
  
      visual.style.left = this.left + "px";
      visual.style.bottom = this.bottom + "px";
  
      grid.appendChild(visual);
  
      this.isBroken = isBrokenPlatform;
      this.isMovingPlatform = Math.random() > 0.95;
      this.direction = this.isMovingPlatform ? (Math.random() > 0.5 ? 1 : -1) : 0;

      const hasSpring = Math.random() > 0.7;
  
      if (hasSpring && !isBrokenPlatform && !this.isMovingPlatform) {
        const springLeft = this.left + (platformWidth - springWidth) / 2;
        this.spring = new Spring(springLeft, this.bottom + 26);
      }
    }
  }

  const createPlatforms = () => {
    for (let i = 0; i < platformCount; i++) {
      let platGap = 929 / platformCount;
      const newPlatBottom = 100 + i * platGap;
      const newPlatform = new Platform(newPlatBottom);

      platforms.push(newPlatform);
    }
  };

  const movePlatforms = () => {
    if (doodlerBottomSpace > 200) {
      platforms.forEach((platform) => {
        platform.bottom -= speed;
        let visual = platform.visual;
        visual.style.bottom = platform.bottom + "px";

        if (platform.spring) {
          platform.spring.bottom -= speed;
          platform.spring.visual.style.bottom = platform.spring.bottom + "px";
        }

        if (platform.isMovingPlatform) {
          if (platform.left <= 0 || platform.left >= 513) {
            platform.direction *= -1;
          }
          platform.left += platform.direction * 2;
          visual.style.left = platform.left + "px";
        }

        if (platform.bottom < 10) {
          let firstPlatform = platforms[0];

          if (firstPlatform.visual && grid.contains(firstPlatform.visual)) {
            grid.removeChild(firstPlatform.visual);
          }

          if (firstPlatform.spring && grid.contains(firstPlatform.spring.visual)) {
            grid.removeChild(firstPlatform.spring.visual);
          }

          platforms.shift();
          score++;
          speed += 0.009;
          let newPlatform = new Platform(929);
          platforms.push(newPlatform);
        }
      });
    }
  };

  const createDoodler = () => {
    grid.appendChild(doodler);
    doodler.classList.add("doodler");
    doodlerLeftSpace = platforms[0].left;
    doodler.style.left = doodlerLeftSpace + "px";
    doodler.style.bottom = doodlerBottomSpace + "px";
  };

  const fall = () => {
    isJumping = false;
    clearInterval(upTimerId);
    downTimerId = setInterval(() => {
      doodlerBottomSpace -= 5;
      doodler.style.bottom = doodlerBottomSpace + "px";
      if (doodlerBottomSpace <= 0) {
        gameOver();
      }
      platforms.forEach((platform) => {
        if (
          doodlerBottomSpace >= platform.bottom &&
          doodlerBottomSpace <= platform.bottom + 15 &&
          doodlerLeftSpace + 60 >= platform.left &&
          doodlerLeftSpace <= platform.left + 105 &&
          !isJumping
        ) {
          if (
            platform.spring &&
            doodlerBottomSpace <= platform.spring.bottom &&
            doodlerLeftSpace + 60 >= platform.spring.left &&
            doodlerLeftSpace <= platform.spring.left + 30
          ) {
            startPoint = doodlerBottomSpace;
            springJump();
            isJumping = true;
          } else if (platform.isBroken) {
            platform.visual.classList.add("broken-activated");
            setTimeout(() => {
              if (platform.visual && grid.contains(platform.visual)) {
                grid.removeChild(platform.visual);                
              }
            }, 500);
            brokenPlatformSound.play();
          } else {
            startPoint = doodlerBottomSpace;
            jump();
            isJumping = true;
          }
        }
      });
    }, 20);
  };
  

  const springJump = () => {
    clearInterval(downTimerId);
    isJumping = true;
    const springJumpAudio = new Audio("audios/spring-jump.mp3");
    springJumpAudio.play();
    upTimerId = setInterval(() => {
      doodlerBottomSpace += 45;
      doodler.style.bottom = doodlerBottomSpace + "px";
      if (doodlerBottomSpace > startPoint + 250) {
        fall();
      }
    }, 20);
  };

  const jump = () => {
    clearInterval(downTimerId);
    isJumping = true;
    upTimerId = setInterval(() => {
      doodlerBottomSpace += 20;
      doodler.style.bottom = doodlerBottomSpace + "px";
      if (doodlerBottomSpace > startPoint + 200) {
        fall();
        isJumping = false;
      }
    }, 30);
  };

  const moveLeft = () => {
    if (isGoingRight) {
      clearInterval(rightTimerId);
      isGoingRight = false;
    }
    isGoingLeft = true;
    leftTimerId = setInterval(() => {
      if (doodlerLeftSpace >= 0) {
        doodlerLeftSpace -= 5;
        doodler.style.left = doodlerLeftSpace + "px";
      } else {
        doodlerLeftSpace = 618;
        doodler.style.left = doodlerLeftSpace + "px";
      }
    }, 20);
  };

  const moveRight = () => {
    if (isGoingLeft) {
      clearInterval(leftTimerId);
      isGoingLeft = false;
    }
    isGoingRight = true;
    rightTimerId = setInterval(() => {
      if (doodlerLeftSpace <= 618) {
        doodlerLeftSpace += 5;
        doodler.style.left = doodlerLeftSpace + "px";
      } else {
        doodlerLeftSpace = 0;
        doodler.style.left = doodlerLeftSpace + "px";
      }
    }, 20);
  };

  const moveStraight = () => {
    isGoingLeft = false;
    isGoingRight = false;
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
  };

  const control = (e) => {
    doodler.style.bottom = doodlerBottomSpace + "px";
    if (e.key === "ArrowLeft") {
      moveLeft();
    } else if (e.key === "ArrowRight") {
      moveRight();
    } else if (e.key === "ArrowUp") {
      moveStraight();
    }
  };

  const gameOver = () => {
    isGameOver = true;
    stopMusic();
    gameOverVideo.style.display = "block";
    gameOverVideo.play();
    gameOverVideo.onended = () => {
      while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
      }
      const gameOverText = document.createElement("div");
      gameOverText.innerHTML = `Game Over!<br>Your score: ${score}`;
      gameOverText.classList.add("game-over");
      grid.appendChild(gameOverText);
    };

    clearInterval(downTimerId);
    clearInterval(upTimerId);
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);
    clearInterval(phaseTimerId);
    clearInterval(timerId);

    const gameOverAudio = new Audio("audios/game-over.mp3");
    gameOverAudio.play();
  };

  const startNextPhase = () => {
    if (currentPhase === 1) {
      currentPhase = 2;
      grid.classList.add("phase2");
      doodlerLeftSpace = 618;
      speed = 4.5;
      phaseTimerId = setTimeout(winGame, 1 * 60 * 1000);
    }
    platforms.forEach(platform => {
      if (platform.visual && grid.contains(platform.visual)) {
        grid.removeChild(platform.visual);
      }
    });
    platforms = [];
    score = 0;
    createPlatforms();
    doodlerBottomSpace = startPoint;
    doodler.style.left = doodlerLeftSpace + "px";
    doodler.style.bottom = doodlerBottomSpace + "px";
    timeElapsed = 0;
  };

  const start = () => {
    if (!isGameOver) {
      startMusic();
      createPlatforms();
      createDoodler();
      setInterval(movePlatforms, 30);
      jump();
      document.addEventListener("keyup", control);
      phaseTimerId = setTimeout(startNextPhase, 2 * 60 * 1000);
      timerId = setInterval(updateTimer, 1000);
    }
  };

  startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    start();
  });
});
