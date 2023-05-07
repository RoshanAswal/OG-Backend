import express, { response } from 'express';
import { QuestionModel } from '../models/Questions.js';
import { RankingModel } from '../models/Ranking.js';
import { UpcomigContestModel } from '../models/UpcomigContest.js';
import {ContestModel} from '../models/Contest.js';
import { UserModel } from '../models/User.js';
import { verfiyToken } from './Users.js';
import moment from 'moment-timezone';
const Router=express.Router();

Router.get('/api/currentTime',async (req,res)=>{
    // const moment=moment();
    // const utcTime = '2022-05-11T12:00:00Z';
    // const istTime = moment.utc(utcTime).tz('Asia/Kolkata').format('ddd hh:mm:ss aa');
    
    // res.send(istTime); 
    res.send("hey");
    
})

/* Save the questions for contest */
Router.post("/questionForUsers",async (req,res)=>{
    const response=req.body;
    const newQuestions=new QuestionModel(response);
    await newQuestions.save();
    res.send({message:"Questions saved"});
});

/* Before starting contest make a ranking document in which data during the contest will be stored */

Router.post("/ranksForUsers",async (req,res)=>{
    const response=req.body;
    const newRanks=new RankingModel(response);
    await newRanks.save();
    res.send({message:"ranking set"});
});

/* Get the questions for the ongoing contest */

Router.get("/questionForUsers/:contest_no",async (req,res)=>{
    try{
        const response=await QuestionModel.findOne({contest_no:req.params.contest_no});
        res.json(response);
    }catch(err){
        console.log(err);
    }
})

/* submitting answers of users */

Router.put("/contest/:contest_no/submission",verfiyToken,async (req,res)=>{
    const userId=req.body.userId;
    const contest_no=req.params.contest_no;
    const ind=req.body.index;
    const totalTime=req.body.totalTime;
    const correct=req.body.correct;
    try{
        // checking the user inside ranking model to update his score

        const response=await RankingModel.findOne({
            rank:{$elemMatch:{userId:userId}}  
        },{"rank.$":1});
        
        if(response){
            let count=response.rank[0].correctAnswers;
            if(correct)count++;
            // do not increment score if already attempted

            if(response.rank[0].attempted.includes(ind)){
                return res.json("already done");
            }else{
                await RankingModel.updateOne({contest_no:contest_no,"rank.userId":userId},
                {$push:{"rank.$.attempted":ind}});
            }
            
            // increment the score and push the attempted index of question

            await RankingModel.updateOne({contest_no:contest_no, "rank.userId":userId},
            {$set: {"rank.$.correctAnswers": count,"rank.$.timeTaken":totalTime}});

            res.json("changed");
        }else{
            res.json("not found");

            // if first question of the user then save a new user in ranking model 

            const item=await RankingModel.findOne({contest_no:contest_no});
            item.rank.push({
                userId:userId,
                timeTaken:totalTime,
                correctAnswers:1,
                attempted:[0]           
            });
            await item.save();
        }
    }catch(err){
        console.log(err);
    }
});


// After contest Routes


// This api set the ranking of users after the contest note: have to call it manually by admin
// there is no automatic api call for this api


Router.put("/:contest_no/SetRanking",async (req,res)=>{
    const contest_no=req.params.contest_no;
    try{
        // Sorting the ranks of users
        const response=await RankingModel.findOne({contest_no});
        const arr=response.rank;
        arr.sort((a,b)=>{
            if(a.correctAnswers===b.correctAnswers){
                if(a.timeTaken>b.timeTaken)return -1;
                else return 1;
            }else{
                return a.correctAnswers-b.correctAnswers;
            }
        });

        // creating new contest data for previous contests section with winners
        // let rankArr=[];
        // rankArr = arr.map(obj => obj);
        arr.reverse();
        let userIds=arr.map(obj => obj.userId);

        const lastContest=await UpcomigContestModel.findOne({contest_no});

        const newContest=new ContestModel({
            contest_no,type:"done",winners:userIds,
            schedule:lastContest.schedule,
            sponser:lastContest.sponser,
            prize:lastContest.prize,
            rules:lastContest.rules
        });

        newContest.save();
        await UpcomigContestModel.deleteOne({contest_no});
        // increment the contestwon by user
        let userId=arr[0].userId;
        const user=await UserModel.findById(userId);
        user.contestWon+=1;
        user.save();

        for(let i=0;i<arr.length;i++){
            const user=await UserModel.findById(arr[i].userId);
            if(arr[i].correctAnswers>user.bestRank)
                await UserModel.updateOne({ _id: { $in: arr[i].userId } }, { $set: { bestRank: arr[i].correctAnswers } })
        }

        await RankingModel.updateOne({contest_no}, {$set: {"rank": arr}});
        res.json("sorted");
    }catch(err){
        console.log(err);
    }
});

// On reaching the thanking page set the timing of finshing the contest (will be called auto)

Router.put("/:contest_no/setTime",verfiyToken,async (req,res)=>{
    const totalTime=req.body.totalTime;
    const userId=req.body.userId;
    const contest_no=req.params.contest_no;
    try{
        await RankingModel.updateOne({contest_no:contest_no, "rank.userId":userId}, {$set: {"rank.$.timeTaken": totalTime}});
        
        const user=await UserModel.findById(userId);
        if(!user.bestTime || user.bestTime<totalTime)
            await UserModel.updateOne({userId},{$set:{bestTime:totalTime}}); // updating the best time of user till now

        await UserModel.updateOne({userId},{$set:{contestAttempted:user.contestAttempted+1,img:user.img.url,username:user.username}}); // incrementing the contest attempted
        res.json(totalTime);   
    }catch(err){
        console.log(err);
    }
});

Router.get("/:contest_no/winners",async (req,res)=>{
    const contest_no=req.params.contest_no;
    try{
        const response=await RankingModel.find({contest_no});
        if(response[0]?.rank)
            res.json(response[0].rank);
        else
            res.json("");
    }catch(err){
        console.log(err);
    }
});

export {Router as QuestionRouter};