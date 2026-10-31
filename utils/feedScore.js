// utils/feedScore.js

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_7_DAYS  = 7  * MS_PER_DAY;
const MS_30_DAYS = 30 * MS_PER_DAY;

export function getWeekStart() {
  const now  = new Date();
  const day  = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(now);
  mon.setUTCDate(now.getUTCDate() + diff);
  mon.setUTCHours(0, 0, 0, 0);
  return mon;
}

export function computeScore(user, now, weekStart) {
  let score = 0;
  
  // 1. POPULARITY — viewsCount sqrt-scaled (0–60 pts)
  const views    = Math.min(user.viewsCount || 0, 500);
  score += (Math.sqrt(views) / Math.sqrt(500)) * 60;

  // 2. NEW USER BOOST — account under 7 days old (0–30 pts)
  const ageMs = now - new Date(user.createdAt);
  if (ageMs <= MS_7_DAYS) score += 30;

  // 3. RECENCY DECAY — linear over 30 days (0–20 pts)
  score += Math.max(0, 20 * (1 - ageMs / MS_30_DAYS));

  // 4. CONTENT FRESHNESS — fields must exist AND updated this week
  const updatedThisWeek = new Date(user.updatedAt) >= weekStart;
  if (updatedThisWeek) {
    if (user.blogTitle) score += 10;
    if (user.slogan)    score += 8;
    if (user.aboutMe)   score += 5;
    if (user.aboutYou)  score += 5;
  }

  return Math.round(score * 100) / 100;
}