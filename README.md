AC week 5 實作 會員系統與記帳系統
===
 
**功能**
--
1. **會員系統**

   * 本地註冊
   * 第三方註冊
   * 登入
   * 登出
   
2. **管理系統，可以管理一套屬於你的收出支狀況**

   * 總覽所有支出
   * 篩選(時間、類別)
   * 排序(按時間、按價格)
   * 新增支出
   * 編輯支出
   * 刪除支出


建置環境
--
bcryptjs <br>
body-parser<br>
connect-flash<br>
dotenv<br>
express<br>
express-handlebars<br>
express-session<br>
method-override<br>
mongoose<br>
passport<br>
passport-facebook<br>
passport-local<br><br>




安裝流程
--
1.打開terminal並輸入git clone指令，將專案檔案下載到本機電腦。<br>
　　`git clone https://github.com/whynotwilson/expense-tracker.git`<br>
  
2.進入資料夾 expense-tracker-master<br>
　　`cd expense-tracker-master`<br>
  
3.在 Terminal 輸入 npm install 指令，安裝 npm 套件</font><br>
　　`npm install`<br>
  
4.執行專案<br>
　　`npm run dev</font>`<br>
  
5.到瀏覽器輸入網址 http://localhost:3000/<br>
