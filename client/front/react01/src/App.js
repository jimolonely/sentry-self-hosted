import logo from './logo.svg';
import './App.css';
import * as Sentry from "@sentry/react";
import axios from 'axios';


function req() {
  axios.get(`https://jsonplaceholder.typicode.com/users/2`)
    .then(res => {
      console.log(res);
    })
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          onClick={req}
        >
          发起请求
        </a>
      </header>
    </div>
  );
}

export default Sentry.withProfiler(App);
