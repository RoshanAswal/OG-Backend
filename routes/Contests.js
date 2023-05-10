import express from "express";
import { ContestModel } from "../models/Contest.js";
import { UpcomigContestModel } from "../models/UpcomigContest.js";
import { verfiyToken } from "./Users.js";
import { instance } from "../server.js";
import crypto from 'crypto';
import { Types } from "mongoose";
import mongoose from "mongoose";

const Router=express.Router();
/* Fetching all the contests */

Router.get("/contest",async (req,res)=>{
    try{
        const response=await ContestModel.find({});
        res.json(response);
    }catch(err){
        console.log(err);
    }
});

Router.get("/loaderio-3e40de01819b50dfcfbf8b7d354c490d/",(req,res)=>{
    res.send("loaderio-3e40de01819b50dfcfbf8b7d354c490d");
});
Router.get("/upcomingcontest",async (req,res)=>{
    try{
        const response=await UpcomigContestModel.find({});
        res.json(response);
    }catch(err){
        console.log(err);
    }
});


/* Saving all the contests */

Router.post("/contest",async (req,res)=>{
    const {contest_no,type,winners,schedule,sponser,prize,rules}=req.body;
    const newContest=new ContestModel({contest_no,type,winners,schedule,sponser,prize,rules});
    newContest.save();
    res.send({message:"Contest saved"});
});

Router.post("/upcomingcontest",async (req,res)=>{
    const {contest_no,type,schedule,sponser,prize,rules,usersRegistered}=req.body;
    const newContest=new UpcomigContestModel({contest_no,type,schedule,sponser,prize,rules,usersRegistered});
    newContest.save();
    res.send({message:"UpContest saved"});
});

/* Regsiter user for contest */

Router.put("/contest/:contest_id",async (req,res)=>{
    const userId=req.body.userId;
    try{
        const contest=await UpcomigContestModel.findById(req.params.contest_id);
        contest.usersRegistered.push(userId);
        await contest.save();
        res.send({usersRegistered:contest.usersRegistered});
    }catch(er){
        console.log(er);
    }
});

/* Get the upcoming contest details */

Router.get("/contest/upcoming/:contest_id",async (req,res)=>{    
    try{
        const contest=await UpcomigContestModel.findById(req.params.contest_id);
        res.json(contest);
    }catch(err){
        console.log(err);
    }
});

/* Get the previous contest details */

Router.get("/contest/:contest_id",async (req,res)=>{    
    try{
        const contest=await ContestModel.findById(req.params.contest_id);
        res.json(contest);
    }catch(err){
        console.log(err);
    }
});

// Router.put("/previous/:contest_no",async (req,res)=>{
//     res.send({message:"user entered"});
// });


Router.get("/getPayKey",async (req,res)=>{
    res.json(process.env.Pay_Key_id);
})

export {Router as ContestRouter};