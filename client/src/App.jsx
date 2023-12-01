import './PhaserGame'
import './App.css'
import { startGame, stopGame } from './PhaserGame';
import {useState} from 'react';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  function login(username) {
    setAuthenticated(true);
    startGame(username);
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
    <form onSubmit={e => e.preventDefault()}>
      <input value={username} onChange={handleChange} autoFocus placeholder='Your player name'/>
      <button onClick={() => login(username)}>Login</button>
    </form>    
  )
}

export default App
