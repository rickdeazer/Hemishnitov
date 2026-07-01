// controllers/feedController.js
import mongoose from "mongoose";
import { userModel } from "../models/models.js";

const PAGE_SIZE = 20;

// Fisher-Yates in-place shuffle — O(n), uniform distribution
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function getHomeFeed(req, res) {

  // ── extract ───────────────────────────────────────────────────────────
  const userRole  = req.user?.Role || "Student";
  const { campus, course, year } = req.query;
  const { cursor, seenIds }      = req.body;
  let institution = campus;
  const username  = req.user.username?.trim();

  // ── parse cursor — "score_idString"
  let cursorScore = null;
  let cursorId    = null;
  if (cursor) {
    const parts = cursor.split("_");
    cursorScore  = parseFloat(parts[0]);
    cursorId     = parts[1];
  }

  // ── parse seenIds
  const seenList = seenIds
    ? (Array.isArray(seenIds) ? seenIds : seenIds.split(",")).filter(Boolean)
    : [];

  // ── base match — shared by both pipelines ────────────────────────────
  const matchQuery = {
    profileLink: {
      $exists: true,
      $nin: ["/mediafiles/defaultProfileCHANGELATER.png", null, ""],
      $not: /ik\.imagekit\.io\/amanikbt1/         // moved before sort/limit (fixes last-page bug)
    },
    $expr: {
      $eq: [{ $ifNull: ["$Role", "Student"] }, userRole]
    },
    username: {
      $nin: [...seenList, username]
    }
  };

  if (institution && institution !== "All") matchQuery.Institution = institution;
  if (course      && course      !== "All") matchQuery.course      = course;
  if (year        && year        !== "All") matchQuery.year        = year;

  // ── keyset cursor stage — only on page 2+
  const cursorStage = (cursorScore !== null && cursorId !== null)
    ? [{
        $match: {
          $or: [
            { feedScore: { $lt: cursorScore } },
            {
              feedScore: cursorScore,
              _id: { $lt: new mongoose.Types.ObjectId(cursorId) }
            }
          ]
        }
      }]
    : [];

  // ── shared project stage ──────────────────────────────────────────────
  const projectStage = {
    $project: {
      password:            0,
      phone:               0,
      createdAt:           0,
      whoViewed:           0,
      Role:                0,
      aboutMe:             0,
      aboutYou:            0,
      birthDay:            0,
      birthMonth:          0,
      birthYear:           0,
      facebookPublic:      0,
      favoriteBookPublic:  0,
      favoriteColorPublic: 0,
      favoriteFoodPublic:  0,
      favoriteMoviePublic: 0,
      favoriteMusicPublic: 0,
      fcmToken:            0,
      gender:              0,
      groups:              0,
      hobbiesPublic:       0,
      instagramHandle:     0,
      instagramLink:       0,
      instagramPublic:     0,
      locality:            0,
      localityPublic:      0,
      relationship:        0,
      relationshipPublic:  0,
      religion:            0,
      religionPublic:      0,
      tribePublic:         0,
      whatsappDefaultMsg:  0,
      whatsappNumber:      0,
      whatsappPublic:      0,
      likedArray:          0,   // never send raw array to client
    }
  };

  // ── liked field stage ─────────────────────────────────────────────────
  const likedStage = {
    $addFields: {
      liked: { $in: [username, { $ifNull: ["$likedArray", []] }] }
    }
  };

  try {
    // ── main sorted pipeline ──────────────────────────────────────────
    const mainPipeline = [
      { $match: matchQuery },
      { $sort: { feedScore: -1, _id: -1 } },
      ...cursorStage,
      { $limit: PAGE_SIZE + 1 },
      likedStage,
      projectStage,
    ];

    // ── fire all three calls simultaneously ───────────────────────────
    // randomPipeline runs against same matchQuery but with $sample.
    // We exclude cursor stage because randoms should come from the full
    // filtered pool, not constrained to the current page window.
    // We exclude seenList IDs already excluded by matchQuery.
    // The $sample size is intentionally small (5) so reservoir scan is cheap.
    const [rawFeed, randomDocs, currentUser] = await Promise.all([
      userModel.aggregate(mainPipeline),

      userModel.aggregate([
        { $match: matchQuery },
        { $sample: { size: 5 } },   // MongoDB reservoir sampling — optimized
        likedStage,
        projectStage,
      ]),

      userModel
        .findOne({ username }, { updatesIndexes: 1, Role: 1 })
        .lean(),
    ]);

    // ── pagination from sorted feed (cursor based on raw, pre-merge) ──
    const hasNextPage = rawFeed.length > PAGE_SIZE;
    const page        = rawFeed.slice(0, PAGE_SIZE);         // sorted slice

    const lastItem   = page[page.length - 1];
    const nextCursor = hasNextPage && lastItem
      ? `${lastItem.feedScore}_${lastItem._id}`
      : null;

    // ── de-duplicate randoms against this page ────────────────────────
    // Build a Set of stringified _ids already in page for O(1) lookup
    const pageIdSet = new Set(page.map(u => String(u._id)));
    const freshRandoms = randomDocs.filter(u => !pageIdSet.has(String(u._id)));

    // ── merge: randoms injected into sorted page, then shuffle all ────
    // Result: every page render has a different order; randoms are woven in.
    // Cursor integrity is unaffected — it was computed from rawFeed above.
    const merged = shuffleArray([...page, ...freshRandoms]);

    return res.json({
      data: merged,
      pagination: {
        nextCursor,
        hasNextPage,
        pageSize: page.length        // intentional: reflects sorted count, not merged
      },
      updates: {
        updates: currentUser?.updatesIndexes ?? "null",
        Role:    currentUser?.Role            ?? "null"
      }
    });

  } catch (error) {
    console.error("Homepage aggregate error:", error);
    return res.status(500).json({ success: false });
  }
}