import Product from '../models/Product.js'
import StockLedger from '../models/StockLedger.js'

// @desc Get all adjustments from ledger
// @route GET /api/adjustments
const getAdjustments = async (req, res) => {
  const adjustments = await StockLedger.find({ type: 'Adjustment' })
    .populate('product', 'name sku')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })

  res.json(adjustments)
}

// @desc Create stock adjustment
// @route POST /api/adjustments
const createAdjustment = async (req, res) => {
  const { productId, countedQuantity, notes } = req.body

  const product = await Product.findById(productId)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const stockBefore = product.currentStock
  const quantityChange = countedQuantity - stockBefore

  product.currentStock = countedQuantity
  await product.save()

  const adjustment = await StockLedger.create({
    product: product._id,
    type: 'Adjustment',
    referenceNumber: `ADJ-${Date.now()}`,
    quantityChange,
    stockBefore,
    stockAfter: countedQuantity,
    notes: notes || 'Manual stock adjustment',
    createdBy: req.user._id,
  })

  res.status(201).json({
    message: `Stock adjusted from ${stockBefore} to ${countedQuantity}`,
    adjustment,
  })
}

export { getAdjustments, createAdjustment }