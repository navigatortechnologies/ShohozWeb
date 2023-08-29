import express from 'express'
const router = express.Router()

import {
    doPayment,
    updatePayment,
    updatePaymentSSL,
    updatePaymentShohozPaySuccess,
    updatePaymentSSLShohozPayFailed,
} from '../controllers/payController.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/').post(protect, doPayment)
router.route('/:id').put(protect, updatePayment)

// for specific purpose
router.route('/ssl-ipn').post(updatePaymentSSL)
router.route('/success').post(updatePaymentShohozPaySuccess)
router.route('/failed').post(updatePaymentSSLShohozPayFailed)

export default router
