// src/components/Auth/Register/Register.js
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Link } from 'react-router-dom'
import './Register.css'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash/debounce'

import FirstImg from '../../../assets/AuthPage/1.svg'
import SecondImg from '../../../assets/AuthPage/2.svg'
import ThirdImg from '../../../assets/AuthPage/3.svg'

const PasswordStrengthMeter = ({ password }) => {
	const { t } = useTranslation()

	const calculateStrength = () => {
		let strength = 0
		if (password.length >= 8) strength += 25
		if (/[A-Z]/.test(password)) strength += 25
		if (/[a-z]/.test(password)) strength += 25
		if (/[0-9]/.test(password)) strength += 25
		return strength
	}

	const getStrengthText = strength => {
		if (strength === 0) return ''
		if (strength <= 25) return t('password_strength.strength.weak')
		if (strength <= 50) return t('password_strength.strength.fair')
		if (strength <= 75) return t('password_strength.strength.good')
		return t('password_strength.strength.strong')
	}

	const strength = calculateStrength()
	const strengthText = getStrengthText(strength)

	return (
		<div className="password-strength">
			<div className="password-requirements">
				<ul className="requirements-list">
					<li className={password.length >= 8 ? 'met' : ''}>
						<span className="check-icon">{password.length >= 8 ? '✓' : '○'}</span>
						{t('password_strength.requirements.min_length')}
					</li>
					<li className={/[A-Z]/.test(password) ? 'met' : ''}>
						<span className="check-icon">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
						{t('password_strength.requirements.uppercase')}
					</li>
					<li className={/[a-z]/.test(password) ? 'met' : ''}>
						<span className="check-icon">{/[a-z]/.test(password) ? '✓' : '○'}</span>
						{t('password_strength.requirements.lowercase')}
					</li>
					<li className={/[0-9]/.test(password) ? 'met' : ''}>
						<span className="check-icon">{/[0-9]/.test(password) ? '✓' : '○'}</span>
						{t('password_strength.requirements.number')}
					</li>
				</ul>
			</div>
			<div className="strength-meter">
				<div className={`strength-meter-fill ${strengthText.toLowerCase()}`} style={{ width: `${strength}%` }} />
			</div>
		</div>
	)
}

const Register = () => {
	const { t, i18n } = useTranslation()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [language, setLanguage] = useState(i18n.language || 'en')
	const [profilePicture, setProfilePicture] = useState('')
	const [error, setError] = useState('')
	const [nameValid, setNameValid] = useState(true)
	const [emailValid, setEmailValid] = useState(true)
	const [passwordValid, setPasswordValid] = useState(true)
	const [activeIndex, setActiveIndex] = useState(0)
	const [languageSelectFocused, setLanguageSelectFocused] = useState(false)
	const [nameError, setNameError] = useState('')
	const [emailError, setEmailError] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const navigate = useNavigate()
	const [isValidating, setIsValidating] = useState({
		name: false,
		email: false,
	})

	const { register, checkUsernameAvailability, checkEmailAvailability } = useAuth()

	// Generate avatar URL when name changes
	useEffect(() => {
		if (name) {
			const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`
			setProfilePicture(avatarUrl)
		}
	}, [name])

	// Debounced validation functions
	const debouncedValidateName = useCallback(
		debounce(async name => {
			if (name.length < 3) {
				setNameError(t('register.name_too_short'))
				setNameValid(false)
				return
			}
			setIsValidating(prev => ({ ...prev, name: true }))
			try {
				const isAvailable = await checkUsernameAvailability(name)
				if (!isAvailable) {
					setNameError(t('register.username_taken'))
					setNameValid(false)
				} else {
					setNameError('')
					setNameValid(true)
				}
			} catch (error) {
				setNameError(t('register.username_check_failed'))
				setNameValid(false)
			} finally {
				setIsValidating(prev => ({ ...prev, name: false }))
			}
		}, 500),
		[t]
	)

	const debouncedValidateEmail = useCallback(
		debounce(async email => {
			const re = /\S+@\S+\.\S+/
			if (!re.test(email)) {
				setEmailError(t('register.invalid_email'))
				setEmailValid(false)
				return
			}
			setIsValidating(prev => ({ ...prev, email: true }))
			try {
				const isAvailable = await checkEmailAvailability(email)
				if (!isAvailable) {
					setEmailError(t('register.email_taken'))
					setEmailValid(false)
				} else {
					setEmailError('')
					setEmailValid(true)
				}
			} catch (error) {
				setEmailError(t('register.email_check_failed'))
				setEmailValid(false)
			} finally {
				setIsValidating(prev => ({ ...prev, email: false }))
			}
		}, 500),
		[t]
	)

	// Handle input changes
	const handleNameChange = e => {
		const value = e.target.value
		setName(value)
		if (value) debouncedValidateName(value)
	}

	const handleEmailChange = e => {
		const value = e.target.value
		setEmail(value)
		if (value) debouncedValidateEmail(value)
	}

	// Validate password separately since it doesn't need server validation
	const validatePassword = password => {
		const hasMinLength = password.length >= 8
		const hasUpperCase = /[A-Z]/.test(password)
		const hasLowerCase = /[a-z]/.test(password)
		const hasNumber = /[0-9]/.test(password)

		const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber

		if (!isValid) {
			setPasswordError(t('register.password_requirements'))
			setPasswordValid(false)
		} else {
			setPasswordError('')
			setPasswordValid(true)
		}

		return isValid
	}

	// Update password handler to include validation
	const handlePasswordChange = e => {
		const value = e.target.value
		setPassword(value)
		validatePassword(value)
	}

	const handleImageUpload = e => {
		const file = e.target.files[0]
		if (file) {
			const reader = new FileReader()
			reader.onloadend = () => {
				setProfilePicture(reader.result)
			}
			reader.readAsDataURL(file)
		}
	}

	const submitHandler = async e => {
		e.preventDefault()

		try {
			// Check if current validation states are valid
			if (!nameValid || !emailValid || !passwordValid) {
				// Show specific error messages based on which validation failed
				if (!nameValid) {
					toast.error(nameError || t('register.invalid_username'))
				}
				if (!emailValid) {
					toast.error(emailError || t('register.invalid_email'))
				}
				if (!passwordValid) {
					toast.error(passwordError || t('register.invalid_password'))
				}
				return
			}

			// If all validations pass, proceed with registration
			await register(name, email, password, profilePicture, language)
			toast.success(t('register.success'))
		} catch (error) {
			setError(error.message)
			toast.error(error.message)
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

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveIndex(prevIndex => (prevIndex + 1) % heroContent.length)
		}, 20000)

		return () => clearInterval(interval)
	}, [])

	const handlePillClick = index => {
		setActiveIndex(index)
	}

	const handleLanguageChange = e => {
		const newLang = e.target.value
		setLanguage(newLang)
		i18n.changeLanguage(newLang)
	}

	const [showPasswordMeter, setShowPasswordMeter] = useState(false)
	const passwordWrapperRef = useRef(null)

	useEffect(() => {
		const handleClickOutside = event => {
			if (passwordWrapperRef.current && !passwordWrapperRef.current.contains(event.target)) {
				setShowPasswordMeter(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Add new state for form completion
	const [isFormValid, setIsFormValid] = useState(false)

	// Add useEffect to check overall form validity
	useEffect(() => {
		const checkFormValidity = () => {
			const isNameFilled = name.trim() !== ''
			const isEmailFilled = email.trim() !== ''
			const isPasswordFilled = password.trim() !== ''
			const isLanguageFilled = language !== ''

			// Check if all fields are filled AND all validations pass
			const allFieldsFilled = isNameFilled && isEmailFilled && isPasswordFilled && isLanguageFilled
			const allValidationsPassed = nameValid && emailValid && passwordValid
			const noOngoingValidations = !isValidating.name && !isValidating.email

			setIsFormValid(allFieldsFilled && allValidationsPassed && noOngoingValidations)
		}

		checkFormValidity()
	}, [name, email, password, language, nameValid, emailValid, passwordValid, isValidating])

	const languages = [
		{ code: 'en', name: 'English', flag: '🇬🇧' },
		{ code: 'pl', name: 'Polski', flag: '🇵🇱' },
		{ code: 'fr', name: 'Français', flag: '🇫🇷' },
		{ code: 'es', name: 'Español', flag: '🇪🇸' },
	]

	return (
		<div className="register__auth">
			<div className="register__form-auth">
				<div className="register__form-headline">
					<h2>{t('register.create_account')}</h2>
					<p>{t('register.join_community')}</p>
				</div>
				<form className="register__form" onSubmit={submitHandler}>
					<div className="register__input-container">
						<label className="register__label">{t('labels.username')}</label>
						<div className="input-wrapper">
							<input
								type="text"
								value={name}
								onChange={handleNameChange}
								placeholder={t('placeholders.username')}
								className={`register__input ${!nameValid ? 'register__input-error' : ''}`}
							/>
							{isValidating.name && <div className="validation-spinner" />}
						</div>
						{nameError && <div className="register__error-message">{nameError}</div>}
					</div>

					<div className="register__input-container">
						<label className="register__label">{t('labels.email')}</label>
						<div className="input-wrapper">
							<input
								type="email"
								value={email}
								onChange={handleEmailChange}
								placeholder={t('placeholders.email')}
								className={`register__input ${!emailValid ? 'register__input-error' : ''}`}
							/>
							{isValidating.email && <div className="validation-spinner" />}
						</div>
						{emailError && <div className="register__error-message">{emailError}</div>}
					</div>

					<div className="register__input-container">
						<label className="register__label">{t('labels.password')}</label>
						<div className="password-wrapper" ref={passwordWrapperRef}>
							<input
								type="password"
								value={password}
								onChange={handlePasswordChange}
								onFocus={() => setShowPasswordMeter(true)}
								placeholder={t('placeholders.password')}
								className={`register__input ${!passwordValid ? 'register__input-error' : ''}`}
							/>
							{showPasswordMeter && <PasswordStrengthMeter password={password} />}
						</div>
						{passwordError && <div className="register__error-message">{passwordError}</div>}
					</div>

					<div className="register__input-container">
						<label className="register__label">{t('labels.language')}</label>
						<select
							className={`register__input register__language-select ${languageSelectFocused ? 'focused' : ''}`}
							value={language}
							onChange={handleLanguageChange}
							onFocus={() => setLanguageSelectFocused(true)}
							onBlur={() => setLanguageSelectFocused(false)}>
							{languages.map(({ code, name, flag }) => (
								<option key={code} value={code}>
									{flag} {name}
								</option>
							))}
						</select>
					</div>

					<button
						className={`register__button ${!isFormValid ? 'register__button-disabled' : ''}`}
						type="submit"
						disabled={!isFormValid}>
						{t('register.register_button')}
					</button>
				</form>

				<p className="register__text__other">
					{t('register.have_account')}
					<span>
						<Link to="/login"> {t('register.login_link')}</Link>
					</span>
				</p>
			</div>
			<div className="register__hero-auth">
				<img src={heroContent[activeIndex].img} alt="Register illustration" />
				<div className="register__hero-info">
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

export default Register
