import express from 'express'
import {
  getReceipts,
  createReceipt,
  validateReceipt,
  deleteReceipt,
  getReceiptById
} from '../controllers/receiptController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getReceipts)
  .post(protect, createReceipt)

router.route('/:id/validate')
  .put(protect, validateReceipt)

router.route('/:id')
  .get(protect, getReceiptById)
  .delete(protect, deleteReceipt)

export default router