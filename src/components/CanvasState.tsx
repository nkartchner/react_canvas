import { RefObject } from "react";
import { Map } from "./Map";
export interface CanvasState {
  height: number;
  width: number;
  mousePosition: {
    x: number;
    y: number;
  };
  canvas: RefObject<HTMLCanvasElement>;
  interval?: NodeJS.Timeout;
  map: undefined | Map;
}
