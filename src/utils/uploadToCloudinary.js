// Configure and setup CLOUDINARY to upload and store files
import { v2 as cloudiNary} from 'cloudinary';
import fs from 'fs';

          
cloudiNary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {return null}
        // upload the file on Cloudinary
        const response =await cloudiNary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // after file uploads successfully
        // console.log("File has been uploaded successfully..", response.url);
        // console.log(response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // removes the locally uploaded file in temp folder after the upload operation got faild.
        return null
    }
}


export { uploadOnCloudinary }