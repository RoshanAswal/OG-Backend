import mongoose from "mongoose";

const RankingSchema=new mongoose.Schema({
    contest_no:{type:Number},
    rank:[{
        userId:{type:mongoose.Schema.Types.ObjectId},
        img:{type:String},
        username:{type:String},
        correctAnswers:{type:Number},
        timeTaken:{type:Number},
        attempted:[{type:Number}]
    }]
});

export const RankingModel=mongoose.model("ranks",RankingSchema);