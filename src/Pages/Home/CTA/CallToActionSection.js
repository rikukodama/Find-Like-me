import React from 'react'
import { useTranslation } from 'react-i18next'
import './CallToActionSection.css'
import Btn3 from '../../../components/Buttons/btn3'
import CTAImage from '../../../assets/CTAsection/ctaimg.svg'

function CallToActionSection() {
	const { t } = useTranslation()

	return (
		<section className="cta-section">
			<div className="cta-section__container">
				<div className="cta-section__info">
					<h3>
						{t('cta_section.title.part1')} <br />
						{t('cta_section.title.part2')}
					</h3>
					<p>{t('cta_section.description')}</p>
					<Btn3 
						text={t('cta_section.button')} 
						to="/register" 
					/>
				</div>
				<img src={CTAImage} alt={t('cta_section.title.part2')} />
			</div>
		</section>
	)
}

export default CallToActionSection
