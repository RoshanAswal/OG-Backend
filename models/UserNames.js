import mongoose from "mongoose";

const UserName=new mongoose.Schema({
    username:{type:String}
})

export const UserNameModel=mongoose.model("UniqueNames",UserName);