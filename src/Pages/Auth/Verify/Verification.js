import React, { useState, useRef, useEffect } from 'react'
import './Verification.css'

import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'react-toastify'

const VERIFICATION_SUCCESS_MSG = 'Użytkownik zweryfikowany prawidłowo'
const ERROR_MSG = 'Kod jest niepoprawny'

const Verification = () => {
	const [code, setCode] = useState(['', '', '', '', '', ''])
	const [error, setError] = useState('')
	const [resendCooldown, setResendCooldown] = useState(0)
	const { user, setUser, logout } = useAuth()
	const navigate = useNavigate()
	const inputRefs = useRef([])

	const handleChange = (e, index) => {
		const value = e.target.value

		if (/^\d*$/.test(value)) {
			const newCode = [...code]
			newCode[index] = value
			setCode(newCode)
			e.target.classList.toggle('verification__code-input--filled', !!value)

			if (value && index < 5) {
				inputRefs.current[index + 1]?.focus()
			}

			if (error) {
				setError('')
			}
		}
	}

	const handleKeyDown = (e, index) => {
		if (e.key === 'Backspace' && code[index] === '') {
			if (index > 0) {
				inputRefs.current[index - 1]?.focus()
				const newCode = [...code]
				newCode[index - 1] = ''
				setCode(newCode)
				inputRefs.current[index - 1].classList.remove('verification__code-input--filled')
			}
		} else if (e.key === 'ArrowLeft' && index > 0) {
			inputRefs.current[index - 1]?.focus()
		} else if (e.key === 'ArrowRight' && index < 5) {
			inputRefs.current[index + 1]?.focus()
		}
	}

	const handleSubmit = async () => {
		if (!user) return

		try {
			const response = await axios.post(`http://localhost:5001/api/auth/verify`, {
				userId: user._id,
				code: code.join(''),
			})

			if (response.status === 200 && response.data.message === VERIFICATION_SUCCESS_MSG) {
				setError('')
				const updatedUser = { ...user, isVerified: true }
				setUser(updatedUser)
				localStorage.setItem('userInfo', JSON.stringify(updatedUser))
				toast.success(VERIFICATION_SUCCESS_MSG)
				navigate('/chat')
			} else {
				setError(ERROR_MSG)
				toast.error(ERROR_MSG)
			}
		} catch (error) {
			console.error('Błąd podczas weryfikacji (blok catch):', error)
			setError(ERROR_MSG)
		}
	}

	const handleResendCode = async () => {
		if (!user || resendCooldown > 0) return

		try {
			const response = await axios.post(`http://localhost:5001/api/auth/resend-verification`, {
				email: user.email,
				userId: user._id,
				verificationToken: user.verificationCode,
			})

			if (response.status === 200) {
				toast.info('Kod weryfikacyjny został ponownie wysłany')
				setError('Kod weryfikacyjny został ponownie wysłany')
				startCooldown() // Start the cooldown after a successful resend
			} else {
				console.error('Nie udało się wysłać ponownie kodu weryfikacyjnego:', response.data.message)
				toast.error('Nie udało się wysłać ponownie kodu weryfikacyjnego')
				setError('Nie udało się wysłać ponownie kodu weryfikacyjnego')
			}
		} catch (error) {
			console.error('Błąd podczas ponownego wysyłania kodu weryfikacyjnego (blok catch):', error)
			toast.error('Nie udało się wysłać ponownie kodu weryfikacyjnego')
			setError('Nie udało się wysłać ponownie kodu weryfikacyjnego')
		}
	}

	const startCooldown = () => {
		setResendCooldown(60) // Set cooldown for 60 seconds

		// Update the cooldown timer every second
		const intervalId = setInterval(() => {
			setResendCooldown(prev => {
				if (prev <= 1) {
					clearInterval(intervalId)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}

	// Render the "Resend Code" message
	const renderResendText = () => {
		if (resendCooldown > 0) {
			return `Ponowna wysyłka dostępna za ${resendCooldown} sekund`
		}
		return 'Nie otrzymałeś kodu? Wyślij ponownie'
	}

	if (!user) {
		return <p>Już się zweryfikowałeś</p>
	}

	return (
		<div className="verification__container">
			<div className="verification__box">
				{/* <MailIcon className="verification__image" aria-label="Ikona poczty" /> */}
				<h1 className="verification__welcome-text">
					Wpisz kod weryfikacyjny <br /> wysłany na twój email
				</h1>
				<p className="verification__info-text">
					Proszę wpisz kod, który wysłaliśmy na twojego maila: <br />{' '}
					<span className="verification__email">{user.email}</span>
				</p>
				<div className="verification__code-inputs">
					{code.map((digit, index) => (
						<input
							key={index}
							id={`verification__code-${index}`}
							type="text"
							maxLength="1"
							value={digit}
							onChange={e => handleChange(e, index)}
							onKeyDown={e => handleKeyDown(e, index)}
							className="verification__code-input"
							ref={el => (inputRefs.current[index] = el)}
							aria-label={`Digit ${index + 1}`}
						/>
					))}
				</div>
				<button className="secondary__button" onClick={handleSubmit}>
					Kontynuuj
				</button>
				<p className="verification-text-info">
					Sprawdź spam, jeśli nie ma nic, to spóbuj później, strona otrzymuje za duzo ządań, przez co niektóre maile sie
					nie wysyłają 😢
				</p>

				{error && <p className="verification__error-message">{error}</p>}
				{/* <p
					className={`verification__resend-code ${resendCooldown > 0 ? 'disabled' : ''}`}
					role="button"
					onClick={handleResendCode}
					style={{ cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}>
					{renderResendText()}
				</p> */}
			</div>
		</div>
	)
}

export default Verification
