import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'

import { connectDB } from './config/db.js'
import payRoutes from './routes/payRoutes.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

dotenv.config()

connectDB()

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use('/api/pay', payRoutes)

app.use(notFound)
app.use(errorHandler)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port: ${process.env.PORT}`)
})
