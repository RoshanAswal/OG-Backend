import express from 'express';
import { UserModel } from '../models/User.js';
import { UserNameModel } from '../models/UserNames.js';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
import mailgen from 'mailgen';
import CryptoJS from 'crypto-js';

const router=express.Router();
dotenv.config();

// For the otp sent to e-mail

router.post("/getOtp",async (req,res)=>{
    const email=req.body.email;
    const otp=req.body.OTP;
    const name=req.body.username;

    let transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.email,
            pass:process.env.email_key
        }
    });


    let mailGen=new mailgen({
        theme:"default",
        product:{
            name:"Only Geeks",
            link:"https://mailgen.js/"
        }
    });

    let response={
        body:{
            name:name,
            intro:"Email verification",
            table:{
                data:{description:`Your otp is ${otp}`}
            }
        }
    }

    let mail=mailGen.generate(response);

    let message={
        from:process.env.email,
        to:email,
        subject:"OnlyGeeks verification",
        html:mail
    }

    try{
        await transporter.sendMail(message);
    }catch(err){
        console.log(err);
    }
})


router.post("/register",async (req,res)=>{
    const {
        username,password,email,caption,
        gender,country,socialURL,favAnime,
        favGame,favCharacter,bestRank,
        contestAttempted,contestWon
    }=req.body;
    const Password=CryptoJS.AES.decrypt(password,process.env.ENCRYPT_KEY);
    const Email=CryptoJS.AES.decrypt(email,process.env.ENCRYPT_KEY);
    
    const Pass=Password.toString(CryptoJS.enc.Utf8);
    const Mail=Email.toString(CryptoJS.enc.Utf8);
    
    const user=await UserModel.findOne({username});
    const mail=await UserModel.findOne({email:Mail});
    const uniqueName=await UserNameModel.findOne({username})

    if(user){
        return res.json({message:"username"});
    }
    if(mail){
        return res.json({message:"email"});
    }
    if(uniqueName){
        return res.json({message:"notUnique"})
    }

    const hashedPass=await bcrypt.hash(Pass,10);
    const newuser=new UserModel({
        username,password:hashedPass,email:Mail,caption,
        gender,country,socialURL,favAnime,
        favGame,favCharacter,bestRank,
        contestAttempted,contestWon
    });
    const newUser=new UserNameModel({username});
    await newUser.save();
    await newuser.save();
    res.json({message:"user registered"});
});

router.post("/login",async (req,res)=>{
    const {username,password}=req.body;
    const decrypter=CryptoJS.AES.decrypt(password,process.env.ENCRYPT_KEY);
    const Pass = decrypter.toString(CryptoJS.enc.Utf8);
    
    const user=await UserModel.findOne({username});
    if(!user){
        return res.json({message:"user not found"});
    }
    const hashedPass=await bcrypt.compare(Pass,user.password);
    
    if(!hashedPass){
        return res.json({message:"Password or username does not match"});
    }else{
        const token=jwt.sign({id:user._id},process.env.SECRET);
        res.json({token,userId:user._id});
    }
});

router.post("/forgotPassword",async (req,res)=>{
    const email=req.body.email;
    const mail=await UserModel.findOne({email});
    
    if(!mail){
        return res.json("none");
    }
    res.json("found");
});

router.post("/setNewPassword",async (req,res)=>{
    const password=req.body.password;
    const email=req.body.email;
    try{
        const DecryptPass=CryptoJS.AES.decrypt(password,process.env.ENCRYPT_KEY);
        const DecryptMail=CryptoJS.AES.decrypt(email,process.env.ENCRYPT_KEY);
        const Pass = DecryptPass.toString(CryptoJS.enc.Utf8);
        const Mail = DecryptMail.toString(CryptoJS.enc.Utf8);
        const hashedPass=await bcrypt.hash(Pass,10);
        const user=await UserModel.findOne({email:Mail});
        user.password=hashedPass;    
        await user.save();
        res.json("changed");
    }catch(er){
        console.log(er);
    }

});

// To fetch the rankings of users in community page

router.get("/ranking",async (req,res)=>{
    try{
        const users=await UserModel.find({});
        users.sort((a,b)=>{
            if(a.contestWon===b.contestWon){
                if(a.bestRank<b.bestRank)return -1;
                else return 1;
            }else{
                return a.contestWon-b.contestWon;
            }
        });
        res.json(users.reverse());
    }catch(err){
        console.log(err);
    }
});

export {router as UserRouter};

export const verfiyToken=(req,res,next)=>{
    const token=req.body.headers; 
    if(token){
      jwt.verify(token,process.env.SECRET,(err)=>{
        if(err)return res.sendStatus(403);
        next();  
      });
    }else{
        window.localStorage.removeItem("userId");
        res.redirect('https://www.only-geeks.com/register');
    }
}