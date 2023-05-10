import express from 'express';
import { UserModel } from '../models/User.js';
import cloudinaryConfig from '../utils/cloudinary.js';
import { verfiyToken } from './Users.js';
const router=express.Router();

/* Get the profile of specific user */

router.get("/profile/:userId",async (req,res)=>{
    const userId=req.params.userId;
    try{
      if(userId){
        const user=await UserModel.findById(userId);
        if(user)
          res.send(user);
        else 
          res.send("not found");
      }
    }catch(err){
        console.log(err);
    }
});


/* Editing the profile of specific user */

router.post("/profile/:userId/edit",verfiyToken,async (req,res)=>{
    const {caption,gender,country,socialURL,favAnime,favGame,favCharacter,img}=req.body;
    const userId=req.params.userId;
    const user = await UserModel.findById(userId);
    try{
      if (user) {
        if(img){
          if(user.img){
            const imgId=user.img.public_id;
            imgId && await cloudinaryConfig.uploader.destroy(imgId);
          }
          const result=await cloudinaryConfig.uploader.upload(img,{folder:"UserDP",width:80,height:80,crop:"fill"});
          user.img={
            public_id:result.public_id,
            url:result.secure_url
          }
          await user.save();
        }

        user.caption = caption;
        user.gender = gender;
        user.country = country;
        user.socialURL = socialURL;
        user.favAnime = favAnime;
        user.favGame = favGame;
        user.favCharacter = favCharacter;

  
        await user.save();
        res.json("edited");
      }
    }catch(err){
      console.log(err);
    }
});

router.put(`/profile/:userId/delete`,verfiyToken,async (req,res)=>{
  try{
    const user = await UserModel.findById(req.params.userId);
    if(user.img){
      const imgId=user.img.public_id;
      imgId && await cloudinaryConfig.uploader.destroy(imgId);
    }
    await UserModel.findByIdAndDelete(req.params.userId);
    res.json("deleted");
  }catch(err){
    console.log(err);
  }
})

export {router as ProfileRouter}
