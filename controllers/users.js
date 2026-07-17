const User = require("../models/user.js");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js");

module.exports.renderSignupForm = (req, res) =>{
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res, next) =>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User ({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    }catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
};

module.exports.renderLoginForm = (req, res) =>{
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) =>{
    req.flash("success", "Welcome to Wanderlust! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) =>{
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
};

module.exports.renderForgotPasswordForm = (req, res) =>{
    res.render("users/forgotPassword.ejs");
};

module.exports.forgotPassword = async(req, res, next) =>{
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        req.flash("error", "No account with that email found!");
        return res.redirect("/forgotPassword");
    }
    const token = crypto.randomBytes(32).toString("hex");
    const encryptedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = encryptedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.BASE_URL}/resetPassword/${token}`;

    const message = `We have received a password reset request. please use the following link to reset your password: \n\n ${resetUrl} \n\nThis reset password link will be valid only for 10 minutes.`;
    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message: message
        });
    }catch(error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        req.flash("error", "There was an error sending the email. Please try again later.");
        return res.redirect("/forgotPassword");
    }

    req.flash("success", "Password reset instructions have been sent to your email!");
    res.redirect("/login");
};

module.exports.renderResetPasswordForm = (req, res) =>{
    res.render("users/resetPassword.ejs", { token: req.params.token });
};

module.exports.resetPassword = async (req, res, next) => {

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match!");
        return res.redirect("back");
    }

    const encryptedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: encryptedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Invalid or expired reset token!");
        return res.redirect("/forgotPassword");
    }
    await user.setPassword(password);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    req.flash("success","Your password has been reset successfully!");

    res.redirect("/login");
};

module.exports.googleLogin = (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);

    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};