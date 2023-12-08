import './PhaserGame'
import './App.css'
import { startGame, stopGame } from './PhaserGame';
import {useState} from 'react';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  function login(address, username) {
    setAuthenticated(true);
    startGame(address, username);
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
  const addresses = ["localhost:3000", "localhost:4000", "localhost:5000", "wss://hajis-room-game-withered-dream-842.fly.dev/"]
  const [serverAddress, setServerAddress] = useState(addresses[0]);

  function handleChange(event) {
    setUsername(event.target.value)
  }

  return (
    <div>
      <p>Select a server</p>
      <div>
        {addresses.map(a => (
          <p key={a}>
            <input id={a} type="radio" name="address" value={a} onChange={(e) => setServerAddress(e.target.value)} checked={serverAddress === a}/>
            <label htmlFor={a}>{a}</label>
          </p>
        ))}
      </div>
  
      <form onSubmit={e => e.preventDefault()}>
        <input value={username} onChange={handleChange} autoFocus placeholder='Your player name'/>
        <button onClick={() => login(serverAddress, username)}>Login</button>
      </form>
    </div>
  )
}

export default App
