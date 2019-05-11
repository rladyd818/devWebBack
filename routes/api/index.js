const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Block = require('../../models/Block');
const crypto = require('crypto'); //Node.js 에서 제공하는 암호화 모듈
//const properties = require('../properties/key.js');
// mapping 
// Login
router.post('/login', function (req, res, next) {
  //DB에 암호화 하여 저장하였으니 DB에서 확인할때도 암호화 된 키로 확인한다
  let  cipher = crypto.createCipher('aes192', 'key');
  cipher.update(req.body.user.password,'utf8', 'base64');
  let cipherPw = cipher.final('base64');

  // find user in MongoDB
  User.findOne({email: req.body.user.email, password: cipherPw}, function(err, user){
    // 구문 error
    if(err) return res.status(500).json({error: err});
    // User가 없으면 error
    if(!user) return res.status(404).json({error: 'user not found'});
    req.session.user = user;
    res.json(user);
  })
});

// Sign Up
// Post로만 받는다
router.post('/signUp', function (req, res, next) {
    const user = new User();
    // setting values
    user.email = req.body.user.email;
    user.password = req.body.user.password;
    user.nickname = req.body.user.nickname;

    // encryption 
    let  cipher = crypto.createCipher('aes192', 'key');
    cipher.update(user.password, 'utf8', 'base64');
    let cipheredOutput = cipher.final('base64');
    user.password = cipheredOutput;
/*  
  //혹시 모를 복호화를 통해 남겨놓음
  //decryption
  let decipher = crypto.createDecipher('aes192', 'key');
  decipher.update(cipheredOutput, 'base64', 'utf8');
  let decipheredOutput = decipher.final('utf8');
*/
    user.save(function(err){
    if(err) {
        console.log(err);
        res.json({result: 0});
        return;
    }
    res.json({result: 1});
    });     
});
router.get("/checkUser", function(req, res, next) {
  res.json(req.session.user);
});
router.post("/clearSession", function(req, res, next){
  req.session.user = undefined;
  res.json(req.session.user);
})
// //checkLogin
// router.post('/checkLogin', function(req, res, next) {
//     console.log(req.session);
//     if (req.session.user) {
//         res.json(req.session.user);
//     } else {
//         //res.status(404).json({error:"not login"});
//     }
// });
// //Business Login Check
// router.post('/BusinessLogin', function(req, res, next) {
//     //console.log(req.session);
//     if (req.session.user) {
//         res.json(req.session.user);
//     } else {
//         //console.log('로그인이 필요합니다.');
//         res.json(req.session.user);
//         //res.status(404).json({error:"not login"});
//     }
// });

module.exports = router;