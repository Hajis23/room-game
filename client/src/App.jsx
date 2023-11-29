import './PhaserGame'
import './App.css'
import {useState} from 'react';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  function login() {
    setAuthenticated(true);
  }

  function logout() {
    setAuthenticated(false);
  }

  if (authenticated) {
    return (
      <div>
        <div id="phaser-container"></div>
        <div id="ui-container">
          <h1>Room game</h1>
          <button onClick={logout}>
            Logout
          </button>  
        </div>
      </div>
    );
  }

  return (
    <Login login={login}>
    </Login>
  )
}

function Login({login}) {
  return (
    <div>
      <input>
      </input>
      <button onClick={login}>Login</button>
    </div>    
  )
}

export default App
