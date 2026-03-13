const Listing = require("../models/listing");
const maptilerClient = require("@maptiler/client");
const mapToken = process.env.MAP_TOKEN;
maptilerClient.config.apiKey = mapToken;
const { geocoding } = maptilerClient;

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
};

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res,next) =>{
    const response = await geocoding
    .forward(req.body.listing.location, {
        limit: 1
    });

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    // save coordinates from MapTiler
    newListing.geometry = response.features[0].geometry;

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    const response = await geocoding
    .forward(req.body.listing.location, {
        limit: 1
    });
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing }, { new: true });

    if(response.features.length > 0){
        listing.geometry = response.features[0].geometry;
    }

    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };  
    }
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.searchListings = async (req, res) => {
    const { query } = req.query;
    const allListing = await Listing.find({
        $or: [
            { location: { $regex: query, $options: "i" } },
            { title: { $regex: query, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs", { allListing });

};

module.exports.categoryListing = async (req, res) => {
    const { category } = req.params;
    const allListing = await Listing.find({ category: category });
    res.render("listings/index.ejs", { allListing });
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};