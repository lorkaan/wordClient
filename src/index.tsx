import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Tags } from './objs/Tag';
import { Words } from './objs/Word';
import LoginForm from './forms/LoginForm';
import './App.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// This is here to lock the testing into data that belongs to a safe test domain.
const domain: string = "https://www-spellinblox-info.filesusr.com/";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginForm login_url="login" domain={domain}/>
  },
  {
    path: "/tags",
    element: <Tags url="api/tags" />
  },
  {
    path: "/words",
    element: <Words url="api/words" domain={domain}/>
  }
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
