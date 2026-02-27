const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
};

//index route
router.get('/', wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
}));

//new route
router.get('/new', wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
}));

//show route
router.get('/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));


//create route
router.post("/",validateListing, wrapAsync(async(req,res,next) =>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//edit route
router.get('/:id/edit', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

//update route
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedData = req.body.listing;

    // Convert image string into object
    updatedData.image = {
        url: updatedData.image,
        filename: "listingimage"
    };

    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));


//post delete route
router.delete('/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;