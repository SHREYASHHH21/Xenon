import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave: false });

    return { accessToken, refreshToken };
    
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating Tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // form,json - req.body
  // url -
  // ******************************************

  // get user details from form (frontend)
  const { username, email, fullname, password } = req.body;
  console.log(req.body);

  // validate users info - not empty
  if (
    [fullname, username, email, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds required!!!");
  }

  // check if user already exist : username , email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists !!!");
  }

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log(coverImageLocalPath);

  // console.log(coverImageLocalPath)

  // upload them to cloudinary
  const avatarResponse = await uploadToCloudinary(avatarLocalPath);
  // console.log(avatarResponse);

  const coverImageResponse = await uploadToCloudinary(coverImageLocalPath);
  // console.log(coverImageResponse);

  if (!avatarResponse) {
    throw new ApiError(400, "Avatar image required !!!");
  }

  // create object to update database
  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    avatar: avatarResponse.url,
    coverImage: coverImageResponse?.url || "",
    email,
    password,
  });

  // remove password and refresh token feild from response
  const createdUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );

  // check for user creration
  if (!createdUser) {
    throw new ApiError(400, "something went wrong while registering user.");
  }

  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body -> user
  const { username, fullname, email,password } = req.body;

  // check username or email is filled
  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required !!!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found !!!");
  }

  // check password
  const passwordValidity = await user.isPasswordCorrect(password);

  if (!passwordValidity) {
    throw new ApiError(401, "Password Invalid !!!");
  }

  // generate access token and refresh token
  const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken(
    user._id
  );

  // send cookie
  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken "
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User loggedin Successfully !!!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(200,{},"User logged out !!!")
});

export { registerUser, loginUser, logoutUser };
