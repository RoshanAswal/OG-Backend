import mongoose from 'mongoose';

const ContestScehma=new mongoose.Schema({
    contest_no:{type:Number,required:true,unique:true},
    type:{type:String},
    winners:[{type:mongoose.Schema.Types.ObjectId}],
    schedule:{type:String},
    sponser:{type:String},
    prize:[{type:String}],
    rules:[{type:String}]
});


export const ContestModel=mongoose.model("contests",ContestScehma);