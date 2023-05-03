import mongoose from 'mongoose';

const ContestScehma=new mongoose.Schema({
    contest_no:{type:Number,required:true,unique:true},
    type:{type:String},
    schedule:{type:String},
    sponser:{type:String},
    prize:[{type:String}],
    rules:[{type:String}],
    usersRegistered:[{type:mongoose.Schema.Types.ObjectId}]
});

export const UpcomigContestModel=mongoose.model("Upcontests",ContestScehma);