const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Booking = require("../models/booking.js");
const { isLoggedIn, validateBooking } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router
    .route("/:id")
    .get(isLoggedIn, wrapAsync(bookingController.renderBookingForm))
    .post(isLoggedIn, validateBooking, wrapAsync(bookingController.createBooking));

router.delete("/:bookingId", isLoggedIn, wrapAsync(bookingController.cancelBooking));

router
    .get("/", isLoggedIn, wrapAsync(bookingController.myBookings));

module.exports = router;
