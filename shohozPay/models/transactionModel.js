import { DataTypes } from 'sequelize'
import { db } from '../config/db.js'

const Transaction = db.define('transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    providerResponse: {
        type: DataTypes.JSON,
    },
})

const tableModelSync = async () => {
    await Transaction.sync()
}

tableModelSync()

export default Transaction
