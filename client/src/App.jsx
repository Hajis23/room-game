import './PhaserGame'
import './App.css'
import {useState} from 'react';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  function login(username) {
    setAuthenticated(true);
    alert(username)
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
