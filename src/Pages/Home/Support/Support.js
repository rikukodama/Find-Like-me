import React from 'react'
import { useTranslation } from 'react-i18next'
import './Support.css'

function Support() {
	const { t } = useTranslation()

	return (
		<section className="support-section">
			<div className="support-container">
				<div className="support-info">
					<div className="support-info-badge">{t('support.badge')}</div>
					<h2 className="support-info__title">{t('support.title')}</h2>
					<p>{t('support.description')}</p>
				</div>
				<div className="support-widget-container">
					<iframe
						style={{
							width: '100%',
							height: '400px',
							maxWidth: '420px'
						}}
						src="https://zrzutka.pl/54yhnm/widget/23"
						frameBorder="0"
						scrolling="no"
						title="Support widget"
					></iframe>
				</div>
			</div>
		</section>
	)
}

export default Support
