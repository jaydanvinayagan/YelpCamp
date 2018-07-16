var express = require("express");
var router = express.Router();

var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

//root router
router.get("/",function(req,res){
   res.render("landing"); 
   
});


//SHOW register form

router.get("/register", function(req, res) {
   res.render("register"); 
});

// handle sign up logic
router.post("/register", function(req, res) {
    
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    
    
    
    if(req.body.adminCode === "secretCode"){  // admin code
        newUser.isAdmin = true;
    }
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// show login form
router.get("/login", function(req, res) {
   res.render("login"); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res) {
});

// logout route
router.get("/logout", function(req, res) {
   req.logout(); 
   req.flash("success", "Logged you out!");
   res.redirect("/campgrounds");
});

// USERS PROFILES
router.get("/users/:id", function(req, res) {
   User.findById(req.params.id,function(err, foundUser){
       if(err){
           req.flash("error","Something went wrong.");
           res.redirect("/");
       } 
       Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds ){
           if(err){
               req.flash("error","Something went wrong.");
               res.redirect("/");
            }
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
       });
   })
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/login");
};


module.exports = router;