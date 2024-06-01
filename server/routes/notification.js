import express from 'express'
import { verifyToken } from '../middleware/verifyUser.js'
import {  newNotification, allNotificationCount, notifications, notifications_new , getUsersWhoLikedPost } from '../controllers/notification.controller.js';

const notificationRouter = express.Router()

notificationRouter.get('/new-notification', verifyToken, newNotification);
notificationRouter.post('/notifications', verifyToken, notifications)

notificationRouter.post('/all-notifications-count', verifyToken, allNotificationCount)
notificationRouter.post('/notifications-new', verifyToken, notifications_new)
notificationRouter.get('/blog/:_id/likes', getUsersWhoLikedPost);

export default notificationRouter