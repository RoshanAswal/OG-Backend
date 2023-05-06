import express from 'express';
import { instance } from '../server.js';
import { verfiyToken } from './Users.js';
import { UpcomigContestModel } from '../models/UpcomigContest.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
const Router=express.Router();

import Stripe from 'stripe';

const stripe = new Stripe(process.env.REACT_APP_SECRET_KEY);

// Router.post("/payment",async (req,res)=>{
//     let status,error;
//     const { token,amount}=req.body;
//     try{
//         await stripe.charges.create({
//             source:token.id,
//             amount,
//             currency:'INR'
//         });
//         status="success";
//     }catch(err){
//         console.log(err);
//         status="Failure"
//     }
//     res.json({error,status});
// })

Router.put("/payments",verfiyToken,async (req,res)=>{
    try{
        const options={
            amount:Number(req.body.amt),
            currency:"INR",
        };
        const order=await instance.orders.create(options);
        return res.json(order);
    }catch(err){
        console.log(err);
    }
});

// const saveUser=async (user_id,contest_id)=>{
//     const user_ID=new mongoose.Types.ObjectId(user_id);
//     const contest_ID=new mongoose.Types.ObjectId(contest_id);
//     try{
//         const contest=await UpcomigContestModel.findById(contest_ID);
//         contest.usersRegistered.push(user_ID);
//         await contest.save();
//         res.json("success");
//     }catch(err){
//         console.log(err);
//     }
// }

Router.post("/payments/verification",verfiyToken,async (req,res)=>{
    // saveUser(req.body.user_id,req.body.contest_id);

    const user_ID=new mongoose.Types.ObjectId(req.body.user_id);
    const contest_ID=new mongoose.Types.ObjectId(req.body.contest_id);
    try{
        const contest=await UpcomigContestModel.findById(contest_ID);
        contest.usersRegistered.push(user_ID);
        await contest.save();
        res.json("success");
    }catch(err){
        console.log(err);
    }
    // try{
    //     const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

    //     let body=razorpay_order_id + "|" + razorpay_payment_id;
        

    //         var expectedSignature = crypto.createHmac('sha256', process.env.Pay_Key_secret)
    //                                         .update(body.toString())
    //                                         .digest('hex');
    //         // console.log("sig received " ,razorpay_signature);
    //         // console.log("sig generated " ,expectedSignature);
    //         const user_id=req.query.user_id;
    //         const contest_id=req.query.contest_id;

    //         if(expectedSignature === razorpay_signature){
    //             saveUser(user_id,contest_id);
    //             res.redirect('http://localhost:3000/PaymentSuccess');
    //         }else{
    //             res.redirect("http://localhost:3000/PaymentFailed");
    //         }
    // }catch(err){
    //     console.log(err);
    // }
});

export {Router as PaymentRouter}