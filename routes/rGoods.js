var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/mgoods');

// 连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/mall');

mongoose.connection.on("connected",function () {
  console.log("MongoDB connected success.")
});

mongoose.connection.on("error",function () {
  console.log("MongoDB connected fail.")
});

mongoose.connection.on("cisconnected",function () {
  console.log("MongoDB connected disconnected.")
});

router.get("/", function (req,res,next) {
    console.log('get goods');
    let page = parseInt(req.param("page"));
    // 分页参数
    let pageSize = parseInt(req.param("pageSize"));
    // 每页多少条数据
    let sort = req.param("sort");
    // 升降序参数
    let skip = (page - 1) * pageSize;

    let params = {};
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice': sort});
    goodsModel.exec(function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message
        });
      } else {
        res.json({
          status: '0',
          msg: '',
          result: {
            count: doc.length,
            list: doc
          }
        });
      }
    })
});

module.exports = router;
