const mongoose = require('mongoose')
const Record = require('../record')
const User = require('../user')
const recordsData = require('../../records.json')
const bcrypt = require('bcryptjs')

mongoose.connect('mongodb://localhost/expense-tracker', { useNewUrlParser: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('db error')
})

db.once('open', () => {
  console.log('db connected!')

  const users = []
  users.push(new User({
    name: 'user1',
    email: 'user1@example.com',
    password: '12345678'
  }))
  users.push(new User({
    name: 'user2',
    email: 'user2@example.com',
    password: '12345678'
  }))

  users.forEach((newUser) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return console.log(err)

      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) return console.log(err)

        newUser.password = hash
        newUser.save()
          .then()
          .catch(err => { if (err) console.log(err) })
      })
    })
  })

  for (let i = 0; i < 6; i++) {
    if (i < 3) {
      recordsData[i].userId = users[0].id
    } else {
      recordsData[i].userId = users[1].id
    }
    Record.create(recordsData[i])
  }

  console.log('done')
})
