import { userModel, interests } from "./models.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const salt = Number(process.env.saltRounds) || 10;

const validate = async (username, password, phone, reqFile) => {
  try {
    let isExisting = await userModel.findOne({ username: username });

    if (isExisting) {
      return {
        statusCode: 409,
        success: false,
        isExisting: true,
        message: "Username is already taken.",
      };
    }

    const saveInfo = async (profileLink) => {
      const hashedPassword = await bcrypt.hash(password, salt);
      await userModel.create({
        username,
        password: hashedPassword,
        phone,
        profileLink,
      });
    };

    let profileLink = "/mediafiles/defaultProfile.png";
    if (reqFile) {
      profileLink = reqFile.path;
    }

    await saveInfo(profileLink);

    await interests.create({
      from: username,
      to: "Admin Control",
      status: "interested",
    });

    return {
      statusCode: 200,
      success: true,
      isExisting: false,
      message: "Your Account has been created",
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        statusCode: 409,
        success: false,
        isExisting: true,
        message: "User already exists",
      };
    } else {
      console.error("Validation error:", error);
      return { success: false, error: ["Validation Error"] };
    }
  }
};

const findUser = async (username, password, fcmToken) => {
  let userFcmToken = null;
  let userRole = "Student";
  const User = await userModel.findOne({ username: username });
  if (User) {
    if(fcmToken){
      User.fcmToken = fcmToken;
      userFcmToken = fcmToken;
      } else if (User.fcmToken){
        userFcmToken = User.fcmToken;
      }
    User.lastSeen = new Date(Date.now());
    try {
      await User.save();
    } catch (error) {
      console.error(error, "couldn't save the item to the database")
    }
    userRole = User?.Role; 
    const updates = User?.updatesIndexes || "";
    const correctPassword = await bcrypt.compare(password, User.password);
    if (correctPassword) {
     await userModel.updateOne({username},{$set: {updatedAt: new Date()}});
      return {
        statusCode: 200,
        status: "success",
        message: "Valid credentials",
        fcmToken: userFcmToken,
        Role: userRole,
        updates,
        user: {
          id: User._id,
          username: User.username,
          phone: User.phone,
          profileLink: User.profileLink,
        },
      };
    } else {
      return {
        statusCode: 401,
        status: "failed",
        message: "Invalid credentials",
      };
    }
  } else {
    return {
      statusCode: 401,
      status: "failed",
      message: "Invalid user",
    };
  }
};

export { validate, findUser };
