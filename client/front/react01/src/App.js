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
