import React, { useState, useEffect } from 'react'
import { useAuth, axiosInstance } from '../../context/AuthContext'

import { useNavigate } from 'react-router-dom'

import FriendsList from './Friend/FriendList/FriendList'
// Remove FriendInfo import

import FindNew from '../../components/FindNew/FindNew'
import WaitingRoom from '../../components/WaitingRoom/WaitingRoom'
import ChatWindow from './ChatWindow/ChatWindow'

import ConfirmationDialog from '../ConfirmationDialog/ConfirmationDialog' // Import ConfirmationDialog
import Modal from '../Modal/Modal'

import './ChatLayout.css'

import io from 'socket.io-client'

const socket = io('/', {
	withCredentials: true,
})

const ChatLayout = () => {
	const { user, logoutAndRedirect } = useAuth()
	const navigate = useNavigate()
	const [showFindNew, setShowFindNew] = useState(false)
	const [showWaitingRoom, setShowWaitingRoom] = useState(false)
	const [isSearching, setIsSearching] = useState(false)
	const [selectedFriend, setSelectedFriend] = useState(null)
	const [isSidebarOpen, setIsSidebarOpen] = useState(true) // Początkowo sidebar jest otwarty
	const [isChatWindowOpen, setIsChatWindowOpen] = useState(false) // Początkowo chat window jest zamknięty
	const [messages, setMessages] = useState([])
	const [onlineStatuses, setOnlineStatuses] = useState({})
	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false) // Nowy stan do zarządzania ConfirmationDialog
	const [isFriendSelected, setIsFriendSelected] = useState(false)
	const [activeSearches, setActiveSearches] = useState([]) // Add this new state

	const toggleSidebar = () => {
		setIsSidebarOpen(true) // Otwórz sidebar
		setIsChatWindowOpen(false) // Zamknij chat window
	}

	const handleSelectFriend = friend => {
		setSelectedFriend(friend)
		setIsFriendSelected(true)
	}

	const handleBackToFriendList = () => {
		setIsFriendSelected(false)
	}

	const fetchMessages = async friendId => {
		try {
			const { data } = await axiosInstance.get(`/messages?user1=${user._id}&user2=${friendId}`)
			setMessages(data)
		} catch (error) {
			console.error('Error fetching messages:', error)
		}
	}

	useEffect(() => {
		const handleReceiveMessage = message => {
			setMessages(prevMessages => [...prevMessages, message])
		}

		const handleUserStatusUpdate = ({ userId, status }) => {
			setOnlineStatuses(prev => ({
				...prev,
				[userId]: status,
			}))
		}

		socket.on('receiveMessage', handleReceiveMessage)
		socket.on('userStatusUpdate', handleUserStatusUpdate)

		return () => {
			socket.off('receiveMessage', handleReceiveMessage)
			socket.off('userStatusUpdate', handleUserStatusUpdate)
		}
	}, [])

	useEffect(() => {
		const handleUserStatusUpdate = ({ userId, status }) => {
			setOnlineStatuses(prev => ({
				...prev,
				[userId]: status,
			}))
		}

		socket.on('userStatusUpdate', handleUserStatusUpdate)

		return () => {
			socket.off('userStatusUpdate', handleUserStatusUpdate)
		}
	}, [])

	const checkActiveSearch = async () => {
		try {
			const response = await axiosInstance.get('/active-search')
			if (response && response.data) {
				setIsSearching(response.data.isSearching)
				setActiveSearches(response.data.activeSearches || []) // Store all active searches
				if (response.data.isSearching) {
					setShowWaitingRoom(true)
				}
			}
		} catch (error) {
			console.error('Error checking active search:', error)
		}
	}

	useEffect(() => {
		let intervalId

		if (user) {
			socket.emit('join', user._id)

			intervalId = setInterval(checkActiveSearch, 5000)
			checkActiveSearch()

			socket.on('friendFound', data => {
				window.location.reload()
			})

			socket.on('friendRemoved', data => {
				window.location.reload()
			})

			socket.on('match', data => {
				window.location.reload()
			})
		}

		return () => {
			socket.off('friendFound')
			socket.off('friendRemoved')
			socket.off('match')
			clearInterval(intervalId)
		}
	}, [user, navigate])

	const handleFindNewSubmit = async data => {
		if (data.matchFound) {
			window.location.reload()
		} else {
			setShowFindNew(false)
			setIsSearching(true)
			// Immediately update the active searches with the new search
			setActiveSearches(prevSearches => [...prevSearches, data.searchDetails])
			setShowWaitingRoom(true)
		}
	}

	const handleFindNew = () => {
		setShowFindNew(true)
		// Remove the isSearching check since users can have multiple searches
	}

	const handleCloseWaitingRoom = () => {
		setShowWaitingRoom(false)
	}

	const handleCancelSearch = () => {
		setIsSearching(false)
		setShowWaitingRoom(false)
	}

	const confirmRemove = () => {
		// Logika usunięcia znajomego
		setShowConfirmationDialog(false) // Zamknij okno dialogowe po potwierdzeniu
	}

	const cancelRemoveFriend = () => {
		setShowConfirmationDialog(false) // Zamknij okno dialogowe po anulowaniu
	}

	return (
		<div className={`chat-layout__container ${isFriendSelected ? 'friend-selected' : ''}`}>
			<Modal show={showFindNew} onClose={() => setShowFindNew(false)}>
				<FindNew onSubmit={handleFindNewSubmit} />
			</Modal>

			<Modal show={showWaitingRoom} onClose={handleCloseWaitingRoom}>
				<WaitingRoom
					onCancelSearch={handleCancelSearch}
					activeSearches={activeSearches} // Pass active searches to WaitingRoom
				/>
			</Modal>

			<FriendsList
				selectedFriend={selectedFriend}
				onSelectFriend={handleSelectFriend}
				onFindNew={handleFindNew}
				isSearching={isSearching}
				setShowWaitingRoom={setShowWaitingRoom}
				messages={messages}
				onlineStatuses={onlineStatuses}
			/>

			{/* Chat Window */}

			<ChatWindow
				selectedFriend={selectedFriend}
				toggleSidebar={handleBackToFriendList} // Use this for the back button
				messages={messages}
				setMessages={setMessages}
				onlineStatuses={onlineStatuses}
			/>

			{/* Confirmation Dialog */}
			{showConfirmationDialog && (
				<ConfirmationDialog
					message={`Are you sure you want to remove ${selectedFriend?.name}?`}
					onConfirm={confirmRemove}
					onCancel={cancelRemoveFriend}
				/>
			)}
		</div>
	)
}

export default ChatLayout
