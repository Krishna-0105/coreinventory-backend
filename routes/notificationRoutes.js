import express from 'express'
import { getNotifications, markAsRead } from '../controllers/notificationController.js'
import { protect } from '../middleware/authMiddleware.js'
import { createNotification } from '../controllers/notificationController.js'

const router = express.Router()

router.get('/:userId', getNotifications)
router.put('/:id/read', protect, markAsRead)
router.post('/', createNotification)
export default router