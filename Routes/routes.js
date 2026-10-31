import express from "express";
import { 
  userModel, 
  feedback,
  Messages, 
  interests, 
  Arena, 
  Application,
  Announcement, 
  Timetable 
} from "../models/models.js";
import { validateLogin, validateUser } from "../models/validation.js";
import { authenticate, sanity } from "../middlewares/validations.js";
import upload, { imagekit } from "../multer.js";
import {
  giveEditPage,
  giveMainUser,
  giveUserFromLink,
  giveUserPage,
  giveUserProfile,
  interestGiver,
  issueData,
  markAsRead,
  obtainHistory,
  unreadFinder,
} from "../middlewares/giver.js";
import fs from "fs";
import { sendPushNotification } from "../Controllers/pushNotificationService.js";
import {AuthWalk} from "../Controllers/AuthWalkThrough.js";
import { getHomeFeed } from "../Controllers/feedController.js";
const Router = express.Router();
let errors = [];
const APP_URL = process.env.PRODUCTION_URL;
Router.get("/",authenticate, sanity, unreadFinder);
Router.get("/login", (req, res) => {
  res.render("login", { errors });
});

Router.get("/chats", authenticate, (req, res) => {
  res.render("chats", { user: req.user });
});

Router.get("/chats/contacts", authenticate, issueData);
Router.get("/chats/main", authenticate, giveMainUser).post(authenticate,giveMainUser).delete(authenticate);

Router.get("/chatspage", authenticate, (req, res) => {
  res.render("chatspage", { user: req.user });
});
Router.get("/interests", authenticate, (req, res) => {
  res.render("interests", { user: req.user });
});
Router.get("/home", authenticate, sanity, unreadFinder);
Router.post("/signup", upload.single("profilePic"), (req, res) => {
  validateUser(req, res);
});

Router.get("/signup", (req, res) => {
 res.render("index", { errors: [] });
});
Router.get("/userProfile", authenticate, giveUserProfile);
Router.get("/modern/:username",(req,res,next)=> {
  let data = {
          message: `Forbidden access. Please login first. User has set access to this blog, to: [MMUN-USERS-ONLY]`,
          redirecting: "login",
          errorCode: "403"
            };
            
  let {username} = req.params;
  let takeBack = `modern/${username}`
  ;AuthWalk(req, data,"default","giveUserFromLink",takeBack  ); next();},
   authenticate,
   giveUserFromLink);
Router.get('/editProfile',authenticate,giveEditPage);
Router.post("/user", authenticate, sanity, giveUserPage);
Router.get("/user",(req,res)=>{
  res.render("defaultStartup")})
Router.get("/logout", authenticate, (req, res) => {
  res.cookie("token", "Logged out User", {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.render("login", { errors: ["You Logged Out"] });
});
Router.post("/login", async (req, res) => {
  const Login = await validateLogin(req.body, res);
  if (Login.status == "success") {
    const { token, user } = Login;
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    if(!Login.user.takeBack){
      res.redirect("/home");
    }else{
      res.render("MMUNerror", {body: {
          message:  `Authentication Successful!`,
          redirecting: `${Login.user.takeBack}`,
          errorCode: "201"
             }})
    }
  } else {
    const { errors } = Login;
    res.render("login", { errors });
  }
});
Router.post("/sendInterest", authenticate, async (req, res) => { 
  const isExisting = await interests.findOne({
    from: req.user.username,
    to: req.body.foreignUser,
  });
  if (isExisting) {
    return res.json({ status: "already exists" });
  };
  const savedInterest = await interests.create({
    from: req.user.username,
    to: req.body.foreignUser,
    status: "pending",
  });
  if(savedInterest){
      const targetUserToken = await userModel.findOne({ username: req.body.foreignUser }, { fcmToken: 1 });
      if(targetUserToken && targetUserToken.fcmToken){
          sendPushNotification(
              "msg",
              targetUserToken.fcmToken, 
              "MMUN, new interest", 
              `${req.user.username} is interested in you!`, 
              `https://${APP_URL}/interests`
          );
      };
          
    }
});
Router.post("/getStatus", authenticate, async (req, res) => {
  const status = await interests.findOne({
    from: req.user.username,
    to: req.body.foreignUser,
  });
  if (!status) {
    return res.json({ state: false, valueState: status && status.status });
  }
  return res.json({ state: true, valueState: status && status.status });
});
Router.post("/markAsRead",authenticate, markAsRead);

Router.post("/interests", authenticate, interestGiver);

Router.post("/chat/path4",authenticate, obtainHistory);
export { Router };
Router.get("/blog/edit",authenticate, async(req,res)=>{
  const username = req.user.username;
  const userData = await userModel.findOne({username},{_id: 0, password: 0});
  res.json({data: userData})
});

Router.post("/homepage", authenticate, getHomeFeed);
Router.post("/others",   authenticate, getHomeFeed);
Router.post("/likeUserProfile", authenticate, async (req, res) => {
  const mainUser = req.user.username;
  const { viewedUser, likeMode } = req.body;

  let liked = await userModel.findOne({ username: viewedUser });
  console.log(liked.likedArray,"___________initial_____liked___array___list____")
  if (liked.likedArray.includes(mainUser) && likeMode == false) {
    let newLiked = liked.likedArray.filter((user)=>{user != null})
    liked.likedArray = newLiked
    liked.likesCount = liked.likesCount - 1;
    console.log(newLiked,"-----updated-------------list-----------------------------",liked.likedArray)
    await liked.save()
    res.json({status: "success"});
  } else {
    if(likeMode){
      try {
      let record = await userModel.findOneAndUpdate(
        { username: viewedUser },
        {
          $push: { likedArray: mainUser },
          $inc: { likesCount: 1 },
        },
        { new: true },
      );
      sendPushNotification(
        "msg",
        record?.fcmToken,
        `MMUN `,
        `${mainUser} liked your profile.`,
        `https://${APP_URL}/modern/${mainUser}`,
      );
      res.json({
        status: "success"
      });
    } catch (error) {
      console.log(error);
    }
    }
  }
});
Router.get("/everyone/:username", authenticate, async (req, res) => {
  try {
    const searchString = req.params.username;

    let data = await userModel.aggregate([
      // 1. Filter matches first
      { $match: { username: { $regex: searchString, $options: "i" } } },

      // 2. Add a relevance score
      {
        $addFields: {
          relevance: {
            $cond: {
              // Check if username starts with the search string (case-insensitive)
              if: { 
                $regexMatch: { 
                  input: "$username", 
                  regex: new RegExp(`^${searchString}`, "i") 
                } 
              },
              then: 2, // Higher score for "Starts With"
              else: 1  // Lower score for "Contains"
            }
          }
        }
      },

      // 3. Sort by relevance (highest first), then alphabetically
      { $sort: { relevance: -1, username: 1 } },

      // 4. Limit the final result set
      { $limit: 30 },

      // 5. Hide sensitive fields
      { 
        $project: { 
          password: 0, 
          whoViewed: 0, 
          createdAt: 0, 
          phone: 0, 
          _id: 0,
          relevance: 0 
        } 
      }
    ]);

    if (data.length === 0) {
      return res.json({ data: [], message: "No users found", status: "not found" });
    };

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});
Router.get("/notics",authenticate,(req,res)=>{
  res.render("notics", {user: req.user})
})
Router.get("/tmt", authenticate, (req, res) => {
  res.render("tmt", { user: req.user });
});
Router.get("/jobs",authenticate,(req,res)=>{
  res.render("jobs", {user: req.user})
})
Router.get("/posts",authenticate,(req,res)=>{
  res.render("posts",{user: req.user})
});





Router.post("/arenas/:arenaId/join", authenticate, async (req, res) => {
  try {
    await Arena.findByIdAndUpdate(req.params.arenaId, { $addToSet: { attendees: req.user.username } });
    res.json({ message: "Joined" });
  } catch (err) {
    console.error("Join Arena Error:", err);
    res.status(500).json({ error: "Could not join arena" });
  }
});

Router.post("/arenas/:arenaId/inspire", authenticate, async (req, res) => {
  try {
    await Arena.findByIdAndUpdate(req.params.arenaId, { $addToSet: { inspiredBy: req.user.username } });
    res.json({ message: "Inspired" });
  } catch (err) {
    console.error("Inspire Arena Error:", err);
    res.status(500).json({ error: "Could not inspire" });
  }
});

Router.delete("/arenas/:arenaId/inspire", authenticate, async (req, res) => {
  try {
    await Arena.findByIdAndUpdate(req.params.arenaId, { $pull: { inspiredBy: req.user.username } });
    res.json({ message: "Uninspired" });
  } catch (err) {
    console.error("Uninspire Arena Error:", err);
    res.status(500).json({ error: "Could not un-inspire" });
  }
});

Router.get("/arenas/search", authenticate, async (req, res) => {
  try {
    const { q = "" } = req.query;
    const arenas = await Arena.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { desc: { $regex: q, $options: "i" } }
      ]
    }).limit(20);
    res.json(arenas);
  } catch (err) {
    console.error("Arena Search Error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// --- ANNOUNCEMENTS ROUTES ---

Router.post("/announcements", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { title, body, endsAt } = req.body;
    let imageUrl = "";
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.filename,
        folder: "/announcements",
        useUniqueFileName: true,
      });
      imageUrl = response.url;
      fs.unlinkSync(req.file.path);
    }
    const ann = await Announcement.create({
      title,
      body,
      endsAt: endsAt ? new Date(endsAt) : null,
      author: req.user.username,
      image: imageUrl
    });
    res.status(201).json({ message: "Announcement posted", announcement: ann });
  } catch (err) {
    console.error("Post Announcement Error:", err);
    res.status(500).json({ error: "Could not post announcement", details: err.message });
  }
});

Router.post("/announcements/:announcementId/keep", authenticate, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.announcementId, { $addToSet: { keptBy: req.user.username } });
    res.json({ message: "Kept" });
  } catch (err) {
    console.error("Keep Announcement Error:", err);
    res.status(500).json({ error: "Could not keep announcement" });
  }
});

Router.delete("/announcements/:announcementId/keep", authenticate, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.announcementId, { $pull: { keptBy: req.user.username } });
    res.json({ message: "Unkepped" });
  } catch (err) {
    console.error("Unkeep Announcement Error:", err);
    res.status(500).json({ error: "Could not unkeep announcement" });
  }
});

// --- TIMETABLES ROUTES ---

Router.get("/timetables", authenticate, async (req, res) => {
  try {
    const timetables = await Timetable.find().populate("author", "username profileLink").sort({ createdAt: -1 });
    res.json(timetables);
  } catch (err) {
    console.error("Get Timetables Error:", err);
    res.status(500).json({ error: "Could not fetch timetables" });
  }
});

Router.post("/timetables", authenticate, async (req, res) => {
  try {
    const { title, description, runsTill } = req.body;
    const timetable = await Timetable.create({
      title,
      description,
      runsTill: runsTill ? new Date(runsTill) : null,
      author: req.user.username
    });
    res.status(201).json({ message: "Timetable posted", timetable });
  } catch (err) {
    console.error("Post Timetable Error:", err);
    res.status(500).json({ error: "Could not post timetable" });
  }
});

Router.post("/subscribe/announcer", async (req, res) => {
  // Logic for subscribing to an announcer
  res.json({ message: "Subscribed" });
});

Router.post("/follow/:targetUserId", async (req, res) => {
  res.json({ message: "Now following" });
});

Router.post("/feedback/page/vote",authenticate, async (req,res)=>{
  const { vote, page } = req.body.voteData;
  const statusOfVote = await feedback.find({ username: req.user.username, page });
  if (!statusOfVote.length){
    feedback.create({
    page,
    vote,
    username: req.user.username.trim()
  }).catch(err => {
    console.error("Error saving feedback:", err);
    return res.json({ response: "Could not save feedback" });
  });
  return res.json({response: "<p style='color: green'>You feedback has been recorded</p>"});
  } else {
    return res.json({response: "<h3 style='color: red'>You had sent your opinion</h3>"});
  }
});
Router.get("/contacts", (req, res) => {
  res.render("contacts", { user: req.user });
});

Router.get("/sysInfo", async (req, res) => {
  const appState = process.env.APP_STATE || "App is currently in development";
  res.json([{ appState }]);
});

const VALID_ROLES = [
  "design",
  "features",
  "stakeholders",
  "marketing",
  "developer",
  "feedback",
];

const VALID_YEARS = [
  "First Year", "Second Year", "Third Year",
  "Fourth Year", "Fifth Year", "Postgraduate", "Graduated",
];

const VALID_GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

function validationError(res, message, field = null) {
  return res.status(422).json({
    success: false,
    message,
    ...(field && { field }),
  });
}

function cleanStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 1 — Upload signature image → ImageKit
// POST /upload-signature
// Auth: required (authenticate middleware)
// Body: multipart/form-data with field "image"
// Returns: { success, url }
// ─────────────────────────────────────────────────────────────────────────────
Router.post(
  "/upload-signature",
  authenticate,
  upload.single("image"),   // reuse your existing multer upload instance
  async (req, res) => {
    // No file
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No signature file provided" });
    }

    const allowedMimes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "Invalid file type — only PNG, JPEG or WEBP allowed",
      });
    }

    // 2 MB max
    if (req.file.size > 2 * 1024 * 1024) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .json({ success: false, message: "Signature file too large (max 2 MB)" });
    }

    try {
      const result = await imagekit.upload({
        file: fs.readFileSync(req.file.path),
        fileName: `sig_${req.user.username}_${Date.now()}.png`,
        folder: "/application-signatures",
        useUniqueFileName: true,
      });

      fs.unlinkSync(req.file.path);

      return res.json({ success: true, url: result.url });
    } catch (err) {
      // Clean up temp file even on ImageKit failure
      try { fs.unlinkSync(req.file.path); } catch (_) {}

      console.error("[upload-signature] ImageKit error:", err);
      return res.status(500).json({
        success: false,
        message: "Signature upload failed — please try again",
      });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 2 — Submit application
// POST /apply
// Auth: required
// Body: JSON (see payload below)
// Returns: { success, message }
// ─────────────────────────────────────────────────────────────────────────────
Router.post("/apply", authenticate, async (req, res) => {
  try {
    const u = req.user; // set by authenticate middleware

    const {
      firstName, lastName, email, phone, dob, gender,
      institution, programme, acYear,
      role, roleSpecialization,
      skills, skillLevel, hoursPerWeek, portfolio, motivation, availableDays,
      signatureUrl, legalName,
    } = req.body;

    // ── VALIDATE ──────────────────────────────────────────────────────────────

    // Personal
    if (!cleanStr(firstName))
      return validationError(res, "First name is required", "firstName");
    if (cleanStr(firstName).length > 60)
      return validationError(res, "First name is too long", "firstName");

    if (!cleanStr(lastName))
      return validationError(res, "Last name is required", "lastName");
    if (cleanStr(lastName).length > 60)
      return validationError(res, "Last name is too long", "lastName");

    if (!cleanStr(email) || !EMAIL_RE.test(cleanStr(email)))
      return validationError(res, "A valid email address is required", "email");

    if (!cleanStr(phone) || cleanStr(phone).length < 7)
      return validationError(res, "A valid phone number is required", "phone");

    if (!dob || !DATE_RE.test(dob))
      return validationError(res, "Date of birth is required (YYYY-MM-DD)", "dob");

    // Validate dob is a real past date and applicant is at least 15
    const dobDate = new Date(dob);
    const now = new Date();
    const ageMs = now - dobDate;
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    if (isNaN(dobDate.getTime()) || dobDate >= now)
      return validationError(res, "Date of birth must be in the past", "dob");
    if (ageYears < 15)
      return validationError(res, "Applicant must be at least 15 years old", "dob");

    if (!VALID_GENDERS.includes(gender))
      return validationError(res, "Invalid gender value", "gender");

    // Academic
    if (!cleanStr(institution))
      return validationError(res, "Institution is required", "institution");
    if (!cleanStr(programme))
      return validationError(res, "Programme is required", "programme");
    if (!VALID_YEARS.includes(acYear))
      return validationError(res, "Invalid academic year", "acYear");

    // Role
    if (!VALID_ROLES.includes(role))
      return validationError(res, "Invalid role selected", "role");

    // Skills
    if (!Array.isArray(skills) || skills.length === 0)
      return validationError(res, "At least one skill is required", "skills");
    if (skills.length > 20)
      return validationError(res, "Maximum 20 skills allowed", "skills");
    const cleanedSkills = skills.map(s => cleanStr(s)).filter(s => s.length > 0);
    if (cleanedSkills.length === 0)
      return validationError(res, "Skills cannot be empty strings", "skills");

    if (!cleanStr(skillLevel))
      return validationError(res, "Skill level is required", "skillLevel");
    if (!cleanStr(hoursPerWeek))
      return validationError(res, "Hours per week is required", "hoursPerWeek");

    if (!cleanStr(motivation) || cleanStr(motivation).length < 20)
      return validationError(
        res,
        "Motivation must be at least 20 characters",
        "motivation"
      );

    // Signature
    if (!cleanStr(signatureUrl) || !signatureUrl.startsWith("https://"))
      return validationError(
        res,
        "A valid signature URL is required — please upload your signature",
        "signatureUrl"
      );

    if (!cleanStr(legalName))
      return validationError(res, "Legal name is required", "legalName");

    // ── CHECK DUPLICATE APPLICATION ───────────────────────────────────────────
    const existing = await Application.findOne({ username: u.username, role });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `You have already applied for the ${role} role. Contact the team if you need to update your application.`,
      });
    }

    // ── SAVE ──────────────────────────────────────────────────────────────────
    const application = new Application({
      username: u.username,

      firstName: cleanStr(firstName),
      lastName:  cleanStr(lastName),
      email:     cleanStr(email).toLowerCase(),
      phone:     cleanStr(phone),
      dob,
      gender,

      institution: cleanStr(institution),
      programme:   cleanStr(programme),
      acYear,

      role,
      roleSpecialization: cleanStr(roleSpecialization) || null,

      skills: cleanedSkills,
      skillLevel:   cleanStr(skillLevel),
      hoursPerWeek: cleanStr(hoursPerWeek),
      portfolio:    cleanStr(portfolio),
      motivation:   cleanStr(motivation),
      availableDays: Array.isArray(availableDays)
        ? availableDays.filter(d => typeof d === "string")
        : [],

      signatureUrl: cleanStr(signatureUrl),
      legalName:    cleanStr(legalName),
    });

    await application.save();

    // ── OPTIONAL: Notify founder (e.g. push notification via FCM) ─────────────
    // You can trigger your existing FCM logic here, e.g.:
    // await sendPushToFounder({ title: "New Application", body: `${u.username} applied for ${role}` });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application.username,
    });

  } catch (err) {
    // Duplicate key (race condition on unique index)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this role.",
      });
    }

    console.error("[apply] Error:", err);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred — your draft is saved, please try again.",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 3 — Get all applications (founder/admin only)
// GET /applications
// Auth: required + Role check
// ─────────────────────────────────────────────────────────────────────────────
Router.get("/applications", authenticate, async (req, res) => {
  try {
    // Only allow the founder or admin (adjust role name to match your schema)
    if (req.user.Role !== "Founder" && req.user.Role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { role, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role && VALID_ROLES.includes(role)) filter.role = role;
    if (status && ["pending","reviewing","accepted","rejected"].includes(status))
      filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Application.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      applications,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    console.error("[applications] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 4 — Update application status (founder/admin)
// PATCH /applications/:id/status
// Body: { status: "reviewing" | "accepted" | "rejected" }
// ─────────────────────────────────────────────────────────────────────────────
Router.patch("/applications/:id/status", authenticate, async (req, res) => {
  try {
    if (req.user.Role !== "Founder" && req.user.Role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status } = req.body;
    const validStatuses = ["pending", "reviewing", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(422).json({ success: false, message: "Invalid status value" });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    return res.json({ success: true, application: app });
  } catch (err) {
    console.error("[applications status] Error:", err);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
});
Router.get("/specialists/applications", (req,res,next)=>{
  
   let data = {
          message: `Please login to MMUN to access this service, via the Login page about to open.`,
          redirecting: "login",
          errorCode: "403"
            };
  let takeBack = 'specialists/applications';
  AuthWalk(req,data,"default","applications",takeBack);
  next();
},authenticate,  async (req, res, next) => {
  try {
    const existing = await Application.findOne({ username: req.user.username });
    if (existing) {
      return res.render("job-applications", { role: existing.role, status: {existing: true} });
    }
    res.render("job-applications", {status: {existing: false}});
  } catch (err) {
    console.error("[specialists/applications] Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }});


Router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await userModel.findOne({ username: req.user.username }).select("-password -fcmToken -whoViewed");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("[profile] Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});











































