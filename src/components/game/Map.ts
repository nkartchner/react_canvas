import { WALLS, initMap } from "./Resources";
import Pacman from "../Pacman";

export default class Map {
  blockSize: number;
  height: number = 0;
  width: number = 0;
  pillSize = 0;
  map: Array<number[]> = [];
  constructor(size: number) {
    this.blockSize = size;
    this.reset();
  }
  reset() {
    this.map = initMap();
    this.height = this.map.length;
    this.width = this.map[0].length;
  }
  withinBounds = (y: number, x: number) => {
    return y >= 0 && y < this.height && x >= 0 && x < this.width;
  };
  isWallSpace = (pos: { x: number; y: number }) => {
    return (
      this.withinBounds(pos.y, pos.x) && this.map[pos.y][pos.x] === Pacman.WALL
    );
  };
  isFloorSpace = (pos: { x: number; y: number }) => {
    if (!this.withinBounds(pos.y, pos.x)) {
      return false;
    }
    const peice = this.map[pos.y][pos.x];
    return peice === Pacman.EMPTY || peice === Pacman.BISCUIT || peice === Pacman.PILL;
  };
  drawPills = (ctx: CanvasRenderingContext2D) => {
    if (++this.pillSize > 30) {
      this.pillSize = 0;
    }
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.map[i][j] === Pacman.PILL) {
          ctx.beginPath();
          ctx.fillStyle = "#000";
          ctx.fillRect(
            j * this.blockSize,
            i * this.blockSize,
            this.blockSize,
            this.blockSize
          );
          ctx.fillStyle = "#FFF";
          ctx.arc(
            j * this.blockSize + this.blockSize / 2,
            i * this.blockSize + this.blockSize / 2,
            Math.abs(5 - this.pillSize / 3),
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };
  draw = (ctx: CanvasRenderingContext2D) => {
    let size = this.blockSize;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.width * size, this.height * size);
    this.drawWall(ctx);
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        this.drawBlock(i, j, ctx);
      }
    }
  };
  drawWall = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (const thing of WALLS) {
      ctx.beginPath();
      for (const t2 of thing) {
        if (t2.move) {
          ctx.moveTo(t2.move[0] * this.blockSize, t2.move[1] * this.blockSize);
        } else if (t2.line) {
          ctx.lineTo(t2.line[0] * this.blockSize, t2.line[1] * this.blockSize);
        } else if (t2.curve) {
          ctx.quadraticCurveTo(
            t2.curve[0] * this.blockSize,
            t2.curve[1] * this.blockSize,
            t2.curve[2] * this.blockSize,
            t2.curve[3] * this.blockSize
          );
        }
      }
      ctx.stroke();
    }
  };
  drawBlock = (i: number, j: number, ctx: CanvasRenderingContext2D) => {
    const layout = this.map[i][j];
    if (layout === Pacman.PILL) {
      return;
    }
    ctx.beginPath();
    if (
      layout === Pacman.BISCUIT ||
      layout === Pacman.BLOCK ||
      layout === Pacman.EMPTY
    ) {
      ctx.fillStyle = "#000";
      ctx.fillRect(
        j * this.blockSize,
        i * this.blockSize,
        this.blockSize,
        this.blockSize
      );
      if (layout === Pacman.BISCUIT) {
        ctx.fillStyle = "#FFF";
        ctx.fillRect(
          j * this.blockSize + this.blockSize / 2.5,
          i * this.blockSize + this.blockSize / 2.5,
          this.blockSize / 6,
          this.blockSize / 6
        );
      }
    }
    ctx.closePath();
  };
  block(pos: { x: number; y: number }) {
    return this.map[pos.y][pos.x];
  }
  setBlock(pos: { x: number; y: number }, type: any) {
    this.map[pos.y][pos.x] = type;
  }
}
