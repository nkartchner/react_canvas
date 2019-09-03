import React from "react";
import { GameState, initMap, WALLS, Position, KEY } from "./game/Resources";
import Map from "./game/Map";
import User from "./game/User";
import Ghost from "./game/Ghost";
import "./Canvas.css";
interface PacmanState {
  gameState: GameState;
  ghosts: Ghost[];
  ghostSpecs: string[];
  eatenCount: number;
  level: number;
  tick: number;
  ghostPos: any[];
  userPos: Position;
  stateChanged: boolean;
  timerStart: number;
  lastTime: number;
  canvas: React.RefObject<HTMLCanvasElement>;
  timer: NodeJS.Timer | undefined;
  map: Map;
  user: User;
  stored: GameState;
}

export default class Pacman extends React.Component {
  static WALL = 0;
  static BISCUIT = 1;
  static EMPTY = 2;
  static BLOCK = 3;
  static PILL = 4;
  static FPS = 30;
  static MAP = initMap();
  static WALLS = WALLS;
  static Map = new Map(382 / 19);
  static User = User;

  componentDidMount = () => {
    this.init();
    document.addEventListener("keypress", e => this.keyPress(e));
    document.addEventListener("keydown", e => this.onKeyStrokeDown(e));
    this.setState({
      timer: setInterval(() => this.mainLoop(), 1000 / Pacman.FPS)
    });
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", e => this.onKeyStrokeDown(e));
    document.removeEventListener("keypress", e => this.keyPress(e));
  };

  getTick = () => {
    return this.state.tick;
  };

  setNewState = ({ ...args }) => {
    this.setState({ ...this.state, ...args });
  };

  drawScore = (text: string, position: { new: Position; old: Position }) => {
    let { map, canvas } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(
          text,
          (position.new.x / 10) * map.blockSize,
          ((position.new.y + 5) / 10) * map.blockSize
        );
      }
    }
  };

  dialog = (text: string) => {
    let { map, canvas } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFF00";
        let width = ctx.measureText(text).width,
          x = (map.width * map.blockSize - width) / 2;
        ctx.fillText(text, x, map.height * 10 + 8);
      }
    }
  };

  soundDisabled = () => {
    return localStorage["soundDisabled"] === "true";
  };

  startLevel = () => {
    let { user, ghosts, tick } = this.state;
    user.resetPosition();
    for (let i = 0; i < ghosts.length; i += 1) {
      ghosts[i].reset();
    }
    this.setNewState({
      gameState: GameState.COUNTDOWN,
      timerStart: tick,
      ghosts
    });
  };

  startNewGame = () => {
    let { user, map, canvas } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        this.setNewState({ gameState: GameState.WAITING });
        map.reset();
        map.draw(ctx);
        this.setNewState({ map, user, level: 1 });
        this.startLevel();
      }
    }
  };

  onKeyStrokeDown = (e: any) => {
    let { map, gameState, stored, canvas, user } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        if (e.keyCode === KEY.N) {
          this.startNewGame();
        } else if (e.keyCode === KEY.P && gameState === GameState.PAUSE) {
          if (ctx) map.draw(ctx);
          this.setNewState({ stored });
        } else if (e.keyCode === KEY.P) {
          stored = gameState;
          this.setNewState({ gameState: GameState.PAUSE });
          if (ctx) map.draw(ctx);
        } else if (gameState !== GameState.PAUSE) {
          return user.onKeyStrokeDown(e);
        }
      }
    }
    return false;
  };

  loseLife = () => {
    let { user } = this.state;
    this.setNewState({ gameState: GameState.WAITING });
    user.loseLife();
    if (user.getLives() > 0) {
      this.startLevel();
    }
  };

  collided = (userPos: Position, ghostPos: Position) => {
    return (
      Math.sqrt(
        Math.pow(ghostPos.x - userPos.x, 2) +
          Math.pow(ghostPos.y - userPos.y, 2)
      ) < 10
    );
  };

  drawFooter = () => {
    let { map, canvas, user, level } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        let topLeft = map.height * map.blockSize,
          textBase = topLeft + 17;
        if (ctx) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, topLeft, map.width * map.blockSize, 30);

          ctx.fillStyle = "#FFFF00";

          for (let i = 0, len = user.getLives(); i < len; i++) {
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.moveTo(
              150 + 25 * i + map.blockSize / 2,
              topLeft + 1 + map.blockSize / 2
            );

            ctx.arc(
              150 + 25 * i + map.blockSize / 2,
              topLeft + 1 + map.blockSize / 2,
              map.blockSize / 2,
              Math.PI * 0.25,
              Math.PI * 1.75,
              false
            );
            ctx.fill();
          }
        }

        ctx.fillStyle = "#FF0000";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("s", 10, textBase);

        ctx.fillStyle = "#FFFF00";
        ctx.font = "14px Calibri";
        ctx.fillText("Score: " + user.theScore(), 30, textBase);
        ctx.fillText("Level: " + level, 260, textBase);
      }
    }
  };

  redrawBlock = (pos: Position) => {
    let { map, canvas } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        if (ctx) {
          map.drawBlock(Math.floor(pos.y / 10), Math.floor(pos.x / 10), ctx);
          map.drawBlock(Math.ceil(pos.y / 10), Math.ceil(pos.x / 10), ctx);
        }
      }
    }
  };

  mainDraw = () => {
    let {
      ghostPos,
      ghosts,
      user,
      canvas,
      userPos,
      eatenCount,
      timerStart,
      tick,
      gameState
    } = this.state;
    let u, i, len, nScore;

    ghostPos = [];
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        for (i = 0, len = ghosts.length; i < len; i += 1) {
          ghostPos.push(ghosts[i].move(ctx));
        }
      }
      if(ctx) u = user.move(ctx);
      if (u) {
        for (i = 0, len = ghosts.length; i < len; i += 1) {
          this.redrawBlock(ghostPos[i].old);
        }
        this.redrawBlock(u.old);

        if (ctx) {
          for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx);
          }

          user.draw(ctx);
        }

        userPos = u.new;
      }
    } 

    for (i = 0, len = ghosts.length; i < len; i += 1) {
      if (this.collided(userPos, ghostPos[i].new)) {
        if (ghosts[i].isVunerable()) {
          ghosts[i].eat();
          eatenCount += 1;
          nScore = eatenCount * 50;
          this.drawScore(`${nScore}`, ghostPos[i]);
          user.addScore(nScore);
          timerStart = tick;
          gameState = GameState.EATEN_PAUSE;
        } else if (ghosts[i].isDangerous()) {
          timerStart = tick;
          gameState = GameState.DYING;
        }
        this.setNewState({
          ghostPos,
          ghosts,
          user,
          canvas,
          userPos,
          eatenCount,
          timerStart,
          tick,
          gameState
        });
      }
    }
  };
  mainLoop = () => {
    let {
      map,
      ghostPos,
      ghosts,
      user,
      canvas,
      userPos,
      timerStart,
      tick,
      gameState,
      stateChanged,
      lastTime
    } = this.state;
    let diff;

    if (gameState !== GameState.PAUSE) {
      this.setNewState({ tick: ++tick });
    }
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        map.drawPills(ctx);

        if (gameState === GameState.PLAYING) {
          this.mainDraw();
        } else if (gameState === GameState.WAITING && stateChanged) {
          stateChanged = false;
          map.draw(ctx);
          this.dialog("Press N to start a New game");
        } else if (
          gameState === GameState.EATEN_PAUSE &&
          tick - timerStart > Pacman.FPS / 3
        ) {
          map.draw(ctx);
          this.setNewState({ gameState: GameState.PLAYING });
        } else if (gameState === GameState.DYING) {
          if (tick - timerStart > Pacman.FPS * 2) {
            this.loseLife();
          } else {
            this.redrawBlock(userPos);
            for (let i = 0, len = ghosts.length; i < len; i += 1) {
              this.redrawBlock(ghostPos[i].old);
              ghostPos.push(ghosts[i].draw(ctx));
            }
            user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
          }
        } else if (gameState === GameState.COUNTDOWN) {
          diff = 5 + Math.floor((timerStart - tick) / Pacman.FPS);

          if (diff === 0) {
            map.draw(ctx);
            this.setNewState({ gameState: GameState.PLAYING });
          } else {
            if (diff !== lastTime) {
              lastTime = diff;
              map.draw(ctx);
              this.dialog("Starting in: " + diff);
            }
          }
        }
      }
    }

    this.drawFooter();
  };

  eatenPill = () => {
    let { ghosts, tick } = this.state;
    for (let i = 0; i < ghosts.length; i += 1) {
      ghosts[i].makeEatable();
    }
    this.setNewState({ eatenCount: 0, timerStart: tick, ghosts });
  };

  completedLevel = () => {
    let { level, map, user } = this.state;
    this.setNewState({ level: level + 1, gameState: GameState.WAITING });
    map.reset();
    user.initUser();
    this.startLevel();
  };

  keyPress = (e: KeyboardEvent) => {
    let { gameState } = this.state;
    if (e.keyCode === 92) {
      if (this.state.timer) {
        clearInterval(this.state.timer);
      }
    }
    if (gameState !== GameState.WAITING && gameState !== GameState.PAUSE) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  init = () => {
    let { ghosts, ghostSpecs, canvas, map, user } = this.state;
    if (canvas.current) {
      let ctx = canvas.current.getContext("2d");
      if (ctx) {
        let blockSize = 382 / 19;

        map = new Map(blockSize);
        user = new User(
          {
            completedLevel: this.completedLevel,
            eatenPill: this.eatenPill
          },
          map
        );
        for (const ghostColor in ghostSpecs) {
          ghosts.push(new Ghost({ getTick: this.getTick }, map, ghostColor));
        }
        if (ctx) {
          map.draw(ctx);
        }
        this.setNewState({ map, ghosts, user });
      }
    }
  };

  render() {
    return (
      <div className="wrapper">
        <canvas
          ref={this.state.canvas}
          width={(382 / 19) * 19}
          height={(382 / 19) * 22 + 30}
          className="canvas"
        />
      </div>
    );
  }
  state: PacmanState = {
    gameState: GameState.WAITING,
    ghosts: [],
    ghostSpecs: ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"],
    eatenCount: 0,
    level: 0,
    tick: 0,
    ghostPos: [],
    userPos: { x: 0, y: 0 },
    stateChanged: true,
    timerStart: 0,
    lastTime: 0,
    canvas: React.createRef<HTMLCanvasElement>(),
    timer: undefined,
    map: Pacman.Map,
    user: new User(
      {
        completedLevel: this.completedLevel,
        eatenPill: this.eatenPill
      },
      Pacman.Map
    ),
    stored: GameState.WAITING
  };
}
