import express from 'express'
const router = express.Router()

import {
    authenticate,
    search,
    price,
    rules,
    prebook,
    ticketing,
    ticketstatus,
    ticketingcancel,
    downloadinvoice,
    downloadticket,
    balance
} from '../controllers/airController.js'

router.get('/authenticate', authenticate)
router.post('/search', search)
router.post('/price', price)
router.post('/rules', rules)
router.post('/flyhub/airprebook', prebook)
router.post('/flyhub/airticketing', ticketing)
router.post('/flyhub/airticketstatus', ticketstatus)
router.post('/flyhub/airticketingcancel', ticketingcancel)
router.post('/flyhub/airdownloadinvoice', downloadinvoice)
router.post('/flyhub/airdownloadticket', downloadticket)
router.get('/flyhub/balance', balance)

export default router
