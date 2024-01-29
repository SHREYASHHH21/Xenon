import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler(async(req,res)=>{
  // remove password and refresh token feild from response
  // check for user creration
  // return res

  // form,json - req.body
  // url -
  // ******************************************

  // get user details from form (frontend)
  const { username, email, fullname, password } = req.body;

  // validate users info - not empty
  if (
    [fullname, username, email, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds required!!!");
  }

  // check if user already exist : username , email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists !!!");
  }

  // check for users image and avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image not found !!!");
  }

  // upload them to cloudinary
  const avatarResponse = await uploadToCloudinary(avatarLocalPath);
  console.log(avatarResponse);

  const coverImageResponse = await uploadToCloudinary(coverImageLocalPath);
  console.log(coverImageResponse);

  if (!avatarResponse) {
    throw new ApiError(400, "Avatar image required !!!");
  }

  // create object to update database
  const user = await User.create({
    fullname,
    username:username.toLowerCase(),
    avatar:avatarResponse.url,
    coverImage:coverImageResponse.url || "",
    email,
    password
  })

  const createdUser = await User.findById(user._id).select(" -password -refreshToken ")

  if(!createdUser){
    throw new ApiError(400,"something went wrong while registering user.")
  }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registered")
  )

})

export {registerUser};

