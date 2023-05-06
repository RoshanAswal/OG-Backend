import mongoose from 'mongoose';

const StructureSchema=new mongoose.Schema({
    question:{type:String},
    options:[{type:String}],
    answer:{type:String},
});

const QuestionSchema=new mongoose.Schema({
    contest_no:{type:Number},
    questions:[StructureSchema],
    ranks:{type:mongoose.Schema.Types.ObjectId},
})


export const QuestionModel=mongoose.model("questions",QuestionSchema);