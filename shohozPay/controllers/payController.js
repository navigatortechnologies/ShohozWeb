import asyncHandler from 'express-async-handler'
import axios from 'axios'
import randomatic from 'randomatic'
import SSLCommerzPayment from 'sslcommerz-lts'

import Transaction from '../models/transactionModel.js'

import generateLaterDate from '../utils/generateLaterDate.js'

/**
 *
 * @desc    to do a payment
 * @route   POST /api/pay
 * @access  Private
 */
const doPayment = asyncHandler(async (req, res) => {
    const { amount, bookingId } = req.body
    let redirectURL,
        paymentId,
        provider = process.env.PAYMENT_PROVIDER

    if (process.env.PAYMENT_PROVIDER === 'shohozPay') {
        const username = JSON.parse(process.env.SHOHOZ_PAY_USERNAME)[
            process.env.NODE_ENV
        ]
        const password =
            process.env.NODE_ENV === 'development'
                ? process.env.SHOHOZ_PAY_PASSWORD_DEVELOPMENT
                : process.env.SHOHOZ_PAY_PASSWORD_PRODUCTION
        const client_id = JSON.parse(process.env.SHOHOZ_PAY_CLIENT_ID)[
            process.env.NODE_ENV
        ]
        const client_secret = JSON.parse(process.env.SHOHOZ_PAY_CLIENT_SECRET)[
            process.env.NODE_ENV
        ]
        const grant_type = process.env.SHOHOZ_PAY_GRANT_TYPE
        const shohozPayUrl = JSON.parse(process.env.SHOHOZ_PAY_URL)[
            process.env.NODE_ENV
        ]

        try {
            // token generation
            const tokenBody = {
                username,
                password,
                client_id,
                client_secret,
                grant_type,
                scope: '*',
            }
            const tokenData = await axios.post(
                `${shohozPayUrl}/oauth/token`,
                tokenBody
            )
            const config = {
                headers: {
                    Authorization: `Bearer ${tokenData.data.access_token}`,
                    Accept: `application/json`,
                },
            }

            // payment initialization
            const paymentBody = {
                amount,
                mobile: req.user.phone,
                booking_id: bookingId,
                payment_mode: `upay`,
                payment_channel: ``,
                ticket_count: 2,
                valid_till: generateLaterDate(2),
                user_token: ``,
            }

            const { data } = await axios.post(
                `${shohozPayUrl}/api/payment`,
                paymentBody,
                config
            )

            redirectURL = data.redirectURL
            paymentId = data.payment_id
        } catch (error) {
            res.status(401)
            throw new Error(`Invalid transaction`)
        }
    } else if (process.env.PAYMENT_PROVIDER === 'sslCommerz') {
        const trxId = randomatic('A0', 10)
        const data = {
            total_amount: amount,
            currency: 'BDT',
            tran_id: trxId,
            success_url: process.env.SSLCOMMERZ_SUCCESS_URL,
            fail_url: process.env.SSLCOMMERZ_FAIL_URL,
            cancel_url: process.env.SSLCOMMERZ_CANCEL_URL,
            ipn_url: process.env.SSLCOMMERZ_IPN_URL,
            shipping_method: 'No',
            product_name: 'Flight',
            product_category: 'Flight',
            product_profile: 'general',
            cus_name: `${req.user.firstName} ${req.user.lastName}`,
            cus_email: `${req.user.email}`,
            cus_phone: `${req.user.phone}`,
        }
        const storeId = JSON.parse(process.env.SSLCOMMERZ_STORE_ID)[
            process.env.NODE_ENV
        ]
        const storePassword = JSON.parse(process.env.SSLCOMMERZ_STORE_PASSWORD)[
            process.env.NODE_ENV
        ]
        try {
            const sslcz = new SSLCommerzPayment(
                storeId,
                storePassword,
                process.env.NODE_ENV === `development` ? false : true
            )
            const sslResData = await sslcz.init(data)
            redirectURL = sslResData.GatewayPageURL
            paymentId = trxId
        } catch (error) {
            res.status(401)
            throw new Error(`Invalid transaction`)
        }
    }

    const transaction = await Transaction.create({
        amount,
        bookingId,
        status: `pending`,
        provider: provider,
        paymentId,
    })
    if (transaction) {
        res.status(201).json({
            message: `Payment initiated successfully`,
            provider,
            redirectURL,
        })
    } else {
        res.status(400)
        throw new Error(`Invalid transaction data`)
    }
})

/**
 *
 * @desc    update a payment
 * @route   PUT /api/pay/:id
 * @access  Private
 */
const updatePayment = asyncHandler(async (req, res) => {
    const task = await Task.findByPk(req.params.id)

    if (task) {
        task.details = req.body.details || task.details
        task.isComplete = req.body.isComplete || task.isComplete

        const updatedTask = await task.save()

        res.json({
            id: updatedTask.id,
            details: updatedTask.details,
            isComplete: updatedTask.isComplete,
            userId: updatedTask.userId,
        })
    } else {
        res.status(404)
        throw new Error('Task not found')
    }
})

/**
 *
 * @desc    update a sslcommerz payment
 * @route   POST /api/pay/ssl-ipn
 * @access  Public
 */
const updatePaymentSSL = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
        where: { paymentId: req.body.tran_id, status: `pending` },
    })
    if (transaction) {
        if (req.body.status === `VALID`) {
            transaction.status = `completed`
        } else {
            transaction.status = `failed`
        }
        transaction.providerResponse = req.body
        const updatedTransaction = await transaction.save()

        res.json({
            message: `Transaction status updated`,
        })
    } else {
        res.status(404)
        throw new Error('Transaction not found')
    }
})

/**
 *
 * @desc    handling the success case for shohozPay
 * @route   POST /api/pay/success
 * @access  Public
 */
const updatePaymentShohozPaySuccess = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
        where: {
            paymentId: req.body.payment_id,
            bookingId: req.body.booking_id,
            status: `pending`,
        },
    })

    if (transaction) {
        transaction.status = `completed`
        transaction.providerResponse = req.body
        const updatedTransaction = await transaction.save()
        res.json({
            message: `Transaction status updated`,
        })
    } else {
        res.status(404)
        throw new Error('Transaction not found')
    }
})

/**
 *
 * @desc    handling the failed case for shohozPay
 * @route   POST /api/pay/failed
 * @access  Public
 */
const updatePaymentSSLShohozPayFailed = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({
        where: {
            paymentId: req.body.payment_id,
            bookingId: req.body.booking_id,
            status: `pending`,
        },
    })

    if (transaction) {
        transaction.status = `failed`
        transaction.providerResponse = req.body
        const updatedTransaction = await transaction.save()
        res.json({
            message: `Transaction status updated`,
        })
    } else {
        res.status(404)
        throw new Error('Transaction not found')
    }
})

export {
    doPayment,
    updatePayment,
    updatePaymentSSL,
    updatePaymentShohozPaySuccess,
    updatePaymentSSLShohozPayFailed,
}
