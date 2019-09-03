import { KEY, KeyCode, Position } from "./Resources";
import Map from "./Map";
import Pacman from "../Pacman";

interface UserState {
  position: {
    x: number;
    y: number;
  };
  direction: number;
  eaten: number;
  due: number;
  lives: number;
  score: number;
  map: Map | undefined;
  keyMap: { [key: number]: number };
  game: { completedLevel: Function; eatenPill: Function };
}

export default class User {
  state: UserState = {
    position: {
      x: 90,
      y: 120
    },
    direction: 0,
    eaten: 0,
    due: 0,
    lives: 0,
    score: 5,
    map: undefined,
    keyMap: {},
    game: { completedLevel: function() {}, eatenPill: function() {} }
  };

  constructor(game: { completedLevel: any; eatenPill: any }, map: Map) {
    this.state.game = game;
    this.state.map = map;
    this.state.keyMap = {
      [KEY.ARROW_LEFT]: KeyCode.LEFT,
      [KEY.ARROW_UP]: KeyCode.UP,
      [KEY.ARROW_RIGHT]: KeyCode.RIGHT,
      [KEY.ARROW_DOWN]: KeyCode.DOWN
    };
    this.initUser();
  }

  getLives = () => {
    return this.state.lives;
  };
  setState({ ...args }) {
    this.state = { ...this.state, ...args };
  }
  theScore = () => {
    return this.state.score;
  };

  addScore(nScore: number) {
    let { lives, score } = this.state;
    score += nScore;
    if (score >= 10000 && score - nScore < 10000) {
      lives += 1;
    }
    this.setState({ score, lives });
  }

  loseLife = () => {
    let { lives } = this.state;
    lives += 1;
    this.setState({ lives });
  };

  newLevel = () => {
    this.resetPosition();
    this.setState({ eaten: 0 });
  };

  resetPosition = () => {
    this.setState({
      position: { x: 90, y: 120 },
      direction: KeyCode.LEFT,
      due: KeyCode.LEFT
    });
  };

  onKeyStrokeDown = (e: KeyboardEvent) => {
    if (typeof this.state.keyMap[e.keyCode] !== "undefined") {
      this.setState({ due: this.state.keyMap[e.keyCode] });
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  };

  getNewCoord = (dir: number, current: Position) => {
    return {
      x:
        current.x +
        ((dir === KeyCode.LEFT && -2) || (dir === KeyCode.RIGHT && 2) || 0),
      y:
        current.y +
        ((dir === KeyCode.DOWN && 2) || (dir === KeyCode.UP && -2) || 0)
    };
  };

  onWholeSquare = (x: number) => {
    return x % 10 === 0;
  };

  pointToCoord = (x: number) => {
    return Math.round(x / 10);
  };

  nextSquare = (x: number, dir: number) => {
    var rem = x % 10;
    if (rem === 0) {
      return x;
    } else if (dir === KeyCode.RIGHT || dir === KeyCode.DOWN) {
      return x + (10 - rem);
    } else {
      return x - rem;
    }
  };

  next = (pos: Position, dir: number) => {
    return {
      y: this.pointToCoord(this.nextSquare(pos.y, dir)),
      x: this.pointToCoord(this.nextSquare(pos.x, dir))
    };
  };

  onGridSquare = (pos: Position) => {
    return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
  };

  isOnSamePlane = (due: number, dir: number) => {
    return (
      ((due === KeyCode.LEFT || due === KeyCode.RIGHT) &&
        (dir === KeyCode.LEFT || dir === KeyCode.RIGHT)) ||
      ((due === KeyCode.UP || due === KeyCode.DOWN) &&
        (dir === KeyCode.UP || dir === KeyCode.DOWN))
    );
  };

  move = (
    ctx: CanvasRenderingContext2D
  ): { new: Position; old: Position } | null => {
    let { position, due, map, direction, game, eaten } = this.state;

    if (!map) {
      console.log("there is no map, so returning");
      return null;
    }
    let npos = null;
    let nextWhole = null;
    let oldPosition = position;
    let block = null;
    if (due !== direction) {
      npos = this.getNewCoord(due, position);

      if (
        this.isOnSamePlane(due, direction) ||
        (this.onGridSquare(position) && map.isFloorSpace(this.next(npos, due)))
      ) {
        direction = due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = this.getNewCoord(direction, position);
    }

    if (
      this.onGridSquare(position) &&
      map.isWallSpace(this.next(npos, direction))
    ) {
      direction = KeyCode.NONE;
    }

    if (direction === KeyCode.NONE) {
      return { new: position, old: position };
    }

    if (npos.y === 100 && npos.x >= 190 && direction === KeyCode.RIGHT) {
      npos = { y: 100, x: -10 };
    }

    if (npos.y === 100 && npos.x <= -12 && direction === KeyCode.LEFT) {
      npos = { y: 100, x: 190 };
    }

    position = npos;
    nextWhole = this.next(position, direction);

    block = map.block(nextWhole);

    if (
      ((this.isMidSquare(position.y) || this.isMidSquare(position.x)) &&
        block === Pacman.BISCUIT) ||
      block === Pacman.PILL
    ) {
      map.setBlock(nextWhole, Pacman.EMPTY);
      this.addScore(block === Pacman.BISCUIT ? 10 : 50);
      eaten += 1;

      if (eaten === 182) {
        game.completedLevel();
      }

      if (block === Pacman.PILL) {
        game.eatenPill();
      }
    }
    this.setState({ position, due, map, direction, game, eaten });
    return {
      new: position,
      old: oldPosition
    };
  };

  isMidSquare = (x: number) => {
    var rem = x % 10;
    return rem > 3 || rem < 7;
  };

  calcAngle = (dir: number, pos: Position) => {
    if (dir === KeyCode.RIGHT && pos.x % 10 < 5) {
      return { start: 0.25, end: 1.75, direction: false };
    } else if (dir === KeyCode.DOWN && pos.y % 10 < 5) {
      return { start: 0.75, end: 2.25, direction: false };
    } else if (dir === KeyCode.UP && pos.y % 10 < 5) {
      return { start: 1.25, end: 1.75, direction: true };
    } else if (dir === KeyCode.LEFT && pos.x % 10 < 5) {
      return { start: 0.75, end: 1.25, direction: true };
    }
    return { start: 0, end: 2, direction: false };
  };

  drawDead = (ctx: CanvasRenderingContext2D, amount: number) => {
    const { map } = this.state;
    if (!map) return;
    var size = map.blockSize,
      half = size / 2;

    if (amount >= 1) {
      return;
    }

    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.moveTo(
      (this.state.position.x / 10) * size + half,
      (this.state.position.y / 10) * size + half
    );

    ctx.arc(
      (this.state.position.x / 10) * size + half,
      (this.state.position.y / 10) * size + half,
      half,
      0,
      Math.PI * 2 * amount,
      true
    );

    ctx.fill();
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    const { map } = this.state;
    if (!map) return;
    let s = map.blockSize;
    let angle = this.calcAngle(this.state.direction, this.state.position);

    ctx.fillStyle = "#FFFF00";

    ctx.beginPath();

    ctx.moveTo(
      (this.state.position.x / 10) * s + s / 2,
      (this.state.position.y / 10) * s + s / 2
    );

    ctx.arc(
      (this.state.position.x / 10) * s + s / 2,
      (this.state.position.y / 10) * s + s / 2,
      s / 2,
      Math.PI * angle.start,
      Math.PI * angle.end,
      angle.direction
    );

    ctx.fill();
  };

  initUser = () => {
    this.setState({ score: 0, lives: 3 });
    this.newLevel();
  };
}
