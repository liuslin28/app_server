var express = require('express');
var router = express.Router();
var Users = require('./../models/musers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login',function (req,res,next) {
   var param = {
     userName: req.body.userName,
     userPwd: req.body.userPwd
   };
   Users.findOne(param,function (err,doc) {
     if(err) {
       res.json({
           status: '1',
           msg: err.message
       });
     } else {
       if(doc) {
         // res.cookie('userId',doc.userId,{
         //   path: '/',
         //     maxAge:1000*60*60
         // });
         // res.cookie("userName",doc.userName,{
         //     path:'/',
         //     maxAge:1000*60*60
         // });
         // req.session.user = doc;
         res.json({
             status: '0',
             msg: '',
             result: {
               userName: doc.userName
             }
         });
       }
     }
   })
});

module.exports = router;
