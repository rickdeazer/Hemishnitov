/*|||$=$|||*/
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import connectionDb from "./Database/database.js";
import mongoose from "mongoose";
import { sendPushNotification } from "./Controllers/pushNotificationService.js";
import {
  interests,
  Messages,
  Posts,
  userModel,
  comments,
  followers,
  settings,
  postComments,
  Group,
  groupMessages,
  CallHistory,
} from "./models/models.js";
import { Router } from "./Routes/routes.js";
import {
  authenticate,
  authenticateOptional,
} from "./middlewares/validations.js";
import upload, { imagekit } from "./multer.js";
import { Console } from "console";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT;
export const APP_URL = process.env.PRODUCTION_URL;
app.use(cors());
app.use("/", Router);
app.set("x-powered-by", false);
app.set("env", process.env.NODE_ENV);
app.use(express.static("public"));
app.use("/", express.static("html"));
app.use("/mediafiles", express.static("mediafiles"));
app.use("/uploads", express.static("uploads"));
app.set("view engine", "ejs");
connectionDb();

const normalizeUsername = (value = "") => String(value).trim();
const getUserRoom = (username = "") =>
  `user:${normalizeUsername(username).toLowerCase()}`;
const getPrivateRoom = (userA = "", userB = "") =>
  [normalizeUsername(userA), normalizeUsername(userB)]
    .filter(Boolean)
    .map((name) => name.toLowerCase())
    .sort((a, b) => a.localeCompare(b))
    .join("--");

let settingsState = "";
let settingsStateF = async () => {
  let data = await settings.find();
  if (data.length > 0) {
    settingsState = true;
  } else {
    settingsState = false;
  }
};
settingsStateF();
setTimeout(() => {
  if (settingsState) {
    return;
  } else {
    settings.create({
      totalOnline: 0,
      appState: true,
    });
  }
}, 1000);

io.on("connection", async (socket) => {

  socket.on("register", (username) => {
    if (typeof username === "string" && username.trim()) {
      socket.username = normalizeUsername(username);
      socket.join(getUserRoom(socket.username));
    } else {
      console.warn("Invalid username registration attempt");
    }
  });

  socket.on("message", async (data) => {

    if (!data?.from || !data?.to) {
      socket.emit("error", { message: "Missing from or to field" });
      console.warn("Invalid message - missing from/to:", data);
      return;
    }

    const from = normalizeUsername(data.from);
    const to = normalizeUsername(data.to);
    let newDate = new Date();
    const time =
      data.time ||
      `${newDate.getHours().toString().padStart(2, "0")}:${newDate.getMinutes().toString().padStart(2, "0")}`;
    const msgType = data.msgType || "text";
    const text = data.text || "";

    const messageData = {
      from,
      to,
      text,
      type: msgType,
      time,
    };

    try {
      const savedMessage = await Messages.create(messageData);

      const response = {
        ...messageData,
        userid: savedMessage._id.toString(),
      };

      io.to(getUserRoom(from))
        .to(getUserRoom(to))
        .emit("serverReply", response);

      // Send notification to receiver
      try {
        const receiver = await userModel.findOne({ username: to });
        if (receiver?.fcmToken) {
          await sendPushNotification(
            "msg",
            receiver.fcmToken,
            "New Message",
            `${from}: ${text}`,
            `https://${APP_URL}/chats?user=${from}`,
            true,
          );
        }
      } catch (notifErr) {
        console.warn("Failed to send message notification:", notifErr.message);
      }

    } catch (err) {
      console.error("Failed to save message:", err.message, err.stack);
      socket.emit("error", {
        message: "Failed to send message",
        error: err.message,
      });
    }
  });

  socket.on("group-message", async (msg) => {
    if (!msg.groupId || !msg.from || !msg.username || !msg.text?.trim()) {
      socket.emit("error", { message: "Missing required fields" });
      return;
    }

    const groupId = msg.groupId.trim();

    // ────────────────────────────────────────────────
    // Use msg.from directly — it should be the ObjectId string
    // No need to query userModel again
    // ────────────────────────────────────────────────
    const fromId = msg.from.trim();

    // Optional: safety check (recommended)
    if (!mongoose.isValidObjectId(fromId)) {
      socket.emit("error", { message: "Invalid sender ID" });
      return;
    }

    let messageType = msg.type || "text";

    // form detection
    let isForm = false;
    try {
      const jsonStart = msg.text.indexOf("{");
      if (jsonStart !== -1) {
        const parsed = JSON.parse(msg.text.slice(jsonStart));
        if (parsed.title && Object.keys(parsed).length > 1) {
          isForm = true;
          messageType = "form";
        }
      }
    } catch (err) {
      // silent fail — not a form
    }

    if (msg.type === "image") {
      messageType = "image";
    }

    const messageData = {
      groupId,
      from: fromId, // ← correct field: from (ObjectId)
      username: msg.username.trim(),
      text: msg.text.trim(),
      type: messageType,
      time: new Date(),
      replyTo: msg.replyTo || null,
    };

    try {
      const savedMessage = await groupMessages.create(messageData);

      // Increment replyCount on parent message if this is a reply
      if (msg.replyTo && mongoose.isValidObjectId(msg.replyTo)) {
        await groupMessages
          .updateOne(
            {
              _id: msg.replyTo, // ← correct field is _id, not userId
              groupId, // extra safety
            },
            { $inc: { replyCount: 1 } },
          )
          .catch((err) => {
            console.warn("Could not increment replyCount:", err.message);
          });
      }

      // Prepare what to broadcast
      const broadcastMsg = {
        ...messageData,
        _id: savedMessage._id.toString(), // ← use _id (not userId)
        time: savedMessage.time.toISOString(),
        replyCount: savedMessage.replyCount || 0,
      };

      io.to(groupId).emit("group-message", broadcastMsg);

    } catch (err) {
      console.error("Failed to save group message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("get-group-messages", async ({ groupId, limit = 50 }) => {
    if (!groupId) {
      socket.emit("error", { message: "Missing groupId" });
      return;
    }

    try {
      const messages = await groupMessages
        .find({ groupId: groupId.trim() })
        .sort({ time: -1 })
        .limit(limit)
        .lean();
      socket.emit("group-messages", messages.reverse());
    } catch (err) {
      console.error("Error loading group messages:", err);
      socket.emit("error", { message: "Could not load messages" });
    }
  });

  socket.on("join-room", (room) => {
    const normalizedRoom = String(room || "").trim();
    if (!normalizedRoom) return;

    socket.join(normalizedRoom);
    socket.to(normalizedRoom).emit("user-joined", socket.id);
  });

socket.on("video-offer", async ({ room, offer, to, from, mediaType }) => {
  const normalizedRoom =
    String(room || "").trim() || getPrivateRoom(from, to);
 
  if (!normalizedRoom) return;

  // Create call history record for outgoing call
  try {
    await CallHistory.create({
      caller: normalizeUsername(from),
      receiver: normalizeUsername(to),
      callType: mediaType === "video" ? "video" : "voice",
      direction: "outgoing",
      status: "missed",
      room: normalizedRoom,
    });
  } catch (err) {
    console.error("Failed to create call history record:", err);
  }

  const callUrl = `https://${APP_URL}/chats?user=${normalizeUsername(from)}&room=${normalizedRoom}&mediaType=${mediaType || 'audio'}&action=join-call`;

  // Emit the offer to the other user
  socket.to(normalizedRoom).emit("video-offer", {
    offer,
    from,
    to,
    room: normalizedRoom,
    mediaType: mediaType || "audio",
  });

  // Send push notification
  try {
    const receiver = await userModel.findOne({
      username: normalizeUsername(to)
    });

    if (receiver?.fcmToken) {
      await sendPushNotification(
        "call",
        receiver.fcmToken,
        `Incoming ${mediaType === "video" ? "Video" : "Voice"} Call`,
        `${normalizeUsername(from)} is calling...`,
        callUrl,           // ← This is now correct
        true
      );
    }
  } catch (notifErr) {
    console.warn("Failed to send call notification:", notifErr.message);
  }
});

  socket.on("video-answer", async ({ room, answer, mediaType }) => {
    const normalizedRoom = String(room || "").trim();
    if (!normalizedRoom) return;

    // Update call history record when call is answered
    try {
      await CallHistory.findOneAndUpdate(
        { room: normalizedRoom, status: "missed" },
        { status: "answered" },
      );
    } catch (err) {
      console.error("Failed to update call history:", err);
    }

    socket.to(normalizedRoom).emit("video-answer", {
      answer,
      from: socket.id,
      mediaType: mediaType || "audio",
    });
  });

  socket.on("ice-candidate", ({ room, candidate }) => {
    const normalizedRoom = String(room || "").trim();
    if (!normalizedRoom) return;

    socket
      .to(normalizedRoom)
      .emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("call-declined", async ({ room }) => {
    const normalizedRoom = String(room || "").trim();
    if (!normalizedRoom) return;

    // Update call history record when call is declined
    try {
      await CallHistory.findOneAndUpdate(
        { room: normalizedRoom, status: "missed" },
        { status: "declined" },
      );
    } catch (err) {
      console.error("Failed to update call history:", err);
    }

    socket.to(normalizedRoom).emit("call-declined");
  });

  socket.on("user-left", async ({ room }) => {
    const normalizedRoom = String(room || "").trim();
    if (!normalizedRoom) return;

    // Update call history record when call ends
    try {
      await CallHistory.findOneAndUpdate(
        { room: normalizedRoom, status: "answered" },
        { status: "ended", endTime: new Date() },
      );
    } catch (err) {
      console.error("Failed to update call history:", err);
    }

    socket.to(normalizedRoom).emit("user-left");
  });

  socket.on("disconnect", async () => {
    if (socket.username) {
    
    }

    await settings.updateOne(
      {},
      { $inc: { totalOnline: -1 } },
      { upsert: true },
    );
  });
});

app.post(
  "/profile/update/pics",
  upload.any(),
  authenticate,
  async (req, res) => {
    try {
      let username = req.user.username?.trim();
      if (!username) {
        return res
          .status(401)
          .json({ message: "Auth Error. Account flagged." });
      }
      const user = await userModel.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let gallery = user.gallaryLinks
        ? Array.isArray(user.gallaryLinks)
          ? [...user.gallaryLinks]
          : user.gallaryLinks.split(",").filter(Boolean)
        : [];

      const updates = {};

      for (const file of req.files || []) {
        const fileBuffer = fs.readFileSync(file.path);

        let folder = "/profile";
        if (file.fieldname.startsWith("gallery")) {
          folder = "/gallery";
        }

        let url;

        try {
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: file.filename,
            folder: folder,
            useUniqueFileName: true,
          });

          url = response.url;
        } finally {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }

        if (file.fieldname.startsWith("prof")) {
          updates.profileLink = url;
        } else if (file.fieldname.startsWith("gallery_")) {
          const idx = parseInt(file.fieldname.split("_")[1], 10);
          if (!isNaN(idx)) {
            while (gallery.length <= idx) gallery.push("");
            gallery[idx] = url;
          } else {
            gallery.push(url);
          }
        } else {
          gallery.push(url);
        }
      }

      if (gallery.length > 0) {
        updates.gallaryLinks = gallery.join(",");
      }

      if (Object.keys(updates).length === 0) {
        return res.json({ message: "No files were uploaded" });
      }

      const updatedUser = await userModel.findOneAndUpdate(
        { username },
        { $set: updates },
        { new: true },
      );

      res.json({
        message: "Profile pictures updated successfully",
        profileLink: updatedUser.profileLink,
        gallaryLinks: updatedUser.gallaryLinks,
      });
    } catch (err) {
      console.error("Profile pics upload error:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },
);

app.post("/profile/update/text", authenticate, async (req, res) => {
  try {
    const username = req.user.username;

    const allowedFields = [
      // basic profile
      "blogTitle",
      "slogan",
      "course",
      "year",
      "tribe",
      "relationship",
      "locality",
      "religion",
      "skinColor",
      "eyeColor",

      // preferences / personal
      "favoriteColor",
      "favoriteFood",
      "bestFriend",
      "favoriteMovie",
      "favoriteBook",
      "favoriteMusic",
      "hobbies",

      // about sections
      "aboutMe",
      "aboutYou",

      // social handles & links
      "instagramHandle",
      "instagramLink",
      "whatsappHandle",
      "whatsappNumber",
      "facebookHandle",
      "facebookLink",
      "whatsappDefaultMsg",

      // privacy flags (add all missing ones here)
      "tribePublic",
      "relationshipPublic",
      "localityPublic",
      "religionPublic",
      "skinColorPublic",
      "eyeColorPublic",
      "favoriteColorPublic",
      "favoriteFoodPublic",
      "bestFriendPublic",
      "favoriteMoviePublic",
      "favoriteBookPublic",
      "favoriteMusicPublic",
      "hobbiesPublic",
      "instagramPublic",
      "whatsappPublic",
      "facebookPublic",
    ];

    const body = req.body;
    const updateData = {};

    allowedFields.forEach((field) => {
      if (body[field] === undefined || body[field] === null) {
        return;
      }

      if (field.endsWith("Public")) {
        updateData[field] =
          body[field] === "true" || body[field] === true || body[field] === 1;
      } else {
        let value = String(body[field]);

        value = value.replace(
          /[\x00-\x1F\x7F-\x9F\u200B-\u200F\u202A-\u202E\u2066-\u206F\uFEFF]/g,
          "",
        );

        value = value.replace(/\\/g, "\\\\");

        value = value.trim();

        const generousMax = 2500;
        if (value.length > generousMax) {
          value = value.slice(0, generousMax);
        }

        updateData[field] = value;
      }
    });
    let date = new Date(Date.now());
    updateData.lastSeen = date;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedDoc = await userModel.findOneAndUpdate(
      { username },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      updatedFields: updateData,
    });
  } catch (error) {
    console.error("Profile text update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update",
      error: error.message,
    });
  }
});
app.get("/checkUsername", async (req, res) => {
  console.log("hello")
  try {
    const { username } = req.query;

    if (
      !username ||
      username.length < 4 ||
      username.length > 12 ||
      !/^[a-zA-Z0-9_-]+$/.test(username)
    ) {
      return res.json({ available: false });
    }

    const existing = await userModel.findOne(
      { username: { $regex: `^${username}$`, $options: "i" } },
      { _id: 1 },
    );

    res.json({ available: !existing });
  } catch (error) {
    console.error("Username check error:", error);
    res.status(500).json({ available: false });
  }
});
app.post("/interests/accept", authenticate, async (req, res) => {
  const to = req.user.username.trim();
  let { from } = req.body;
  from = from.trim();
  try {
      const doc = await interests.findOneAndUpdate(
        { to, from, status: "pending" },
        { $set: { status: "interested" } },
      );
      const token = await userModel.findOne({username: from});
      if(doc && token?.fcmToken){ 
        sendPushNotification(
        "msg",
        token.fcmToken, 
        `Hey ${from}.`, 
        `${to} is also interested in you`, 
        `https://${APP_URL}/interests`
    );
      
    }
    res.json({ status: true });
  } catch (err) {
    res.json({ status: false, error: err });
  }
});

app.post("/interests/decline", authenticate, async (req, res) => {
  const to = req.user.username.trim();
  let { from } = req.body;
  from = from.trim();
  try {
    const declineDoc = await interests.findOneAndUpdate(
      { to, from, status: "pending" },
      { $set: { status: "declined" } },
    );
    const token = await userModel.findOne({username: from});
    if(declineDoc && token?.fcmToken){ 
        sendPushNotification(
        "msg",
        token.fcmToken,
        "MMUN", 
        `${to} declined your interest.`, 
        `https://${APP_URL}/interests`
    );
      }
    res.json({ status: true });
  } catch (err) {
    res.json({ status: false, error: err });
  }
});

app.post("/post/comments", authenticate, async (req, res) => {
  const from = req.user.username?.trim();
  let { to, comment } = req.body;
  if (!from || !to || !comment) {
    return res.status(400).json({ message: "All fields are required" });
  }
  to = to.trim();
  const time = `${new Date().getHours()}:${new Date().getMinutes()}`;
  const userprofileFCM = await userModel.findOne({username: to });
  const token1 = userprofileFCM?.fcmToken;
  if (token1){
    sendPushNotification(
          "msg",
          token1, 
          `${from}, Commented on your profile`, 
          `${comment}`, 
          `https://${APP_URL}/modern/${from}`
      );
  }
  const newComment = await comments.create({
    from,
    to,
    comment,
    likes: 0,
    time,
  });

  const commentdata = await userModel.findOneAndUpdate(
    { username: to },
    { $inc: { comments: 1 } },
  );
  return res.json({ success: true, comment: newComment });
});

app.post("/obtainComments", async (req, res) => {
  const { currentCommentUser } = req.body;
  if (!currentCommentUser)
    return res.status(400).json({ message: "User is required" });

  const userComments = await comments
    .find({ to: currentCommentUser })
    .sort({ _id: 1 });

  res.json({ success: true, comments: userComments });
});

app.post("/toggleLike", authenticate, async (req, res) => {
  const { commentId } = req.body;
  const username = req.user.username?.trim();

  if (!commentId || !username) {
    return res.status(400).json({ error: "Missing commentId or username" });
  }
  const comment = await comments.findById(commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  const from = comment.from;
  const to = comment.to;
  const message = comment.comment;
  
  const likesCount = (comment.likedBy.length);
  let additionalMsg  = '';
    if (likesCount && likesCount == 1){
      additionalMsg = ' and 1 other ';
    } else if (likesCount && likesCount > 1){
      additionalMsg = ` and ${likesCount} others `}
  let validateToSend = false;
  if (comment.likedBy.includes(username)) {
    comment.likedBy = comment.likedBy.filter((u) => u !== username);
    comment.likes -= 1;
  } else {
    validateToSend = true;
    comment.likedBy.push(username);
    comment.likes += 1;
  }

  await comment.save();
  if(validateToSend){
    const profileLiker = await userModel.findOne({username: from });
  const token4 = profileLiker?.fcmToken;
  if (token4){
    sendPushNotification(
          "msg",
          token4, 
          `${username} ${additionalMsg}liked your comment on ${to}'s profile` , 
          `${message}`, 
          `https://${APP_URL}/modern/${username}`,
          true
      );
  }
  }
  res.json({
    likes: comment.likes,
    liked: comment.likedBy.includes(username),
  });
});


app.post("/getFollowStatus", authenticate, async (req, res) => {
  let { to } = req.body;
  to = to.trim();
  const from = req.user.username.trim();
  const followDoc = await followers.findOne({ from, to });
  const isFollowing = !!followDoc;
  const followersCount = await followers.countDocuments({ to });

  res.json({ isFollowing, followersCount });
});

app.get("/followersCount", authenticate, async (req, res) => {
  const to = req.user.username.trim();
  const followersCount = await followers.countDocuments({ to });
  res.json({ followersCount });
});

app.post("/toggleFollow", async (req, res) => {
  let { from, to } = req.body;
  from = from.trim();
  to = to.trim();
  try {
    const existing = await followers.aggregate([
      { $match: { from, to } },
      {
        $lookup: {
          from: "users",
          localField: "to",
          foreignField: "username",
          as: "user",
        },
      },
      {
        $addFields: {
          fcmToken: "$user.fcmToken",
        },
      },
      {
        $project: {
          fcmToken: 1,
          from: 1,
          to: 1,
        },
      },
    ]);
    const targetUserToken =
      existing && existing.length > 0 ? existing[0].fcmToken[0] : null;
    if (existing && existing.length > 0) {
      await followers.deleteOne({ from, to });
      sendPushNotification(
        "msg",
        targetUserToken,
        `MMUN`,
        `${from} is no longer your disciple`,
        `https://${APP_URL}/modern/${from}`,
      );
    } else {
      await followers.create({ from, to });
      const userToken = await userModel.findOne(
        { username: to },
        { fcmToken: 1 },
      );
      sendPushNotification(
        "msg",
        userToken.fcmToken,
        `MMUN `,
        `${from} has started following you.`,
        `https://${APP_URL}/modern/${from}`,
      );
    }

    const followersCount = await followers.countDocuments({ to });
    res.json({ followersCount });
  } catch (err) {
    console.error(err);
    res.json({ error: "Server error" });
  }
});

app.post("/viewProfile", authenticate, async (req, res) => {
  const mainUser = req.user.username;
  const { viewedUser } = req.body;

  let viewed = await userModel.findOne({ username: viewedUser });
  if (viewed.whoViewed.includes(mainUser)) {
    return res.json({
      viewsCount: viewed.viewsCount,
      hasViewed: true,
    });
  } else {
    try {
      let record = await userModel.findOneAndUpdate(
        { username: viewedUser },
        {
          $push: { whoViewed: mainUser },
          $inc: { viewsCount: 1 },
        },
        { new: true },
      );
      res.json({
        viewsCount: record.viewsCount,
        hasViewed: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
});

app.get("/sysInfo", async (req, res) => {
  let data = await settings.find();
  res.json(data);
});
app.get("/versions/updates",(req,res)=>{
  res.render("versionUpdates.ejs")
})

app.post("/deleteComment", authenticate, async (req, res) => {
  try {
    let { commentId } = req.body;

    let comment = await comments.findById(commentId);

    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.from !== req.user.username) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await comments.findByIdAndDelete(commentId);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/posts", upload.array("media[]"), authenticate, async (req, res) => {
  try {
    const { description } = req.body;
    const mediaLinks = [];
    const mediaTypes = [];

    for (const file of req.files) {
      const fileBuffer = fs.readFileSync(file.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: file.filename,
        folder: file.fieldname.startsWith("prof")
          ? "/uploads/profile"
          : "/uploads/gallery",
      });

      mediaLinks.push(response.url);
      mediaTypes.push(file.mimetype.startsWith("video") ? "video" : "image");

      fs.unlinkSync(file.path);
    }

    const newPost = await Posts.create({
      fromName: req.user.username,
      fromPic: req.user.profileLink || "/mediafiles/defaultProfile.png",
      description,
      mediaLinks,
      mediaTypes,
      date: new Date(),
      likes: 0,
      likedBy: [],
      comments: [],
    });

    res.json(newPost);
  } catch (err) {
    console.error("ImageKit upload error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

const renderPosts = async (username, res) => {
  try {
    const allPosts = await Posts.find({ fromName: username }).sort({
      createdAt: -1,
    });

    const normalizedPosts = allPosts.map((post) => {
      return {
        ...post.toObject(),
        mediaLink: Array.isArray(post.mediaLink)
          ? post.mediaLink
          : post.mediaLink
            ? [post.mediaLink]
            : [],
      };
    });

    res.json(normalizedPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

app.get("/posts/data/:username", authenticate, async (req, res) => {
  let username = req.params.username;
  if (username === "false") {
    try {
      const allPosts = await Posts.find({}).sort({ createdAt: -1 });

      const normalizedPosts = allPosts.map((post) => {
        return {
          ...post.toObject(),
          mediaLink: Array.isArray(post.mediaLink)
            ? post.mediaLink
            : post.mediaLink
              ? [post.mediaLink]
              : [],
        };
      });

      res.json(normalizedPosts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  } else if (username === "vidualPosts") {
    username = req.user.username;
    renderPosts(username, res);
  } else {
    renderPosts(username, res);
  }
});

app.post("/post/commentsP",authenticate, async (req, res) => {
  const { postId, to, comment, time } = req.body;
  const from = req.user.username?.trim();
  const newComment = new postComments({
    postId,
    from,
    to,
    comment,
    time: time ? new Date(time) : Date.now(),
  });

  const savedComment = await newComment.save();
  const userpostFCM = await userModel.findOne({username: to });
  const token1 = userpostFCM?.fcmToken;
  if (token1){
    sendPushNotification(
          "msg",
          token1, 
          `New insight on your post from ${from}`, 
          `${comment}`, 
          `https://${APP_URL}/modern/${from}`
      );
  }
  res.status(201).json(savedComment);
});

app.post("/post/commentsP", async (req, res) => {
  const { postId, from, to, comment, time } = req.body;
  const newComment = new postComments({
    postId,
    from,
    to,
    comment,
    time: time ? new Date(time) : Date.now(),
  });

  const savedComment = await newComment.save();
  res.status(201).json(savedComment);
});

app.post("/obtain/commentsP", async (req, res) => {
  const { postId, username } = req.body;

  try {
    const comments = await postComments
      .find({ postId })
      .sort({ time: 1 })
      .lean();

    const enriched = comments.map((c) => ({
      ...c,
      likesCount: c.likes || 0,
      hasLiked: username ? c.likedBy.includes(username) : false,
    }));

    res.json({ commentsData: enriched });
  } catch (err) {
    res.status(500).json({ error: "Failed to load comments" });
  }
});

app.get("/champions/data", async (req, res) => {
  try {
    const champions = await userModel
      .find({})
      .sort({ viewsCount: -1 })
      .select("username comments viewsCount");

    res.json({ champions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch champions" });
  }
});

app.post("/posts/:postId/like", authenticate, async (req, res) => {
  const { postId } = req.params;
  const username = req.user.username?.trim();

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const alreadyLiked = post.likedBy.includes(username);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((u) => u !== username);
    } else {
      post.likedBy.push(username);
    }

    post.likes = post.likedBy.length;

    await post.save();

    res.json({
      liked: !alreadyLiked,
      likesCount: post.likes,
    });
  } catch (err) {
    console.error("Like toggle error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/posts/:postId/likes",authenticate, async (req, res) => {
  const post = await Posts.findById(req.params.postId).select("likes likedBy");
  if (!post) return res.status(404).json({});
  let username = req.user?.username.trim();
  res.json({
    likes: post.likes || 0,
    hasLiked: post.likedBy?.includes(username || "") || false,
  });
});

app.post("/comments/:commentId/like",authenticate, async (req, res) => {
  const { commentId } = req.params;
  const username = req.user.username?.trim();

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    const comment = await postComments.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const likesCount = (comment.likedBy.length);
    let additionalMsg  = '';
    if (likesCount && likesCount == 1){
      additionalMsg = ' and 1 other ';
    } else if (likesCount && likesCount > 1){
      additionalMsg = ` and ${likesCount} others `}
    const alreadyLiked = comment.likedBy.includes(username);
    const to = comment.to;
    const from = comment.from;
    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter((u) => u !== username);
    } else {
      comment.likedBy.push(username);
    }

    comment.likes = comment.likedBy.length;

    await comment.save();
    if(!alreadyLiked){
          
  const savecommentuser = await userModel.findOne({username: from });
  const token3 = savecommentuser?.fcmToken;
  const message = comment.comment;
  if (token3){
    sendPushNotification(
          "msg",
          token3, 
          `${username} ${additionalMsg}liked your comment on ${to}'s post` , 
          `${message}`, 
          `https://${APP_URL}/modern/${username}`
      );
  }
    }

    res.json({
      liked: !alreadyLiked,
      likesCount: comment.likes,
    });
  } catch (err) {
    console.error("Comment like error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/groups/my-groups", authenticate, async (req, res) => {
  let arr1 = await userModel.find({ username: req.user.username });
  let userId = arr1[0]._id;
  try {
    const groups = await Group.find({ members: userId }).lean();

    const formatted = groups.map((g) => ({
      _id: g._id.toString(),
      name: g.name,
      icon: g.icon,
      admin: g.admin?.username || "Unknown",
      membersCount: g.members.length,
      isAdmin: g.admin?._id.toString() === userId.toString(),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("[MY GROUPS ERROR]", err.message);
    res.status(500).json({ error: "Failed to fetch your groups" });
  }
});

app.post("/api/groups/join/:groupId", authenticate, async (req, res) => {
  const { username } = req.body;
  const { groupId } = req.params;

  if (!username) return res.status(400).json({ error: "Username is required" });
  if (!mongoose.isValidObjectId(groupId))
    return res.status(400).json({ error: "Invalid group ID" });

  try {
    const userToAdd = await userModel.findOne({ username });
    if (!userToAdd) return res.status(404).json({ error: "User not found" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const userIdStr = userToAdd._id.toString();
    if (group.members.some((id) => id.toString() === userIdStr)) {
      return res.status(400).json({ error: "User is already a member" });
    }

    group.members.push(userToAdd._id);
    await group.save();

    await userModel.findByIdAndUpdate(userToAdd._id, {
      $push: { groups: group._id },
    });

    res.json({ message: `${username} added successfully!` });
  } catch (err) {
    console.error("[JOIN GROUP ERROR]", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/groupChats/:groupId", authenticate, async (req, res) => {
  let arr1 = await userModel.find({ username: req.user.username });
  let userId = arr1[0]._id;
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "username")
      .populate("admin", "username");

    if (!group) return res.status(404).send("Group not found");

    const members = group.members.map((m) => m.username);

    res.render("groupChats", {
      groupName: group.name,
      groupIcon: group.icon,
      groupDescription: group.description || "No description",
      members: await userModel.find({ _id: { $in: group.members } }).lean(),
      admin: group.admin,
      currentUserId: userId.toString(),
      groupId: group._id.toString(),
      currentUsername: req.user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post(
  "/groups/create",
  authenticate,
  upload.single("icon"),
  async (req, res) => {
    try {
      let arr1 = await userModel.find({ username: req.user.username });
      let userId = arr1[0]._id;

      const name = req.body?.name?.trim();
      const iconUrl = req.body?.iconUrl?.trim();

      if (!name) {
        return res.status(400).json({ error: "Group name is required" });
      }

      let finalIcon = iconUrl || null;

      if (req.file) {
        try {
          const fileData = fs.readFileSync(req.file.path);

          const uploadResult = await imagekit.upload({
            file: fileData,
            fileName: `${name.replace(/\s+/g, "-")}-${Date.now()}.${req.file.mimetype.split("/")[1]}`,
            folder: "/groups",
          });

          finalIcon = uploadResult.url;

          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("ImageKit upload error:", err);
        }
      }

      const group = await Group.create({
        name,
        icon: finalIcon,
        admin: userId,
        members: [userId],
      });

      res.status(201).json(group);
    } catch (err) {
      console.error("Group creation error:", err);
      res.status(500).json({ error: "Server error while creating group" });
    }
  },
);

app.put("/api/groups/:groupId/description", authenticate, async (req, res) => {
  let arr1 = await userModel.find({ username: req.user.username });
  let userId = arr1[0]._id;

  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Description required" });
    }

    const group = await Group.findById(req.params.groupId).populate("admin");

    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can edit description" });
    }

    group.description = description.trim();
    await group.save();

    res.json({ success: true, description: group.description });
  } catch (err) {
    console.error("DESC UPDATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/groups/:id/leave", authenticate, async (req, res) => {
  try {
    const groupId = req.params.id;
    let arr1 = await userModel.find({ username: req.user.username });
    let userId = arr1[0]._id;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const userIdStr = userId.toString();

    if (
      group.members.length === 1 &&
      group.members[0].toString() === userIdStr
    ) {
      return res.status(400).json({
        error: "You are the only member. Delete the group instead.",
      });
    }

    if (!group.members.some((id) => id.toString() === userIdStr)) {
      return res
        .status(400)
        .json({ error: "You're not a member of this group" });
    }

    group.members = group.members.filter((id) => id.toString() !== userIdStr);

    let adminTransferred = false;
    if (group.admin.toString() === userIdStr) {
      if (group.members.length > 0) {
        group.admin = group.members[0];
        adminTransferred = true;
      } else {
        await Group.findByIdAndDelete(groupId);
        return res.json({
          success: true,
          message: "Group deleted as last member left",
        });
      }
    }

    await group.save();

    await userModel.findByIdAndUpdate(userId, {
      $pull: { groups: groupId },
    });
    res.json({
      success: true,
      message: "You have left the group",
    });
  } catch (error) {
    console.error("[LEAVE GROUP ERROR]", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get(
  "/groups/join/:groupId/:groupName",
  authenticateOptional,
  async (req, res) => {
    const { groupId } = req.params;

    try {
      if (!req.user) {
        req.session = req.session || {};
        req.session.pendingGroupJoin = groupId;
        return res.redirect("/login");
      }

      const user = await userModel.findOne({ username: req.user.username });
      if (!user) return res.status(404).send("User not found");

      const group = await Group.findById(groupId);
      if (!group) return res.status(404).send("Group not found");

      const userIdStr = user._id.toString();
      if (!group.members.some((id) => id.toString() === userIdStr)) {
        group.members.push(user._id);
        await group.save();

        await userModel.findByIdAndUpdate(user._id, {
          $push: { groups: group._id },
        });
      }

      res.redirect(`/groupChats/${groupId}`);
    } catch (err) {
      console.error("[JOIN LINK ERROR]", err);
      res.status(500).send("Failed to join group");
    }
  },
);
app.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });

  try {
    const result = await imagekit.upload({
      file: fs.readFileSync(req.file.path),
      fileName: req.file.filename,
      folder: "/chat-images",
      useUniqueFileName: true,
    });

    fs.unlinkSync(req.file.path);

    res.json({ success: true, url: result.url });
  } catch (err) {
    console.error("ImageKit upload error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Upload failed" });
  }
});

// Get call history for a user
app.get("/api/call-history", authenticate, async (req, res) => {
  try {
    const username = req.user.username;
    const limit = parseInt(req.query.limit) || 50;

    // Get both incoming and outgoing calls for the user
    const calls = await CallHistory.find({
      $or: [{ caller: username }, { receiver: username }],
    })
      .sort({ startTime: -1 })
      .limit(limit)
      .lean();

    // Format calls for frontend
    const formattedCalls = calls.map((call) => {
      const isOutgoing = call.caller === username;
      const otherUser = isOutgoing ? call.receiver : call.caller;

      return {
        id: call._id,
        user: otherUser,
        type: call.callType,
        direction: call.direction,
        status: call.status,
        duration: call.duration,
        timestamp: call.startTime,
        isMissed: call.status === "missed" && !isOutgoing,
        isOutgoing,
      };
    });

    res.json({ calls: formattedCalls });
  } catch (err) {
    console.error("Failed to fetch call history:", err);
    res.status(500).json({ error: "Failed to fetch call history" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Started on http://0.0.0.0:${PORT}`);
});
app.get('/.well-known/assetlinks.json', (req, res) => {
  const assetLinks = [
    {
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": "com.moispace.mmun",
        "sha256_cert_fingerprints": [
          "AB:84:FF:D1:F7:04:6C:C1:89:95:70:B2:B7:2C:59:4B:F3:EB:5E:27:57:41:6A:C7:35:03:B0:93:24:11:FF:83"
        ]
      }
    }
  ];

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(assetLinks));
});
app.get("/privacyPolicy",(req,res)=>{
  res.render("privacyPolicy");
});
app.get("/about", (req, res) => {
  res.render("about");
});

 
app.post("/fcmTokenUpdater", authenticate, async (req, res) => {
  const { token } = req.body;
  const username = req.user.username.trim();
  const date = new Date(Date.now());
  try {
    await userModel.findOneAndUpdate({ username }, { fcmToken: token, lastSeen: date });
    res.json({ success: true });
  } catch (error) {
    console.error("FCM token update error:", error);
    res.status(500).json({ success: false });
  }
});
app.patch("/updateYear", authenticate, async (req, res) => {
  const { year } = req.body;
  const username = req.user.username;
  try {
    const user = await userModel.findOne({ username });
    if (!user ) {
      return res.status(403).json({ success: false });
    }

    const indexes = user.updatesIndexes?.length ? [...user.updatesIndexes] : ["0","0","0","0"];
    indexes[3] = "1";

    await userModel.findOneAndUpdate(
      { username },
      { $set: { year, updatesIndexes: indexes } },
      { upsert: true }
    );

    res.json({ success: true });

  } catch (error) {
    console.error("Year update error:", error);
    res.status(500).json({ success: false });
  }
});