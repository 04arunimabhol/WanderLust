const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  
  res.render("bookings/bookings.ejs", {listing});
};

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const { checkIn, checkOut, guests } = req.body;

  const conflict = await Booking.findOne({
    listing: id,
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (conflict) {
    req.flash("error", "These dates are already booked!");
    return res.redirect(`/bookings/${id}`);
  }
  if (listing.owner._id.equals(req.user._id)) {
    req.flash("error", "You can't book your own listing!");
    return res.redirect(`/listings/${id}`);
  }

  const nights =
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

  const subtotal = listing.price * nights * (guests || 1);
  const taxes = Math.round(subtotal * 0.05);
  const totalPrice = subtotal + taxes;

  const newBooking = new Booking({
    user: req.user._id,
    listing: id,
    checkIn,
    checkOut,
    guests: guests || 1,
    totalPrice,
  });

  await newBooking.save();
  req.flash("success", "Booking successful!");
  res.redirect(`/listings/${id}`);
};

module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking cancelled successfully!");

  res.redirect("/listings");
};

module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ checkIn: 1 });

  res.render("bookings/myBookings.ejs", { bookings });
};
