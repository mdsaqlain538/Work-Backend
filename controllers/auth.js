const User = require("../models/user");
const Password = require('../models/password');
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
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

  const password = new Password(req.body);
  
  password.save((err, user) => {
    //console.log(user);
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB"
      });
    }
    // if(user.mail){
    //   const old_pass = user.old_pass;
    //   const new_pass = user.new_pass;
    //   const confirm_pass = user.confirm;
    //   const email_pass = user.email;
    //   console.log(email_pass);
    //   User.findOne({"email":email_pass},(err,user)=>{
    //     if(user!=null){
    //       var hash = user.encry_password;
    //       bcrypt.compare(old_pass,hash,function(err,res){
    //         if(res){
    //           if(new_pass==confirm_pass){
    //             bcrypt.hash(new_pass,3,function(err,hash){
    //               user.encry_password = hash;
    //               user.save(function(err,user){
    //                 if(err) console.log(err);
    //                 console.log(user.first+"! Your Password has been Changed")
    //               });
    //             });
    //           }else{
    //             //password doest match
    //           }
    //         };
    //       })
    //     }else{
    //       console.log('Failed to chnage Password');
    //     }
    //   })
    // }
    res.json({
      mail:user.mail,
      oldpass: user.oldpass,
      newpass: user.newpass,
      confirm: user.confirm,
      id: user._id
    });
  });
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