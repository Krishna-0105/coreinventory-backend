import Delivery from '../models/Delivery.js'
import Product from '../models/Product.js'
import StockLedger from '../models/StockLedger.js'
import Notification from '../models/Notification.js'
const generateDeliveryNumber = () => {
  return `DEL-${Date.now()}`
}

// @desc Get all deliveries
// @route GET /api/deliveries
const getDeliveries = async (req, res) => {
  const { status } = req.query
  let filter = {}
  if (status) filter.status = status

  const deliveries = await Delivery.find(filter)
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })

  res.json(deliveries)
}

// @desc Create delivery
// @route POST /api/deliveries
const createDelivery = async (req, res) => {
  const { customer, items, notes } = req.body

  // Check if enough stock exists
  for (const item of items) {
    const product = await Product.findById(item.product)
    if (!product) {
      res.status(404)
      throw new Error(`Product not found`)
    }
    if (product.currentStock < item.quantity) {
      res.status(400)
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}`)
    }
  }

  const delivery = await Delivery.create({
    deliveryNumber: generateDeliveryNumber(),
    customer,
    items,
    notes,
    createdBy: req.user._id,
  })

  res.status(201).json(delivery)
}

// @desc Validate delivery - decreases stock
// @route PUT /api/deliveries/:id/validate
const validateDelivery = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id)

  if (!delivery) {
    res.status(404)
    throw new Error('Delivery not found')
  }

  if (delivery.status === 'Done') {
    res.status(400)
    throw new Error('Delivery already validated')
  }

  // Decrease stock for each item
  for (const item of delivery.items) {
    const product = await Product.findById(item.product)
    if (product) {
      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        })
      }
      const stockBefore = product.currentStock
      product.currentStock -= item.quantity
      console.log("STOCK CHECK:", {
  name: product.name,
  stock: product.currentStock,
  reorder: product.reorderLevel
})
      await product.save()

      if (product.currentStock <= product.reorderLevel) {

  console.log("🔥 LOW STOCK TRIGGERED:", product.name)

  await Notification.create({
    message: `${product.name} is low on stock`,
    user: req.user._id,
  })

  global.io.emit('lowStock', {
    productId: product._id,
    name: product.name,
    stock: product.currentStock,
  })
}
      // Log in stock ledger
      await StockLedger.create({
        product: product._id,
        type: 'Delivery',
        referenceNumber: delivery.deliveryNumber,
        quantityChange: -item.quantity,
        stockBefore,
        stockAfter: product.currentStock,
        createdBy: req.user._id,
      })
    }
  }

  delivery.status = 'Done'
  delivery.validatedAt = new Date()
  await delivery.save()

  res.json({ message: 'Delivery validated, stock updated', delivery })
}

// @desc Delete delivery
// @route DELETE /api/deliveries/:id
const deleteDelivery = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id)

  if (!delivery) {
    res.status(404)
    throw new Error('Delivery not found')
  }

  if (delivery.status === 'Done') {
    res.status(400)
    throw new Error('Cannot delete a validated delivery')
  }

  await delivery.deleteOne()
  res.json({ message: 'Delivery deleted' })
}
const getDeliveryById = async (req, res) => {
  const delivery = await Delivery.findById(req.params.id)
    .populate('items.product', 'name sku')

  if (!delivery) {
    res.status(404)
    throw new Error('Delivery not found')
  }

  res.json(delivery)
}

export { getDeliveries, createDelivery, validateDelivery, deleteDelivery, getDeliveryById }