import './PhaserGame';
import './App.css';
import { startGame, stopGame } from './PhaserGame';
import {useState} from 'react';

import useCoordinator from './coordinatorService';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [ checkUsername, logoutFromCoordinator, roomServers ] = useCoordinator();

  function login(address, username) {
    console.log("joining to", address)
    checkUsername(username).then(({invalid}) => {
      if(invalid){
        alert("Username is already taken");
      }else{
        setAuthenticated(true);
        startGame(address, username);
      }
    });
  }

  function logout() {
    logoutFromCoordinator();
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
          <Login login={login} addresses={roomServers}/>
        )}
      </div>
    </div>
  );
}

function Login({login, addresses}) {
  const [username, setUsername] = useState("");
  const [serverName, setServerName] = useState("room1"); //TODO: remove hardcoded servername

  function handleChange(event) {
    setUsername(event.target.value)
  }

  return (
    <div>
      <p>Select a server</p>
      <div>
        {Object.keys(addresses).map(a => (
          <p key={a}>
            <input id={a} type="radio" name="address" value={a} onChange={(e) => setServerName(e.target.value)} checked={serverName === a}/>
            <label htmlFor={a}>{a}</label>
          </p>
        ))}
      </div>
  
      <form onSubmit={e => e.preventDefault()}>
        <input value={username} onChange={handleChange} autoFocus placeholder='Your player name'/>
        <button onClick={() => login(addresses[serverName], username)}>Login</button>
      </form>
    </div>
  )
}

export default App
