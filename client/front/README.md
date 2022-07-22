

# react

install
```shell
# Using yarn
yarn add @sentry/react @sentry/tracing

# Using npm
npm install --save @sentry/react @sentry/tracing
```
usage

```js
import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from "./App";

Sentry.init({
  dsn: "http://b1d7cdaa0b5e4372b73075f09998b96d@localhost:9000/3",
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

ReactDOM.render(<App />, document.getElementById("root"));

// Can also use with React Concurrent Mode
// ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

enable trace

```js
import * as Sentry from "@sentry/react";

export default Sentry.withProfiler(App);
```

use axios

```shell
$ npm install axios
```

# 手动监控HTTP请求

[https://docs.sentry.io/platforms/javascript/performance/instrumentation/custom-instrumentation/](https://docs.sentry.io/platforms/javascript/performance/instrumentation/custom-instrumentation/)

```js
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
```





