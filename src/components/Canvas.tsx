import React, { Component, createRef, Ref, RefObject } from "react";

interface CanvasState {
  height: number;
  width: number;
  mousePosition: {
    x: number;
    y: number;
  };
  canvas: RefObject<HTMLCanvasElement>;
  interval?: NodeJS.Timeout;
}

class Canvas extends Component {
  state: CanvasState = {
    height: 900,
    width: 900,
    mousePosition: {
      x: 0,
      y: 0
    },
    canvas: createRef<HTMLCanvasElement>()
  };

  get ctx(): CanvasRenderingContext2D {
    return this.state.canvas.current!.getContext("2d")!;
  }
  componentDidUpdate() {
    // Draws a square in the middle of the canvas rotated
    // around the centre by this.props.angle
    // const canvas = this.state.canvas.current!;
    // const ctx = canvas.getContext('2d')!;
    // const width = canvas.width;
    // const height = canvas.height;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.clearRect(0, 0, this.state.width, this.state.height);
    this.ctx.translate(this.state.width / 2, this.state.height / 2);
    this.ctx.rotate((0 * Math.PI) / 180);
    this.ctx.fillStyle = "#4397AC";
    this.ctx.fillRect(
      -this.state.width / 4,
      -this.state.height / 4,
      this.state.width / 2,
      this.state.height / 2
    );
    this.ctx.restore();
  }

  componentDidMount() {
    this.start();
  }
  calculateMouseRelativePosition(e: MouseEvent) {
    const { mousePosition, canvas } = this.state;

    if (canvas) {
      mousePosition.x =
        e.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft) -
        canvas.current!.offsetLeft;
      mousePosition.y =
        e.clientY +
        (document.documentElement.scrollLeft || document.body.scrollLeft) -
        canvas.current!.offsetTop;
    }
  }
  updateGameArea() {
    this.clear();
    this.update();
  }
  clear() {
    const { width, height } = this.state;
    this.ctx.clearRect(0, 0, width, height);
  }
  update() {
    console.log("updateing");
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(450, 450, 200, 200);
  }
  start() {
    console.log("starting");
    const interval = setInterval(() => this.updateGameArea, 20);
    this.setState({ ...this.state, interval });
  }
  render() {
    const { height, width, canvas } = this.state;
    return (
      <canvas
        ref={canvas}
        height={height}
        width={width}
        className="canvas"
      ></canvas>
    );
  }
}

export default Canvas;
