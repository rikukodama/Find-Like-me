import React from 'react'
import { Link } from 'react-router-dom'
import './btn.css'
import ChevronRight from '../../assets/lucide/chevron-rightwhite.png'

function CTA2({ text, to }) {
	if (to) {
		return (
			<Link to={to}>
				<button className="btn__cta2">
					<span>{text}</span>
					<img src={ChevronRight} alt="Chevron Right" />
				</button>
			</Link>
		)
	}

	return (
		<button className="btn__cta2">
			<span>{text}</span>
			<img src={ChevronRight} alt="Chevron Right" />
		</button>
	)
}

export default CTA2
