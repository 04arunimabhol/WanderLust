const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listingRoute.js");
const reviews = require("./routes/reviewRoute.js");

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

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", { err});
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

