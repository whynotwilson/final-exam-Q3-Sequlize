const express = require('express')
const router = express.Router()
const db = require('../models')
const Record = db.Record
const User = db.User
const { authenticated } = require('../config/auth')

// 設定路由
// 列出全部 & filter
router.get('/', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error('user not found')

      return Record.findAll({
        raw: true,
        nest: true,
        where: {
          userId: req.user.id
        }
      })
    })
    .then((records) => {
      // console.log(records)
      const month = req.query.month || ''
      const category = req.query.category || ''

      // 轉換 date 格式給前端使用
      records.forEach((record) => {
        record.date = record.date.toLocaleString().split('-')
        record.date[2] = record.date[2].slice(0, 2).replace(' ', '')
        if (record.date[1].length === 1) {
          record.date[1] = '0' + record.date[1]
        }
        if (record.date[2].length === 1) {
          record.date[2] = '0' + record.date[2]
        }
        record.date = record.date.join('-')
      })

      // 篩選類別
      if (category) {
        records = records.filter((record) => {
          return (record.category === category)
        })
      }

      // 篩選月份
      if (month) {
        records = records.filter((record) => {
          return record.date.slice(4, 7).includes(month)
        })
      }

      // 計算總金額
      let totalAmount = 0
      records.forEach((record) => {
        totalAmount += record.amount
      })

      return res.render('index', { records, month, category, totalAmount })
    })
    .catch((err) => {
      console.log(err)
      return res.status(422).json(err)
    })
})

// 顯示新增一筆 record 頁面
router.get('/new', authenticated, (req, res) => {
  let today = new Date()
  today = today.toISOString().slice(0, 10)
  return res.render('new', { today })
})

// 新增一筆 record
router.post('/', authenticated, (req, res) => {
  req.body.UserId = req.user.id
  const record = req.body
  console.log('record', record)

  const errors = []
  if (!record.name || !record.amount || !record.category || !record.date) {
    errors.push({ message: '請填寫所有必填欄位' })
  }

  if (errors.length > 0) {
    let today = new Date()
    today = today.toISOString().slice(0, 10)
    return res.render('new', { record, today, errors })
  }

  Record.create({
    name: req.body.name,
    amount: req.body.amount,
    category: req.body.category,
    date: req.body.date,
    merchant: req.body.merchant,
    UserId: req.body.UserId
  })
    .then((record) => { return res.redirect('/') })
    .catch((err) => {
      console.log(err)
      return res.status(422).json(err)
    })
})

// 顯示修改 record 頁面
router.get('/:id/edit', authenticated, (req, res) => {
  Record.findOne({ id: req.params.id, userId: req.user.id })
    .lean()
    .exec((err, record) => {
      if (err) return console.log(err)
      record.date = record.date.toISOString().slice(0, 10)
      return res.render('edit', { record })
    })
})

// 修改 record
router.put('/:id', authenticated, (req, res) => {
  req.body.userId = req.user.id

  const errors = []
  if (!req.body.name || !req.body.amount || !req.body.category || !req.body.date) {
    errors.push({ message: '請填寫所有必填欄位' })
  }

  if (errors.length > 0) {
    Record.findOne({ id: req.params.id, userId: req.user.id })
      .lean()
      .exec((err, record) => {
        if (err) return console.log(err)
        record.date = record.date.toISOString().slice(0, 10)
        return res.render('edit', { record, errors })
      })
  } else {
    Record.findOne({ id: req.params.id, userId: req.user.id }, (err, record) => {
      if (err) return console.log(err)

      req.body.userId = req.user.id
      Object.assign(record, req.body)

      record.save(err => {
        if (err) return console.log(err)
        return res.redirect('/')
      })
    })
  }
})

// 刪除 record
router.delete('/:id/delete', authenticated, (req, res) => {
  Record.findOne({ id: req.params.id, userId: req.user.id }, (err, record) => {
    if (err) return console.log(err)
    record.remove(err => {
      if (err) return console.log(err)
      return res.redirect('/')
    })
  })
})

module.exports = router
