// src/components/User/FriendsList/FriendsList.js

import React, { useState, useEffect } from 'react'
import { useAuth, axiosInstance } from '../../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import './FriendList.css'
import { FiSettings, FiChevronDown, FiChevronUp, FiX, FiClock, FiCalendar } from 'react-icons/fi'
import Modal from '../../../Modal/Modal'
import FindNew from '../../../../components/FindNew/FindNew'
import PsychologistModal from '../../../../components/PsychologistModal/PsychologistModal'

const formatTimeAgo = (date, t) => {
	const now = new Date()
	const searchDate = new Date(date)
	const diffInMinutes = Math.floor((now - searchDate) / (1000 * 60))

	if (diffInMinutes < 1) return t('active_searches.time_ago.just_now')
	if (diffInMinutes < 60) return t('active_searches.time_ago.minutes_ago', { count: diffInMinutes })
	if (diffInMinutes < 1440) return t('active_searches.time_ago.hours_ago', { count: Math.floor(diffInMinutes / 60) })
	return t('active_searches.time_ago.days_ago', { count: Math.floor(diffInMinutes / 1440) })
}

const FriendsList = ({ selectedFriend, onSelectFriend, onFindNew, messages, onlineStatuses }) => {
	const { t } = useTranslation() // Dodano useTranslation
	const [friends, setFriends] = useState([])
	const [activeSearches, setActiveSearches] = useState([]) // New state for active searches
	const [unreadCounts, setUnreadCounts] = useState({})
	const { user, logoutAndRedirect } = useAuth()
	const navigate = useNavigate()
	const [lastMessages, setLastMessages] = useState({})
	const [lastMessageDates, setLastMessageDates] = useState({})
	const [showFindNewModal, setShowFindNewModal] = useState(false)
	const [expandedSearches, setExpandedSearches] = useState({})
	const [isSearchSectionCollapsed, setIsSearchSectionCollapsed] = useState(false)
	const [isFriendsListCollapsed, setIsFriendsListCollapsed] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [isSearching, setIsSearching] = useState(false)
	const [isSearchFocused, setIsSearchFocused] = useState(false)
	const [showPsychModal, setShowPsychModal] = useState(false)

	// Move fetchData outside useEffect so it can be used elsewhere
	const fetchData = async () => {
		try {
			// Fetch friends
			const friendsResponse = await axiosInstance.get('/friends')
			setFriends(friendsResponse.data)

			// Fetch active searches
			const searchesResponse = await axiosInstance.get('/active-search')
			setActiveSearches(searchesResponse.data)

			const initialLastMessages = {}
			const initialLastMessageDates = {}
			for (const friend of friendsResponse.data) {
				const response = await axiosInstance.get(`/messages/last?user1=${user._id}&user2=${friend._id}`)
				const lastMessage = response.data

				if (lastMessage && lastMessage.content) {
					initialLastMessages[friend._id] =
						lastMessage.content.length > 6 ? lastMessage.content.substring(0, 6) + '...' : lastMessage.content
					initialLastMessageDates[friend._id] = new Date(lastMessage.createdAt)
				} else {
					initialLastMessages[friend._id] = ''
					initialLastMessageDates[friend._id] = new Date(0)
				}
			}
			setLastMessages(initialLastMessages)
			setLastMessageDates(initialLastMessageDates)
		} catch (error) {
			if (error.response?.status === 401) {
				console.error('Unauthorized access, logging out...')
				logoutAndRedirect()
			} else {
				console.error('Error fetching data:', error)
				// Don't logout for other types of errors
			}
		}
	}

	useEffect(() => {
		if (user) {
			fetchData()
		}
	}, [user])

	useEffect(() => {
		if (messages.length > 0) {
			const latestMessage = messages[messages.length - 1]
			const friendId = latestMessage.sender === user._id ? latestMessage.receiver : latestMessage.sender

			setLastMessages(prev => ({
				...prev,
				[friendId]:
					latestMessage.content.length > 6 ? latestMessage.content.substring(0, 6) + '...' : latestMessage.content,
			}))

			setLastMessageDates(prev => ({
				...prev,
				[friendId]: new Date(latestMessage.createdAt),
			}))
		}
	}, [messages, user._id])

	const sortedFriends = friends.slice().sort((a, b) => {
		const dateA = lastMessageDates[a._id] || new Date(0)
		const dateB = lastMessageDates[b._id] || new Date(0)
		return dateB - dateA
	})

	const handleLogout = () => {
		logoutAndRedirect()
		toast.success(t('friends_list.logout_success')) // Użycie t()
	}

	const handleSelectFriend = friend => {
		setUnreadCounts(prev => ({
			...prev,
			[friend._id]: 0,
		}))
		onSelectFriend(friend)
	}

	const handleFindNewClick = () => {
		setShowFindNewModal(true)
	}

	// Update handleFindNewSubmit to use the now-accessible fetchData function
	const handleFindNewSubmit = data => {
		setShowFindNewModal(false)
		if (data.matchFound) {
			window.location.reload() // Use page reload instead of fetchData
		}
		toast.success(t('friendList.searchStarted'))
	}

	const toggleSearch = searchId => {
		setExpandedSearches(prev => ({
			...prev,
			[searchId]: !prev[searchId],
		}))
	}

	const handleCancelSearch = async searchId => {
		try {
			await axiosInstance.delete('/cancel-search', { data: { searchId } })
			setActiveSearches(prev => prev.filter(search => search._id !== searchId))
			toast.success('Search canceled successfully')
		} catch (error) {
			console.error('Error canceling search:', error)
			toast.error('Failed to cancel search')
		}
	}

	const toggleSearchSection = () => {
		setIsSearchSectionCollapsed(!isSearchSectionCollapsed)
	}

	const toggleFriendsList = () => {
		setIsFriendsListCollapsed(!isFriendsListCollapsed)
	}

	const handleSearchInput = e => {
		const query = e.target.value
		setSearchQuery(query)
		setIsSearching(query.length > 0)

		if (query.length > 0) {
			setIsFriendsListCollapsed(false)
		}
	}

	const filteredFriends = sortedFriends.filter(friend => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

	// Handle search focus
	const handleSearchFocus = () => {
		setIsSearchFocused(true)
	}

	// Handle search blur
	const handleSearchBlur = () => {
		if (!searchQuery) {
			setIsSearchFocused(false)
		}
	}

	return (
		<div className="friends-list__container">
			<div className="friends-list__title">
				<h5 className="friends-list__friends__list__title">{t('friends_list.title')}</h5>
				<div className="friends-list__find-new-btn-bg-div-borr">
					<button onClick={handleFindNewClick}>+</button>
				</div>
			</div>
			<input
				type="text"
				placeholder={t('friends_list.search_placeholder')}
				className="friends-list__search"
				value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
				onFocus={handleSearchFocus}
				onBlur={handleSearchBlur}
			/>
			<div className="friends-list__scroll-container">
				<ul className="friends-list__list">
					{friends && friends.length > 0 && (
						<div className="friends-section">
							<div className="section-header" onClick={toggleFriendsList}>
								<div className="section-header-content">
									<span>{t('friends_list.my_friends')}</span>
									<span className="search-counter">{searchQuery ? filteredFriends.length : friends.length}</span>
								</div>
								{isFriendsListCollapsed ? (
									<FiChevronDown className="section-chevron" />
								) : (
									<FiChevronUp className="section-chevron" />
								)}
							</div>
							{!isFriendsListCollapsed && (
								<div className="friends-content">
									{(searchQuery ? filteredFriends : sortedFriends).map(friend => (
										<div
											key={friend._id}
											className={`friends-list__item ${
												selectedFriend && selectedFriend._id === friend._id ? 'active' : ''
											}`}
											onClick={() => handleSelectFriend(friend)}>
											<div className="friends-list__item__status">
												<img
													src={friend.profilePicture}
													alt={friend.name}
													className={`friends-list__profile-picture pfp099 ${
														onlineStatuses[friend._id] === 'online' ? 'green-border' : 'gray-border'
													}`}
												/>
												<span
													className={`friends-list__status-icon ${
														onlineStatuses[friend._id] === 'online' ? 'online' : 'offline'
													}`}></span>
											</div>
											<div className="friends-list__details">
												<span className="friends-list__name">{friend.name}</span>
												<span className="friends-list__last-message">{lastMessages[friend._id]}</span>
												{unreadCounts[friend._id] > 0 && (
													<span className="friends-list__unread-count">{unreadCounts[friend._id]}</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					{!isSearchFocused && activeSearches && activeSearches.length > 0 && (
						<div className="active-searches-section">
							<div className="section-header" onClick={toggleSearchSection}>
								<div className="section-header-content">
									<span>{t('friends_list.active_searches_section.title')}</span>
									<span className="search-counter">{activeSearches.length}</span>
								</div>
								<button aria-label={t('friends_list.active_searches_section.toggle_aria')} className="section-toggle">
									{isSearchSectionCollapsed ? (
										<FiChevronDown className="section-chevron" />
									) : (
										<FiChevronUp className="section-chevron" />
									)}
								</button>
							</div>
							{!isSearchSectionCollapsed && (
								<div className="active-searches-content">
									{activeSearches.map(search => (
										<div key={search._id} className="active-search-item">
											<div className="search-header">
												<div className="search-status-indicator">
													<div className="status-dot"></div>
													<span>{t('active_searches.status')}</span>
												</div>

												<button
													className="cancel-search-btn"
													onClick={() => handleCancelSearch(search._id)}
													aria-label={t('active_searches.cancel_search')}>
													<FiX />
												</button>
											</div>

											<div className="active-search-main">
												<div className="active-search-category">{search.category}</div>

												<div className="active-search-issue">{search.specificIssue}</div>
											</div>

											<div className="active-search-meta">
												<div className="meta-item">
													<FiCalendar />
													<span>
														{search.ageRange} {t('active_searches.age_range')}
													</span>
												</div>
												<div className="meta-item">
													<FiClock />
													<span>{formatTimeAgo(search.createdAt, t)}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{searchQuery && filteredFriends.length === 0 && (
						<p className="friends-list-p">{t('friends_list.no_friends_found', { query: searchQuery })}</p>
					)}

					{!isSearching && !friends.length && !activeSearches.length && (
						<p className="friends-list-p">{t('friends_list.no_friends_or_active_searches')}</p>
					)}
				</ul>
			</div>

			<div className="active-searches-list"></div>
			<div className="friends-list__buttons-container">
				<button className="friends-list__find-new" onClick={handleFindNewClick}>
					{t('friends_list.find_new_friend')}
				</button>

				<div className="friends-list__divider">
					<span>{t('friends_list.or')}</span>
				</div>

				<button className="friends-list__professional-help" onClick={() => setShowPsychModal(true)}>
					{t('friends_list.talk_to_professional')}
				</button>
			</div>

			<Modal show={showFindNewModal} onClose={() => setShowFindNewModal(false)}>
				<FindNew onSubmit={handleFindNewSubmit} />
			</Modal>

			<Modal show={showPsychModal} onClose={() => setShowPsychModal(false)}>
				<PsychologistModal onClose={() => setShowPsychModal(false)} />
			</Modal>

			<div className="friends-list__profile-info" onClick={() => navigate('/edit-profile')}>
				<div className="friends-list__profile-info__container">
					<img
						src={user?.profilePicture || 'https://via.placeholder.com/150'}
						alt={user?.name || 'Profile'}
						className="friends-list__profile-picture"
						onError={e => {
							e.target.onerror = null
							e.target.src = 'https://via.placeholder.com/150'
						}}
					/>
					<div className="friends-list__user-details">
						<span className="friends-list__user-name">{user?.name}</span>
						<span className="friends-list__user-email">{user?.email}</span>
					</div>
				</div>
				<div className="friends-list__settings">
					<FiSettings className="friends-list__settings-icon" />
				</div>
			</div>
		</div>
	)
}

export default FriendsList
