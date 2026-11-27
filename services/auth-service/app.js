const express=require("express");const cors=require("cors");const bcrypt=require("bcrypt");const jwt=require("jsonwebtoken");const pool=require("./db");const {publishEvent}=require("./events");
const app=express();app.use(cors());app.use(express.json());
app.get("/health",async(_q,s)=>{try{await pool.query("SELECT 1");s.json({service:"auth-service",status:"ok"});}catch{s.status(503).json({status:"database unavailable"});}});
app.post("/auth/register",async(q,s)=>{try{
 const {username,email,password}=q.body;
 if(!username||!email||!password||password.length<8)return s.status(400).json({message:"Укажите имя, email и пароль минимум 8 символов"});
 const hash=await bcrypt.hash(password,10);
 const r=await pool.query("INSERT INTO auth_users(username,email,password_hash) VALUES($1,$2,$3) RETURNING id,username,email,created_at",[username.trim(),email.trim().toLowerCase(),hash]);
 const user=r.rows[0];
 try{await publishEvent("user.registered",{userId:user.id,username:user.username,email:user.email,registeredAt:user.created_at});}
 catch(eventError){console.error("UserRegistered publish failed:",eventError.message);return s.status(503).json({message:"Аккаунт создан, но событие создания профиля не отправлено",user,eventPublished:false});}
 s.status(201).json({message:"Регистрация успешна",user,eventPublished:true});
 }catch(e){if(e.code==="23505")return s.status(409).json({message:"Email или имя уже заняты"});console.error(e);s.status(500).json({message:"Ошибка сервера"});}});
app.post("/auth/login",async(q,s)=>{try{
 const r=await pool.query("SELECT id,username,email,password_hash FROM auth_users WHERE email=$1",[String(q.body.email||"").trim().toLowerCase()]);
 const u=r.rows[0];if(!u||!(await bcrypt.compare(q.body.password||"",u.password_hash)))return s.status(401).json({message:"Неверный email или пароль"});
 if(!process.env.JWT_SECRET)return s.status(500).json({message:"JWT_SECRET не настроен"});
 const token=jwt.sign({id:u.id,email:u.email},process.env.JWT_SECRET,{expiresIn:"7d"});s.json({token,user:{id:u.id,username:u.username,email:u.email}});
 }catch(e){console.error(e);s.status(500).json({message:"Ошибка сервера"});}});
app.listen(Number(process.env.PORT||5001),()=>console.log("AuthService started"));
