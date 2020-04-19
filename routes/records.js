const express = require('express')
const router = express.Router()
const Record = require('../models/record')
const { authenticated } = require('../config/auth')

// 設定路由
// 列出全部 & filter
router.get('/', authenticated, (req, res) => {
  const month = req.query.month || ''
  const category = req.query.category || ''

  let categoryRegex = new RegExp('')
  if (category) {
    categoryRegex = new RegExp(category)
  } else {
    categoryRegex = new RegExp('[a-zA-Z]')
  }

  let totalAmount = 0

  // Record.find({ userId: req.user._id })
  Record.find({ userId: req.user._id, category: { $regex: categoryRegex } })
    .collation({ locale: 'en_US' }) // 設定英文語系
    .lean()
    .exec((err, records) => {
      if (err) return console.log(err)
      // 轉換 date 格式給前端使用
      records.forEach((record) => {
        record.date = record.date.toISOString().slice(0, 10) // 把日期 Date 格式 轉成字串 xxxx-xx-xx 的格式
      })
      // 篩選月份
      if (month) {
        records = records.filter((record) => {
          return record.date.slice(5, 7).includes(month)
        })
      }
      // 計算總金額
      records.forEach((record) => {
        totalAmount += record.amount
      })

      return res.render('index', { records, month, category, totalAmount })
    })
})

// 顯示新增一筆 record 頁面
router.get('/new', authenticated, (req, res) => {
  let today = new Date()
  today = today.toISOString().slice(0, 10)
  console.log('today', today)
  return res.render('new', { today })
})

// 新增一筆 record
router.post('/', authenticated, (req, res) => {
  req.body.userId = req.user._id
  const record = new Record(req.body)

  const errors = []
  if (!record.name || !record.amount || !record.category || !record.date) {
    errors.push({ message: '請填寫所有必填欄位' })
  }

  if (errors.length > 0) {
    return res.render('new', { record, errors })
  }

  record.save(err => {
    if (err) return console.log(err)
    return res.redirect('/')
  })
})

// 顯示修改 record 頁面
router.get('/:id/edit', authenticated, (req, res) => {
  Record.findOne({ _id: req.params.id, userId: req.user._id })
    .lean()
    .exec((err, record) => {
      if (err) return console.log(err)
      record.date = record.date.toISOString().slice(0, 10)
      return res.render('edit', { record })
    })
})

// 修改 record
router.put('/:id', authenticated, (req, res) => {
  req.body.userId = req.user._id

  const errors = []
  if (!req.body.name || !req.body.amount || !req.body.category || !req.body.date) {
    errors.push({ message: '請填寫所有必填欄位' })
  }

  if (errors.length > 0) {
    Record.findOne({ _id: req.params.id, userId: req.user._id })
      .lean()
      .exec((err, record) => {
        if (err) return console.log(err)
        record.date = record.date.toISOString().slice(0, 10)
        return res.render('edit', { record, errors })
      })
  } else {
    Record.findOne({ _id: req.params.id, userId: req.user._id }, (err, record) => {
      if (err) return console.log(err)

      req.body.userId = req.user._id
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
  Record.findOne({ _id: req.params.id, userId: req.user._id }, (err, record) => {
    if (err) return console.log(err)
    record.remove(err => {
      if (err) return console.log(err)
      return res.redirect('/')
    })
  })
})

module.exports = router
