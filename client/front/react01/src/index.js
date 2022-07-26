import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from './App';
import reportWebVitals from './reportWebVitals';

Sentry.init({
//  dsn: "http://b1d7cdaa0b5e4372b73075f09998b96d@localhost:9000/3",
  dsn: "http://d4b982b72b3b4f379236e74e42de38f8@172.18.0.2:3000/2",
  integrations: [new BrowserTracing({
    tracingOrigins: ["jsonplaceholder.typicode.com", "localhost"],
  })],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
