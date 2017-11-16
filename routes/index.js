var express = require('express');
var router = express.Router();

// router.all('*',function (req,res,next) {
//   content_type = req.header('Content-Type');
//   access_control_allow_origin = req.header('Origin');
//   res.set('Content-Type',content_type);
//   res.set("Access-Control-Allow-Origin",access_control_allow_origin);
//   next();
// });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



module.exports = router;
