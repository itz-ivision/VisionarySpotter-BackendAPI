import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import  {asyncHandlerUsingPromise} from '../utils/asyncHandler.js';
import {ApiErrorHandler} from '../utils/ApiErrorHandler.js';
import {ApiResponseHandler} from '../utils/ApiResponseHandler.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';



// generate Refresh and Access Tokens
const generateAccessAndRefreshTokens = async(userID) => {

    try {
        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiErrorHandler(500, "Something went wrong while generating access and refresh tokens")
    }

}

// User Controller to register
const registerUser = asyncHandlerUsingPromise(
    async(req, res) => {
        
        // get user details from req.body
        const { username, email, fullName, password } = req.body;

        // user input validation
        if (
            [username, email, fullName, password].some(
                (field) => field?.trim() === ""
            )
        ) {
            throw new ApiErrorHandler(400, "All the mandatory fields are required to register. ")
        }

        // check if user is already there
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existedUser) {
            throw new ApiErrorHandler(400, "User with username or email already exists.")
        }

        // check for user-avatar || cover-image
        const avatarLocalPath = req.files?.avatar[0]?.path
        if (!avatarLocalPath) {
            throw new ApiErrorHandler(400, "Avatar is required to register.")
        }

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        // upload to cloudinary || confirm for avatar
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new ApiErrorHandler(400, "Avatar is required to register.");
        }

        // create user object - create entry in mongoDB
        const createdUser = await User.create({
            username,
            email,
            fullName,
            avatar: avatar?.url || "",
            coverImage: coverImage?.url || "",
            password
        });

        // remove password and refreshToken from response
        const userFromDB = await User.findById(createdUser._id).select(
            "-password -refreshToken"
        )

        // check for user creation
        if (!userFromDB) {
            throw new ApiErrorHandler(500, "Something went wrong while registering for the user.")
        }

        // if user created, return response
        return res.status(201)
                        .json(
                            new ApiResponseHandler(
                                201,
                                userFromDB,
                                "User registered successfully."
                            )
                        )

    }
)



export { 
    registerUser,
}