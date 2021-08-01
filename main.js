"use strict";

(() => {
  const rand = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  class Ball {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.x = 30;
      this.y = 30;
      this.r = 10;
      this.vx = rand(3, 7) * (Math.random() < 0.5 ? 1 : -1);
      this.vy = rand(4, 6);
      this.isMissed = false;
    }

    getMissedStatus() {
      return this.isMissed;
    }

    speedUp() {
      this.vx += 0.1;
      this.vy += 0.1;
    }

    bounceX() {
      this.vx *= -1;
    }

    bounceY() {
      this.vy *= -1;
    }

    reposition(paddleTop) {
      this.y = paddleTop - this.r;
    }

    getX() {
      return this.x;
    }
    getY() {
      return this.y;
    }
    getR() {
      return this.r;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.y - this.r > this.canvas.height) {
        this.isMissed = true;
      }

      if (this.x < 0 + this.r || this.x > canvas.width - this.r) {
        this.vx *= -1;
      }

      if (this.y < 0 + this.r) {
        this.vy *= -1;
      }
    }

    draw() {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#fdfdfd";
      this.ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  class Paddle {
    constructor(canvas, game) {
      this.canvas = canvas;
      this.game = game;
      this.ctx = this.canvas.getContext("2d");
      this.w = 100;
      this.h = 10;
      this.x = this.canvas.width / 2 - this.w / 2;
      this.y = this.canvas.height - 32;
      this.mouseX = this.x;
      this.addHandler();
    }

    addHandler() {
      document.addEventListener("mousemove", (e) => {
        this.mouseX = e.clientX;
      });

      document.addEventListener("touchstart", (e) => {
        this.mouseX = e.changedTouches[0].pageX;
      });
      document.addEventListener("touchmove", (e) => {
        this.mouseX = e.changedTouches[0].pageX;
      });
    }

    update(ball) {
      const ballBottom = ball.getY() + ball.getR();
      const paddleTop = this.y;
      const ballTop = ball.getY() - ball.getR();
      const paddleBottom = this.y + this.h;
      const ballCenter = ball.getX();
      const paddleLeft = this.x;
      const paddleRight = this.x + this.w;

      if (
        ballBottom > paddleTop &&
        ballTop < paddleBottom &&
        ballCenter > paddleLeft &&
        ballCenter < paddleRight
      ) {
        ball.speedUp();
        ball.bounceY();
        ball.reposition(paddleTop);
        this.game.addScore();
      }
      const rect = this.canvas.getBoundingClientRect();
      this.x = this.mouseX - rect.left - this.w / 2;

      if (this.x < 0) {
        this.x = 0;
      }
      if (this.x > this.canvas.width - this.w) {
        this.x = this.canvas.width - this.w;
      }
    }

    draw() {
      this.ctx.fillStyle = "#fdfdfd";
      this.ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }

  class Hindrance {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.w = 100;
      this.h = 10;
      this.x = this.canvas.width / 2 - this.w / 2;
      this.y = 50;

      this.vx = rand(2, 5);
    }

    draw() {
      this.ctx.fillStyle = "#fd1270";
      this.ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update(ball) {
      const ballBottom = ball.getY() + ball.getR();
      const hidranceTop = this.y;
      const ballTop = ball.getY() - ball.getR();
      const hidranceBottom = this.y + this.h;
      const ballCenterX = ball.getX();
      const ballCenterY = ball.getY();
      const ballLeft = ball.getX() - ball.getR();
      const ballRight = ball.getX() + ball.getR();
      const hidranceLeft = this.x;
      const hidranceRight = this.x + this.w;

      this.x += this.vx;
      if (this.x < 0 || this.x + this.w > this.canvas.width) {
        this.vx *= -1;
      }

      if (
        ballBottom > hidranceTop &&
        ballTop < hidranceBottom &&
        ballCenterX > hidranceLeft &&
        ballCenterX < hidranceRight
      ) {
        ball.bounceY();
      }

      if (
        ballRight > hidranceLeft &&
        ballLeft < hidranceRight &&
        ballCenterY > hidranceTop &&
        ballCenterY < hidranceBottom
      ) {
        ball.bounceX();
      }

      const rect = this.canvas.getBoundingClientRect();

      if (this.x < 0) {
        this.x = 0;
      }
      if (this.x > this.canvas.width - this.w) {
        this.x = this.canvas.width - this.w;
      }
    }
  }

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.ball = new Ball(this.canvas);
      this.paddle = new Paddle(this.canvas, this);
      this.hindrance1 = new Hindrance(this.canvas, this);
      this.hindrance1.vx = 3;
      this.hindrance2 = new Hindrance(this.canvas, this);
      this.hindrance2.vx = 2;
      this.hindrance2.y = 170;
      this.loop();
      this.isGameOver = false;
      this.score = 0;
    }

    addScore() {
      this.score += 1;
      return this.score;
    }

    loop() {
      if (this.isGameOver) {
        return;
      }
      this.update();
      this.draw();

      requestAnimationFrame(() => {
        this.loop();
      });
    }

    update() {
      this.ball.update();
      this.paddle.update(this.ball);
      this.hindrance1.update(this.ball);
      this.hindrance2.update(this.ball);

      if (this.ball.getMissedStatus()) {
        this.isGameOver = true;
      }
    }

    draw() {
      if (this.isGameOver) {
        this.drawGameOver();
        this.showRetry();
        return;
      }

      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ball.draw();
      this.paddle.draw();
      this.hindrance1.draw();
      this.hindrance2.draw();
      this.drawScore();
    }

    drawGameOver() {
      this.ctx.font = '28px "Arial Black"';
      this.ctx.fillStyle = "tomato";
      this.ctx.fillText("GAME OVER", 100, 150);
    }

    drawScore() {
      this.ctx.font = "24px Arial";
      this.ctx.fillStyle = "#fdfdfd";
      this.ctx.fillText(this.score, 10, 25);
    }

    showRetry() {
      const btn = document.getElementById("js-btn");
      btn.style.display = "inline-block";
    }
  }

  const canvas = document.querySelector("canvas");
  if (typeof canvas.getContext === "undefined") {
    return;
  }

  new Game(canvas);
})();
