import './PhaserGame';
import './App.css';
import { setDebug, startGame, stopGame } from './PhaserGame';
import {useState} from 'react';

import useCoordinator from './coordinatorService';
import { inDevelopment } from './config';

const App = () => {
  const [debug, setDebugState] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [ checkUsername, logoutFromCoordinator, roomServers ] = useCoordinator();

  function login(username) {
    checkUsername(username).then(({invalid, roomServer, error}) => {
      if(invalid){
        alert(error);
      }else{
        setAuthenticated(true);
        setDebug(debug);
        //Hack for connecting to room servers running in docker-compose
        const roomAddr = inDevelopment ? `localhost:${roomServer.split(':').at(-1)}` : roomServer;
        console.log("joining to", roomAddr);
        startGame(roomAddr, username);
      }
    });
  }

  function logout() {
    logoutFromCoordinator();
    setAuthenticated(false);
    stopGame();
  }

  function handleToggleDebug() {
    setDebugState(!debug);
    setDebug(!debug);
  }

  return (
    <div>
      <div id="phaser-container"></div>
      <div id="ui-container">
        <h1>Room game</h1>
        {authenticated ? (
          <div>
            <button onClick={logout}>
              Logout
            </button>
            <button onClick={handleToggleDebug}>
              {debug ? "Debug on" : "Debug off"}
            </button>
          </div>
        ) : (
          <Login login={login} addresses={roomServers}/>
        )}
      </div>
    </div>
  );
}

function Login({login, addresses}) {
  const [username, setUsername] = useState("");

  function handleChange(event) {
    setUsername(event.target.value)
  }

  return (
    <div>
      <form onSubmit={e => e.preventDefault()}>
        <input value={username} onChange={handleChange} autoFocus placeholder='Your player name'/>
        <button onClick={() => login(username)}>Login</button>
      </form>
    </div>
  )
}

export default App
