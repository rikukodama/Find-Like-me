// src/components/ChatWindow/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { useAuth } from '../../../context/AuthContext'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import './ChatWindow.css'
import NoFriendSelected from '../../../assets/ChatPage/NoFriends.svg'
import ConfirmationDialog from '../../ConfirmationDialog/ConfirmationDialog'
import {
	FiSmile,
	FiSend,
	FiArrowLeft,
	FiMoreVertical,
	FiSearch,
	FiClock,
	FiStar,
	FiX,
	FiHeart,
	FiCoffee,
	FiFlag,
} from 'react-icons/fi'

const socket = io(`https://findalike.me`, {
	withCredentials: true,
	extraHeaders: {
		'my-custom-header': 'abcd',
	},
})
const languageFlags = {
	pl: '🇵🇱',
	en: '🇬🇧',
	fr: '🇫🇷',
	es: '🇪🇸',
	// Dodaj inne języki i ich flagi tutaj
}
const ChatWindow = ({ selectedFriend, toggleFriendInfo, toggleSidebar, onlineStatuses }) => {
	const { t, i18n } = useTranslation() // Dodano i18n
	const { user } = useAuth()
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')
	const [replyTo, setReplyTo] = useState(null)
	const [showOptions, setShowOptions] = useState(null)
	const [showTopOptions, setShowTopOptions] = useState(false)
	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
	const messagesEndRef = useRef(null)
	const optionsRef = useRef(null)
	const textareaRef = useRef(null)
	const dropdownRef = useRef(null)
	const [friendshipInfo, setFriendshipInfo] = useState(null)
	const [showOptionsMenu, setShowOptionsMenu] = useState(false)
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)
	const [emojiSearch, setEmojiSearch] = useState('')
	const [activeCategory, setActiveCategory] = useState('recent')
	const emojiPickerRef = useRef(null)

	const frequentEmojis = ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👋', '✨']

	const emojiCategories = [
		{
			id: 'recent',
			icon: <FiClock />,
			label: 'Recent',
			emojis: ['😊', '👍', '❤️', '😂', '🎉', '🔥', '👋', '✨', '🙌', '👏', '🤗', '🥳'],
		},
		{
			id: 'favorites',
			icon: <FiStar />,
			label: 'Favorites',
			emojis: ['⭐', '💫', '🌟', '✨', '💖', '💝', '💕', '💞', '💓', '💗', '💘', '💜'],
		},
		{
			id: 'smileys',
			icon: <FiSmile />,
			label: 'Smileys',
			emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌'],
		},
		{
			id: 'emotions',
			icon: <FiHeart />,
			label: 'Emotions',
			emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💫'],
		},
		{
			id: 'food',
			icon: <FiCoffee />,
			label: 'Food',
			emojis: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙'],
		},
		{
			id: 'flags',
			icon: <FiFlag />,
			label: 'Flags',
			emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇺🇸', '🇬🇧', '🇯🇵', '🇰🇷', '🇨🇳'],
		},
	]

	const handleCategoryChange = categoryId => {
		setActiveCategory(categoryId)
	}

	const getCurrentEmojis = () => {
		if (emojiSearch) {
			// Combine all emojis and filter based on search
			const allEmojis = emojiCategories.flatMap(cat => cat.emojis)
			// Create a mapping of emojis to their names
			const emojiNames = {
				'😊': 'Smiling Face',
				'👍': 'Thumbs Up',
				'❤️': 'Heart',
				'😂': 'Face with Tears of Joy',
				'🎉': 'Party Popper',
				'🔥': 'Fire',
				'👋': 'Waving Hand',
				'✨': 'Sparkles',
				// Add more emojis and their names as needed
			}
			return allEmojis.filter(
				emoji =>
					emoji.toLowerCase().includes(emojiSearch.toLowerCase()) ||
					(emojiNames[emoji] && emojiNames[emoji].toLowerCase().includes(emojiSearch.toLowerCase()))
			)
		}
		return emojiCategories.find(cat => cat.id === activeCategory)?.emojis || []
	}

	const handleInputChange = e => {
		setMessage(e.target.value)
	}

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	const handleReply = message => {
		if (!message.isDeleted) {
			setReplyTo(message)
			scrollToBottom()
		}
	}

	useEffect(() => {
		if (selectedFriend) {
			const fetchMessages = async () => {
				try {
					const { data } = await axios.get(
						`https://findalike.me/api/messages?user1=${user._id}&user2=${selectedFriend._id}`,
						{ withCredentials: true }
					)
					setMessages(data)
				} catch (error) {
					console.error('Error fetching messages:', error)
				}
			}
			fetchMessages()
		}
	}, [selectedFriend, user._id])

	useEffect(() => {
		socket.emit('join', user._id)

		socket.on('receiveMessage', async message => {
			if (
				selectedFriend &&
				((message.sender === user._id && message.receiver === selectedFriend._id) ||
					(message.receiver === user._id && message.sender === selectedFriend._id))
			) {
				setMessages(prevMessages => {
					const updatedMessages = [...prevMessages, message]
					if (updatedMessages.length > 20) {
						const oldestMessage = updatedMessages[0] // The message to delete

						// Send request to backend to delete the oldest message from the database
						deleteOldestMessage(oldestMessage._id)

						updatedMessages.shift() // Remove the first (oldest) message
					}
					return updatedMessages
				})
				scrollToBottom()
			}
		})

		const deleteOldestMessage = async messageId => {
			try {
				await axios.delete(`https://findalike.me/api/messages/${messageId}`, {
					withCredentials: true,
				})
			} catch (error) {
				console.error('Error deleting the oldest message:', error)
			}
		}
		socket.on('messageEdited', editedMessage => {
			if (selectedFriend) {
				setMessages(prevMessages => prevMessages.map(msg => (msg._id === editedMessage._id ? editedMessage : msg)))
				scrollToBottom()
			}
		})

		socket.on('messageDeleted', deletedMessage => {
			if (selectedFriend) {
				setMessages(prevMessages =>
					prevMessages.map(msg =>
						msg._id === deletedMessage._id
							? { ...msg, isDeleted: true, content: t('chat_window.message_deleted') }
							: msg
					)
				)
				scrollToBottom()
			}
		})

		// Listening to `messagesReset` event
		socket.on('messagesReset', () => {
			;('Received messagesReset event') // Added for debuggingconsole.log
			window.location.reload() // Refresh the page upon receiving the event
		})

		socket.on('friendRemoved', ({ friendId }) => {
			if (selectedFriend && selectedFriend._id === friendId) {
				window.location.reload()
			} else if (user._id === friendId) {
				window.location.reload()
			}
		})

		return () => {
			socket.off('receiveMessage')
			socket.off('messageEdited')
			socket.off('messageDeleted')
			socket.off('messagesReset') // Remove listener on component unmount
			socket.off('friendRemoved')
		}
	}, [user, selectedFriend, t, i18n.language]) // Dodano i18n.language

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleSendMessage = async () => {
		if (selectedFriend && message.trim()) {
			const newMessage = {
				sender: user._id,
				receiver: selectedFriend._id,
				content: message,
				replyTo: replyTo ? replyTo._id : null,
			}

			socket.emit('sendMessage', newMessage)
			setMessage('')
			setReplyTo(null)
		}
	}

	const handleDeleteMessage = async messageId => {
		if (selectedFriend) {
			socket.emit('deleteMessage', { messageId })

			try {
				await axios.delete(`https://findalike.me/api/messages/${messageId}`, {
					withCredentials: true,
				})
			} catch (error) {
				console.error('Error deleting message:', error)
			}
		}
	}

	const handleEditMessage = async (messageId, newContent) => {
		if (selectedFriend) {
			socket.emit('editMessage', { messageId, content: newContent })

			try {
				await axios.put(
					`https://findalike.me/api/messages/${messageId}`,
					{ content: newContent },
					{ withCredentials: true }
				)
			} catch (error) {
				console.error('Error editing message:', error)
			}
		}
	}

	const handleOptionsToggle = messageId => {
		if (showOptions === messageId) {
			setShowOptions(null)
		} else {
			setShowOptions(messageId)
		}
	}

	const handleClickOutside = event => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setShowOptions(null)
			setShowTopOptions(false)
		}
	}

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleKeyPress = event => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSendMessage()
		}
	}

	const handleRemoveFriend = async friendId => {
		if (!friendId || friendId.length !== 24) {
			console.error('Invalid friendId')
			return
		}

		try {
			await axios.post(`https://findalike.me/api/remove-friend`, { friendId }, { withCredentials: true })
			socket.emit('friendRemoved', { friendId })
			window.location.reload()
		} catch (error) {
			console.error('Error removing friend', error)
		}
	}

	const confirmRemoveFriend = () => {
		setShowConfirmationDialog(true)
	}

	const cancelRemoveFriend = () => {
		setShowConfirmationDialog(false)
	}

	const confirmRemove = () => {
		if (selectedFriend) {
			handleRemoveFriend(selectedFriend._id)
			setShowConfirmationDialog(false)
		}
	}

	const shouldStartNewSeries = (currentMsg, prevMsg) => {
		if (!prevMsg) return true

		if (currentMsg.sender !== prevMsg.sender) {
			return true
		}

		const currentDate = new Date(currentMsg.createdAt)
		const prevDate = new Date(prevMsg.createdAt)

		if (currentDate.getMinutes() !== prevDate.getMinutes()) {
			return true
		}

		return false
	}
	// Function to format date
	const formatMessageDate = messageDate => {
		const now = new Date()
		const date = new Date(messageDate)
		const isToday =
			date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()

		const isCurrentYear = date.getFullYear() === now.getFullYear()

		const datePart = isToday
			? t('chat_window.today')
			: date.toLocaleDateString(i18n.language, {
					year: isCurrentYear ? undefined : 'numeric',
					month: 'long',
					day: 'numeric',
			  })

		const timePart = date.toLocaleTimeString(i18n.language, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})

		return `${datePart} • ${timePart}`
	}
	// Add useEffect to fetch friendship info when selectedFriend changes
	useEffect(() => {
		const fetchFriendshipInfo = async () => {
			if (selectedFriend?._id) {
				try {
					const response = await axios.get(`https://findalike.me/api/friendship-info/${selectedFriend._id}`, {
						withCredentials: true,
					})

					if (response.data) {
						setFriendshipInfo(response.data)
					} else {
						console.warn('No data in response')
					}
				} catch (error) {
					console.error('Error fetching friendship info:', {
						error,
						response: error.response,
						status: error.response?.status,
						data: error.response?.data,
					})
				}
			}
		}

		fetchFriendshipInfo()
	}, [selectedFriend])

	const handleOptionsClick = e => {
		e.stopPropagation()
		setShowOptionsMenu(prev => !prev)
	}

	useEffect(() => {
		const handleClickOutside = event => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleEmojiClick = emoji => {
		setMessage(prev => prev + emoji)
		// Optional: close picker after selection
		// setShowEmojiPicker(false)
	}

	const toggleEmojiPicker = () => {
		setShowEmojiPicker(prev => !prev)
	}

	return (
		<div className="chat-window__container">
			{selectedFriend ? (
				<>
					<div className="selected-friend-top-info">
						{/* Add back arrow button */}
						<button className="chat-window__back-button" onClick={toggleSidebar}>
							<FiArrowLeft size={24} aria-label={t('chat_window.back_button')} />
						</button>

						<div className="selected-friend-top-info__profile-info">
							<div className="friends-list__item__status">
								<img
									src={selectedFriend.profilePicture}
									alt="Profile"
									onClick={toggleFriendInfo}
									className={`friends-list__profile-picture pfp099 ${
										onlineStatuses[selectedFriend._id] === 'online' ? 'green-border' : 'gray-border'
									}`}
								/>
								<span
									className={`friends-list__status-icon ${
										onlineStatuses[selectedFriend._id] === 'online' ? 'online' : 'offline'
									}`}></span>
							</div>
							<div className="selected-friend-top-info__text">
								<h5 onClick={toggleFriendInfo}>{selectedFriend.name}</h5>
								{friendshipInfo && <span className="specific-issue">{friendshipInfo.specificIssue}</span>}
							</div>
						</div>

						{/* Add the options menu here */}
						<div className="friend-options">
							<button className="friend-options__button" onClick={handleOptionsClick} aria-label="More options">
								<FiMoreVertical size={20} />
							</button>

							{showOptionsMenu && (
								<>
									<div className="friend-options__overlay" onClick={() => setShowOptionsMenu(false)} />
									<div className="friend-options__menu">
										<button
											className="friend-options__menu-item friend-options__menu-item--delete"
											onClick={confirmRemoveFriend}>
											{t('chat_window.delete_friend')}
										</button>
									</div>
								</>
							)}
						</div>
					</div>
					<div className="chat-window__messages-container">
						<div className="bg-pattern"></div>
						{messages.map((msg, index) => {
							const prevMsg = index > 0 ? messages[index - 1] : null
							const nextMsg = index < messages.length - 1 ? messages[index + 1] : null

							const isSeriesStart = shouldStartNewSeries(msg, prevMsg)
							const isLastInSeries =
								!nextMsg ||
								(nextMsg &&
									(nextMsg.sender !== msg.sender ||
										new Date(nextMsg.createdAt).getMinutes() !== new Date(msg.createdAt).getMinutes()))

							const isStandalone = isSeriesStart && isLastInSeries

							const parentClasses = [
								'chat-window__message',
								msg.sender === user._id ? 'chat-window__message-sent' : 'chat-window__message-received',
								msg.isDeleted ? 'chat-window__message-deleted' : '',
								isStandalone ? '' : isSeriesStart ? 'message-series-start' : '',
								!isStandalone && isLastInSeries ? 'message-series-end' : '',
								!isStandalone && !isSeriesStart && !isLastInSeries ? 'message-in-series' : '',
							]
								.filter(Boolean)
								.join(' ')

							return (
								<div key={msg._id} className={parentClasses}>
									{isLastInSeries && msg.sender !== user._id && (
										<img src={selectedFriend.profilePicture} alt="Profile" className="chat-window__profile-picture" />
									)}
									<div className="chat-window__message-content">
										{msg.isDeleted ? t('chat_window.message_deleted') : msg.content}
										{msg.edited && !msg.isDeleted && <span className="chat-window__edited-label">*</span>}
										{msg.replyTo && (
											<div className="chat-window__reply-message">
												{t('chat_window.replying_to')}: {messages.find(m => m._id === msg.replyTo)?.content}
											</div>
										)}
									</div>
									{(isStandalone || isLastInSeries) && (
										<div className="chat-window__message-time">{formatMessageDate(msg.createdAt)}</div>
									)}
								</div>
							)
						})}
						<div ref={messagesEndRef} />
					</div>
					{replyTo && (
						<div className="chat-window__reply-preview">
							<span>
								{t('chat_window.replying_to')}: <b>{replyTo.content}</b>
							</span>
							<button onClick={() => setReplyTo(null)}>{t('chat_window.cancel_reply')}</button>
						</div>
					)}

					<div className="chat-window__message-input-container">
						<div className="emoji-picker-wrapper">
							<div className="emoji-icon" onClick={toggleEmojiPicker}>
								<FiSmile className={`chat-window__emoji-icon ${showEmojiPicker ? 'emoji-icon--active' : ''}`} />
							</div>

							{showEmojiPicker && (
								<div className="emoji-picker-container" ref={emojiPickerRef}>
									<div className="emoji-picker__header">
										<span className="emoji-picker__title">{t('chat_window.emoji_picker.title')}</span>
										<button
											className="emoji-picker__close"
											onClick={() => setShowEmojiPicker(false)}
											aria-label={t('chat_window.emoji_picker.close')}>
											<FiX />
										</button>
									</div>

									<div className="emoji-picker__search">
										<div className="emoji-picker__search-wrapper">
											<FiSearch className="emoji-picker__search-icon" />
											<input
												type="text"
												className="emoji-picker__search-input"
												placeholder={t('chat_window.emoji_picker.search.placeholder')}
												value={emojiSearch}
												onChange={e => setEmojiSearch(e.target.value)}
											/>
										</div>
									</div>

									<div className="emoji-picker__categories">
										{emojiCategories.map(category => (
											<button
												key={category.id}
												className={`emoji-picker__category ${
													activeCategory === category.id ? 'emoji-picker__category--active' : ''
												}`}
												onClick={() => handleCategoryChange(category.id)}
												aria-label={t(`chat_window.emoji_picker.categories.${category.id}`)}>
												{category.icon}
												<span>{t(`chat_window.emoji_picker.categories.${category.id}`)}</span>
											</button>
										))}
									</div>

									<div className="emoji-picker__content">
										<div className="emoji-picker__section-title">
											{emojiSearch
												? t('chat_window.emoji_picker.section_titles.search_results')
												: t(`chat_window.emoji_picker.categories.${activeCategory}`)}
										</div>
										<div className="emoji-picker__emojis">
											{getCurrentEmojis().map((emoji, index) => (
												<button
													key={index}
													className="emoji-picker__emoji"
													onClick={() => handleEmojiClick(emoji)}
													aria-label={`Emoji ${emoji}`}>
													{emoji}
												</button>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
						<div style={{ position: 'relative', width: '100%' }}>
							<input
								ref={textareaRef}
								value={message}
								onChange={handleInputChange}
								onKeyPress={handleKeyPress}
								placeholder={t('chat_window.message_input.placeholder')}
								disabled={!selectedFriend}
								className="chat-window__message-input"
							/>
							<div onClick={handleSendMessage} className="chat-window__send-button">
								<FiSend className="chat-window__send-icon" />
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="chat-window__no-friend-selected">
					<img src={NoFriendSelected} alt="No friend selected" className="chat-window__no-friend-selected__image" />
					<div>
						<h5 className="chat-window__no-friend-selected__title">{t('chat_window.no_friend_selected_title')}</h5>
						<p className="chat-window__no-friend-selected__subtitle">{t('chat_window.no_friend_selected_subtitle')}</p>
					</div>
				</div>
			)}
			{showConfirmationDialog && (
				<ConfirmationDialog
					message={t('chat_window.confirm_remove_friend', { name: selectedFriend.name })}
					onConfirm={confirmRemove}
					onCancel={cancelRemoveFriend}
				/>
			)}
		</div>
	)
}

export default ChatWindow
