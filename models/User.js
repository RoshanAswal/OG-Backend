import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    caption:{type:String},
    gender:{type:String},
    country:{type:String},
    socialURL:{type:String},
    favAnime:{type:String},
    favGame:{type:String},
    favCharacter:{type:String},
    bestRank:{type:Number,default:0},
    contestAttempted:{type:Number,default:0},
    contestWon:{type:Number,default:0},
    attemptedContest:[{type:Number}],
    img:{
        public_id:{type:String},
        url:{type:String},
    }
});

export const UserModel=mongoose.model("Users",UserSchema);