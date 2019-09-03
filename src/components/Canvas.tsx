import React from "react";
// ...
// canvas draw function
// ...
interface CanvasProps {
  height: number;
  width: number;
}

type Coordinate = {
  x: number;
  y: number;
};

const Canvas = ({ width, height }: CanvasProps) => {
  const [isPainting, setIsPainting] = React.useState(false);

  const [mousePosition, setMousePosition] = React.useState<
    Coordinate | undefined
  >(undefined);

  const paint = React.useCallback((event: MouseEvent) => {
    if(isPainting) {
      const newMousePosition = getCoordinates(event);
      if(mousePosition && newMousePosition) {
        drawLine(mousePosition, newMousePosition);
        setMousePosition(newMousePosition);
      }
    }
  }, [mousePosition, isPainting, setMousePosition])


  const drawLine = (oMousePos: Coordinate, newMousePos: Coordinate) => {
    if(!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if(ctx) {
      ctx.strokeStyle = 'red';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.moveTo(oMousePos.x, oMousePos.y)
      ctx.lineTo(newMousePos.x, newMousePos.y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  const exitPaint = React.useCallback(() => {
    setIsPainting(false);
  }, [])

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const startPaint = React.useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousedown", startPaint);
    return () => canvas.removeEventListener("mousedown", startPaint);
  }, [startPaint]);

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener("mousemove", paint);
    return () => canvas.removeEventListener("mousemove", paint);
  }, [paint]);


  React.useEffect(() => {
    if(!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);
    return () => {
      canvas.removeEventListener('mouseup', exitPaint);
      canvas.removeEventListener('mouseleave', exitPaint);
    }
    
  }, [exitPaint])

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    };
  };

  return (<canvas ref={canvasRef} height={height} width={width} />);
};

Canvas.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight
};

export default Canvas;
// import React, { Component, createRef, Ref } from "react";
// import { CanvasState } from "./Resources";
// import { Map } from "./Map";

// export default class Canvas extends Component {
//   state: CanvasState = {
//     height: 900,
//     width: 900,
//     mousePosition: {
//       x: 0,
//       y: 0
//     },
//     canvas: createRef<HTMLCanvasElement>(),
//     map: undefined
//   };

//   get ctx(): CanvasRenderingContext2D {
//     return this.state.canvas.current!.getContext("2d")!;
//   }
//   get map(): Map {
//     return this.state.map!;
//   }
//   componentDidUpdate() {}

//   componentDidMount() {
//     const blockSize = 470 / 19;
//     this.setState(
//       {
//         ...this.state,
//         width: blockSize * 19,
//         height: blockSize * 22 + 30,
//         map: new Map(blockSize)
//       },
//       () => {
//         this.map.draw(this.ctx);
//       }
//     );

//     // this.setState({
//     //   ...this.state,
//     //   width: blockSize * 19,
//     //   height: blockSize * 22 + 30
//     // });
//     // this.start();
//   }
//   calculateMouseRelativePosition(e: MouseEvent) {
//     const { mousePosition, canvas } = this.state;

//     if (canvas) {
//       mousePosition.x =
//         e.clientX +
//         (document.documentElement.scrollLeft || document.body.scrollLeft) -
//         canvas.current!.offsetLeft;
//       mousePosition.y =
//         e.clientY +
//         (document.documentElement.scrollLeft || document.body.scrollLeft) -
//         canvas.current!.offsetTop;
//     }
//   }

//   render() {
//     const { height, width, canvas } = this.state;
//     return (
//       <canvas ref={canvas} height={height} width={width} className="canvas" />
//     );
//   }
// }
