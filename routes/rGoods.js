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

router.get("/list", function (req,res,next) {

    let page = parseInt(req.param("page"));
    // 分页参数
    let pageSize = parseInt(req.param("pageSize"));
    // 每页多少条数据
    let sort = req.param("sort");
    // 升降序参数
    let skip = (page - 1) * pageSize;
    // 分页数据
    let priceLevel = req.param("priceLevel");
    console.log('get goods');
    let priceGt = '';
    let priceLte = '';
    let params = {};
    if(priceLevel!='all') {
        switch (priceLevel){
            case '0': priceGt = 0; priceLte = 100; break;
            case '1': priceGt = 100; priceLte = 500; break;
            case '2': priceGt = 500; priceLte = 1000; break;
            case '3': priceGt = 1000; priceLte = 5000; break;
        }
        params = {
            salePrice:{
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }

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

// 加入购物车
router.post('/addCart', function (req,res,next) {
    let userId = '100000077', productId = req.body.productId;
    let User = require('../models/musers');
    User.findOne({userId:userId},function (err,userDoc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            // console.log(userDoc.cartList);
            if (userDoc) {
                let goodsItem = '';
                userDoc.cartList.forEach(function (item) {
                    if (item.productId == productId) {
                        goodsItem = item;
                        item.productNum++;
                    }
                });
                if (goodsItem) {
                    userDoc.save(function (err1, doc1) {
                        if (err1) {
                            res.json({
                                status: '1',
                                msg: err1.message
                            });
                        } else {
                            res.json({
                                status: '0',
                                msg: '',
                                result: 'suc'
                            });
                        }
                    });
                } else {
                    Goods.findOne({productId: productId}, function (err2, doc) {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg:err1.message
                            });
                        } else {
                            if (doc) {
                                doc.productNum = 1;
                                doc.checked = 1;
                                userDoc.cartList.push(doc);
                                userDoc.save(function (err3, doc1) {
                                    if (err3) {
                                        res.json({
                                            status: '1'
                                            // msg:err2.message
                                        });
                                        console.log("last");
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: '',
                                            result: 'suc'
                                        });
                                    }
                                });
                            }
                        }
                    })
                }
            }
        }
    });

});



module.exports = router;
