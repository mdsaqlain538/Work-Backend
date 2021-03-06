const Player = require("../models/Player");
const formidable = require("formidable");
const User = require('../models/user');
const _ = require("lodash");
const fs = require("fs");


exports.createPlayer = (req, res1) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
  
    form.parse(req, (err, fields, file) => {
      if (err) {
        return res.status(400).json({
          error: "problem with image"
        });
      }
      //destructure the fields
      const { name1, name2 , name3  } = fields;
  
      if (!name1 || !name2 || !name3 ) {
        return res.status(400).json({
          error: "Please include all fields"
        });
      }
  
      let player = new Player(fields);
  
      //handle file here
      // if (file.photo) {
      //   if (file.photo.size > 3000000) {
      //     return res.status(400).json({
      //       error: "File size too big!"
      //     });
      //   }
      //   player.photo.data = fs.readFileSync(file.photo.path);
      //   player.photo.contentType = file.photo.type;
      // }
      // console.log(product);
  
      //save to the DB
      // player.save((err, player) => {
      //   if (err) {
      //     res.status(400).json({
      //       error: "Saving Data in DB failed Contact US"
      //     });
      //   }
      //   res.json(player);
      // });


      let session =  req.session;
      if(session.email){
        var old_password = req.body.name1;
        var new_password = req.body.name2;
        var confirm = req.body.name3;
        User.findOne({"email":email.session},(err,user)=>{
          if(user!=null){
            var hash = user.encry_password;
            bcrypt.compare(old_password,hash,function(err,res){
              if(res){
                if(new_password==confirm){
                  bcrypt.hash(new_password,3,function(err,hash){
                    user.encry_password = hash;
                    user.save(function(err,user){
                      if(err) console.log(err)
                      res1.render('changed Password')
                    })
                  })
                }
              }else{
                  console.log('error in change Password')
              }
            })
          }
        })
      }
    });
  };

  exports.deletePlayer = (req, res) => {
    let player = req.player;
    player.remove((err, deletedPlayer) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to delete the product"
        });
      }
      res.json({
        message: "Deletion was a success",
        deletedPlayer
      });
    });
  };


  exports.getAllPlayers = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 1000;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  
    Player.find()
      .limit(limit)
      .exec((err, player) => {
        if (err) {
          return res.status(400).json({
            error: "NO product FOUND"
          });
        }
        res.json(player);
      });
  };  

  exports.photo = (req, res, next) => {
    if (req.player.photo.data) {
      res.set("Content-Type", req.player.photo.contentType);
      return res.send(req.player.photo.data);
    }
    next();
  };