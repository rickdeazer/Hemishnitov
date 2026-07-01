// cron/feedScoreJob.js
import cron      from "node-cron";
import {userModel} from "../models/models.js";
import { computeScore, getWeekStart } from "../utils/feedScore.js";

async function recomputeFeedScores() {
  console.log("[FeedScore] Recomputing —", new Date().toISOString());
  const now       = new Date();
  const weekStart = getWeekStart();

  try {
    const users = await userModel.find(
      {},
      {
        _id:        1,
        createdAt:  1,
        updatedAt:  1,
        viewsCount: 1,
        blogTitle:  1,
        slogan:     1,
        aboutMe:    1,
        aboutYou:   1
      }
    ).lean();

    const bulkOps = users.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { feedScore: computeScore(user, now, weekStart) } }
      }
    }));

    if (!bulkOps.length) return;

    const result = await userModel.bulkWrite(bulkOps, { ordered: false });
    console.log(`[FeedScore] Done — ${result.modifiedCount} users updated.`);

  } catch (err) {
    console.error("[FeedScore] Recompute error:", err);
  }
}

export function startFeedScoreCron() {
  // runs every 6 hours
  cron.schedule("0 */6 * * *", recomputeFeedScores);
  console.log("[FeedScore] Cron scheduled — every 6 hours.");

  // run immediately on server start so scores are never stale after deploy
  recomputeFeedScores();
}