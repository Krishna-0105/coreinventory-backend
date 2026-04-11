import mongoose from 'mongoose'

const stockLedgerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['Receipt', 'Delivery', 'Transfer', 'Adjustment'],
      required: true,
    },
    referenceNumber: {
      type: String,
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    stockBefore: {
      type: Number,
      required: true,
    },
    stockAfter: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      default: 'Main Warehouse',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema)
export default StockLedger