import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './ForgotPassword.css'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import FirstImg from '../../../../assets/AuthPage/1.svg'
import SecondImg from '../../../../assets/AuthPage/2.svg'
import ThirdImg from '../../../../assets/AuthPage/3.svg'

const ForgotPassword = () => {
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [activeIndex, setActiveIndex] = useState(1) // Starting with second image
	const { t } = useTranslation()

	// Hero content configuration
	const heroContent = [
		{
			img: FirstImg,
			title: t('hero_content.first.title'),
			description: t('hero_content.first.description'),
		},
		{
			img: SecondImg,
			title: t('hero_content.second.title'),
			description: t('hero_content.second.description'),
		},
		{
			img: ThirdImg,
			title: t('hero_content.third.title'),
			description: t('hero_content.third.description'),
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

	const handleSubmit = async e => {
		e.preventDefault()
		try {
			const { data } = await axios.post(`http://localhost:5001/api/auth/forgot-password`, { email })
			setMessage(data.message)
			setError('')
			toast.success(t('forgot_password.success_message'))
		} catch (err) {
			if (err.response && err.response.data && err.response.data.message) {
				setError(err.response.data.message)
				toast.error(err.response.data.message)
			} else {
				setError(t('forgot_password.error.unexpected'))
				toast.error(t('forgot_password.error.unexpected'))
			}
			setMessage('')
		}
	}

	return (
		<div className="forgot__auth">
			<div className="forgot__form-auth">
				<div className="forgot__form-headline">
					<h2>{t('forgot_password.title')}</h2>
					<p>{t('forgot_password.description')}</p>
				</div>
				<form className="forgot__form" onSubmit={handleSubmit}>
					<div className="forgot__input-container">
						<label>{t('forgot_password.email_label')}</label>
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							placeholder={t('forgot_password.email_placeholder')}
							className="forgot__input"
						/>
					</div>

					<button type="submit" className="forgot__button">
						{t('forgot_password.submit_button')}
					</button>
				</form>

				<p className="forgot__text__other">
					{t('forgot_password.remember_password')}
					<span>
						<Link to="/login"> {t('forgot_password.login_link')}</Link>
					</span>
				</p>
			</div>
			<div className="forgot__hero-auth">
				<img src={heroContent[activeIndex].img} alt="Forgot Password illustration" />
				<div className="forgot__hero-info">
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

export default ForgotPassword
