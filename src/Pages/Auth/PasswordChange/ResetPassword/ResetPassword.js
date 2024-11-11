import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import './ResetPassword.css'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import FirstImg from '../../../../assets/AuthPage/1.svg'
import SecondImg from '../../../../assets/AuthPage/2.svg'
import ThirdImg from '../../../../assets/AuthPage/3.svg'

const ResetPassword = () => {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [activeIndex, setActiveIndex] = useState(2) // Set to 2 for third pill
	const { token } = useParams()
	const navigate = useNavigate()
	const { t } = useTranslation()

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
		if (password !== confirmPassword) {
			setError('Passwords do not match')
			toast.error('Passwords do not match')
			return
		}

		try {
			const { data } = await axios.post(`http://localhost:5001/api/auth/reset-password/${token}`, {
				password,
			})
			setMessage(data.message)
			setError('')
			toast.success('Password has been reset successfully')
			setTimeout(() => {
				navigate('/login')
			}, 2000)
		} catch (err) {
			setError(err.response.data.message)
			toast.error(err.response.data.message)
			setMessage('')
		}
	}

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

	return (
		<div className="reset__auth">
			<div className="reset__form-auth">
				<div className="reset__form-headline">
					<h2>{t('reset_password.title')}</h2>
					<p>{t('reset_password.description')}</p>
				</div>
				<form className="reset__form" onSubmit={handleSubmit}>
					<div className="reset__input-container">
						<label>{t('reset_password.new_password.label')}</label>
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							placeholder={t('reset_password.new_password.placeholder')}
							className="reset__input"
						/>
					</div>

					<div className="reset__input-container">
						<label>{t('reset_password.confirm_password.label')}</label>
						<input
							type="password"
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							required
							placeholder={t('reset_password.confirm_password.placeholder')}
							className="reset__input"
						/>
					</div>

					<button type="submit" className="reset__button">
						{t('reset_password.submit_button')}
					</button>
				</form>
			</div>
			<div className="reset__hero-auth">
				<img src={heroContent[activeIndex].img} alt="Reset Password illustration" />
				<div className="reset__hero-info">
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

export default ResetPassword
