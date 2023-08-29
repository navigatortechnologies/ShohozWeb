import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const db = new Sequelize(
    process.env.DB,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
    }
)

const connectDB = async () => {
    try {
        await db.authenticate()
        console.log(`MYSQL Connected`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export { db, connectDB }
