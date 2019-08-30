export default class Game {
  state = State.WAITING;
  constructor() {}
}

enum State {
  WAITING,
  PAUSE,
  stores,
  COUNTDOWN
}
