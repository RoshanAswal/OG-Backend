import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { UserRouter } from './src/routes/Users.js';
import { ContestRouter } from './src/routes/Contests.js';
import { ProfileRouter } from './src/routes/Profile.js';
import { QuestionRouter } from './src/routes/Question.js';
import { PostRouter } from './src/routes/Posts.js';
import { PaymentRouter } from './src/routes/Payment.js';
import cors from 'cors';
import dotenv from "dotenv";

const app=express();
dotenv.config();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/auth",UserRouter);
app.use("/",ContestRouter);
app.use("/",ProfileRouter);
app.use("/",QuestionRouter);
app.use("/",PostRouter);
app.use("/",PaymentRouter);

mongoose.connect(process.env.mongoConn,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

app.listen(3001,()=>{
    console.log("Running");
})
module.exports=app;