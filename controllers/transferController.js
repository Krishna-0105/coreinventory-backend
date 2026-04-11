import Transfer from '../models/Transfer.js'
import Product from '../models/Product.js'
import StockLedger from '../models/StockLedger.js'

const generateTransferNumber = () => {
  return `TRF-${Date.now()}`
}

// @desc Get all transfers
// @route GET /api/transfers
const getTransfers = async (req, res) => {
  const { status } = req.query
  let filter = {}
  if (status) filter.status = status

  const transfers = await Transfer.find(filter)
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })

  res.json(transfers)
}

// @desc Create transfer
// @route POST /api/transfers
const createTransfer = async (req, res) => {
  const { fromLocation, toLocation, items, notes } = req.body

  // Check if enough stock exists
  for (const item of items) {
    const product = await Product.findById(item.product)
    if (!product) {
      res.status(404)
      throw new Error(`Product not found`)
    }
    if (product.currentStock < item.quantity) {
      res.status(400)
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.currentStock}`
      )
    }
  }

  const transfer = await Transfer.create({
    transferNumber: generateTransferNumber(),
    fromLocation,
    toLocation,
    items,
    notes,
    createdBy: req.user._id,
  })

  res.status(201).json(transfer)
}

// @desc Validate transfer - logs movement
// @route PUT /api/transfers/:id/validate
const validateTransfer = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id)

  if (!transfer) {
    res.status(404)
    throw new Error('Transfer not found')
  }

  if (transfer.status === 'Done') {
    res.status(400)
    throw new Error('Transfer already validated')
  }

  // Log each item movement in ledger
  for (const item of transfer.items) {
    const product = await Product.findById(item.product)
    if (product) {
      const stockBefore = product.currentStock

      // Update warehouse location
      product.warehouse = transfer.toLocation
      await product.save()

      // Log in stock ledger
      await StockLedger.create({
        product: product._id,
        type: 'Transfer',
        referenceNumber: transfer.transferNumber,
        quantityChange: 0,
        stockBefore,
        stockAfter: product.currentStock,
        location: `${transfer.fromLocation} → ${transfer.toLocation}`,
        createdBy: req.user._id,
      })
    }
  }

  transfer.status = 'Done'
  transfer.validatedAt = new Date()
  await transfer.save()

  res.json({ message: 'Transfer validated, location updated', transfer })
}

// @desc Delete transfer
// @route DELETE /api/transfers/:id
const deleteTransfer = async (req, res) => {
  const transfer = await Transfer.findById(req.params.id)

  if (!transfer) {
    res.status(404)
    throw new Error('Transfer not found')
  }

  if (transfer.status === 'Done') {
    res.status(400)
    throw new Error('Cannot delete a validated transfer')
  }

  await transfer.deleteOne()
  res.json({ message: 'Transfer deleted' })
}
const getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('items.product', 'name')

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' })
    }

    res.json(transfer)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transfer' })
  }
}
export { getTransfers, createTransfer, validateTransfer, deleteTransfer, getTransferById }