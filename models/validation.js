import { error, profile } from "console";
import { findUser } from "./saveFunctions.js";
import { validate } from "./saveFunctions.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "./models.js";
import fs from "fs";
import { imagekit } from "../multer.js";

let errors = [];
const validateUser = async (req, res) => {
  let {
    usernameS,
    passwordS,
    passwordCS,
    phoneS,
    Role,
    course,
    Year,
    Campus,
    birthYear,
    birthMonth,
    birthDay,
    gender,
  } = req.body;

  let errors = [];
  birthDay = Number(birthDay);
  birthMonth = Number(birthMonth);
  birthYear = Number(birthYear);
  let Institution = Campus;
  let courseName = "";
  let yearPrecise = "";

  if(Role == "Department Worker"){
    courseName = course[0];
    yearPrecise = Year;
  } else if(Role == "Lecturer"){
    courseName = course[1];
    yearPrecise = Year;
  } else {
    courseName = course[0];
    yearPrecise = Year[0];
  }

  const saltRounds = Number(process.env.saltRounds) || 10;
  let username = usernameS?.trim() || "";
  let password = passwordS;
  let phone = phoneS?.trim() || "";

  if (!username) errors.push("You must provide a username");
  else if (!username.match(/^[a-zA-Z0-9_-]+$/)) errors.push("Username can only contain letters, numbers, - or _");
  else if (username.length < 4) errors.push("Username must be at least 4 characters");
  else if (username.length > 12) errors.push("Username must not exceed 12 characters");

  if (!phone) errors.push("You must enter phone number");
  else if (!phone.match(/^[0-9]+$/)) errors.push("Invalid phone number");
  else if (phone.length !== 9 && phone.length !== 10) errors.push("Phone must have 10 digits");

  if (!password) errors.push("You must provide a password");
  else if (password.length > 12) errors.push("Password cannot exceed 12 characters");

  if (!passwordCS) errors.push("You must confirm your password");
  else if (password !== passwordCS) errors.push("Passwords do not match");

  if (errors.length) return res.render("index", { errors });

  const reqFile = req.file;
  let profileLink = "/mediafiles/defaultProfile.png";

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.render("index", { errors: ["Username already taken 😌"] });
    }
      if (reqFile) {
    try {
      const buffer = await fs.promises.readFile(reqFile.path);

      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: reqFile.filename,
        folder: "/uploads/profile",
      });

      profileLink = uploadRes.url;
      fs.unlinkSync(reqFile.path);

    } catch (uploadErr) {
      fs.unlinkSync(reqFile.path);
      return res.render("index", { errors: ["Profile photo upload failed. Please try again."] });
    }
  }
    await userModel.create({
      username,
      password: hashedPassword,
      phone,
      profileLink,
      course: courseName,
      year: yearPrecise,
      birthDay,
      birthMonth,
      birthYear,
      updatesIndexes: ['0','0','0','1'],
      Institution,
      Role,
      gender,
    });

    res.render("login", { errors: ["Your Account has been created"] });

  } catch (err) {
    console.error("DB ERROR — code:", err.code, "message:", err.message);
    if(err.code == 11000){
      errors = ["Username already taken 😌"];
    } else {
      errors = ["Something went wrong. Please Try again"];
    }
    res.render("index", { errors });
  }
};

const validateLogin = async (userData) => {
  errors = [];
  let { usernameL, takeBack, passwordL, fcm_token: fcmToken} = userData;
  let username = usernameL;
  let password = passwordL;
  let fcmData = {};
  if (fcmToken && fcmToken.trim() !== "") {
    fcmData = {
      token: fcmToken,
      isvalid: true};
  } else {
    console.warn("No valid FCM token provided.");
  }
  if (!username) errors.push("Please provide a username");
  else if (username.length < 3) errors.push("Invalid username (<3 char)");
  else if (username.length > 12) errors.push("Invalid username (>12 char)");

  if (!password) errors.push("Please provide a password");

  if (errors.length) {
    return { status: "failed", errors };
  } else {
    const findResults = await findUser(username, password, fcmData?.token);
    if (findResults.status === "success") {
      let user = findResults.user;
      user.takeBack = takeBack;
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          profileLink: user.profileLink,
          fcmToken: findResults.fcmToken || null,
          Role: findResults.Role
        },
        process.env.JWT_SECRET,
        { expiresIn: "300m" },
      );
      return { status: "success", token, user };
    } else {
      return {
        status: "failed",
        errors: ["401 Unauthorized", "invalid username or password"],
      };
    }
  }
};

export { validateUser, validateLogin, errors };
