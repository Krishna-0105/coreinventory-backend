import Notification from '../models/Notification.js'

// GET notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    notification.read = true
    await notification.save()

    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// CREATE notification
export const createNotification = async (req, res) => {
  try {
    const { user, message } = req.body

    if (!user || !message) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    const notification = await Notification.create({
      user,
      message,
      read: false,
    })

    res.status(201).json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}