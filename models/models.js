import mongoose, { mongo } from "mongoose";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    fcmToken: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gallaryLinks: {
      type: String,
    },
    profileLink: {
      type: String,
    },
    aboutMe: {
      type: String,
    },
    aboutYou: {
      type: String,
    },
    course: {
      type: String,
    },
    year: {
      type: String,
    },
    slogan: {
      type: String,
    },
    comments: { type: Number, default: 0 },
    whoViewed: { type: [String], default: [] },
    feedScore:  { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    likesCount: {type: Number, default: 0},
    blogTitle: { type: String },  
    likedArray: {type: Array, default:['Person']},
    lastSeen: {type: Date},
    tribe: { type: String },
    tribePublic: { type: Boolean, default: true },
    relationship: { type: String, default: "Single" },
    relationshipPublic: { type: Boolean, default: true },
    locality: { type: String },
    localityPublic: { type: Boolean, default: true },
    religion: { type: String, default: "Christian" },
    religionPublic: { type: Boolean, default: true },
    groups: [String],
    gender: { type: String },
    Role: { type: String, default: "Student" },
    Institution: { type: String },
    birthYear: { type: Number },
    birthMonth: { type: Number },
    deleted: { type: Boolean },
    birthDay: { type: Number },
    defaultBlog: { type: String },
    instagramHandle: { type: String, trim: true },
    instagramLink: { type: String, trim: true },
    instagramPublic: { type: Boolean, default: false },
    whatsappHandle: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    whatsappPublic: { type: Boolean, default: false },
    facebookHandle: { type: String, trim: true },
    facebookLink: { type: String, trim: false },
    facebookPublic: { type: Boolean, default: false },
    whatsappDefaultMsg: {
      type: String,
      default: "Hey, saw you on MMUN, how are you doing?",
    },
    favoriteColorPublic: { type: Boolean, default: false },
    favoriteFoodPublic: { type: Boolean, default: false },
    bestFriendPublic: { type: Boolean, default: false },
    favoriteMoviePublic: { type: Boolean, default: false },
    hobbiesPublic: { type: Boolean, default: false },
    favoriteBookPublic: { type: Boolean, default: false },
    favoriteMusicPublic: { type: Boolean, default: false },
    updatesIndexes: {type: [String], default: ['0','0','0','0']},
  },
  { strict: true, strictQuery: true, timestamps: true },
);
userSchema.index({ Role: 1, feedScore: -1, _id: -1 }, { name: "feed_role_score_id" });
userSchema.index({ updatedAt: 1 },{ name: "feed_updatedAt"     });
const applicationSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true },
    dob:       { type: String, required: true },
    gender:    { type: String, required: true },
    institution: { type: String, required: true },
    programme:   { type: String, required: true },
    acYear:      { type: String, required: true },
    role:               { type: String, required: true },
    roleSpecialization: { type: String, default: null },
    skills:        { type: [String], required: true },
    skillLevel:    { type: String, required: true },  
    hoursPerWeek:  { type: String, required: true },
    portfolio:     { type: String, default: "" },
    motivation:    { type: String, required: true },
    availableDays: { type: [String], default: [] },
    signatureUrl:  { type: String, required: true },
    legalName:     { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, role: 1 }, { unique: true });
const Application = mongoose.model("Application", applicationSchema);
const messageL = new mongoose.Schema(
  {
    from: {type: String, index: true},
    to: String,
    text: String,
    image: { type: String },
    time: String,
    content: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "form"],
      default: "text"
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const noticsSchema = new mongoose.Schema({
  username: {type: String},
  description: {type: String},
  likes: Number
},{strict:true, strictQuery:true, timestamps: true});

const feedbackSchema = new mongoose.Schema({
  page: {type: String, required: true},
  vote: {type: String, enum: ['true', 'false', 'improve'], required: true},
  ownOopinion: {type: String, default: "null"},
  time: {type: Date, default: Date.now},
  username: {type: String, required: true}
},{strict:true, strictQuery:true, timestamps: true});
const feedback = mongoose.model("feedback", feedbackSchema);

const noticsSubscribe = new mongoose.Schema({
  to: {type: String},
  from: {type: String},
  id: {type: Number, index: true}
},{timestamps: true, strict: true, strictQuery: true})
const announcementSchema = new mongoose.Schema({
  body: { type: String, required: true },
  title: { type: String },
  image: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  endsAt: { type: Date },
  keptBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }]
}, { timestamps: true });

const arenaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  image: { type: String },
  date: { type: Date },
  host: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  inspiredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  views: { type: Number, default: 0 }
}, { timestamps: true });

const timetableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  postedDate: { type: Date, default: Date.now },
  runsTill: { type: Date },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);
const Arena = mongoose.model("Arena", arenaSchema);
const Timetable = mongoose.model("Timetable", timetableSchema);
const notics = mongoose.model("notics", noticsSchema);


const Messages = mongoose.model("Messages", messageL);

const userModel = mongoose.model("Users", userSchema);

const interestSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    status: String,
    time: String,
  },
  { timestamps: true },
);
const interests = mongoose.model("Interests", interestSchema);

const commentsLbl = new mongoose.Schema({
  from: String,
  to: String,
  comment: String,
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },
  time: String,
});

let comments = mongoose.model("Comments", commentsLbl);

const followersLbl = new mongoose.Schema({
  from: String,
  to: String,
});

let followers = mongoose.model("Followers", followersLbl);

let settingsL = new mongoose.Schema({
  totalOnline: { type: Number, default: 0 },
  appState: { type: Boolean, default: true },
});

let settings = mongoose.model("criticalSettings", settingsL);
let PostsL = new mongoose.Schema({
  fromName: String,
  fromPic: String,
  description: String,
  mediaLinks: [String],
  mediaTypes: [String],
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: { type: Array, default: [] },
  likedBy: { type: [String], default: [] },
});

const postCommentsL = new mongoose.Schema({
  postId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  comment: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

let Posts = mongoose.model("Posts", PostsL);

const postCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: false,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [String],
    default: [],
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

let postComments = mongoose.model("postComments", postCommentSchema);

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: "" },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  description: { type: String, default: "" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // â† match here too
  createdAt: { type: Date, default: Date.now },
});

const Group = mongoose.model("Group", groupSchema);

const groupMessageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "form", "system", "notification"],
      default: "text",
      index: true,
    },
    time: {
      type: Date,
      default: Date.now,
      index: true,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groupMessages",
      default: null,
      index: true,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    replyToUsername: {
      type: String,
      trim: true,
      default: null,
    },
    replyToPreview: {
      type: String,
      trim: true,
      maxlength: 140,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const groupMessages = mongoose.model("groupMessages", groupMessageSchema);

// Call History Schema for WhatsApp-like call tracking
const callHistorySchema = new mongoose.Schema(
  {
    caller: {
      type: String,
      required: true,
      index: true,
    },
    receiver: {
      type: String,
      required: true,
      index: true,
    },
    callType: {
      type: String,
      enum: ["voice", "video"],
      required: true,
    },
    direction: {
      type: String,
      enum: ["outgoing", "incoming"],
      required: true,
    },
    status: {
      type: String,
      enum: ["missed", "answered", "declined", "busy", "failed", "ended"],
      required: true,
    },
    duration: {
      type: Number, // in seconds, 0 for missed/declined calls
      default: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    room: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
callHistorySchema.index({ caller: 1, receiver: 1, startTime: -1 });
callHistorySchema.index({ receiver: 1, startTime: -1 });

const CallHistory = mongoose.model("CallHistory", callHistorySchema);

export {
  userModel,
  Messages,
  interests,
  comments,
  followers,
  settings,
  Posts,
  postComments,
  Group,
  groupMessages,
  CallHistory,
  Announcement,
  Arena,
  Timetable,
  feedback,
  Application
};
