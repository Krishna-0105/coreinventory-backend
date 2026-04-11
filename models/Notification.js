import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'lowStock',
    },
    read: {
      type: Boolean,
      default: false,
    },
    user: {
  type: String,
  required: true,
},
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Notification', notificationSchema)