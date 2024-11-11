import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CustomSelect from './CustomSelect'
import './FindNew.css'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

const FindNew = ({ onSubmit }) => {
	const { t } = useTranslation()
	const [isDescribeMode, setIsDescribeMode] = useState(false)
	const [category, setCategory] = useState('')
	const [specificIssue, setSpecificIssue] = useState('')
	const [problemDescription, setProblemDescription] = useState('')
	const [ageRange, setAgeRange] = useState('')
	const [friendsAdded, setFriendsAdded] = useState(0)

	// Fetch user data
	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const { data } = await axios.get(`http://localhost:5001/api/auth/user-info`, {
					withCredentials: true,
				})
				setFriendsAdded(data.FriendsAdded)
			} catch (error) {
				console.error(t('findNew.fetchUserDataError'), error)
				toast.error(t('findNew.fetchUserDataError'))
			}
		}
		fetchUserData()
	}, [t])

	const handleCategoryChange = value => {
		setCategory(value)
		setSpecificIssue('')
	}

	const submitHandler = async e => {
		e.preventDefault()

		if (friendsAdded >= 99) {
			toast.error(t('findNew.submitButton.limitReached'))
			return
		}

		try {
			toast.info(t('findNew.searchingFriend'))
			let response

			if (isDescribeMode) {
				if (!problemDescription.trim() || problemDescription.trim().length < 10 || !ageRange) {
					toast.error(t('findNew.formValidationErrorDescription'))
					return
				}
				response = await axios.post(
					`http://localhost:5001/api/submit-description`,
					{ description: problemDescription, ageRange },
					{ withCredentials: true }
				)
			} else {
				if (!specificIssue || !category || !ageRange) {
					toast.error(t('findNew.formValidationError'))
					return
				}
				response = await axios.post(
					`http://localhost:5001/api/submit-response`,
					{ category, specificIssue, ageRange },
					{ withCredentials: true }
				)
			}

			// Simply refresh the page after successful submission
			window.location.reload()
		} catch (error) {
			if (error.response && error.response.status === 400 && error.response.data.allowCancel) {
				alert(
					`${t('findNew.activeResponseWarning')} ${error.response.data.existingResponse.category}. ${t(
						'findNew.alert_can_cancel'
					)}`
				)
			} else {
				console.error(t('findNew.submitError'), error.response ? error.response.data : error.message)
				toast.error(t('findNew.submitError'))
			}
		}
	}

	// Age options
	const ageOptions = ['0-18', '18+']
	// Load issue options from translations
	const issueOptions = t('findNew.categories', { returnObjects: true })

	const isSubmitDisabled = isDescribeMode
		? !problemDescription.trim() || problemDescription.trim().length < 10 || !ageRange
		: !category || !specificIssue || !ageRange

	return (
		<div className="find-new__container">
			<div className="find-new__title-container">
				<h3 className="find-new__title">{t('findNew.title')}</h3>
				<p className="find-new__description">{t('findNew.descriptionTitle')}</p>
			</div>
			<form className="find-new__form" onSubmit={submitHandler}>
				<div className={`choice__findnew ${isDescribeMode ? 'active-description' : 'active-choice'}`}>
					<button className={!isDescribeMode ? 'active' : ''} onClick={() => setIsDescribeMode(false)} type="button">
						{t('findNew.labels.selectMode')}
					</button>
					<button className={isDescribeMode ? 'active' : ''} onClick={() => setIsDescribeMode(true)} type="button">
						{t('findNew.labels.describeMode')}
					</button>
				</div>

				{isDescribeMode ? (
					<>
						<div className="describe-your-problem-container">
							<label>{t('findNew.labels.describeYourProblem')}</label>
							<textarea
								value={problemDescription}
								onChange={e => setProblemDescription(e.target.value)}
								placeholder={t('findNew.placeholders.describeYourProblem')}
							/>
							{problemDescription && problemDescription.trim().length < 10 && (
								<span className="error-message-findnew">{t('findNew.formValidationDescriptionLength')}</span>
							)}
						</div>
						<div className="age-range-selection-container">
							<label>{t('findNew.labels.selectAgeRange')}</label>
							<div className="age-range-selection">
								<div
									className={`age-range-option ${ageRange === '0-18' ? 'selected' : ''}`}
									onClick={() => setAgeRange('0-18')}>
									0-18
								</div>
								<div
									className={`age-range-option ${ageRange === '18+' ? 'selected' : ''}`}
									onClick={() => setAgeRange('18+')}>
									18+
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="category-selection-container-container">
							<div className="category-selection-container">
								<label>{t('findNew.labels.selectCategory')}</label>
								<CustomSelect
									options={Object.keys(issueOptions)}
									value={category}
									onChange={handleCategoryChange}
									placeholder={t('findNew.placeholders.category')}
								/>
							</div>
							<div>
								<label>{t('findNew.labels.selectSpecificIssue')}</label>
								<CustomSelect
									options={issueOptions[category] || []} // Ensure options is an empty array if undefined
									value={specificIssue}
									onChange={setSpecificIssue}
									placeholder={t('findNew.placeholders.specificIssue')}
									disabled={!category} // Make the select disabled if no category is picked
									className={!category ? 'disabled-select' : ''} // {{ edit_1 }} Add disabled class if no category is picked
								/>
							</div>
						</div>
						{/* Age Range Selection in Choosing Mode */}
						<div className="age-range-selection-container">
							<label>{t('findNew.labels.selectAgeRange')}</label>
							<div className="age-range-selection">
								<div
									className={`age-range-option ${ageRange === '0-18' ? 'selected' : ''}`}
									onClick={() => setAgeRange('0-18')}>
									0-18
								</div>
								<div
									className={`age-range-option ${ageRange === '18+' ? 'selected' : ''}`}
									onClick={() => setAgeRange('18+')}>
									18+
								</div>
							</div>
						</div>
					</>
				)}

				<button type="submit" className="find-new__submit-button" disabled={isSubmitDisabled}>
					{t('findNew.submitButton.default')}
				</button>
			</form>
		</div>
	)
}

export default FindNew
