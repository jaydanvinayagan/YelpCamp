var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX- show all campgrounds
router.get("/",function(req,res){
    
    //Get all campgrounds from DB
    Campground.find({}, function(err,allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser: req.user});
        }
    });
    
    
});

router.post("/", middleware.isLoggedIn,  function(req,res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.decription;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name : name, price: price, image: image, decription: desc, author: author}
   //Create a new campground and save to DB
    Campground.create(newCampground, function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});


//NEW - Show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
    
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
   
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || ! foundCampground){
            console.log(err);
            req.flash('error', 'Sorry, that campground does not exist!');
            return res.redirect('/campgrounds');
        }else{
            console.log(foundCampground);
            // render show template with the campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
   
    
});

//   EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    // is user loggin in
    Campground.findById(req.params.id, function(err, foundCampground){
        // does user own the campground
       
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});


// UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.checkCampgroundOwnership,  function(req, res){
   // find and update the correct campground
   
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
   })
   // redirect somewhere
});


// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
});





module.exports = router;