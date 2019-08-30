import React from "react";
import "./App.css";
import Canvas from "./components/Canvas";

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <div className="App">
        <Canvas />
      </div>
    </React.StrictMode>
  );
};

export default App;

{/* <header className="App-header">
<img src={logo} className="App-logo" alt="logo" />
<p>
  Edit <code>src/App.tsx</code> and save to reload.
</p>
<a
  className="App-link"
  href="https://reactjs.org"
  target="_blank"
  rel="noopener noreferrer"
>
  Learn React
</a>
</header> */}