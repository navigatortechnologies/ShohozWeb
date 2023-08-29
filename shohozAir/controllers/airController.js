import axios from 'axios'
import asyncHandler from 'express-async-handler'

import { pnrModel } from '../models/pnrModel.js'

/**
 *
 * @desc    authenticate air search
 * @route   GET /api/air/authenticate
 * @access  Public
 */
const authenticate = asyncHandler(async (req, res) => {
    let url
    let reqBody
    let resBody

    if (process.env.PROVIDER === 'flyhub') {
        try {
            url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
                }/Authenticate`
            reqBody = {
                username: JSON.parse(process.env.FLYHUB_USERNAME)[
                    process.env.NODE_ENV
                ],
                apikey: JSON.parse(process.env.FLYHUB_API_KEY)[
                    process.env.NODE_ENV
                ],
            }
            const response = await axios.post(url, reqBody)
            resBody = response.data
            res.status(200).json({
                provider: process.env.PROVIDER,
                data: resBody,
            })
        } catch (error) {
            res.status(400)
            throw new Error('CALL TO AUTHENTICATE API FAILED')
        }
    } else if (process.env.PROVIDER === 'sabre') {
    }
})

/**
 *
 * @desc    air search
 * @route   POST /api/air/search
 * @access  Public
 */
const search = asyncHandler(async (req, res) => {
    let url
    const reqBody = req.body
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        if (process.env.PROVIDER === 'flyhub') {
            url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
                }/AirSearch`

            config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip,deflate',
                    Authorization: `${req.headers.authorization}`,
                },
            }

            try {
                const response = await axios.post(url, reqBody, config)
                resBody = response.data
                res.status(200).json({
                    provider: process.env.PROVIDER,
                    data: resBody,
                })
            } catch (error) {
                res.status(400)
                throw new Error('CALL TO AIR SEARCH API FAILED')
            }
        } else if (process.env.PROVIDER === 'sabre') {
        }
    } else {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

/**
 *
 * @desc    air airprice
 * @route   POST /api/air/price
 * @access  Public
 */

const price = asyncHandler(async (req, res) => {
    const reqBody = req.body

    const flyhub_url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
        }/AirPrice`

    const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip,deflate',
        Authorization: `${req.headers.authorization}`,
    }

    try {
        const response = await axios.post(flyhub_url, reqBody, { headers })
        res.status(200).json({ data: response.data })
    } catch (error) {
        res.status(400)
        throw new Error('CALL TO FLYHUB AIR PRICE FAILED')
    }
})

/**
 *
 * @desc    air rules
 * @route   POST /api/air/rules
 * @access  Public
 */

const rules = asyncHandler(async (req, res) => {
    let url
    const reqBody = req.body
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/AirRules`
        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {
            const response = await axios.post(url, reqBody, config)
            resBody = response.data
            res.status(200).json({
                provider: process.env.PROVIDER,
                data: resBody,
            })
        } catch (error) {
            res.status(400)
            throw new Error('CALL TO AIR RULES API FAILED')
        }
    } else {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

/**
 *
 * @desc    air prebook
 * @route   POST /api/air/prebook
 * @access  Public
 */

const prebook = async (req, res) => {

    let url
    const reqBody = req.body
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {

        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/AirPreBook`;

        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            const response = await axios.post(url, reqBody.BookingData, config)
            resBody = response.data

            console.log("AirPreBook", resBody);

            if (resBody.Error == null) {
                var customer = `${reqBody.BookingData.Passengers[0].Title} ${reqBody.BookingData.Passengers[0].FirstName} ${reqBody.BookingData.Passengers[0].LastName}`;

                var requested = {
                    ...reqBody.Request,
                    segments: reqBody.BookingData.segments
                }

                const storePnr = await pnrModel.create({
                    pnr_id: "TempPNR" + Date.now(),
                    pnr_status: "Pre Book",
                    journey_type: reqBody.Request.JourneyType,
                    customer_id: reqBody.UserId,
                    customer: customer,
                    pnr_response: JSON.stringify(resBody),
                    air_book_response: "",
                    air_book_ticketed: "",
                    price: reqBody.Price,
                    to_be_paid: reqBody.ToBePaid,
                    coupon_discount: reqBody.ToBePaid,
                    used_coupon: reqBody.ToBePaid,
                    payment_status: "NOT_PAID",
                    requested: JSON.stringify(requested),
                    bank_trans_id: "",
                    payment_mode: reqBody.PaymentMode,
                    currency: reqBody.Currency,
                    pnr_body: JSON.stringify(reqBody.BookingData),
                    response_error: ""
                })

                if (storePnr) {


                    let result = await finalBook(reqBody.BookingData, req.headers.authorization);

                    console.log("finalBook", result.data);

                    if (result.status == 200) {
                        let resFinal = result.data;

                        let storePnr_ = storePnr.dataValues;
                        const updatePnr = await pnrModel.findByPk(storePnr_.id);

                        if (updatePnr && resFinal.BookingID != null) {
                            updatePnr.pnr_id = resFinal.BookingID;
                            updatePnr.pnr_status = resFinal.BookingStatus;
                            updatePnr.air_book_response = JSON.stringify(resFinal);

                            await updatePnr.save();

                            res.status(200).json({
                                provider: process.env.PROVIDER,
                                pnr_id: updatePnr.pnr_id,
                            });
                        }
                        else {
                            res.status(200).json({
                                ...resFinal
                            });
                        }
                    } else {

                        res.status(200).json({
                            ...result.data
                        });
                    }

                } else {
                    res.status(400)
                    throw new Error('Invalid task data')
                }
            } else {
                res.status(200).json({
                    ...resBody
                });
            }



        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        });
    }
}

/**
 *
 * @desc    AirBook
 */
const finalBook = async (reqBody, token) => {

    let url
    let config

    url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
        }/AirBook`;

    config = {
        headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip,deflate',
            Authorization: `${token}`,
        },
    }

    try {

        var result = await axios.post(url, reqBody, config);

        return result;

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

}

/**
 *
 * @desc    AirTicketing
 * @route   POST /api/flyhub/airticketing
 * @access  Public
 */

const ticketing = async (req, res) => {

    let url
    const reqBody = req.body
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/AirTicketing`;


        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            resBody = await axios.post(url, {
                BookingID: req.body.pnr_id,
                IsAcceptedPriceChangeandIssueTicket: true
            }, config);


            resBody = resBody.data;
            console.log("AirTicketing", resBody);

            if (resBody.Error == null && resBody.BookingStatus != "InProcess") {

                const updatePnr = await pnrModel.findOne({
                    where: {
                        pnr_id: req.body.pnr_id
                    }
                });

                if (updatePnr && resBody.BookingID != null) {

                    updatePnr.air_book_ticketed = JSON.stringify(resBody);
                    updatePnr.pnr_status = resBody.BookingStatus;

                    await updatePnr.save();

                    res.status(200).json({
                        ...resBody.data
                    });

                } else {

                    res.status(200).json({
                        ...resBody
                    });

                }
            } else {
                res.status(200).json({
                    ...resBody
                });
            }

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        });
    }
}

/**
 *
 * @desc    AirCancel
 * @route   POST /api/flyhub/AirCancel
 * @access  Public
 */

const ticketingcancel = async (req, res) => {

    let url
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/AirCancel`;


        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            resBody = await axios.post(url, {
                BookingID: req.body.pnr_id,
            }, config);


            resBody = resBody.data;

            if (resBody.Error == null) {
                const updatePnr = await pnrModel.findOne({
                    where: {
                        pnr_id: req.body.pnr_id
                    }
                });

                if (updatePnr && resBody.BookingID != null) {

                    updatePnr.pnr_status = resBody.BookingStatus;

                    await updatePnr.save();

                    res.status(200).json({
                        ...resBody
                    });

                } else {

                    res.status(200).json({
                        ...resBody
                    });

                }
            } else {
                res.status(200).json({
                    ...resBody
                });
            }

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }
}

/**
 *
 * @desc    DownloadInvoice
 * @route   POST /api/flyhub/airdownloadinvoice
 * @access  Public
 */

const downloadinvoice = async (req, res) => {

    let url
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/DownloadInvoice`;


        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            resBody = await axios.post(url, {
                BookingID: req.body.pnr_id,
                ShowPassenger: true
            }, config);



            res.status(200).json({
                ...resBody.data
            });


        } catch (error) {
            res.status(404).json({
                message: error.message
            })
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }
}

/**
 *
 * @desc    DownloadTicket
 * @route   POST /api/flyhub/airdownloadticket
 * @access  Public
 */

const downloadticket = async (req, res) => {

    let url
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/DownloadTicket`;


        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            // const callPnr = await pnrModel.find(m => m.pnr_id == req.body.pnr_id);
            const callPnr = await pnrModel.findOne({
                where: {
                    pnr_id: req.body.pnr_id
                }
            });

            if (callPnr) {

                if (callPnr.air_book_ticketed == "") {

                    let air_book_ticketed = JSON.parse(callPnr.air_book_ticketed);

                    let reqBody = {
                        "BookingID": req.body.pnr_id,
                        "ResultID": air_book_ticketed?.Results[0]?.ResultID,
                        "PaxIndex": air_book_ticketed?.Passengers[0]?.PaxIndex,
                        "TicketNumber": air_book_ticketed?.Passengers[0]?.Ticket[0]?.TicketNo,
                        "ShowFare": true,
                        "ShowAllPax": false
                    }

                    resBody = await axios.post(url, reqBody, config);

                    res.status(200).json({
                        ...resBody.data
                    });

                } else {
                    res.status(404).json({
                        message: "Ticket not found"
                    });
                }


            } else {

                res.status(404).json({
                    message: "PNR not found"
                });

            }




        } catch (error) {
            res.status(404).json({
                message: error.message
            })
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }
}

/**
 *
 * @desc    AirRetrieve
 * @route   POST /api/flyhub/airticketstatus
 * @access  Public
 */

const ticketstatus = async (req, res) => {

    let url
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/AirRetrieve`;


        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            resBody = await axios.post(url, {
                BookingID: req.body.pnr_id,
            }, config);


            resBody = resBody.data;

            const updatePnr = await pnrModel.findOne({
                where: {
                    pnr_id: req.body.pnr_id
                }
            });

            if (updatePnr && resBody.BookingID != null) {

                updatePnr.pnr_status = resBody.BookingStatus;

                await updatePnr.save();

                res.status(200).json({
                    ...resBody
                });

            } else {
                res.status(200).json({
                    message: "PNR not found"
                });
            }

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }
}

/**
 *
 * @desc    GetBalance
 * @route   GET /api/flyhub/balance
 * @access  Public
 */

const balance = async (req, res) => {

    let url
    let config
    let resBody

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        url = `${JSON.parse(process.env.FLYHUB_URL)[process.env.NODE_ENV]
            }/GetBalance`;


        config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip,deflate',
                Authorization: `${req.headers.authorization}`,
            },
        }

        try {

            resBody = await axios.post(url, {
                "UserName": JSON.parse(process.env.FLYHUB_USERNAME)[
                    process.env.NODE_ENV
                ]
            }, config);

            res.status(200).json({
                ...resBody.data
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    } else {
        res.status(401).json({
            message: "Not authorized, no token"
        })
    }
}


export {
    authenticate, search, price, rules,
    prebook, ticketing, ticketingcancel, downloadinvoice, downloadticket, ticketstatus,
    balance
}
