const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(listingController.index)) //index route
    .post(isLoggedIn, upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing)); //create route

//search route
router.get("/search", wrapAsync(listingController.searchListings));

//new route
router.get('/new',isLoggedIn, wrapAsync(listingController.renderNewForm));

//category route
router.get("/category/:category",wrapAsync(listingController.categoryListing));


router
    .route("/:id")
    .get( wrapAsync(listingController.showListing)) //show route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) //update route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //post delete route

//edit route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;