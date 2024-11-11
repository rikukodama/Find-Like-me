import React from 'react'
import { useTranslation } from 'react-i18next'
import './Footer.css'
import Logo from '../../assets/LogoOrange.png'

function Footer() {
	const { t } = useTranslation()

	return (
		<footer>
			<div className="footer-container">
				<div className="footer-container-left">
					<div className="logo">
						<h2>
							FindAlike<span>Me</span>
						</h2>
					</div>
					<p>{t('footer.support_initiative')}</p>
					<div className="footer-iframe-container p-3" style={{ padding: '0' }}>
						<iframe
							className="footer-iframe p-3"
							src="https://zrzutka.pl/54yhnm/widget/14"
							frameBorder="0"
							scrolling="no"
							style={{ padding: '0' }}
							title={t('footer.support_initiative')}
						></iframe>
					</div>
				</div>
				<div className="footer-container-right">
					<div>
						<p>{t('footer.sections.pages.title')}</p>
						<ul>
							<li>
								<a>{t('footer.sections.pages.links.home')}</a>
							</li>
							<li>
								<a>{t('footer.sections.pages.links.register')}</a>
							</li>
							<li>
								<a>{t('footer.sections.pages.links.login')}</a>
							</li>
						</ul>
					</div>
					<div>
						<p>{t('footer.sections.support.title')}</p>
						<ul>
							<li>
								<a>{t('footer.sections.support.links.privacy')}</a>
							</li>
							<li>
								<a>{t('footer.sections.support.links.faq')}</a>
							</li>
							<li>
								<a>{t('footer.sections.support.links.contact')}</a>
							</li>
						</ul>
					</div>
					<div>
						<p>{t('footer.sections.company.title')}</p>
						<span>{t('footer.sections.company.labels.nip')}</span>
						<p className="footer-company-info">571 172 78 74</p>
						<span>{t('footer.sections.company.labels.phone')}</span>
						<p className="footer-company-info">+48 698 404 252</p>
						<span>{t('footer.sections.company.labels.email')}</span>
						<p className="footer-company-info">findalikeme@gmail.com</p>
					</div>
				</div>
			</div>
			<div className="footer-findalikeme">
				<h5>
					FindAlike<span>Me</span>
				</h5>
			</div>
		</footer>
	)
}

export default Footer
