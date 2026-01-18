import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as Parse from 'parse';

// Initialize Parse SDK for Back4App connectivity
// App ID and JS Key are typically identical in this project's configuration
const APP_ID = "1718ba2cb62b5f786d8b658a4aa83530c859c408";
const JS_KEY = "1718ba2cb62b5f786d8b658a4aa83530c859c408";

try {
  // Use Parse.default if available (common in some ESM bundles), otherwise Parse itself
  const ParseObj = (Parse as any).default || Parse;
  ParseObj.initialize(APP_ID, JS_KEY);
  ParseObj.serverURL = "https://parseapi.back4app.com/";
  console.log("ExamPro: Parse Backend Initialized Successfully");
} catch (err) {
  console.error("ExamPro: Parse Initialization Failed", err);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);