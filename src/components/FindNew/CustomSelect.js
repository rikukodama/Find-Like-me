import React, { useState, useRef, useEffect } from 'react'

const CustomSelect = ({ options, value, onChange, placeholder, disabled }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedValue, setSelectedValue] = useState(value || '')
	const selectRef = useRef(null)

	useEffect(() => {
		const handleClickOutside = event => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleSelect = option => {
		if (!disabled) { // Prevent selection if disabled
			setSelectedValue(option)
			onChange(option)
			setIsOpen(false)
		}
	}

	return (
		<div ref={selectRef} className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled-select' : ''}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
			<div className="custom-select__trigger">
				<span>{selectedValue || placeholder}</span>
			</div>
			<div className="custom-options">
				{options.map((option, index) => (
					<div
						key={index}
						className={`custom-option ${selectedValue === option ? 'selected' : ''}`}
						onClick={() => handleSelect(option)}>
						{option}
					</div>
				))}
			</div>
		</div>
	)
}

export default CustomSelect
