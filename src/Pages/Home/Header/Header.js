import React from 'react'
import { useTranslation } from 'react-i18next'
import './Header.css'
import BtnCta from '../../../components/Buttons/CTA'
import Underline from '../../../assets/Underline.png'
import ChatMobile from '../../../assets/HeroSection/mobileChat.webp'
import ReviewComment from '../../../components/ReviewComment/ReviewComments'

const AVATARS = {
	john: 'https://api.dicebear.com/9.x/thumbs/svg?seed=John',
	jennifer: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Jennifer',
	anna: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Anna',
	mateusz: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Mateusz',
}

function Header() {
	const { t } = useTranslation()
	const [ChatPc, setChatPc] = React.useState(null)
	const [ChatTablet, setChatTablet] = React.useState(null)

	const loadImage = React.useCallback(async () => {
		const width = window.innerWidth
		if (width > 992) {
			const module = await import('../../../assets/HeroSection/pcChat.webp')
			setChatPc(module.default)
			setChatTablet(null)
		} else if (width > 576) {
			const module = await import('../../../assets/HeroSection/tabletChat.webp')
			setChatTablet(module.default)
			setChatPc(null)
		} else {
			setChatPc(null)
			setChatTablet(null)
		}
	}, [])

	React.useEffect(() => {
		loadImage()

		let resizeTimer
		const handleResize = () => {
			clearTimeout(resizeTimer)
			resizeTimer = setTimeout(() => {
				loadImage()
			}, 250)
		}

		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
			clearTimeout(resizeTimer)
		}
	}, [loadImage])

	// Determine which image to show
	const heroImage = ChatPc || ChatTablet || ChatMobile

	return (
		<div className="header-wrapper">
			<div className="review-container" aria-hidden="true">
				{[
					{ key: 'john', className: 'review-comment--john' },
					{ key: 'jennifer', className: 'review-comment--jennifer' },
					{ key: 'anna', className: 'review-comment--anna' },
					{ key: 'mateusz', className: 'review-comment--mateusz' },
				].map(({ key, className }) => (
					<ReviewComment
						key={key}
						text={t(`header.reviews.${key}.text`)}
						name={t(`header.reviews.${key}.name`)}
						imageSrc={AVATARS[key]}
						className={className}
					/>
				))}
			</div>

			<header>
				<div className="header-container"></div>
				<div className="header__info">
					<h1>
						{t('header.title.main')} <br />
						{t('header.title.connect')} <br />
						{t('header.title.who')}
						<div className="h1__div__underline">
							<span>{t('header.title.understand')}</span>{' '}
							<img src={Underline} className="hedaer__h1__underline" alt="" />
						</div>
					</h1>
					<p>
						{t('header.description.part1')} <b>{t('header.description.part2')}</b>
					</p>
					<BtnCta text={t('header.cta_button')} to="/register" />
				</div>
				<link rel="preload" as="image" href={heroImage} fetchpriority="high" />

				<img src={heroImage} className="hero-img" alt="Chat Interface Preview" fetchpriority="high" loading="eager" />
			</header>
		</div>
	)
}

export default Header
