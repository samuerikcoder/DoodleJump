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
  const gameOverAudio = new Audio("audios/game-over.mp3");
  const jumpAudio = new Audio("audios/jump.mp3");
  const springJumpAudio = new Audio("audios/spring-jump.mp3");

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
      visual.classList.add("platform");
      visual.style.left = this.left + "px";
      visual.style.bottom = this.bottom + "px";

      grid.appendChild(visual);

      const hasSpring = Math.random() > 0.7;

      if (hasSpring) {
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

        if (platform.bottom < 10) {
          let firstPlatform = platforms[0];

          firstPlatform.visual.classList.remove("platform");
          grid.removeChild(firstPlatform.visual);

          if (firstPlatform.spring) {
            firstPlatform.spring.visual.classList.remove("spring");
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
            platform.spring.visual.style.backgroundImage = 'url(images/opened-spring.png)';
            isJumping = true;
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
    springJumpAudio.play();
    upTimerId = setInterval(() => {
      doodlerBottomSpace += 30;
      doodler.style.bottom = doodlerBottomSpace + "px";
      if (doodlerBottomSpace > startPoint + 400) {
        fall();
        isJumping = false;
      }
    }, 30);
  };
  

  const jump = () => {
    clearInterval(downTimerId);
    isJumping = true;
    upTimerId = setInterval(() => {
      doodlerBottomSpace += 15;
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
