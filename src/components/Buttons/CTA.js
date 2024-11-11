import React from 'react'
import { Link } from 'react-router-dom'
import './btn.css'
import ChevronRight from '../../assets/ChevronRight.png'

function CTA({ text, to }) {
	if (to) {
		return (
			<Link to={to}>
				<button className="btn__cta">
					<span className="btn__cta-text">{text}</span>
					<img src={ChevronRight} alt="Chevron Right" className="btn__cta-icon" />
				</button>
			</Link>
		)
	}

	return (
		<button className="btn__cta">
			<span className="btn__cta-text">{text}</span>
			<img src={ChevronRight} alt="Chevron Right" className="btn__cta-icon" />
		</button>
	)
}

export default CTA
