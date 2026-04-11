import Product from '../models/Product.js'
import Receipt from '../models/Receipt.js'
import Delivery from '../models/Delivery.js'
import Transfer from '../models/Transfer.js'
import StockLedger from '../models/StockLedger.js'

// @desc Get dashboard KPIs
// @route GET /api/dashboard
const getDashboardStats = async (req, res) => {
  // Total products in stock
  const totalProducts = await Product.countDocuments({ isActive: true })

  // Low stock items (currentStock <= reorderLevel)
  const lowStockItems = await Product.countDocuments({
    isActive: true,
    $expr: { $lte: ['$currentStock', '$reorderLevel'] },
  })

  // Out of stock items
  const outOfStockItems = await Product.countDocuments({
    isActive: true,
    currentStock: 0,
  })

  // Pending receipts
  const pendingReceipts = await Receipt.countDocuments({
    status: { $in: ['Draft', 'Waiting', 'Ready'] },
  })

  // Pending deliveries
  const pendingDeliveries = await Delivery.countDocuments({
    status: { $in: ['Draft', 'Waiting', 'Ready'] },
  })

  // Pending transfers
  const pendingTransfers = await Transfer.countDocuments({
    status: { $in: ['Draft', 'Waiting', 'Ready'] },
  })

  // Recent stock movements
  const recentMovements = await StockLedger.find()
    .populate('product', 'name sku')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(10)

  // Low stock products list
  const lowStockProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ['$currentStock', '$reorderLevel'] },
  }).select('name sku currentStock reorderLevel warehouse')

  res.json({
    totalProducts,
    lowStockItems,
    outOfStockItems,
    pendingReceipts,
    pendingDeliveries,
    pendingTransfers,
    recentMovements,
    lowStockProducts,
  })
}

export { getDashboardStats }