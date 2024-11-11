// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import i18n from '../i18n' // Import pliku i18n

const AuthContext = createContext()
axios.defaults.withCredentials = true

const axiosInstance = axios.create({
	baseURL: `https://findalike.me/api`,
	withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

// Add debounce utility at the top
const debounce = (func, wait) => {
	let timeout
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout)
			func(...args)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
	}
}

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [accessTokenExpiration, setAccessTokenExpiration] = useState(null)
	const navigate = useNavigate()
	const [isLoggingOut, setIsLoggingOut] = useState(false) // Nowa flaga
	const [validationState, setValidationState] = useState({
		username: { isValid: true, message: '' },
		email: { isValid: true, message: '' },
	})

	// Debounced validation functions
	const debouncedUsernameCheck = React.useCallback(
		debounce(async username => {
			try {
				if (username.length < 3) {
					setValidationState(prev => ({
						...prev,
						username: { isValid: false, message: 'Username must be at least 3 characters' },
					}))
					return
				}
				const isAvailable = await checkUsernameAvailability(username)
				setValidationState(prev => ({
					...prev,
					username: {
						isValid: isAvailable,
						message: isAvailable ? '' : 'Username is already taken',
					},
				}))
			} catch (error) {
				setValidationState(prev => ({
					...prev,
					username: { isValid: false, message: 'Error checking username' },
				}))
			}
		}, 500),
		[]
	)

	const debouncedEmailCheck = React.useCallback(
		debounce(async email => {
			try {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(email)) {
					setValidationState(prev => ({
						...prev,
						email: { isValid: false, message: 'Invalid email format' },
					}))
					return
				}
				const isAvailable = await checkEmailAvailability(email)
				setValidationState(prev => ({
					...prev,
					email: {
						isValid: isAvailable,
						message: isAvailable ? '' : 'Email is already registered',
					},
				}))
			} catch (error) {
				setValidationState(prev => ({
					...prev,
					email: { isValid: false, message: 'Error checking email' },
				}))
			}
		}, 500),
		[]
	)

	useEffect(() => {
		const userInfo = localStorage.getItem('userInfo')
		if (userInfo) {
			const parsedUserInfo = JSON.parse(userInfo)
			setUser(parsedUserInfo)
			setAccessTokenExpiration(parsedUserInfo.accessTokenExpiration)
			// Ustawienie języka i18n na podstawie preferencji użytkownika
			i18n.changeLanguage(parsedUserInfo.language || 'en')
		}
	}, [])

	const logoutAndRedirect = () => {
		if (isLoggingOut) return // Zapobiega wielokrotnemu wywoływaniu

		setIsLoggingOut(true)
		const userInfo = JSON.parse(localStorage.getItem('userInfo'))
		if (!userInfo) {
			setUser(null)
			setAccessTokenExpiration(null)
			localStorage.removeItem('userInfo')
			i18n.changeLanguage('en') // Resetowanie języka do domyślnego
			setIsLoggingOut(false)
			return
		}

		axiosInstance
			.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${userInfo.token}` } })
			.catch(error => {
				if (process.env.NODE_ENV !== 'production') {
					console.error('Błąd podczas wylogowywania:', error.response?.data || error.message)
				}
			})
			.finally(() => {
				setUser(null)
				setAccessTokenExpiration(null)
				localStorage.removeItem('userInfo')
				i18n.changeLanguage('en') // Resetowanie języka do domyślnego
				setIsLoggingOut(false)
			})
	}

	const login = async (email, password) => {
		try {
			const { data } = await axiosInstance.post('/auth/login', { email, password })
			setUser(data)
			setAccessTokenExpiration(data.accessTokenExpiration)
			localStorage.setItem('userInfo', JSON.stringify(data))
			// Ustawienie języka i18n na podstawie preferencji użytkownika
			i18n.changeLanguage(data.language || 'en')
			navigate(data.isVerified ? '/chat' : '/verify')
		} catch (error) {
			if (
				error.response &&
				error.response.status === 400 &&
				error.response.data.message === 'Niepoprawny email lub hasło'
			) {
				throw new Error('Nieprawidłowy email lub hasło')
			} else {
				throw new Error('Wystąpił problem. Spróbuj ponownie później.')
			}
		}
	}

	const register = async (name, email, password, profilePicture = null, language = 'en') => {
		try {
			// Check final validation state before proceeding
			if (!validationState.username.isValid || !validationState.email.isValid) {
				throw new Error('Please fix validation errors before submitting')
			}

			const { data } = await axiosInstance.post('/auth/register', {
				name,
				email,
				password,
				profilePicture,
				language,
			})
			setUser(data)
			setAccessTokenExpiration(data.accessTokenExpiration)
			localStorage.setItem('userInfo', JSON.stringify(data))
			i18n.changeLanguage(data.language || 'en')
			navigate(data.isVerified ? '/chat' : '/verify')
		} catch (error) {
			console.error('Registration error:', error.response?.data || error.message)
			throw new Error(error.response?.data?.message || 'Registration failed. Please try again.')
		}
	}

	const logout = () => {
		logoutAndRedirect()
	}

	const refreshTokenFunc = async () => {
		const userInfo = JSON.parse(localStorage.getItem('userInfo'))
		const userId = userInfo ? userInfo._id : null
		if (userId) {
			try {
				const { data } = await axiosInstance.post('/auth/refresh-token', { userId }, { withCredentials: true })
				if (data.message === 'invalid_refresh_token') {
					logoutAndRedirect()
				} else {
					setAccessTokenExpiration(data.accessTokenExpiration)
					const updatedUserInfo = { ...userInfo, accessTokenExpiration: data.accessTokenExpiration }
					localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
					// Aktualizacja języka i18n
					i18n.changeLanguage(updatedUserInfo.language || 'en')
				}
			} catch (refreshError) {
				logoutAndRedirect()
			}
		} else {
			logoutAndRedirect()
		}
	}

	const refreshAuthLogic = async (failedRequest, userId) => {
		try {
			const { data } = await axiosInstance.post('/auth/refresh-token', { userId }, { withCredentials: true })

			if (data.message === 'invalid_refresh_token') {
				logoutAndRedirect()
				return Promise.reject(
					new Error('Użytkownik został wylogowany z powodu braku lub nieważnego tokenu odświeżania.')
				)
			}

			setAccessTokenExpiration(data.accessTokenExpiration)
			const userInfo = JSON.parse(localStorage.getItem('userInfo'))
			const updatedUserInfo = {
				...userInfo,
				accessTokenExpiration: data.accessTokenExpiration,
				language: data.language,
			} // Aktualizacja języka
			localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
			// Aktualizacja języka i18n
			i18n.changeLanguage(updatedUserInfo.language || 'en')

			failedQueue.forEach(req => req.resolve())
			failedQueue = []
			return axiosInstance(failedRequest)
		} catch (refreshError) {
			failedQueue.forEach(req => req.reject(refreshError))
			failedQueue = []

			if (refreshError.response && refreshError.response.status === 401) {
				logoutAndRedirect()
			}

			throw refreshError
		}
	}

	axiosInstance.interceptors.response.use(
		response => response,
		async error => {
			const originalRequest = error.config
			const userInfo = JSON.parse(localStorage.getItem('userInfo'))
			const userId = userInfo ? userInfo._id : null

			if (error.response && error.response.status === 401) {
				if (error.response.data.message === 'invalid_refresh_token') {
					logoutAndRedirect()
					return Promise.reject(error)
				}

				if (!originalRequest._retry) {
					originalRequest._retry = true

					if (userId) {
						if (!isRefreshing) {
							isRefreshing = true
							try {
								await refreshAuthLogic(originalRequest, userId)
								isRefreshing = false
								return axiosInstance(originalRequest)
							} catch (refreshError) {
								isRefreshing = false
								logoutAndRedirect()
								return Promise.reject(refreshError)
							}
						} else {
							return new Promise((resolve, reject) => {
								failedQueue.push({ resolve, reject })
							})
						}
					} else {
						logoutAndRedirect()
						return Promise.reject(error)
					}
				} else {
					logoutAndRedirect()
					return Promise.reject(error)
				}
			}

			return Promise.reject(error)
		}
	)

	const checkUsernameAvailability = async username => {
		try {
			const { data } = await axiosInstance.get(`/auth/check-username?name=${username}`)
			return !data.exists // Return true if the username is available (doesn't exist)
		} catch (error) {
			console.error('Error checking username availability:', error)
			throw new Error('Failed to check username availability')
		}
	}

	const checkEmailAvailability = async email => {
		try {
			const { data } = await axiosInstance.get(`/auth/check-email?email=${email}`)
			return !data.exists // Return true if the email is available (doesn't exist)
		} catch (error) {
			console.error('Error checking email availability:', error)
			throw new Error('Failed to check email availability')
		}
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				login,
				register,
				logout,
				refreshToken: refreshTokenFunc,
				logoutAndRedirect,
				axiosInstance,
				checkUsernameAvailability,
				checkEmailAvailability, // Add this new function to the context
				validationState,
				validateUsername: debouncedUsernameCheck,
				validateEmail: debouncedEmailCheck,
			}}>
			{children}
		</AuthContext.Provider>
	)
}

export { AuthProvider, axiosInstance }
export const useAuth = () => useContext(AuthContext)
