import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './App.css'

ReactDOM.render(
	<React.StrictMode>
		<Router>
			<AuthProvider>
				<App />
			</AuthProvider>
		</Router>
	</React.StrictMode>,
	document.getElementById('root')
)
