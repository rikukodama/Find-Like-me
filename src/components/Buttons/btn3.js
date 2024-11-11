import React from 'react'
import { Link } from 'react-router-dom'
import './btn.css'

function btn3({ text, to }) {
	if (to) {
		return (
			<Link to={to}>
				<button className="btn btn__3">
					<span>{text}</span>
				</button>
			</Link>
		)
	}

	return (
		<div>
			<button className="btn btn__3">
				<span>{text}</span>
			</button>
		</div>
	)
}

export default btn3
