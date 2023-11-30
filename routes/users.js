var express = require('express');
var router = express.Router();

var dbget = require('../db/get.js');
var dball = require('../db/all.js');
var dbdo = require('../db/exec.js');

/* login page */
router.get('/login', function(req, res, next){
  res.render('login',{
    title: 'login',
    login: req.session.login,
  });
});
router.post('/login', async function(req, res, next){

  let account = req.body.account;
  let pass = req.body.password;
  
  let sql = "select * from users where account = '"
    + account + "' and password = '" + pass + "'";
  let record = await dbget.getRow(sql);
  if(record != undefined){
    req.session.login = record;
  }
  res.redirect('/');
});

/* Logout */
router.get('/logout', function(req, res, next){
  req.session.login = undefined;
  res.redirect('/users/login');
})

/* Admin (Add New User) */
router.get('/admin',async function(req, res,next){
  if(req.session.login == undefined){
    res.redirect('/users/login');
    return;
  }
  if(req.session.login.role != 'admin'){
    res.redirect('/users/login');
    return;
  }
  res.render('admin',{
    title: 'Admin',
    login: req.session.login,
  })
  
})

router.post('/admin',async function(req,res,next){
  let account = req.body.account;
  let pass = req.body.password;
  let name = req.body.name;
  
  let sql = "insert into users (account, password, name, role) values('"
  + account + "','" + pass + "','" + name + "','user')";
  await dbdo.exec(sql);
  res.render('admin',{
    title: 'Admin',
    login: req.session.login,
  });
});

/* Show User List */
router.get('/admin2', async function(req, res, next){
  if(req.session.login == undefined){
    res.redirect('/users/login');
    return;
  }
  let sql = "select * from users";
  let records = await dball.getAllRows(sql);
  res.render('admin2', {
    title: 'Admin2',
    login: req.session.login,
    data:records
  });

});

/* Delete User */
router.get('/del_usr',async function(req, res, next){
  if(req.session.login == undefined){
    res.redirect('/users/login');
    return;
  }
  if(req.session.login.role != 'admin'){
    res.redirect('/users/login');
    return;
  }
  let id = req.query.id;
  let sql = 'delete from users where id = ' + id;
  await dbdo.exec(sql);
  res.redirect('/users/admin2')
});


module.exports = router;
