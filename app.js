const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get('/', (req, res) => {
    res.send("I'm the root");
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
}

//index route
app.get('/listings', wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
}));

//new route
app.get('/listings/new', wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
}));

//show route
app.get('/listings/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));


//create route
app.post("/listings",validateListing, wrapAsync(async(req,res,next) =>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    }
));

//edit route
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//update route
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let updatedData = req.body.listing;

    // Convert image string into object
    updatedData.image = {
        url: updatedData.image,
        filename: "listingimage"
    };

    await Listing.findByIdAndUpdate(id, updatedData);
    res.redirect(`/listings/${id}`);
}));


//post delete route
app.delete('/listings/:id', wrapAsync(async (req, res) => {
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//review route 
app.post("/listings/:id/reviews", validateReview, wrapAsync( async(req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing.id}`);
}));

//review delete route
app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    console.log(deletedReview);
    res.redirect(`/listings/${id}`);
}));

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", { err});
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

