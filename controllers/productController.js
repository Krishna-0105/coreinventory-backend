import Product from '../models/Product.js'

// @desc Get all products
// @route GET /api/products
const getProducts = async (req, res) => {
  const { category, warehouse, search } = req.query

  let filter = { isActive: true }

  if (category) filter.category = category
  if (warehouse) filter.warehouse = warehouse
  if (search) filter.name = { $regex: search, $options: 'i' }

  const products = await Product.find(filter).sort({ createdAt: -1 })
  res.json(products)
}

// @desc Get single product
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    res.json(product)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
}

// @desc Create product
// @route POST /api/products
const createProduct = async (req, res) => {
  const { name, sku, category, unitOfMeasure, currentStock, reorderLevel, warehouse, description } = req.body

  const skuExists = await Product.findOne({ sku: sku.toUpperCase() })
  if (skuExists) {
    res.status(400)
    throw new Error('SKU already exists')
  }

  const product = await Product.create({
    name,
    sku,
    category,
    unitOfMeasure,
    currentStock: currentStock || 0,
    reorderLevel: reorderLevel || 10,
    warehouse: warehouse || 'Main Warehouse',
    description,
  })

  res.status(201).json(product)
}

// @desc Update product
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    product.name = req.body.name || product.name
    product.category = req.body.category || product.category
    product.unitOfMeasure = req.body.unitOfMeasure || product.unitOfMeasure
    product.reorderLevel = req.body.reorderLevel || product.reorderLevel
    product.warehouse = req.body.warehouse || product.warehouse
    product.description = req.body.description || product.description
    product.currentStock = req.body.currentStock ?? product.currentStock
    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
}

// @desc Delete product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    product.isActive = false
    await product.save()
    res.json({ message: 'Product removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
}

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct }