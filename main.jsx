import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter as Router} from "react-router-dom"
import App from './App.jsx'
import { App as AntdApp } from 'antd';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntdApp>
      <Router>
          <App/>
      </Router>
    </AntdApp>
  </StrictMode>,
)
