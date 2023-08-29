import asyncHandler from 'express-async-handler'
import axios from 'axios'

/**
 *
 * @desc check the user logged in or not
 */
const protect = asyncHandler(async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
                const response = await axios.get(
                    `${process.env.AUTH_URL}/api/auth`,
                    config
                )
                const resData = response.data
                if (resData.auth) {
                    req.user = resData.user
                    next()
                } else {
                    res.status(401)
                    throw new Error('Not authorized, token failed')
                }
            } catch (error) {
                res.status(401)
                throw new Error(error.message)
            }
        } catch (error) {
            res.status(401)
            throw new Error('Not authorized, token failed')
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

/**
 *
 * @desc check the user is admin or not
 */
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next()
    } else {
        res.status(401)
        throw new Error('Not authorized as an admin')
    }
}

export { protect, admin }
