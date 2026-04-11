import dotenv from "dotenv"
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import 'express-async-errors'



import connectDB from './config/db.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js'
import deliveryRoutes from './routes/deliveryRoutes.js'
import transferRoutes from './routes/transferRoutes.js'
import adjustmentRoutes from './routes/adjustmentRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'



connectDB()

const app = express()

app.use(helmet())
app.use(cors({ origin: '*' }))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.use('/api/notifications', notificationRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/receipts', receiptRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/transfers', transferRoutes)
app.use('/api/adjustments', adjustmentRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

import { Server } from 'socket.io'

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

global.io = io

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
})