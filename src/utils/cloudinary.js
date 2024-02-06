import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file uploaded successfully!!!")
        // console.log(response.url)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log(error)
    }
}

// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

export default uploadToCloudinary; 