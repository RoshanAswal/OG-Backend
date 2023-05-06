import mongoose from 'mongoose';

const PostSchema=new mongoose.Schema({
    author:{type:mongoose.Schema.Types.ObjectId},
    authorName:{type:String},
    img:{type:String},
    title:{type:String,required:true},
    postData:{type:String,required:true},
    likes:{type:Number,default:0},
    dateOfPost:{type:String},
    depth:{type:Number,default:0},
    userLiked:[{type:String}],
    comments:[
        {
            user:{type:mongoose.Schema.Types.ObjectId},
            authorName:{type:String},
            img:{type:String},
            comment:{type:String},
            likes:{type:Number,default:0},
            depth:{type:Number,default:1},
            userLiked:[{type:String}],
            replies:[{
                user:{type:mongoose.Schema.Types.ObjectId},
                authorName:{type:String},
                img:{type:String},
                comment:{type:String},
                likes:{type:Number,default:0},
                userLiked:[{type:String}],
            }]
        }
    ]
});

export const PostModel=mongoose.model("post",PostSchema);