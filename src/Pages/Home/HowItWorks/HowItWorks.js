import React from 'react'
import { useTranslation } from 'react-i18next'
import './HowItWorks.css'
import BtnCta2 from '../../../components/Buttons/CTA2'

function HowItWorks() {
	const { t } = useTranslation()

	return (
		<section className="how-it-works" id="how-it-works">
			<div className="headline">
				<h2>{t('how_it_works.headline.title')}</h2>
				<p>{t('how_it_works.headline.description')}</p>
			</div>
			<div className="how-it-works__container">
				<div className="how-it-works__card card__left">
					<div className="how-it-works__number">1</div>
					<h3>{t('how_it_works.steps.1.title')}</h3>
					<p>{t('how_it_works.steps.1.description')}</p>
				</div>

				<div className="how-it-works__card card__center">
					<div className="how-it-works__number">2</div>
					<h3>{t('how_it_works.steps.2.title')}</h3>
					<p>{t('how_it_works.steps.2.description')}</p>
				</div>

				<div className="how-it-works__card card__right">
					<div className="how-it-works__number">3</div>
					<h3>{t('how_it_works.steps.3.title')}</h3>
					<p>{t('how_it_works.steps.3.description')}</p>
				</div>
			</div>
			<BtnCta2 
				text={t('how_it_works.cta_button')} 
				to="/register"
			/>
		</section>
	)
}

export default HowItWorks
