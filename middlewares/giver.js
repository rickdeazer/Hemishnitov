import { userModel, Messages, interests } from "../models/models.js";
import jwt from "jsonwebtoken"; 

const findContacts = async (req) => {
  try {
    const username = req.user.username;

    const interestsList = await interests.find({
      status: "interested",
      $or: [{ from: username }, { to: username }],
    });

    const contactNames = interestsList.map((item) =>
      item.from === username ? item.to : item.from
    );

    const contacts = await userModel.find(
      { username: { $in: contactNames } },
      { _id: 0, username: 1, profileLink: 1, slogan: 1 }
    );

    return { contacts };
  } catch (error) {
    console.error("Error in findContacts:", error);
  }
};

const issueData = async (req, res) => {
  try {
    const me = req.user.username;

    // 1️⃣ Get all contacts from interests
    const interestsList = await interests.find({
      status: "interested",
      $or: [{ from: me }, { to: me }]
    });

    const contactNames = interestsList.map(item =>
      item.from === me ? item.to : item.from
    );

    if (contactNames.length === 0) {
      return res.json({ status: "success", conversations: [] });
    }

    // 2️⃣ Aggregate messages only between me and contacts
    const conversations = await Messages.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $in: ["$from", [me, ...contactNames]] },
              { $in: ["$to", [me, ...contactNames]] }
            ]
          }
        }
      },
      {
        $addFields: {
          contact: { $cond: [{ $eq: ["$from", me] }, "$to", "$from"] },
          createdAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] } // fallback timestamp
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$contact",
          lastMessage: { $first: "$text" },
          read: {$first: "$read"},
          from: {$first: "$from"},
          lastMessageFrom: { $first: "$from" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$to", me] }, { $eq: ["$read", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "username",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          username: "$_id",
          profileLink: "$user.profileLink",
          slogan: "$user.slogan",
          lastMessage: 1,
          lastMessageFrom: 1,
          lastMessageAt: 1,
          unreadCount: 1,
          read: 1,
          from: 1
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    res.json(conversations); // ✅ corrected here
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failed", error: "Something went wrong" });
  }
};


const giveMainUser = async (req, res, next) => {
      return res.status(200).json({ userDetails: user });
};

const obtainHistory = async (req, res) => {
  let arr1 = await Messages.find({
    from: req.body.name2,
    to: req.user.username,
  });
  let arr2 = await Messages.find({
    from: req.user.username,
    to: req.body.name2,
  });
  res.json({ msgReceivedH: arr1, msgSentH: arr2 });
};
const markAsRead = async (req, res) => {
  const mainUser = req.user.username
  const {receiver } = req.body;

  await Messages.updateMany(
    { from: receiver, to: mainUser, read: false },
    { $set: { read: true } }
  );
};

const unreadFinder = async (req, res) => {
  try {
    let unread = await Messages.find({
      to: req.user.username,
      read: false,
    }).countDocuments();
    let newInterest = await interests.find({
      to: req.user.username,
      status: "pending"
    }).countDocuments();
    return res.render("home", { user: req.user, unread, newInterest });
  } catch (error) {
    return res.render("login", {
      errors: ["The server experienced an error", "Please try again"],
    });
  }
};
const giveUserPage = async (req, res) => {
  let username = req.body.username;
  try {
    const userInfo = await userModel
      .findOne({ username })
      .select(
        "username gallaryLinks profileLink aboutMe aboutYou course year slogan " +
  "blogTitle tribe relationship locality religion " +
  "instagramHandle instagramLink instagramPublic " +
  "whatsappHandle whatsappNumber whatsappPublic whatsappDefaultMsg " +
  "facebookHandle facebookLink facebookPublic " +
  "viewsCount"
      );
    let links = [];
    if (userInfo.gallaryLinks) {
      links = userInfo.gallaryLinks.split(",");
    } else {
      links = [];
    }
    if(userInfo.whatsappNumber){
      if(!userInfo.whatsappPublic){
      userInfo.whatsappNumber = "";
      userInfo.whatsappDefaultMsg = "";
      }
    } else {
      userInfo.whatsappNumber = "missing";
    };

    if(userInfo.instagramLink){
    if(!userInfo.instagramPublic){
      userInfo.instagramLink = "";
    }} else {
      userInfo.instagramLink = "missing";
    };

    if(userInfo.facebookLink){
    if(!userInfo.facebookPublic){
      userInfo.facebookLink = ""
    }} else {
      userInfo.facebookLink = "missing";
    };


    res.render("foreignUser", { user: userInfo, links });
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const giveUserFromLink = async (req, res) => {
  let username = (req.params.username || "").trim();
  // === STRONG DEFENSE LAYER: Block suspicious / dangerous / junk usernames ===
  if (!username || username.length > 40) {
    console.log(`Blocked invalid username (empty or too long): "${username}"`);
    return res.status(404).send();
  }

  // Block path traversal, filesystem dangerous chars, control chars
  if (/[<>:"/\\|?*\x00-\x1F\x7F]/.test(username) || username.includes('..')) {
    console.log(`Blocked dangerous pattern in username: "${username}"`);
    return res.status(403).send("Forbidden");
  }

  // Block common browser probes, file extensions, and double-dot tricks
  const suspiciousPatterns = [
    /\.(css|js|json|map|html?|php[0-7]?|asp[x]?|jsp|exe|sh|bat|py[co]?|rb|pl|dll|so|bin)$/i,
    /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|otf|pdf|zip|rar|7z|txt|log|env|bak|old|~)$/i,
    /^(favicon|manifest|robots|sitemap|humans|browserconfig|apple-touch-icon|sw|service-worker)$/i,
    /%[0-9a-f]{2}/i,           // URL-encoded junk
    /\.(?:min\.)?(?:css|js)$/i // minified files
  ];

  if (suspiciousPatterns.some(regex => regex.test(username))) {
    console.log(`Blocked suspicious file-like username: "${username}"`);
    return res.status(404).send(); // silent 404 for probes
  }

  // Optional: Optional rate limiting per IP if you want extra protection (uncomment if needed)
  // if (tooManyRequestsFromIp(req.ip)) return res.status(429).send("Too many requests");

  // === Clean username for real users ===
  // Remove extra spaces/tabs (in case of weird padding)
  username = username.replace(/\s+/g, ' ').trim();

  // Debug only for valid-looking usernames
  console.log("Clean username processed:", JSON.stringify(username));

  try {
    // Case-insensitive lookup (very useful in real world)
    const userInfo = await userModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") }
    }).select(
      "username gallaryLinks profileLink aboutMe aboutYou course year slogan " +
  "blogTitle tribe relationship locality religion " +
  "instagramHandle instagramLink instagramPublic " +
  "whatsappHandle whatsappNumber whatsappPublic whatsappDefaultMsg " +
  "facebookHandle facebookLink facebookPublic " +
  "viewsCount"
    );

    if (!userInfo) {
      console.log(`User not found for: "${username}"`);
      return res.status(404).render("MMUNerror",
        {body: {
          message: `${username}, is not a valid MMUN user.`,
          redirecting: "home",
          errorCode: "404"
        } }); 
    }

    const links = userInfo.gallaryLinks
      ? userInfo.gallaryLinks.split(",").map(l => l.trim()).filter(Boolean)
      : [];
    res.render("foreignUser", { user: userInfo, links });
  } catch (err) {
    console.error("Error in giveUserFromLink:", err.message);
    res.status(500).send("Something went wrong on our side");
  }
};


const giveUserProfile = async (req, res) => {
  let username = req.user.username;
  try {
    const userInfo = await userModel
      .findOne({ username })
      .select(
  "username gallaryLinks profileLink aboutMe aboutYou course year slogan " +
  "blogTitle tribe relationship locality religion " +
  "instagramHandle instagramLink instagramPublic " +
  "whatsappHandle whatsappNumber whatsappPublic whatsappDefaultMsg " +
  "facebookHandle facebookLink facebookPublic " +
  "viewsCount"
);

    let links = [];
    if (userInfo.gallaryLinks) {
      links = userInfo.gallaryLinks.split(",");
    } else {
      links = [];
    }
    if(userInfo.whatsappNumber){
      if(!userInfo.whatsappPublic){
      userInfo.whatsappNumber = "";
      userInfo.whatsappDefaultMsg = "";
      }
    } else {
      userInfo.whatsappNumber = "missing";
    };

    if(userInfo.instagramLink){
    if(!userInfo.instagramPublic){
      userInfo.instagramLink = "";
    }} else {
      userInfo.instagramLink = "missing";
    };

    if(userInfo.facebookLink){
    if(!userInfo.facebookPublic){
      userInfo.facebookLink = ""
    }} else {
      userInfo.facebookLink = "missing";
    };
    res.render("userProfile", { user: userInfo, links });
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const giveEditPage = async (req, res) => {
  let username = req.user.username;
  try {
    const userInfo = await userModel.findOne({ username }).select(
  "username gallaryLinks profileLink aboutMe aboutYou course year slogan " +
  "blogTitle tribe tribePublic relationship relationshipPublic locality localityPublic religion religionPublic " +
  "instagramHandle instagramLink instagramPublic " +
  "whatsappHandle whatsappNumber whatsappPublic whatsappDefaultMsg " +
  "facebookHandle facebookLink facebookPublic " +
  "viewsCount"
);
    let links = [];
    if (userInfo.gallaryLinks) {
      links = userInfo.gallaryLinks.split(",");
    } else {
      links = [];
    }
    res.render("editPage", { user: userInfo, links });
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const interestGiver = async (req, res) => {
const received = await interests.aggregate([
  { $match: { to: req.user.username } },
  { $addFields: {
      order: {
        $switch: {
          branches: [
            { case: { $eq: ["$status", "pending"] },    then: 0 },
            { case: { $eq: ["$status", "declined"] },   then: 1 },
            { case: { $eq: ["$status", "interested"] }, then: 2 }
          ],
          default: 3
        }
      }
    }
  },
  { $sort: { order: 1, from: 1 } },{$lookup: {
    from: "users",
    localField: "from",
    foreignField: "username",
    as: "fused"
  }},{$unwind: "$fused"},{$addFields: {
    username: "$fused.username",
    profileLink: "$fused.profileLink"
  }},
  {$project: { order: 0, fused: 0
   } }
]);

const sent = await interests.aggregate([
  { $match: { from: req.user.username } },
  { $addFields: {
      order: {
        $switch: {
          branches: [
            { case: { $eq: ["$status", "pending"] },    then: 0 },
            { case: { $eq: ["$status", "declined"] },   then: 1 },
            { case: { $eq: ["$status", "interested"] }, then: 2 }
          ],
          default: 3
        }
      }
    }
  },{$lookup: {
    from: "users",
    localField: "to",
    foreignField: "username",
    as: "fused"
  }}, 
  { $sort: { order: 1, to: 1 } },{$unwind: "$fused"},{$addFields: {
    username: "$fused.username",
    profileLink: "$fused.profileLink"
  }},{$project: {
    order: 0, fused: 0
  }}
]);
  return res.json({ received: received, sent: sent });
};
export {
  issueData,
  giveMainUser,
  unreadFinder,
  obtainHistory,
  markAsRead,
  giveUserPage,
  giveUserProfile,
  giveUserFromLink,
  giveEditPage,
  interestGiver,
  findContacts
}; 
