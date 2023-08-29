import express from 'express'
const router = express.Router()

import {
    addCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
} from '../controllers/couponController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router
    .route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, addCoupon)
router
    .route('/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon)

export default router
