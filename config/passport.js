const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const FacebookStrategy = require('passport-facebook').Strategy

module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ email: email }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Email 尚未註冊' })
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Email 或密碼不正確' })
          }
        })
      })
    })
  )

  passport.use(
    new FacebookStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      profileFields: ['email', 'displayName']
    }, (accessToken, refreshToken, profile, done) => {
      // 檢查是否已註冊，未註冊就建立新用戶
      // console.log('profile', profile)
      User.findOne({
        email: profile._json.email
      }).then(user => {
        if (!user) {
          var randomPassword = Math.random().toString(36).slice(-8)
          bcrypt.genSalt(10, (err, salt) => {
            if (err) console.log(err)

            bcrypt.hash(randomPassword, salt, (err, hash) => {
              if (err) console.error(err)

              var newUser = User({
                name: profile._json.name,
                email: profile._json.email,
                password: hash
              })

              console.log('newUser.email', newUser.email)

              newUser.save().then(user => {
                return done(null, user)
              }).catch(err => {
                console.log(err)
              })
            })
          })
        } else {
          return done(null, user)
        }
      })
    })
  )

  // 序列化，只存 id 就好，節省資料量
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // 取出 user 資料以後，可能傳給前端樣板，故加入.lean().exec()
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .exec((err, user) => {
        done(err, user)
      })
  })
}
