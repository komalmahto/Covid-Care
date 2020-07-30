 var bodyParser       = require("body-parser"),
methodOverride       = require("method-override"),
mongoose             = require("mongoose"),
express              = require("express"),
app                  = express(),
moment               = require(__dirname+"/models/moments.js"),
passport             =require("passport"),
flash                =require("connect-flash"),
localStrategy        =require("passport-local"),
passportLocalMongoose=require("passport-local-mongoose"),
user                 =require(__dirname+"/models/user.js"),
	 comment         =require("./models/comments");
	var admin=require("./models/admin");
const multer  = require("multer");
const path=require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');

mongoose.connect("mongodb://localhost:27017/moments",{useNewUrlParser:true ,useUnifiedTopology: true ,useFindAndModify: false });

app.use(flash());

app.use(require("express-session")({
		secret:"Komal",
	    resave:false,
	    saveUninitialized:false          
		}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(function(req,res,next){
	res.locals.currentUser= req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
})




app.use("/admin",admin);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method"));


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname));
  }
})

var upload = multer({ storage: storage });


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'knitron1992@gmail.com',
    pass: '717368sdsm'
  }
});

//function to calculate distance between author and user
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  var earthRadiusKm = 6378;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return earthRadiusKm * c;
}

//covid routes
app.get("/",function(req,res){
	res.redirect("/moments");
});
app.get("/moments",isLoggedIn,function(req,res){
	
	moment.find({},function(err,moments){
		if(err){
			console.log(err);
		}else{
			res.render("moments/index",{moments:moments,currentUser:req.user});
		}
	});

});
app.post("/moments",upload.single("postImage"),isLoggedIn,function(req,res){
	const oment= new moment({
	title: req.body.postTitle,
	photopath: req.file.path.substring(15,100),
	body: req.body.postBody,
	email:req.body.phoneNumber,
    postlat:req.body.postLat,
    postlng:req.body.postLng,
	author:{
		id: req.user._id,
		username:req.user.username
	}
});
	var mailOptions = {
    from:"knitron1992@gmail.com",
    to:"samarmahur1992@gmail.com",
    subject:req.body.postTitle,
    text:req.body.postBody,
    attachments:[
      {filename:req.file.path.substring(15,100), path:__dirname+"/public/uploads/"+req.file.path.substring(15,100)}
    ]
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
oment.save(function(err){
	if(err){
	 res.redirect("moments/new");
    }else{
	 req.flash("success","Your Post Has Been Uploaded Successfully");
	 res.redirect("/moments");
 }
});


});
app.get("/moments/new",isLoggedIn,function(req,res){
	res.render("moments/new");
				});

app.get("/moments/:id",isLoggedIn,function(req,res){
	
	moment.findById(req.params.id).populate("comments").exec(function(err,foundmoment){
		if(err){
			res.redirect("/moments");
		} else{ 
			res.render("moments/show",{moment:foundmoment});
		}
	});

});
app.get("/moments/:id/edit",isLoggedIn,function(req,res){
	moment.findById(req.params.id,function(err,foundmoment){
		if(err){
			req.flash("error","No Post Found");
			res.redirect("/moments");
		}else{
			
			if(foundmoment.author.id.equals(req.user._id)){
			res.render("moments/edit",{moment:foundmoment});
			} else{
				req.flash("error","You Don't Have Permission To Edit The Post");
				res.redirect("back");
			}
		}
	});

});
app.put("/moments/:id",upload.single("postImage"),isLoggedIn,function(req,res){
	moment.findById(req.params.id, function (err, foundPost) {
	const path="public/uploads/"+foundPost.photopath;
var fs = require('fs');

fs.unlink(path, function (err) {
	if (err) throw err;
	
	console.log('File deleted!');

});
});
	moment.findByIdAndUpdate(req.params.id, {title: req.body.postTitle,  photopath:req.file.path.substring(15,100),  body:req.body.postBody} ,function(err,updated){
		if(err){
			res.redirect("/moments");
		}else{
			req.flash("success"," Your Post Has Been Successfully Updated");
			res.redirect("/moments/"+req.params.id);
		}

	})
});


app.delete("/moments/:id",isLoggedIn,function(req,res){
	moment.findById(req.params.id, function (err, foundPost) {
    const path="public/uploads/"+foundPost.photopath;
  var fs = require('fs');

  fs.unlink(path, function (err) {
    if (err) throw err;
    
    console.log('File deleted!');

  });
  });
	moment.findByIdAndRemove(req.params.id, function(err,foundpost){

		if(err){ 
			console.log(err);
			   }
		else {
			    if(foundpost.author.id.equals(req.user._id)){
					req.flash("success"," Your Post Has Been Deleted Successfully");
			res.redirect("/moments");
			} else{
				res.send("no permission");
			}
		}
		
		});
	});







//comment routes
app.get("/moments/:id/comments/new",isLoggedIn,function(req,res){
	moment.findById(req.params.id,function(err,moment){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{moment:moment});
		}
	});
	
});	
app.post("/moments/:id/comments/new",isLoggedIn, function(req,res){
	moment.findById(req.params.id,function(err,moment){
		if(err){
			req.flash("error","Something Went Wrong!!")
			console.log(err);
		}
		else{ 
			comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}else{
					comment.author._id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					moment.comments.push(comment);
					moment.save();
					req.flash("success","Your Comment Has Been Added Successfully!!")
					res.redirect("/moments/"+ moment._id);
				}
			})
		}
	});
});
app.get("/covid-tracker",function(req,res){
	res.render("moments/covid");
})

//Auth routes

app.get("/",function(req,res){
	res.render("home");
});


app.get("/register",function(req,res){
	res.render("register");

});
//2
app.post("/register",function(req,res){
   
	user.register(new user({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			
			console.log(err);
			return res.render("register",{"error":err.message});
		}
		
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome To Covid Care App"+" " + user.username);
			res.redirect("/moments");
		});
	});
});

app.get("/login",function(req,res){
	res.render("login");
});
var express= require("express");
var router = express.Router();


app.post("/login",passport.authenticate("local",{
	successRedirect:"/moments",
	faailureRedirect:"/login",
	
}),function(req,res){
    
});

app.get("/logout",function(req,res){
	req.logout();
	req.flash("success","You Have Been Logged  Out Successfully!!");
	res.redirect("/login");
})


//Sorting posts on the basis of authors location
app.post("/safezone/:dist",function(req,res){
var distance=req.params.dist;
var filterMoments=[];

  moment.find({},function(err,moments){
   moments.forEach(function(moment){
     var lat1=req.body.userlat;
     var lng1=req.body.userlng;
     var lat2=moment.postlat;
     var lng2=moment.postlng;

      const x=distanceInKmBetweenEarthCoordinates(lat1,lng1,lat2,lng2);
      if(x<=distance){
        filterMoments.push(moment);
      }

   });

			 res.render("moments/index",{moments:filterMoments});

	});

});


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","Please Login First");
	res.redirect("/login");
}




app.listen(2101,function(){
	console.log("starting");
})
