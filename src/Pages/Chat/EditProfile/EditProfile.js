// src/components/User/EditProfile/EditProfile.js

import React, { useState, useEffect, useRef } from 'react'
import { useAuth, axiosInstance } from '../../../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import './EditProfile.css'
import { toast } from 'react-toastify'
import leoProfanity from 'leo-profanity'
import { useTranslation } from 'react-i18next'
import { FaChevronDown, FaPencilAlt, FaSync, FaTrash, FaSignOutAlt } from 'react-icons/fa' // Import chevron icon, trash icon, and logout icon
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog' // Import ConfirmationDialog

const EditProfile = () => {
	const { t, i18n } = useTranslation()
	const { user, setUser } = useAuth()
	const [name, setName] = useState('')
	const [password, setPassword] = useState('')
	const [profilePicture, setProfilePicture] = useState('')
	const [description, setDescription] = useState('')
	const [error, setError] = useState('')
	const [charCount, setCharCount] = useState(0)
	const [nameError, setNameError] = useState('')
	const [passwordStrength, setPasswordStrength] = useState('')
	const [language, setLanguage] = useState('pl')
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false) // State for ConfirmationDialog
	const [nameAvailable, setNameAvailable] = useState(true) // New state for username availability
	const [repeatPassword, setRepeatPassword] = useState('') // New state for repeat password
	const dropdownRef = useRef(null)
	const navigate = useNavigate()

	// Language definitions with flags
	const languages = [
		{ code: 'pl', nativeName: 'Polski', flag: '🇵🇱' },
		{ code: 'en', nativeName: 'English', flag: '🇬🇧' },
		{ code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
		{ code: 'es', nativeName: 'Español', flag: '🇪🇸' },
		// Add more languages as needed
	]

	// Initialize profanity blacklist
	const customBlacklist = ['']

	useEffect(() => {
		leoProfanity.loadDictionary()
		customBlacklist.forEach(word => leoProfanity.add(word))
	}, [])

	// Initialize profile fields after user data is loaded
	useEffect(() => {
		if (user) {
			setName(user.name)
			setProfilePicture(user.profilePicture)
			setDescription(user.description)
			setCharCount(user.description ? user.description.length : 0)
			setLanguage(user.language || 'pl')
		}
	}, [user])

	// Generate avatar URL when name changes
	useEffect(() => {
		if (name) {
			const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(name)}`
			setProfilePicture(avatarUrl)
		}
	}, [name])

	// Validate password
	const validatePassword = password => {
		let strength = ''
		if (password.length >= 6) {
			if (/[A-Z]/.test(password) && /\d/.test(password)) {
				if (password.length >= 12) {
					strength = t('edit_profile.password_strength_very_strong')
				} else if (password.length >= 8) {
					strength = t('edit_profile.password_strength_strong')
				} else {
					strength = t('edit_profile.password_strength_ok')
				}
			} else {
				strength = t('edit_profile.password_strength_weak')
			}
		} else {
			strength = t('edit_profile.password_strength_too_short')
		}
		setPasswordStrength(strength)
	}

	// Handle description changes and character count
	const handleDescriptionChange = e => {
		const input = e.target.value
		if (input.length <= 185) {
			setDescription(input)
			setCharCount(input.length)
		}
	}

	// Generate random avatar
	const generateRandomAvatar = () => {
		const randomSeed = Math.random().toString(36).substring(2, 15)
		const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${randomSeed}`
		setProfilePicture(avatarUrl)
	}

	// New: Check username availability
	const checkUsernameAvailability = async name => {
		try {
			const { data } = await axiosInstance.get('/auth/check-username', { params: { name } })
			// If the new name is the same as the current user's name, it's available
			if (name === user.name) {
				setNameAvailable(true)
			} else {
				setNameAvailable(!data.exists)
			}
		} catch (error) {
			console.error(t('edit_profile.username_check_error'), error)
			setNameAvailable(false) // Assume not available on error
		}
	}

	// Handle username changes
	const handleNameChange = event => {
		const newName = event.target.value.slice(0, 16) // Length limit
		setName(newName)
		
		// Clear previous errors
		setNameError('')
		
		// Only check availability if name has changed
		if (newName === user.name) {
			setNameAvailable(true)
		} else {
			checkUsernameAvailability(newName)
		}
	}

	// Handle password changes
	const handlePasswordChange = event => {
		const newPassword = event.target.value
		setPassword(newPassword)
		validatePassword(newPassword)
	}

	// Handle language changes
	const handleLanguageChange = selectedLang => {
		setLanguage(selectedLang)
		setIsDropdownOpen(false)
		i18n.changeLanguage(selectedLang)
	}

	// Close dropdown when clicking outside
	const handleClickOutside = event => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsDropdownOpen(false)
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Handle repeat password changes
	const handleRepeatPasswordChange = event => {
		setRepeatPassword(event.target.value)
	}

	// Determine if passwords match
	const passwordsMatch = password === repeatPassword

	// Handle form submission
	const submitHandler = async e => {
		e.preventDefault()

		// Disable form submission if there are frontend validation errors
		if (
			nameError ||
			!nameAvailable ||
			passwordStrength === t('edit_profile.password_strength_too_short') ||
			passwordStrength === t('edit_profile.password_strength_weak')
		) {
			setError(t('edit_profile.form_validation_error'))
			toast.error(t('edit_profile.form_validation_error'))
			return
		}

		try {
			const { data } = await axiosInstance.put('/auth/profile', {
				name,
				password,
				profilePicture,
				description,
				language, // Pass language
			})
			setUser(data) // Update user context
			localStorage.setItem('userInfo', JSON.stringify(data))
			// Set i18n language based on user preference
			i18n.changeLanguage(data.language || 'en')
			toast.success(t('edit_profile.profile_updated_success'))
			navigate('/chat')
		} catch (error) {
			console.error('Error updating profile', error)
			// Check if the error is due to username being taken
			if (error.response && error.response.data && error.response.data.message === 'Username is already taken') {
				setNameError(t('edit_profile.username_taken'))
				setNameAvailable(false)
				toast.error(t('edit_profile.username_taken'))
			} else {
				setError(t('edit_profile.profile_update_error'))
				toast.error(t('edit_profile.profile_update_error'))
			}
		}
	}

	// Handle account deletion
	const handleDeleteAccount = async () => {
		try {
			await axiosInstance.delete('/auth/delete-account')
			toast.success(t('edit_profile.account_deleted_success'))
			navigate('/login')
		} catch (error) {
			console.error('Error deleting account', error)
			toast.error(t('edit_profile.account_delete_error'))
		}
	}

	// Handle account deletion confirmation
	const handleDeleteAccountClick = () => {
		setIsConfirmationOpen(true) // Open confirmation dialog
	}

	// Add logout function
	const handleLogout = () => {
		// Logic to handle logout (e.g., clear user context, redirect to login)
		localStorage.removeItem('userInfo')
		setUser(null)
		navigate('/login')
	}

	// Redirect to login if user is not authenticated
	if (!user) {
		navigate('/login')
		return null
	}

	// Determine if the form has any errors
	const hasErrors =
		!!error ||
		!!nameError ||
		!nameAvailable ||
		passwordStrength === t('edit_profile.password_strength_too_short') ||
		passwordStrength === t('edit_profile.password_strength_weak')

	return (
		<div className="edit-profile-container">
			<div className="edit-profile-container__header">
				<h2>{t('edit_profile.settings')}</h2>
			</div>
			<form className="edit-profile__form" onSubmit={submitHandler}>
				{/* Profile picture section */}
				<div className="edit-profile__form_container-input">
					<div className="edit-profile__form_container_parent_div_top">
						<div>
							<h3>{t('edit_profile.profile_info')}</h3>
							<p>{t('edit_profile.profile_info_description')}</p>
						</div>
						<div className="edit-profile__top-buttons">
							<button type="button" className="edit-profile__cancel-btn" onClick={() => navigate('/chat')}>
								{t('edit_profile.cancel')}
							</button>
							<button type="submit" className="edit-profile__confirm-btn" disabled={hasErrors}>
								{t('edit_profile.confirm')} <FaPencilAlt />
							</button>
						</div>
					</div>
					<div className="edit-profile__form_container__parent_div_bottom">
						<div className="edit-profile__picture-selection">
							<img src={profilePicture} alt={t('edit_profile.profile_picture_alt')} />
							<button type="button" className="edit-profile__button" onClick={generateRandomAvatar} aria-label={t('edit_profile.generate_new_avatar')}>
								<FaSync className="edit-profile__button-icon" />
							</button>
						</div>

						{/* Username */}
						<div className="edit-profile-randomasda">
							<div>
								<label className="edit-profile__label">{t('edit_profile.username_label')}</label>
								{nameError && <div className="edit-profile__error-message">{nameError}</div>}
								<div className="password-meter-div-parent">
									<input
										className={`edit-profile__input m-0 ${
											nameError || !nameAvailable ? 'edit-profile__input-error' : ''
										}`}
										type="text"
										value={name}
										onChange={handleNameChange}
										placeholder={t('edit_profile.username_placeholder')}
										maxLength={16} // Limit to 16 characters
									/>

									{/* Display availability error */}
									{!nameAvailable && !nameError && (
										<div className="edit-profile__error-message">{t('edit_profile.username_taken')}</div>
									)}
								</div>
							</div>
							<div className="kahskahdas">
								<label className="edit-profile__label">{t('edit_profile.description_label')}</label>
								<div className="edit-profile__textarea-wrapper">
									<textarea
										className="edit-profile__input"
										value={description}
										onChange={handleDescriptionChange}
										placeholder={t('edit_profile.description_placeholder')}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="edit-profile__form_container-input">
					<label className="edit-profile__label">{t('edit_profile.language_label')}</label>
					<div className="custom-dropdown" ref={dropdownRef}>
						<div className="custom-dropdown__selected" onClick={() => setIsDropdownOpen(prev => !prev)}>
							<span>
								{languages.find(lang => lang.code === language)?.flag}{' '}
								{languages.find(lang => lang.code === language)?.nativeName || t('edit_profile.select_language')}
							</span>
							<FaChevronDown className={`custom-dropdown__icon ${isDropdownOpen ? 'open' : ''}`} />
						</div>
						{isDropdownOpen && (
							<ul className="custom-dropdown__list">
								{languages.map(lang => (
									<li key={lang.code} className="custom-dropdown__item" onClick={() => handleLanguageChange(lang.code)}>
										<span>
											{lang.flag} {lang.nativeName}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				{/* Password Section */}
				<div className="edit-profile__form_container-input">
					<div className="edit-profile__password-section">
						<div className="edit-profile__password-field">
							<label className="edit-profile__label">{t('edit_profile.password_label')}</label>
							<div className="password-meter-div-parent">
								<input
									className="edit-profile__input m-0"
									type="password"
									value={password}
									onChange={handlePasswordChange}
									placeholder={t('edit_profile.password_placeholder')}
								/>
								{password && passwordStrength && (
									<div
										className={`edit-profile__password-strength ${passwordStrength.replace(/ /g, '-').toLowerCase()}`}>
										{passwordStrength}
									</div>
								)}
							</div>
						</div>

						<div className="edit-profile__password-field">
							<label className="edit-profile__label">{t('edit_profile.repeat_password_label')}</label>
							<input
								className={`edit-profile__input m-0 ${
									!passwordsMatch && repeatPassword ? 'edit-profile__input-error' : ''
								}`}
								type="password"
								value={repeatPassword}
								onChange={handleRepeatPasswordChange}
								placeholder={t('edit_profile.repeat_password_placeholder')}
							/>
							{!passwordsMatch && repeatPassword && (
								<div className="edit-profile__error-message">{t('edit_profile.passwords_do_not_match')}</div>
							)}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="edit-profile__buttons-container">
					<div className="edit-profile__delete-account">
						<div className="edit-profile__action-group">
							<button type="button" className="edit-profile__logout-btn" onClick={handleLogout}>
								<FaSignOutAlt /> {t('edit_profile.logout')}
							</button>
							<button type="button" className="delete-account-button" onClick={handleDeleteAccountClick}>
								<FaTrash /> {t('edit_profile.delete_account')}
							</button>
						</div>
					</div>
				</div>
			</form>

			{/* Confirmation Dialog */}
			{isConfirmationOpen && (
				<ConfirmationDialog
					message={t('edit_profile.delete_account_confirmation')}
					onConfirm={() => {
						handleDeleteAccount()
						setIsConfirmationOpen(false)
						navigate('/chat')
					}}
					onCancel={() => setIsConfirmationOpen(false)}
				/>
			)}
		</div>
	)
}

export default EditProfile
