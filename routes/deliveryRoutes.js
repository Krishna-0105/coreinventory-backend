import express from 'express'
import {
  getDeliveries,
  createDelivery,
  validateDelivery,
  deleteDelivery,
  getDeliveryById,
} from '../controllers/deliveryController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getDeliveries)
  .post(protect, createDelivery)

router.route('/:id/validate')
  .put(protect, validateDelivery)

router.route('/:id')
  .get(protect, getDeliveryById)
  .delete(protect, deleteDelivery)

export default router