import Receipt from '../models/Receipt.js'
import Product from '../models/Product.js'
import StockLedger from '../models/StockLedger.js'
import Notification from '../models/Notification.js' // 🔥 add at top
const generateReceiptNumber = () => {
  return `REC-${Date.now()}`
}

// @desc Get all receipts
// @route GET /api/receipts
const getReceipts = async (req, res) => {
  const { status } = req.query
  let filter = {}
  if (status) filter.status = status

  const receipts = await Receipt.find(filter)
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })

  res.json(receipts)
}

// @desc Create receipt
// @route POST /api/receipts
const createReceipt = async (req, res) => {
  const { supplier, items, notes } = req.body

  const receipt = await Receipt.create({
    receiptNumber: generateReceiptNumber(),
    supplier,
    items,
    notes,
    createdBy: req.user._id,
  })

  res.status(201).json(receipt)
}

// @desc Validate receipt - increases stock
// @route PUT /api/receipts/:id/validate
const validateReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id)

  if (!receipt) {
    res.status(404)
    throw new Error('Receipt not found')
  }

  if (receipt.status === 'Done') {
    res.status(400)
    throw new Error('Receipt already validated')
  }

  // Increase stock for each item
  for (const item of receipt.items) {
    const product = await Product.findById(item.product)
    if (product) {
      const stockBefore = product.currentStock
      product.currentStock += item.quantity
      await product.save()

      // 🔥 Emit real-time low stock alert
      

if (product.currentStock <= product.reorderLevel) {

  console.log(`LOW STOCK ALERT: ${product.name} is low on stock`)
  // 🔥 SAVE IN DB
  await Notification.create({
    message: `${product.name} is low on stock`,
    user: req.user._id,
  })

  // 🔥 REAL-TIME EVENT
  global.io.emit('lowStock', {
    productId: product._id,
    name: product.name,
    stock: product.currentStock,
  })
}


      // Log in stock ledger
      await StockLedger.create({
        product: product._id,
        type: 'Receipt',
        referenceNumber: receipt.receiptNumber,
        quantityChange: +item.quantity,
        stockBefore,
        stockAfter: product.currentStock,
        createdBy: req.user._id,
      })
    }
  }

  receipt.status = 'Done'
  receipt.validatedAt = new Date()
  await receipt.save()

  res.json({ message: 'Receipt validated, stock updated', receipt })
}

// @desc Delete receipt
// @route DELETE /api/receipts/:id
const deleteReceipt = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id)

  if (!receipt) {
    res.status(404)
    throw new Error('Receipt not found')
  }

  if (receipt.status === 'Done') {
    res.status(400)
    throw new Error('Cannot delete a validated receipt')
  }

  await receipt.deleteOne()
  res.json({ message: 'Receipt deleted' })
}


const getReceiptById = async (req, res) => {
  const receipt = await Receipt.findById(req.params.id)
    .populate('items.product', 'name sku')

  if (!receipt) {
    res.status(404)
    throw new Error('Receipt not found')
  }

  res.json(receipt)
}
export { getReceipts, createReceipt, validateReceipt, deleteReceipt, getReceiptById }