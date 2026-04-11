import express from 'express'
import {
  getTransfers,
  createTransfer,
  validateTransfer,
  deleteTransfer,
  getTransferById 
} from '../controllers/transferController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')

  .get(protect, getTransfers)
  .post(protect, createTransfer)

router.route('/:id/validate')
  .put(protect, validateTransfer)

router.route('/:id')
  .get(protect, getTransferById)   // 👈 ADD THIS LINE
  .delete(protect, deleteTransfer)

export default router