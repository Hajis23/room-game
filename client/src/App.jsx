import './PhaserGame'
import './App.css'
import { startGame, stopGame } from './PhaserGame';
import {useState} from 'react';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  function login(username) {
    setAuthenticated(true);
    startGame(username);
    alert(username)
  }

  function logout() {
    setAuthenticated(false);
    stopGame();
  }

  return (
    <div>
      <div id="phaser-container"></div>
      <div id="ui-container">
        <h1>Room game</h1>
        {authenticated ? (
        <button onClick={logout}>
          Logout
        </button>
        ) : (
          <Login login={login}/>
        )}
      </div>
    </div>
  );
}

function Login({login}) {
  const [username, setUsername] = useState("");

  function handleChange(event) {
    setUsername(event.target.value)
    
  }  
  return (
    <div>
      <input value={username} onChange={handleChange}>
        
      </input>
      <button onClick={() => login(username)}>Login</button>
    </div>    
  )
}

export default App
