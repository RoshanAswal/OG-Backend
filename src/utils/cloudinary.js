import dotenv from 'dotenv';
dotenv.config();
import cloudinary from 'cloudinary';

const cloudinaryConfig=cloudinary.v2;

cloudinaryConfig.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.api_key,
    api_secret:process.env.api_secret
});

export default cloudinaryConfig;