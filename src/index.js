require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const { Pool } = require('pg')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret:'xhyper',resave:false,saveUninitialized:true }))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
})

async function initDB(){
await pool.query(`
CREATE TABLE IF NOT EXISTS users(
id SERIAL PRIMARY KEY,
phone TEXT UNIQUE,
approved BOOLEAN DEFAULT true
);
`)
}
initDB()

function auth(req,res,next){
if(req.session.logged) return next()
res.redirect('/login')
}

app.get('/',auth,(req,res)=>{
res.send(`<html><body style="background:#0f0f0f;color:#00ff88;font-family:sans-serif">
<h1>XHYPER MD V15 Phase 1</h1>
<p>Foundation Running Successfully</p>
<a href="/logout">Logout</a>
</body></html>`)
})

app.get('/login',(req,res)=>{
res.send(`<form method="POST">
<input name="user" placeholder="Username"/>
<input name="pass" type="password" placeholder="Password"/>
<button>Login</button></form>`)
})

app.post('/login',(req,res)=>{
if(req.body.user===process.env.ADMIN_USERNAME &&
req.body.pass===process.env.ADMIN_PASSWORD){
req.session.logged=true
return res.redirect('/')
}
res.send("Login Failed")
})

app.get('/logout',(req,res)=>{
req.session.destroy(()=>res.redirect('/login'))
})

app.get('/health',(req,res)=>res.send("OK"))

app.listen(process.env.PORT || 3000,()=>{
console.log("XHYPER MD V15 Phase 1 Running")
})
