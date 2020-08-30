const User = require("../models/user");
const Password = require('../models/password');
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const crypto = require("crypto");
var expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB"
      });
    }
    res.json({
      first: user.first,
      last: user.last,
      school: user.school,
      address: user.address,
      city:user.city,
      email:user.email,
      mobile:user.mobile,
      id: user._id
    });
  });
};

exports.ChangePassword = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }
  const x = req.body.mail;
  console.log(x);
    if(x){
      const old_pass = req.body.old_pass;
      const new_pass = req.body.new_pass;
      const confirm_pass = req.body.confirm;
      User.findOne({'email':x},(err,user)=>{
        console.log(user);


        const saq = crypto.createHash('sha256');
        saq.update('req.body.old_pass');
        const y = saq.digest('hex');

        const sal = crypto.createHash('sha256');
        sal.update('req.body.new_pass');
        const y1 = sal.digest('hex');

        if(user!=null){
          var hash = user.encry_password;
          console.log(y);
          console.log(y1);
          if(hash==y){
            if(req.body.new_pass==req.body.confirm){
              const sal = crypto.createHash('sha256');
              sal.update(req.body.new_pass);
              user.encry_password = sal.digest('hex');
              user.save(function(err,user){
                if(err) console.log(err);
                console.log(user.first+"Your Password has been Changed")
              })
            }else{
              console.log('New Password No Match.')
            }
          }else{
            console.log('Enter Correct Old Password');
          }
        }else{
          console.log('Enter Correct Details To Update Password');
        }
      })
    }
};

exports.signin = (req, res) => {
    const errors = validationResult(req);
    const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  User.findOne({ email }, (err, user) => { 
    if (err || !user) {
      res.status(400).json({
        error: "USER email does not exists"
      });
    }
    //const x =user.autheticate(encry_password);
    //console.log(x);
    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to front end
    const { _id, first, last, school , address, city , email, mobile , role } = user;
    return res.json({ token, user: { _id, first, last, school, address,city, email, mobile, role } });
  });
};



exports.signout = (req, res) => {
  res.clearCookie('token');
  res.json({
    message: "User signout Successfully.."
  });
};

//protected route
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  userProperty:"auth"
});

//custom middleware
exports.isAuthenticated = (req,res,next) =>{
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if(!checker){
    return res.status(403).json({
      error:"Access Denied.."
    });
  }
  next();
};

exports.isAdmin = (req,res,next) =>{
  if(req.profile.role === 0){
    return res.status(403).json({
      error:"You are not an admin.."
    }); 
  }
  next();
};