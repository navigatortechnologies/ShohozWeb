import express from 'express'
const router = express.Router()

import {
    addTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/').post(protect, addTask)
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask)

export default router
