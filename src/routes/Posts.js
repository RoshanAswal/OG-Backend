import express from 'express';
import { PostModel } from '../models/Post.js';
import { UserModel } from '../models/User.js';
import { verfiyToken } from './Users.js';

const router=express.Router();

router.get("/posts",async (req,res)=>{
    try{
        const posts=await PostModel.find({});
        res.json(posts);
    }catch(err){
        console.log(err);
    }
});
router.get("/posts/filtered/:author/:title",async (req,res)=>{
    let username=req.params.author;
    let Title=req.params.title;
    username=username.substring(0,username.length-1);
    Title=Title.substring(0,Title.length-1);
    try{
        let posts=null;
        if(username!==""){
            posts=await PostModel.find({authorName:{$regex:username,$options:"i"}});
        }else if(Title!==""){
            posts=await PostModel.find({title:{$regex:Title,$options:"i"}});
        }
        res.json(posts);
    }catch(err){
        console.log(err);
    }
});

router.post("/posts/newPost",verfiyToken,async (req,res)=>{
    const {userId,title,postData}=req.body;
    const current = new Date();
    const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
    try{
        const user=await UserModel.findById(userId);
        const post=new PostModel({author:userId,authorName:user.username,img:user.img.url,title,postData,dateOfPost:date})
        await post.save();
        res.json({msg:"Post created"});
    }catch(err){
        console.log(err);
    }
});

router.put("/posts/deletePost",verfiyToken,async (req,res)=>{
    const postId=req.body.postId;
    try{
        await PostModel.findByIdAndDelete(postId);
        return res.json("deleted");
    }catch(err){
        console.log(err);
    }
});

router.put("/posts/addComment",verfiyToken,async (req,res)=>{
    const {postId,userId,comment,headers}=req.body;
    try{
        const post=await PostModel.findById(postId);
        const user=await UserModel.findById(userId);
        const newObj={
            user:userId,
            authorName:user.username,
            img:user.img.url,
            comment:comment,
        };
        post.comments.push(newObj);
        await post.save();
        res.send(post);
    }catch(err){
        console.log(err);
    }
});

router.put("/posts/addReply",verfiyToken,async (req,res)=>{
    const {postId,userId,reply,ind}=req.body;
    try{
        const post=await PostModel.findById(postId);
        const user=await UserModel.findById(userId);
        const newObj={
            user:userId,
            authorName:user.username,
            img:user.img.url,
            comment:reply,
        };
        (post.comments)[ind].replies.push(newObj);
        await post.save();
        res.send(post);
    }catch(err){
        console.log(err);
    }
});

router.get("/posts/:postId",async (req,res)=>{
    try{
        const response=await PostModel.findById(req.params.postId);
        res.send(response);
    }catch(err){
        console.log(err);
    }
});

router.put("/posts/deleteComment",verfiyToken,async (req,res)=>{
    try{
        const response=await PostModel.findById(req.body.postId);
        response.comments.splice(req.body.ind,1);
        await response.save();
        res.send(response);
    }catch(err){
        console.log(err);
    }
});

router.put("/posts/deleteReply",verfiyToken,async (req,res)=>{
    const ind1=req.body.ind1;
    const ind2=req.body.ind2;
    try{
        const response=await PostModel.findById(req.body.postId);
        response.comments[ind1].replies.splice(ind2,1);
        await response.save();
        res.send(response);
    }catch(err){
        console.log(err);
    }
});

router.put("/posts/addLike",verfiyToken,async (req,res)=>{
    const {postId,ind1,ind2,type,userId}=req.body;
    try{
        const response=await PostModel.findById(postId);
        if(type==="post"){
            if(response.userLiked.includes(userId)){
                response.likes-=1;
                response.userLiked = response.userLiked.filter((e) => e !== userId)
            }else{
                response.likes+=1;
                response.userLiked.push(userId);
            }
        }else if(type==="comment"){
            if(response.comments[ind1].userLiked.includes(userId)){
                response.comments[ind1].likes-=1;
                response.comments[ind1].userLiked=response.comments[ind1].userLiked.filter((e)=> e !== userId);
            }else {
                response.comments[ind1].likes+=1;
                response.comments[ind1].userLiked.push(userId);
            }
        }else{
            if(response.comments[ind1].replies[ind2].userLiked.includes(userId)){
                response.comments[ind1].replies[ind2].likes-=1;
                response.comments[ind1].replies[ind2].userLiked=response.comments[ind1].replies[ind2].userLiked.filter((e)=> e !== userId);
            }else{
                response.comments[ind1].replies[ind2].likes+=1;
                response.comments[ind1].replies[ind2].userLiked.push(userId);
            }
        }
        await response.save();
        res.send(response);
    }catch(err){
        console.log(err);
    }
});
export {router as PostRouter}