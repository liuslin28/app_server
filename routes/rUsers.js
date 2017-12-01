var express = require('express');
var router = express.Router();
var User = require('./../models/musers');
require('./../util/util');

/* GET user listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登录 logIn
router.post('/login',function (req,res,next) {
   var param = {
     userName: req.body.userName,
     userPwd: req.body.userPwd
   };
   User.findOne(param,function (err,doc) {
     if(err) {
       res.json({
           status: '1',
           msg: err.message
       });
     } else {
       if(doc) {
         res.cookie('userId',doc.userId,{
           path: '/',
             maxAge:1000*60*60
         });
         res.cookie("userName",doc.userName,{
             path:'/',
             maxAge:1000*60*60
         });
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

// 登出logOut
router.post("/logout", function(req,res,next) {
    res.cookie("userId","",{
        path:'/',
        maxAge: -1
    });
    res.json({
        status: '0',
        msg: '',
        result: ''
    })
});

router.get("/checkLogin",function (req,res,next) {
   if(req.cookies.userId) {
       res.json({
           status:'0',
           msg:'',
           result: req.cookies.userName
       });
   } else {
       res.json({
           status: '1',
           msg:'未登录',
           result:''
       });
   }
});

//查询当前用户的购物车数据
router.get("/cartList",function (req,res,next) {
    let userId = req.cookies.userId;
    User.findOne({userId:userId},function (err,doc) {
        if(err) {
            res.json({
                status: '1',
                msg: err.message,
                result:''
            });
        } else {
            if(doc) {
                res.json({
                    status:'0',
                    msg: '',
                    result:doc.cartList
                });
            }
        }
        
    })

});

// 购物车删除
router.post("/cartDel",function (req,res,next) {
   let userId = req.cookies.userId;
   let productId = req.body.productId;
   User.update({userId:userId},{$pull:{'cartList':{'productId':productId}}},function (err,doc) {
       if(err){
           res.json({
               status:'1',
               msg:err.message,
               result:''
           });
       } else {
           res.json({
               status:'0',
               msg:'',
               result:'suc'
           });
       }
   })
});

// 购物车数量增减
router.post("/cartEdit", function (req,res,next) {
   let userId = req.cookies.userId;
   let productId = req.body.productId;
   let productNum = req.body.productNum;
   let checked = req.body.checked;
   User.update({'userId':userId},{'cartList.productId':productId},{
       'cartList.$.productNum': productNum
   },function (err,doc) {
       if(err){
           res.json({
               status:'1',
               msg:err.message,
               result:''
           });
       } else {
           res.json({
               status:'0',
               msg:'',
               result:'suc'
           });
       }
   })
});

//全选
router.post("/cartCheckAll",function (req,res,next) {
    let userId = req.cookies.userId;
    let checkAll = req.body.checkAll?'1':'0';
    User.findOne({userId:userId},function (err,user) {
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        } else {
            if(user) {
                user.cartList.forEach((item) => {
                    item.checked = checkAll;
                });
                user.save(function (err1,doc) {
                    if(err1) {
                        res.json({
                            status:'1',
                            msg:err1.message,
                            result:''
                        });
                    } else {
                        res.json({
                            status:'0',
                            msg:'',
                            result:'suc'
                        });
                    }
                })
            }
        }
    })
});

//查询用户地址接口
router.get("/addressList",function (req,res,next) {
    let userId = req.cookies.userId;
    User.findOne({userId:userId},function (err,doc) {
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        } else {
            res.json({
                status:'0',
                msg:'',
                result: doc.addressList
            });
        }
    })

});

// 设置默认地址
router.post("/setDefault",function (req,res,next) {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;
    if(!addressId) {
        res.json({
            status:'10001',
            msg: 'addressId is null',
            result:''
        });
    }  else {
        User.findOne({userId:userId},function (err,doc) {
            if(err) {
                res.json({
                    status:'1',
                    msg:err.message,
                    result:''
                });
            } else {
                let addressList = doc.addressList;
                console.log(addressList);
                addressList.forEach((item)=>{
                    console.log(item);
                    if( item.addressId === addressId) {
                        item.isDefault = true;
                        console.log('1');
                    } else {
                        item.isDefault = false;
                    }
                });
            }
        });
    }
    doc.save(function (err1,doc1) {
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:''
            });
        }
    });

});

// 删除地址接口
router.post("/delDefault",function (req,res,next) {
   let userId = req.cookies.userId;
   let addressId = req.body.addressId;
   User.update({userId:userId},
       {
           $pull: {
               'addressList': {
                   'addressId': addressId
               }
           }
       }, function (err,doc) {
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:''
            });
        }
   });
});

//订单付款
router.post("/payMent",function (req,res,next) {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;
    let orderTotal = req.body.orderTotal;
    User.findOne({userId:userId},function (err,doc){
       if(err) {
           res.json({
               status:'1',
               msg:err.message,
               result:''
           });
       } else {
           let address = '',
               goodsList = [];
           doc.addressList.forEach((item) => {
               if(addressId === item.addressId) {
                   address = item;
                }
           });
           // 获取用户购物车的购买商品
           doc.cartList.filter((item) => {
               if(item.checked === 1) {
                   goodsList.push(item);
                }
           });
           // orderId的设置
           let platform = '455';
           let r1 = Math.floor(Math.random()*10);
           let r2 = Math.floor(Math.random()*10);
           let sysDate = new Date().Format('yyyyMMddhhmmss');
           let orderId = platform + r1 + sysDate + r2;
           // 生成时间
           let creatDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
           let order ={
               orderId:orderId,
               orderTotal: orderTotal,
               addressInfo: address,
               goodsList: goodsList,
               orderStatus: '0',
               createDate: creatDate
           };

           doc.orderList.push(order);

           doc.save(function (err1,doc1) {
               if(err1){
                   res.json({
                       status:"1",
                       msg:err.message,
                       result:''
                   });
               }else{
                   res.json({
                       status:"0",
                       msg:'',
                       result:{
                           orderId:order.orderId,
                           orderTotal:order.orderTotal
                       }
                   });
               }
           });
       }
    });
});

module.exports = router;
