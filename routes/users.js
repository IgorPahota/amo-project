const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users')

/* GET users listing. */
router.get('/', async function(req, res) {
  const users = await User.find();
  res.json(users);
  // res.redirect('https://google.com')
});

router.post('/', async (req, res) => {
  const user = new User({
    name: req.body.name,
    age: req.body.age,
  })
  await user.save();
  // console.log();
  res.send(user._id);
})


router.get('/form', function(req, res) {
  res.render('users');
});



module.exports = router;
