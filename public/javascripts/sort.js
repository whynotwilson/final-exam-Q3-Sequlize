let countDate = 0
let countAmount = 0
const amountDatas = document.getElementsByName('amount')
const dateDatas = document.getElementsByName('date')
const sortFather = document.getElementById('sortFather')

const sortDate = document.getElementById('sortDate')
const sortAmount = document.getElementById('sortAmount')
const sortDatas = document.getElementsByName('sortDatas')

// 按照日期排序
sortDate.addEventListener('click', function () {
  // 日期正序排列
  if (countDate % 2 === 0) {
    for (let i = 0; i < sortDatas.length; i++) {
      let minDate = dateDatas[i].innerText
      let minIndex = i

      for (var j = i; j < sortDatas.length; j++) {
        if (dateDatas[j].innerText < minDate) {
          minDate = dateDatas[j].innerText
          minIndex = j
        }
      }
      sortFather.insertBefore(sortDatas[minIndex], sortDatas[i])
      sortDate.innerText = '日期↑'
      sortAmount.innerText = '價格'
    }
  // 日期倒序排列
  } else {
    for (let i = 0; i < sortDatas.length; i++) {
      let maxAmount = dateDatas[i].innerText
      let maxIndex = i
      for (let j = i; j < sortDatas.length; j++) {
        if (dateDatas[j].innerText > maxAmount) {
          maxAmount = dateDatas[j].innerText
          maxIndex = j
        }
      }
      sortFather.insertBefore(sortDatas[maxIndex], sortDatas[i])
      sortDate.innerText = '日期↓'
      sortAmount.innerText = '價格'
    }
  }
  countDate++
})

// 按照金額排序
sortAmount.addEventListener('click', function () {
  // 金額正序排列，選擇排序法（Selection Sort），每次循環找出最小的值放在最前面，重複 i 次
  if (countAmount % 2 === 0) {
    for (let i = 0; i < sortDatas.length; i++) {
      let minAmount = Number(amountDatas[i].innerText)
      let minIndex = i

      for (var j = i; j < sortDatas.length; j++) {
        if (Number(amountDatas[j].innerText) < minAmount) { // 轉成數字比較，如果用字串比較會得到 100 < 2 < 5 < 10
          minAmount = Number(amountDatas[j].innerText)
          minIndex = j
        }
      }
      sortFather.insertBefore(sortDatas[minIndex], sortDatas[i])
      sortDate.innerText = '日期'
      sortAmount.innerText = '價格↑'
    }
  // 金額倒序排列
  } else {
    for (let i = 0; i < sortDatas.length; i++) {
      let maxAmount = Number(amountDatas[i].innerText)
      let maxIndex = i
      for (let j = i; j < sortDatas.length; j++) {
        if (Number(amountDatas[j].innerText) > maxAmount) {
          maxAmount = Number(amountDatas[j].innerText)
          maxIndex = j
        }
      }
      sortFather.insertBefore(sortDatas[maxIndex], sortDatas[i])
      sortDate.innerText = '日期'
      sortAmount.innerText = '價格↓'
    }
  }
  countAmount++
})

sortAmount.click()
