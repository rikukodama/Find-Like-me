// src/components/UI/ConfirmationDialog/ConfirmationDialog.js
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './ConfirmationDialog.css'

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
	const { t } = useTranslation()

	useEffect(() => {
		const handleEsc = (event) => {
			if (event.keyCode === 27) onCancel()
		}
		window.addEventListener('keydown', handleEsc)
		return () => window.removeEventListener('keydown', handleEsc)
	}, [onCancel])

	useEffect(() => {
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [])

	return (
		<div 
			className="confirmation-dialog__overlay"
			onClick={(e) => {
				if (e.target === e.currentTarget) onCancel()
			}}
		>
			<div 
				className="confirmation-dialog__content"
				role="dialog"
				aria-modal="true"
			>
				<div className="confirmation-dialog__header">
					<h3>Confirm Action</h3>
				</div>
				<div className="confirmation-dialog__body">
					<p>{message}</p>
				</div>
				<div className="confirmation-dialog__footer">
					<button 
						className="confirmation-dialog__button confirmation-dialog__button--secondary"
						onClick={onCancel}
					>
						{t('confirmation_dialog.no')}
					</button>
					<button 
						className="confirmation-dialog__button confirmation-dialog__button--primary"
						onClick={onConfirm}
						autoFocus
					>
						{t('confirmation_dialog.yes')}
					</button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmationDialog
