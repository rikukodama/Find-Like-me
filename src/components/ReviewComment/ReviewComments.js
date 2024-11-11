import React from 'react'
import './ReviewComments.css'

function ReviewComments({ text, imageSrc, position, name, rotate, className }) {
	return (
		<div 
			className={`review-comment ${className}`} 
			style={{ ...position }}
		>
			<div className="review-comment__image">
				<img src={imageSrc} alt="Reviewer" />
			</div>
			<div className="review-comment__text">
				<h4>{name}</h4>
				<p>{text}</p>
			</div>
		</div>
	)
}

export default ReviewComments
