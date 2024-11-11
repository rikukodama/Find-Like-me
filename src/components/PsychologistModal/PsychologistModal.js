import React from 'react'
import { IoClose, IoFlash } from 'react-icons/io5'
import { BsClock, BsShieldCheck, BsPlusCircle } from 'react-icons/bs'
import { FaVideo } from 'react-icons/fa'
import './PsychologistModal.css'

const PsychologistModal = ({ onClose }) => {
	const psychologists = []

	const handleJoinAsPsychologist = () => {
		window.open(
			'https://docs.google.com/forms/d/e/1FAIpQLSdb5PDzV2w4sCoMXOAZOuAvhU1rZ5j9HpiFpgUCyuC_RgKTbg/viewform?usp=sf_link',
			'_blank'
		)
	}

	return (
		<div className="psych-modal">
			<div className="psych-modal__header">
				<div>
					<h2>Pomoc Specjalisty</h2>
					<p>Połącz się z licencjonowanymi psychologami</p>
				</div>
				<button className="psych-modal__close" onClick={onClose}>
					<IoClose />
				</button>
			</div>

			<div className="psych-modal__content">
				{psychologists.length > 0 ? (
					psychologists.map(psych => (
						<div key={psych.id} className={`psych-card ${psych.featured ? 'featured' : ''}`}>
							{psych.featured && (
								<div className="featured-badge">
									<IoFlash />
									<span>Polecany Specjalista</span>
								</div>
							)}

							<div className="psych-card__main">
								<div className="psych-card__left">
									<div className="psych-card__image-wrapper">
										<img src={psych.imageUrl} alt={psych.name} />
										{psych.verified && (
											<div className="verified-badge">
												<BsShieldCheck />
											</div>
										)}
									</div>
									<div className="psych-card__availability">
										<div className="availability-indicator"></div>
										Dostępny {psych.nextAvailable}
									</div>
								</div>

								<div className="psych-card__content">
									<div className="psych-card__header">
										<h3>{psych.name}</h3>
										<span className="psych-card__title">{psych.title}</span>
									</div>

									<div className="psych-card__stats">
										<div className="stat">
											<span>★</span>
											<span>{psych.rating}</span>
											<span className="stat-detail">({psych.reviews} opinii)</span>
										</div>
										<div className="stat">
											<BsClock />
											<span>{psych.yearsExperience}+ lat doświadczenia</span>
										</div>
									</div>

									<p className="psych-card__description">{psych.description}</p>

									<div className="psych-card__tags">
										{psych.specializations.map(spec => (
											<span key={spec} className="specialty-tag">
												{spec}
											</span>
										))}
									</div>
								</div>

								<div className="psych-card__right">
									<div className="price-section">
										<div className="price-header">
											<div className="psych-card__price">
												<span className="price-amount">{psych.price} zł</span>
												<span className="price-period">/sesja</span>
											</div>
											<div className="session-info">
												<BsClock />
												<span>{psych.sessionLength} minut</span>
											</div>
										</div>

										{psych.featured && (
											<div className="satisfaction-guarantee">
												<BsShieldCheck />
												<span>{psych.satisfaction} zadowolonych pacjentów</span>
											</div>
										)}

										<div className="next-slots">
											<span className="next-slots-label">Najbliższe terminy:</span>
											<div className="slots-list">
												{psych.nextSlots.map((slot, index) => (
													<span key={index} className="time-slot">
														{slot}
													</span>
												))}
											</div>
										</div>
									</div>

									<button className="book-session-btn">
										<FaVideo />
										<span>Umów Wizytę Online</span>
										<span className="btn-arrow">→</span>
									</button>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="empty-state">
						<div className="empty-state__icon">👋</div>
						<h3>Brak dostępnych specjalistów</h3>
						<p>Aktualnie nie mamy żadnych specjalistów na liście. Sprawdź ponownie później.</p>
					</div>
				)}
			</div>

			<button className="join-psychologist-btn" onClick={handleJoinAsPsychologist}>
				<BsPlusCircle />
				<span>Dołącz jako Specjalista</span>
			</button>
		</div>
	)
}

export default PsychologistModal
