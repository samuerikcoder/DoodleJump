document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const doodler = document.createElement("div");

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
  const gameOverAudio = new Audio('audios/game-over.mp3');
  const jumpAudio = new Audio("audios/jump.mp3");

  class Platform {
    constructor(newPlatBottom) {
      const platformWidth = 105;
      this.left = Math.random() * (618 - platformWidth);
      this.bottom = newPlatBottom;
      this.visual = document.createElement("div");

      const visual = this.visual;
      visual.classList.add("platform");
      visual.style.left = this.left + "px";
      visual.style.bottom = this.bottom + "px";

      grid.appendChild(visual);
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

        if (platform.bottom < 10) {
          let firstPlatform = platforms[0].visual;
          firstPlatform.classList.remove("platform");
          platforms.shift();
          score++;
          speed += 0.001;
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
          startPoint = doodlerBottomSpace;
          jump();
          isJumping = true;
        }
      });
    }, 20);
  };

  const jump = () => {
    clearInterval(downTimerId);
    isJumping = true;
    jumpAudio.play();
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
        doodlerLeftSpace = 618 - 60;
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
      if (doodlerLeftSpace <= 618 - 60) {
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
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }
    const gameOverText = document.createElement("div");
    gameOverText.innerHTML = `Game Over!<br>Your score: ${score}`;
    gameOverText.classList.add("game-over");
    grid.appendChild(gameOverText);
    clearInterval(downTimerId);
    clearInterval(upTimerId);
    clearInterval(leftTimerId);
    clearInterval(rightTimerId);

    gameOverAudio.play();
  };

  const start = () => {
    if (!isGameOver) {
      createPlatforms();
      createDoodler();
      setInterval(movePlatforms, 30);
      jump();
      document.addEventListener("keyup", control);
    }
  };

  start();
});
