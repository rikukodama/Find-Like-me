import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useTranslation } from 'react-i18next'
import './Navbar.css'
import { useAuth } from '../../context/AuthContext'
import { IoLanguage } from 'react-icons/io5'
import axiosInstance from 'axios'
import { io } from 'socket.io-client'

import Btn2 from '../Buttons/btn2'
import Btn3 from '../Buttons/btn3'

const Navbar = () => {
	const [scrolled, setScrolled] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
	const menuRef = useRef(null)
	const hamburgerRef = useRef(null)
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const { t, i18n } = useTranslation()
	const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
	const langMenuRef = useRef(null)
	const [currentLang, setCurrentLang] = useState(i18n.language || 'en')
	const [userStats, setUserStats] = useState({ totalUsers: 0, onlineUsers: 0 })

	const socket = useMemo(() => {
		return io('http://localhost:5001', {
			withCredentials: true,
		})
	}, [])

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50)
		}

		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768)
		}

		window.addEventListener('scroll', handleScroll)
		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	useEffect(() => {
		if (isOpen) {
			gsap.to(menuRef.current, {
				x: '0%',
				duration: 0.3,
				ease: 'power2.out',
				onComplete: () => {
					gsap.to('.nav-item', {
						opacity: 1,
						y: 0,
						stagger: 0.05,
						ease: 'power2.out',
					})
					gsap.to('.menu-pattern', {
						opacity: 0.1,
						rotation: 0,
						duration: 0.5,
						ease: 'power2.out',
					})
				},
			})
		} else {
			gsap.to('.nav-item', {
				opacity: 0,
				y: 10,
				duration: 0.2,
				ease: 'power2.in',
				onComplete: () => {
					gsap.to(menuRef.current, {
						x: '100%',
						duration: 0.3,
						ease: 'power2.in',
					})
				},
			})
			gsap.to('.menu-pattern', {
				opacity: 0,
				rotation: -10,
				duration: 0.3,
				ease: 'power2.in',
			})
		}
	}, [isOpen])

	const toggleMenu = () => {
		setIsOpen(!isOpen)
		const tl = gsap.timeline()
		if (!isOpen) {
			tl.to('.hamburger-line:nth-child(1)', { y: 8, duration: 0.1 })
				.to('.hamburger-line:nth-child(3)', { y: -8, duration: 0.1 }, '<')
				.to('.hamburger-line:nth-child(2)', { opacity: 0, duration: 0.1 }, '<')
				.to('.hamburger-line:nth-child(1)', { rotation: 45, duration: 0.1 })
				.to('.hamburger-line:nth-child(3)', { rotation: -45, duration: 0.1 }, '<')
		} else {
			tl.to('.hamburger-line:nth-child(1)', { rotation: 0, duration: 0.1 })
				.to('.hamburger-line:nth-child(3)', { rotation: 0, duration: 0.1 }, '<')
				.to('.hamburger-line:nth-child(2)', { opacity: 1, duration: 0.1 })
				.to('.hamburger-line:nth-child(1)', { y: 0, duration: 0.1 })
				.to('.hamburger-line:nth-child(3)', { y: 0, duration: 0.1 }, '<')
		}
	}

	const handleLogout = async () => {
		try {
			await logout()
			navigate('/')
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	const renderButtons = () => {
		if (!user) {
			return (
				<>
					<Link to="/login">
						<Btn2 text={t('navbar.buttons.login')} />
					</Link>
					<Link to="/register">
						<Btn3 text={t('navbar.buttons.start_chatting')} />
					</Link>
				</>
			)
		} else if (user && !user.isVerified) {
			return (
				<>
					<div onClick={handleLogout}>
						<Btn2 text={t('navbar.buttons.logout')} />
					</div>
					<Link to="/verify">
						<Btn3 text={t('navbar.buttons.verify')} />
					</Link>
				</>
			)
		} else {
			return (
				<>
					<div onClick={handleLogout}>
						<Btn2 text={t('navbar.buttons.logout')} />
					</div>
					<Link to="/chat">
						<Btn3 text={t('navbar.buttons.start_chatting')} />
					</Link>
				</>
			)
		}
	}

	const handleNavClick = async (e, path) => {
		e.preventDefault()

		// If it's a direct navigation path (not logout or scroll)
		if (path.startsWith('/')) {
			navigate(path)
			// Delay the menu closing slightly to ensure navigation completes
			setTimeout(() => {
				toggleMenu()
			}, 100)
			return
		}

		// Handle special cases
		if (path === '/logout') {
			await handleLogout()
			toggleMenu()
		} else if (path === '#how-it-works') {
			toggleMenu()
			setTimeout(() => {
				document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
			}, 300)
		} else if (path === 'mailto') {
			window.location.href = 'mailto:findalikeme@gmail.com'
			toggleMenu()
		}
	}

	const handleLanguageChange = lang => {
		i18n.changeLanguage(lang)
		setCurrentLang(lang)
		setIsLangMenuOpen(false)
	}

	useEffect(() => {
		const handleClickOutside = event => {
			if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
				setIsLangMenuOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const LanguageSelector = () => {
		const [dropdownOpen, setDropdownOpen] = useState(false)
		const dropdownRef = useRef(null)
		const { t, i18n } = useTranslation()
		const [currentLang, setCurrentLang] = useState(i18n.language || 'en')

		const languages = [
			{ code: 'en', name: 'English', flag: '🇬🇧' },
			{ code: 'pl', name: 'Polski', flag: '🇵🇱' },
			{ code: 'fr', name: 'Français', flag: '🇫🇷' },
			{ code: 'es', name: 'Español', flag: '🇪🇸' },
		]

		useEffect(() => {
			const handleClickOutside = event => {
				if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
					setDropdownOpen(false)
				}
			}

			if (dropdownOpen) {
				document.addEventListener('mousedown', handleClickOutside)
			}

			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}, [dropdownOpen])

		const handleLanguageSelect = langCode => {
			i18n.changeLanguage(langCode)
			setCurrentLang(langCode)
			setTimeout(() => {
				setDropdownOpen(false)
			}, 100)
		}

		return (
			<div className="language-selector" ref={dropdownRef}>
				<button className="language-button" onClick={() => setDropdownOpen(!dropdownOpen)} aria-expanded={dropdownOpen}>
					<IoLanguage className="lang-icon" />
					<span>{currentLang.toUpperCase()}</span>
				</button>

				{dropdownOpen && (
					<>
						<div className="language-menu-backdrop" onClick={() => setDropdownOpen(false)} />
						<div className="language-menu">
							{languages.map(({ code, name, flag }) => (
								<button
									key={code}
									className={`language-option ${currentLang === code ? 'active' : ''}`}
									onClick={() => handleLanguageSelect(code)}>
									<span className="flag">{flag}</span>
									<span className="lang-name">{name}</span>
									{currentLang === code && <span className="check-icon">✓</span>}
								</button>
							))}
						</div>
					</>
				)}
			</div>
		)
	}

	useEffect(() => {
		const fetchUserStats = async () => {
			try {
				const response = await axiosInstance.get(`http://localhost:5001/api/auth/user-stats`)
				setUserStats(response.data)
			} catch (error) {
				console.error('Error fetching user stats:', error)
			}
		}

		fetchUserStats()

		// Listen for real-time updates
		socket.on('userStatusUpdate', ({ userId, status }) => {
			setUserStats(prev => ({
				...prev,
				onlineUsers: status === 'online' ? prev.onlineUsers + 1 : Math.max(0, prev.onlineUsers - 1),
			}))
		})

		return () => {
			socket.off('userStatusUpdate')
		}
	}, [socket])

	const UserStats = ({ className }) => (
		<div className={`user-stats ${className}`}>
			<div className="stat-item online">
				<span className="stat-value">{userStats.onlineUsers}</span>
				<span className="stat-label">{t('user_stats.online')}</span>
			</div>
			<div className="stat-divider" />
			<div className="stat-item total">
				<span className="stat-value">{userStats.totalUsers}</span>
				<span className="stat-label">{t('user_stats.total')}</span>
			</div>
		</div>
	)

	return (
		<>
			<nav className={`navbar ${scrolled && !isMobile ? 'scrolled' : ''}`}>
				<div className={`nav__container ${scrolled && !isMobile ? 'scrolled' : ''}`}>
					<UserStats className="desktop-stats" />
					<div className="nav-center desktop-menu">
						<ul>
							<li>
								<a href="#how-it-works">{t('navbar.menu.how_it_works')}</a>
							</li>
							<li>
								<a href="#faq">{t('navbar.menu.faq')}</a>
							</li>
							<li>
								<a href="mailto:contact@findalikeme.com">{t('navbar.menu.contact')}</a>
							</li>
						</ul>
					</div>
					<div className="nav-right desktop-menu">
						<LanguageSelector />
						{renderButtons()}
					</div>
					<div className="hamburger" ref={hamburgerRef} onClick={toggleMenu}>
						<div className="hamburger-line"></div>
						<div className="hamburger-line"></div>
						<div className="hamburger-line"></div>
					</div>
				</div>
				<div className={`mobile-menu ${isOpen ? 'open' : ''}`} ref={menuRef}>
					<div className="menu-pattern"></div>
					<ul>
						<li className="nav-item">
							<a href="#how-it-works" onClick={e => handleNavClick(e, '#how-it-works')}>
								{t('navbar.menu.how_it_works')}
							</a>
						</li>
						<li className="nav-item">
							<a href="mailto:contact@findalikeme.com" onClick={e => handleNavClick(e, 'mailto')}>
								{t('navbar.menu.contact')}
							</a>
						</li>
						{!user && (
							<>
								<li className="nav-item">
									<a href="/login" onClick={e => handleNavClick(e, '/login')}>
										<Btn2 text={t('navbar.buttons.login')} />
									</a>
								</li>
								<li className="nav-item">
									<a href="/register" onClick={e => handleNavClick(e, '/register')}>
										<Btn3 text={t('navbar.buttons.start_chatting')} />
									</a>
								</li>
							</>
						)}
						{user && !user.isVerified && (
							<>
								<li className="nav-item">
									<a href="/logout" onClick={e => handleNavClick(e, '/logout')}>
										<Btn2 text={t('navbar.buttons.logout')} />
									</a>
								</li>
								<li className="nav-item">
									<a href="/verify" onClick={e => handleNavClick(e, '/verify')}>
										<Btn3 text={t('navbar.buttons.verify')} />
									</a>
								</li>
							</>
						)}
						{user && user.isVerified && (
							<>
								<li className="nav-item">
									<a href="/chat" onClick={e => handleNavClick(e, '/chat')}>
										<Btn2 text={t('navbar.buttons.start_chatting')} />
									</a>
								</li>
								<li className="nav-item">
									<a href="/logout" onClick={e => handleNavClick(e, '/logout')}>
										<Btn3 text={t('navbar.buttons.logout')} />
									</a>
								</li>
							</>
						)}
					</ul>
				</div>
			</nav>

			{isMobile && (
				<div className="mobile-language-selector-wrapper">
					<LanguageSelector />
				</div>
			)}

			{isMobile && (
				<div className="mobile-stats-wrapper">
					<UserStats className="mobile-stats" />
				</div>
			)}
		</>
	)
}

export default Navbar
