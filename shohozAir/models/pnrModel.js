import { DataTypes } from 'sequelize'
import { db } from '../config/db.js'


const pnrModel = db.define('pnr_records', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    pnr_id: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    pnr_status: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    journey_type: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.INTEGER(20),
        allowNull: false,
    },
    customer: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    pnr_response: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    air_book_response: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    air_book_ticketed: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    to_be_paid: {
        type: DataTypes.INTEGER(50),
        allowNull: false,
    },
    coupon_discount: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    used_coupon: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    payment_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    requested: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    bank_trans_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    payment_mode: {
        type: DataTypes.STRING(16),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(16),
        allowNull: false,
    },
    pnr_body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    response_error: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
})

const tableModelSync = async () => {
    await pnrModel.sync()
}

tableModelSync()

export {pnrModel};
