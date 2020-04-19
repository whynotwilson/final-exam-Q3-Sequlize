const express = require('express')
const router = express.Router()
const db = require('../models')
const Record = db.Record
const User = db.User
const { authenticated } = require('../config/auth')
const formateDate = function (date) {
  date = date.toLocaleString().split('-')
  date[2] = date[2].slice(0, 2).replace(' ', '')
  if (date[1].length === 1) {
    date[1] = '0' + date[1]
  }
  if (date[2].length === 1) {
    date[2] = '0' + date[2]
  }
  date = date.join('-')

  return date
}

// 判斷值是否為空白字串
const isNullorEmpty = function (obj) {
  if (obj.name.trim().length === 0 || obj.amount.trim().length === 0 || obj.category.trim().length === 0 || obj.date.trim().length === 0) {
    return true
  } else {
    return false
  }
}

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
          UserId: req.user.id
        }
      })
    })
    .then((records) => {
      // console.log(records)
      const month = req.query.month || ''
      const category = req.query.category || ''

      // 轉換 date 格式給前端使用
      records.forEach((record) => {
        record.date = formateDate(record.date)
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

  // 判斷是否為空
  if (isNullorEmpty(record)) {
    errors.push({ message: '內容不能為空白' })
  }

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
  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error('user not found')
      return Record.findOne({
        where: {
          Id: req.params.id,
          UserId: req.user.id
        }
      })
    })
    .then((record) => {
      record.date = formateDate(record.date)
      return res.render('edit', { record: record.get() })
    })
    .catch((err) => {
      console.log(err)
    })
})

// 修改 record
router.put('/:id', authenticated, (req, res) => {
  req.body.UserId = req.user.id
  // console.log('req.user', req.user)
  // console.log('req.body', req.body)

  const errors = []
  if (isNullorEmpty(req.body)) {
    errors.push({ message: '內容不能為空白' })
  }

  if (!req.body.name || !req.body.amount || !req.body.category || !req.body.date) {
    errors.push({ message: '請填寫所有必填欄位' })
  }

  if (errors.length > 0) {
    Record.findOne({
      where: {
        Id: req.params.id,
        UserId: req.user.id
      }
    })
      .then((record) => {
        console.log('record', record)
        record.date = formateDate(record.date)
        return res.render('edit', { record: record.get(), errors })
      })
      .catch((err) => {
        console.log(err)
        return res.status(422).json(err)
      })
  } else {
    Record.findOne({
      where: {
        Id: req.params.id,
        UserId: req.user.id
      }
    })
      .then((record) => {
        console.log('record', record)
        record.name = req.body.name
        record.amount = req.body.amount
        record.category = req.body.category
        record.date = req.body.date
        record.merchant = req.body.merchant
        record.UserId = req.user.id
        return record.save()
      })
      .then((record) => {
        return res.redirect('/records')
      })
      .catch((err) => {
        console.log(err)
        return res.status(422).json(err)
      })
  }
})

// 刪除 record
router.delete('/:id/delete', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error('user not found')

      return Record.destroy({
        where: {
          UserId: req.user.id,
          Id: req.params.id
        }
      })
    })
    .then((record) => {
      return res.redirect('/')
    })
    .catch((err) => {
      console.log(err)
      return res.status(422).json(err)
    })
})

module.exports = router
