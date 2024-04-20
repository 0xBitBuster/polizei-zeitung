const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")

/**
 * Login
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
    if (req.cookies.access_token) {
        return next(new AppError("Du bist bereits eingeloggt.", 400))
    }

    const { password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
        return next(new AppError("Falsches Passwort.", 401))
    }

    const access_token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.cookie('access_token', access_token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2h
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "none"
    });

    return res.json({ ok: true });
});

/**
 * Logout
 * @route   POST /api/auth/logout
 * @access  Public
 */
exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("access_token")

    return res.json({ ok: true });
});
