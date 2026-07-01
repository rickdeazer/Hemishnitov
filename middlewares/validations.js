import jwt from "jsonwebtoken";
import sanitize from "sanitize-html";
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  let page = req.redirectOnError || "login";
  let from = req.from || "";
  let body = req.data;
  let errorParameters = "";
  if (from){
    errorParameters = {body: body };
  }
  if (!token) {
    return res.render(page, errorParameters || { errors: ["Expired login token"] });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    user.username = user.username.trim();
    user.fcmToken = user.fcmToken || null;
    req.fcmToken = user.fcmToken && user.fcmToken.trim();
    req.user = user;
    next();
  } catch (error) {
    res.render(page, errorParameters || { errors: ["Expired login token"] });
  }
};
const sanity = (req, res, next) => {
  let body = req.user.username;
  const sanitized = sanitize(body);
  sanitized
    ? next()
    : res.render("login", { errors: ["violations have been detected"] });
};

const authenticateOptional = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

export { authenticate, sanity, authenticateOptional }; 