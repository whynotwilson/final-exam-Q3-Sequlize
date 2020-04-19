const express = require('express')
const router = express()
const User = require('../models/user')
const passport = require('passport')
const bcrypt = require('bcryptjs')

// 登入頁面
router.get('/login', (req, res) => {
  res.render('login')
})

// 檢查登入
router.post('/login', (req, res, next) => {
  const { email, password } = req.body
  const errors = []
  if (!email || !password) {
    errors.push({ message: '請填寫全部欄位' })
    res.render('login', { errors })
  } else {
    passport.authenticate('local', (err, user, info) => {
      if (err) throw err
      if (user) {
        passport.authenticate('local', { successRedirect: '/' })(req, res, next)
      } else {
        req.flash('warning_msg', info.message)
        return res.redirect('/users/login')
      }
    })(req, res, next)
  }
})

// 註冊頁面
router.get('/register', (req, res) => {
  res.render('register')
})

// 檢查註冊
router.post('/register', (req, res, next) => {
  const { name, email, password, password2 } = req.body

  // 錯誤訊息提示
  const errors = []
  if (!name || !email || !password || !password2) {
    errors.push({ message: '請填寫全部欄位' })
  }

  if (password !== password2) {
    errors.push({ message: '二次密碼不一致' })
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    // 尋找 email 是否已被註冊
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ message: '此 Email 已註冊' })
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        })
      } else {
        const newUser = new User({
          name,
          email,
          password
        })

        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err
            newUser.password = hash
            newUser
              .save()
              .then(user => {
                res.redirect('/')
              })
              .catch(err => console.log(err))
          })
        })
      }
    })
  }
})

// 登出
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你已經成功登出')
  res.redirect('/users/login')
})

module.exports = router
