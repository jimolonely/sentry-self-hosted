import logo from './logo.svg';
import './App.css';
import * as Sentry from "@sentry/react";
import axios from 'axios';


function req() {
  // This will create a new Transaction for you
  const transaction = Sentry.startTransaction({ name: "访问用户" });
  // Set transaction on scope to associate with errors and get included span instrumentation
  // If there's currently an unfinished transaction, it may be dropped
  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));

  const span = transaction.startChild({
    data: {},
    op: 'http',
    description: `GET /users/2`,
  });

  try {
    axios.get(`https://jsonplaceholder.typicode.com/users/2`)
      .then(res => {
        console.log(res);
        span.setHttpStatus(res.status);
        span.setTag("http.status_code", res.status);
        span.setData("http.data", res.data);
      });
  } catch (err) {
    span.setHttpStatus(500);
  } finally {
    span.finish();
    transaction.finish();
  }
}

function req_error() {
  throw new TypeError("我错了");
}

function req_fetch() {
  fetch('https://jsonplaceholder.typicode.com/users/2')
    .then(response => response.json())
    .then(data => console.log(data));
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
          发起axios请求
        </a>
        <a
          className="App-link"
          onClick={req_error}
        >
          报错呀
        </a>
        <button
          className="App-link"
          onClick={req_fetch}
        >
          发起fetch请求
        </button>
      </header>
    </div>
  );
}

export default Sentry.withProfiler(App);
