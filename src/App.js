// src/App.js
import React, { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import './i18n'

// Lazy load components for better performance
const Login = React.lazy(() => import('./Pages/Auth/Login/Login'))
const Register = React.lazy(() => import('./Pages/Auth/Register/Register'))
const EditProfile = React.lazy(() => import('./Pages/Chat/EditProfile/EditProfile'))
const Chat = React.lazy(() => import('./Pages/Chat/ChatLayout'))
const Verify = React.lazy(() => import('./Pages/Auth/Verify/Verification'))
const Home = React.lazy(() => import('./Pages/Home/Home'))
const ForgotPassword = React.lazy(() => import('./Pages/Auth/PasswordChange/ForgotPassword/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./Pages/Auth/PasswordChange/ResetPassword/ResetPassword'))

// Loading component for suspense fallback
const LoadingSpinner = () => (
	<div role="status" aria-label="Loading" className="spinner-container">
		<div className="spinner"></div>
	</div>
)

const App = () => {
	const { user } = useAuth()
	const location = useLocation()
	const isHomePage = location.pathname === '/'

	useEffect(() => {
		// Handle viewport height for mobile browsers
		const setVh = () => {
			const vh = window.innerHeight * 0.01
			document.documentElement.style.setProperty('--vh', `${vh}px`)
		}

		setVh()
		window.addEventListener('resize', setVh)

		return () => window.removeEventListener('resize', setVh)
	}, [])

	// Protected route component
	const ProtectedRoute = ({ children, isVerificationRequired = true }) => {
		if (!user) return <Navigate to="/register" replace />
		if (isVerificationRequired && !user.isVerified) return <Navigate to="/verify" replace />
		return children
	}

	return (
		<HelmetProvider>
			<div className={isHomePage ? 'div-home' : 'div-main'}>
				<ToastContainer
					position="top-right"
					autoClose={5000}
					zIndex={9999}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
				<React.Suspense fallback={<LoadingSpinner />}>
					<Routes>
						{/* Public routes */}
						<Route
							path="/login"
							element={
								!user ? (
									<Login />
								) : user.isVerified ? (
									<Navigate to="/chat" replace />
								) : (
									<Navigate to="/verify" replace />
								)
							}
						/>
						<Route
							path="/register"
							element={
								!user ? (
									<Register />
								) : user.isVerified ? (
									<Navigate to="/chat" replace />
								) : (
									<Navigate to="/verify" replace />
								)
							}
						/>

						{/* Protected routes */}
						<Route
							path="/edit-profile"
							element={
								<ProtectedRoute>
									<EditProfile />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/chat"
							element={
								<ProtectedRoute>
									<Chat />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/verify"
							element={
								user ? (
									user.isVerified ? (
										<Navigate to="/chat" replace />
									) : (
										<Verify />
									)
								) : (
									<Navigate to="/register" replace />
								)
							}
						/>

						{/* Password reset routes */}
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/reset-password/:token" element={<ResetPassword />} />

						{/* Home route */}
						<Route path="/" element={<Home />} />

						{/* Catch all route */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</React.Suspense>
			</div>
		</HelmetProvider>
	)
}

export default App
