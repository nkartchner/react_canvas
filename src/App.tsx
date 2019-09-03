import React from "react";
import "./App.css";
import Pacman from "./components/Pacman";

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <div className="App">
          <Pacman />
      </div>
    </React.StrictMode>
  );
};

export default App;