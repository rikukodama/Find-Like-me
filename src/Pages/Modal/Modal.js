import React from 'react'
import './Modal.css'

const Modal = ({ show, onClose, children }) => {
	if (!show) {
		return null
	}

	return (
		<div className="modal__overlay" onClick={onClose}>
			<div className="modal__content" onClick={e => e.stopPropagation()}>
				{children}
			</div>
		</div>
	)
}

export default Modal
