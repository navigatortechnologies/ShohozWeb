import { DataTypes } from 'sequelize'
import { db } from '../config/db.js'

const Task = db.define('task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    details: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

// foreign key constraints
// Task.belongsTo(User)

const tableModelSync = async () => {
    await Task.sync()
}

tableModelSync()

export default Task
