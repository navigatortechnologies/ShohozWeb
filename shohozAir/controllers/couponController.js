import asyncHandler from 'express-async-handler'

import Coupon from '../models/couponModel.js'

/**
 *
 * @desc    add a new coupon
 * @route   POST /api/coupons
 * @access  private/admin
 */
const addCoupon = asyncHandler(async (req, res) => {
    const { title, code, amount, type } = req.body

    const coupon = await Coupon.create({
        title,
        code,
        type,
        amount,
    })

    if (coupon) {
        res.status(201).json(coupon.dataValues)
    } else {
        res.status(400)
        throw new Error('Invalid coupon data')
    }
})

/**
 *
 * @desc    update a coupon
 * @route   PUT /api/coupons/:id
 * @access  private/admin
 */
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByPk(req.params.id)

    if (coupon) {
        coupon.title = req.body.title || coupon.title
        coupon.code = req.body.code || coupon.code
        coupon.type = req.body.type || coupon.type
        coupon.amount = req.body.amount || coupon.amount

        const updatedCoupon = await coupon.save()

        res.json(updatedCoupon.dataValues)
    } else {
        res.status(404)
        throw new Error('Coupon not found')
    }
})

/**
 *
 * @desc    delete a coupon
 * @route   DELETE /api/coupons/:id
 * @access  private/admin
 */
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByPk(req.params.id)
    if (coupon) {
        await coupon.destroy()
        res.json({ message: 'Coupon removed' })
    } else {
        res.status(404)
        throw new Error('Coupon not found')
    }
})

/**
 *
 * @desc    get all coupons
 * @route   GET /api/coupons
 * @access  private/admin
 */
const getCoupons = asyncHandler(async (req, res) => {
    const allCoupons = await Coupon.findAll()
    res.json(allCoupons)
})

export { addCoupon, updateCoupon, deleteCoupon, getCoupons }
