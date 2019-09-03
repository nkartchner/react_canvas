import { KeyCode, Position } from "./Resources";
import Pacman from "../Pacman";

interface GhostState {}

export default class Ghost {
  position = { x: 0, y: 0 };
  game: any;
  map: any;
  colour: any;
  direction = 0;
  eatable: number | null = null;
  eaten: number | null = null;
  due = 0;
  constructor(game: { getTick: Function }, map: any, colour: string) {
    this.game = { getTick: game.getTick };
    this.colour = colour;
    this.map = map;
  }

  getNewCoord = (dir: number, current: Position) => {
    let speed = this.isVunerable() ? 1 : this.isHidden() ? 4 : 2,
      xSpeed =
        (dir === KeyCode.LEFT && -speed) ||
        (dir === KeyCode.RIGHT && speed) ||
        0,
      ySpeed =
        (dir === KeyCode.DOWN && speed) || (dir === KeyCode.UP && -speed) || 0;
    return {
      x: this.addBounded(current.x, xSpeed),
      y: this.addBounded(current.y, ySpeed)
    };
  };

  /* Collision detection(walls) is done when a ghost lands on an
   * exact block, make sure they dont skip over it
   */
  addBounded = (x1: number, x2: number) => {
    let rem = x1 % 10,
      result = rem + x2;
    if (rem !== 0 && result > 10) {
      return x1 + (10 - rem);
    } else if (rem > 0 && result < 0) {
      return x1 - rem;
    }
    return x1 + x2;
  };

  isVunerable = () => {
    return this.eatable !== null;
  };

  isDangerous = () => {
    return this.eaten === null;
  };

  isHidden = () => {
    return this.eatable === null && this.eaten !== null;
  };

  getRandomDirection = () => {
    let moves =
      this.direction === KeyCode.LEFT || this.direction === KeyCode.RIGHT
        ? [KeyCode.UP, KeyCode.DOWN]
        : [KeyCode.LEFT, KeyCode.RIGHT];
    return moves[Math.floor(Math.random() * 2)];
  };

  reset = () => {
    this.eaten = null;
    this.eatable = null;
    this.position = { x: 90, y: 80 };
    this.direction = this.getRandomDirection();
    this.due = this.getRandomDirection();
  };

  onWholeSquare = (x: number) => {
    return x % 10 === 0;
  };

  oppositeDirection = (dir: number) => {
    return (
      (dir === KeyCode.LEFT && KeyCode.RIGHT) ||
      (dir === KeyCode.RIGHT && KeyCode.LEFT) ||
      (dir === KeyCode.UP && KeyCode.DOWN) ||
      KeyCode.UP
    );
  };

  makeEatable = () => {
    this.direction = this.oppositeDirection(this.direction);
    this.eatable = this.game.getTick();
  };

  eat = () => {
    this.eatable = null;
    this.eaten = this.game.getTick();
  };

  pointToCoord = (x: number) => {
    return Math.round(x / 10);
  };

  nextSquare = (x: number, dir: number) => {
    let rem = x % 10;
    if (rem === 0) {
      return x;
    } else if (dir === KeyCode.RIGHT || dir === KeyCode.DOWN) {
      return x + (10 - rem);
    } else {
      return x - rem;
    }
  };

  onGridSquare = (pos: Position) => {
    return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
  };

  secondsAgo = (tick: any) => {
    return (this.game.getTick() - tick) / Pacman.FPS;
  };

  getColour = () => {
    if (this.eatable) {
      if (this.secondsAgo(this.eatable) > 5) {
        return this.game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
      } else {
        return "#0000BB";
      }
    } else if (this.eaten) {
      return "#222";
    }
    return this.colour;
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    let s = this.map.blockSize,
      top = (this.position.y / 10) * s,
      left = (this.position.x / 10) * s;
    if (this.eatable && this.secondsAgo(this.eatable) > 8) {
      this.eatable = null;
    }

    if (this.eaten && this.secondsAgo(this.eaten) > 3) {
      this.eaten = null;
    }

    let tl = left + s;
    let base = top + s - 3;
    let inc = s / 10;

    let high = this.game.getTick() % 10 > 5 ? 3 : -3;
    let low = this.game.getTick() % 10 > 5 ? -3 : 3;

    ctx.fillStyle = this.getColour();
    ctx.beginPath();

    ctx.moveTo(left, base);

    ctx.quadraticCurveTo(left, top, left + s / 2, top);
    ctx.quadraticCurveTo(left + s, top, left + s, base);

    // Wavy things at the bottom
    ctx.quadraticCurveTo(tl - inc * 1, base + high, tl - inc * 2, base);
    ctx.quadraticCurveTo(tl - inc * 3, base + low, tl - inc * 4, base);
    ctx.quadraticCurveTo(tl - inc * 5, base + high, tl - inc * 6, base);
    ctx.quadraticCurveTo(tl - inc * 7, base + low, tl - inc * 8, base);
    ctx.quadraticCurveTo(tl - inc * 9, base + high, tl - inc * 10, base);

    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#FFF";
    ctx.arc(left + 6, top + 6, s / 6, 0, 300, false);
    ctx.arc(left + s - 6, top + 6, s / 6, 0, 300, false);
    ctx.closePath();
    ctx.fill();

    let f = s / 12;
    let off: any = {};
    off[KeyCode.RIGHT] = [f, 0];
    off[KeyCode.LEFT] = [-f, 0];
    off[KeyCode.UP] = [0, -f];
    off[KeyCode.DOWN] = [0, f];

    ctx.beginPath();
    ctx.fillStyle = "#000";
    ctx.arc(
      left + 6 + off[this.direction][0],
      top + 6 + off[this.direction][1],
      s / 15,
      0,
      300,
      false
    );
    ctx.arc(
      left + s - 6 + off[this.direction][0],
      top + 6 + off[this.direction][1],
      s / 15,
      0,
      300,
      false
    );
    ctx.closePath();
    ctx.fill();
  };

  pane = (pos: Position) => {
    if (pos.y === 100 && pos.x >= 190 && this.direction === KeyCode.RIGHT) {
      return { y: 100, x: -10 };
    }

    if (pos.y === 100 && pos.x <= -10 && this.direction === KeyCode.LEFT) {
      return (this.position = { y: 100, x: 190 });
    }

    return false;
  };

  move = (ctx: CanvasRenderingContext2D): { new: Position; old: Position } => {
    let oldPos = this.position,
      onGrid = this.onGridSquare(this.position),
      npos = null;

    if (this.due !== this.direction) {
      npos = this.getNewCoord(this.due, this.position);

      if (
        onGrid &&
        this.map.isFloorSpace({
          y: this.pointToCoord(this.nextSquare(npos.y, this.due)),
          x: this.pointToCoord(this.nextSquare(npos.x, this.due))
        })
      ) {
        this.direction = this.due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = this.getNewCoord(this.direction, this.position);
    }

    if (
      onGrid &&
      this.map.isWallSpace({
        y: this.pointToCoord(this.nextSquare(npos.y, this.direction)),
        x: this.pointToCoord(this.nextSquare(npos.x, this.direction))
      })
    ) {
      this.due = this.getRandomDirection();
      return this.move(ctx);
    }

    this.position = npos;

    let tmp = this.pane(this.position);
    if (tmp) {
      this.position = tmp;
    }

    this.due = this.getRandomDirection();

    return {
      new: this.position,
      old: oldPos
    };
  };
}
