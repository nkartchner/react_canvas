import React, { Component, createRef, Ref } from "react";
import { CanvasState } from "./CanvasState";
import { Map } from "./Map";

export default class Canvas extends Component {
  state: CanvasState = {
    height: 900,
    width: 900,
    mousePosition: {
      x: 0,
      y: 0
    },
    canvas: createRef<HTMLCanvasElement>(),
    map: undefined
  };

  get ctx(): CanvasRenderingContext2D {
    return this.state.canvas.current!.getContext("2d")!;
  }
  get map(): Map {
    return this.state.map!;
  }
  componentDidUpdate() {}

  componentDidMount() {
    const blockSize = 470 / 19;
    this.setState(
      {
        ...this.state,
        width: blockSize * 19,
        height: blockSize * 22 + 30,
        map: new Map(blockSize)
      },
      () => {
        this.map.draw(this.ctx);
      }
    );

    // this.setState({
    //   ...this.state,
    //   width: blockSize * 19,
    //   height: blockSize * 22 + 30
    // });
    // this.start();
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
  // updateGameArea() {
  //   this.clear();
  //   this.update();
  // }
  // clear() {
  //   const { width, height } = this.state;
  //   this.ctx.clearRect(0, 0, width, height);
  // }
  // update() {
  //   console.log("updateing");
  //   this.ctx.fillStyle = "blue";
  //   this.ctx.fillRect(450, 450, 200, 200);
  // }
  // start() {
  //   console.log("starting");
  //   const interval = setInterval(() => this.updateGameArea, 20);
  //   this.setState({ ...this.state, interval });
  // }

  render() {
    const { height, width, canvas } = this.state;
    return (
      <canvas ref={canvas} height={height} width={width} className="canvas" />
    );
  }
}
