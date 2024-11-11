// src/components/User/FriendInfo/FriendInfo.js
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ConfirmationDialog from '../../../ConfirmationDialog/ConfirmationDialog'
import io from 'socket.io-client'
import { useTranslation } from 'react-i18next'

const socket = io(`http://localhost:5001`, {
	withCredentials: true,
	extraHeaders: {
		'my-custom-header': 'abcd',
	},
})

const FriendInfo = ({ selectedFriend, onClose }) => {
	const { t, i18n } = useTranslation() // Destructure i18n here
	const [friendToRemove, setFriendToRemove] = useState(null)
	const [matchInfo, setMatchInfo] = useState(null)
	const [notification, setNotification] = useState('')

	useEffect(() => {
		if (selectedFriend) {
			const fetchMatchInfo = async () => {
				try {
					const { data } = await axios.get(`http://localhost:5001/api/friendship/${selectedFriend._id}`, {
						withCredentials: true,
					})
					setMatchInfo(data)
				} catch (error) {
					console.error('Błąd podczas pobierania informacji o dopasowaniu:', error)
				}
			}

			fetchMatchInfo()
		}
	}, [selectedFriend])

	const handleRemoveFriend = async friendId => {
		try {
			await axios.post(`http://localhost:5001/api/remove-friend`, { friendId }, { withCredentials: true })
			socket.emit('friendRemoved', { friendId })
			setNotification(t('friend_info.remove_friend_success')) // Użycie t()
			setTimeout(() => {
				window.location.reload()
			}, 2000)
		} catch (error) {
			console.error('Błąd podczas usuwania znajomego:', error)
			setNotification(t('friend_info.remove_friend_error')) // Użycie t()
		}
	}

	const confirmRemoveFriend = friend => {
		setFriendToRemove(friend)
	}

	const cancelRemoveFriend = () => {
		setFriendToRemove(null)
	}

	const confirmRemove = () => {
		if (friendToRemove) {
			handleRemoveFriend(friendToRemove._id)
			setFriendToRemove(null)
		}
	}

	return (
		<div className="friend-info__container">
			<div className="friend-info__header-info">
				<button className="friend-info__close-button" onClick={onClose}></button>
			</div>
			{selectedFriend ? (
				<div className="friend-info__details">
					<div className="friend-info__top">
						<img src={selectedFriend.profilePicture} alt={selectedFriend.name} className="friend-info__picture" />
						<h3>{selectedFriend.name}</h3>
					</div>
					<div className="friend-info__desc">
						<h5 className="friends-list__friends__list__title">{t('friend_info.description')}</h5>
						<div className="friend-info__desc-border">
							<strong>{t('friend_info.friend_description')}</strong>
							<p className="friend-info__description">
								{selectedFriend?.description ? selectedFriend.description : t('friend_info.no_description')}
							</p>
						</div>
					</div>
					<div className="friend-info__match-info">
						<h5 className="friends-list__friends__list__title">{t('friend_info.problem')}</h5>
						<div className="friend-info__match-desc-border">
							{matchInfo ? (
								<>
									<p>
										<strong>{t('friend_info.category')}:</strong> {matchInfo.category}
									</p>
									<p>
										<strong>{t('friend_info.specific_issue')}:</strong> {matchInfo.specificIssue}
									</p>
								</>
							) : (
								<p>{t('friend_info.loading_problem_info')}</p>
							)}
						</div>
					</div>
					<div className="friend-info__match-info">
						<h5 className="friends-list__friends__list__title">{t('friend_info.statistics')}</h5>
						<div className="friend-info__match-desc-border">
							{matchInfo && matchInfo.createdAt ? (
								<>
									<p>
										<strong>{t('friend_info.friendship_duration')}</strong>{' '}
										{new Date(matchInfo.createdAt).toLocaleDateString(i18n.language)}
									</p>
								</>
							) : (
								<p>{t('friend_info.loading_friendship_date')}</p>
							)}
						</div>
					</div>
					{notification && <p className="friend-info__notification">{notification}</p>} {/* Opcjonalne powiadomienie */}
				</div>
			) : (
				<p className="friend-info__friend__choose">{t('friend_info.select_friend')}</p>
			)}
			{friendToRemove && (
				<ConfirmationDialog
					message={t('friend_info.remove_friend_confirmation', { name: friendToRemove.name })} // Użycie t()
					onConfirm={confirmRemove}
					onCancel={cancelRemoveFriend}
				/>
			)}
		</div>
	)
}

export default FriendInfo
