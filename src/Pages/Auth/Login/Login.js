// src/components/Auth/Login/Login.js
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Link } from 'react-router-dom'
import './Login.css'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import FirstImg from '../../../assets/AuthPage/1.svg'
import SecondImg from '../../../assets/AuthPage/2.svg'
import ThirdImg from '../../../assets/AuthPage/3.svg'

const Login = () => {
	const { t } = useTranslation()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [emailValid, setEmailValid] = useState(true)
	const [passwordValid, setPasswordValid] = useState(true)
	const [activeIndex, setActiveIndex] = useState(0)

	const { login } = useAuth()

	// Hero content configuration
	const heroContent = [
		{
			img: FirstImg,
			title: 'Find Support, Share Strength',
			description: 'Connect with people who understand your struggles and grow together',
		},
		{
			img: SecondImg,
			title: 'Safe Space for Healing',
			description: 'Share your journey in a supportive and non-judgmental environment',
		},
		{
			img: ThirdImg,
			title: 'Empowerment Through Community',
			description: 'Gain insights, tools, and friendships to help you thrive',
		},
	]

	// Auto-rotate pills and content
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex(prevIndex => (prevIndex + 1) % 3)
		}, 20000)

		return () => clearInterval(interval)
	}, [])

	const handlePillClick = index => {
		setActiveIndex(index)
	}

	const validateEmail = email => {
		const re = /\S+@\S+\.\S+/
		return re.test(email)
	}

	const validatePassword = password => {
		return password.length >= 6
	}

	const submitHandler = async e => {
		e.preventDefault()

		const isEmailValid = validateEmail(email)
		const isPasswordValid = validatePassword(password)

		setEmailValid(isEmailValid)
		setPasswordValid(isPasswordValid)

		if (!isEmailValid || !isPasswordValid) {
			const errorMsg = t('login.invalid_data')
			setError(errorMsg)
			toast.error(errorMsg)
			return
		}

		try {
			await login(email, password)
			toast.success(t('login.success'))
		} catch (error) {
			if (error.message === 'Nieprawidłowy email lub hasło' || error.message === 'Invalid email or password') {
				const errorMsg = t('login.invalid_credentials')
				setError(errorMsg)
				toast.error(errorMsg)
			} else {
				setError(error.message)
				toast.error(error.message)
			}
		}
	}

	return (
		<div className="login__auth">
			<div className="login__form-auth">
				<div className="login__form-headline">
					<h2>{t('login.welcome_back')}</h2>
					<p>{t('login.enter_details')}</p>
				</div>
				<form className="login__form" onSubmit={submitHandler}>
					<div className="login__input-container">
						<label>{t('labels.email')}</label>
						<input
							className={`login__input ${!emailValid ? 'login__input-error' : ''}`}
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder={t('placeholders.email')}
						/>
					</div>

					<div className="login__input-container">
						<label>{t('labels.password')}</label>
						<input
							className={`login__input ${!passwordValid ? 'login__input-error' : ''}`}
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder={t('placeholders.password')}
						/>
						<Link to="/forgot-password">{t('login.forgot_password')}</Link>
					</div>

					<button className="login__button" type="submit">
						{t('login.login_button')}
					</button>
				</form>

				<p className="login__text__other">
					{t('login.no_account')}
					<span>
						<Link to="/register"> {t('login.register_link')}</Link>
					</span>
				</p>
			</div>
			<div className="login__hero-auth">
				<img src={heroContent[activeIndex].img} alt="Login illustration" />
				<div className="login__hero-info">
					<div className="pills-container">
						{[0, 1, 2].map(index => (
							<div
								key={index}
								className={`pill ${index === activeIndex ? 'active' : ''}`}
								onClick={() => handlePillClick(index)}
							/>
						))}
					</div>
					<h4>{heroContent[activeIndex].title}</h4>
					<p>{heroContent[activeIndex].description}</p>
				</div>
			</div>
		</div>
	)
}

export default Login
