const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError")

const AUTH_LEVELS = {
    ADMIN: 2,
    INTERNAL: 1,
    USER: 0
}

const checkIfAdmin = (req) => {
    const token = req.cookies.access_token;
	if (!token) {
        return false
	}
    
	try {
        jwt.verify(token, process.env.JWT_SECRET);
	} catch (_) {
		return false
	}

	return true;
}

const checkIfInternal = (req) => {
    const apiKey = req.headers.authorization;
    return apiKey && process.env.INTERNAL_API_KEY == apiKey.split(" ")[1]
}

const getAuthLevel = (req) => {
    const isAdmin = checkIfAdmin(req);
    const isInternal = checkIfInternal(req);
    let userLevel = AUTH_LEVELS.USER;
    
    if (isAdmin)
        userLevel = AUTH_LEVELS.ADMIN;
    else if (isInternal)
        userLevel = AUTH_LEVELS.INTERNAL;

    return userLevel;
}

exports.verifyAuth = (level) => {
    return (req, res, next) => {
        const authLevel = getAuthLevel(req)
        
        // Check if allowed to continue
        if (authLevel >= level)
            next();
        else
            next(new AppError("Du hast keine Rechte diese URL zu benutzen.", 401))
    }
}

exports.AUTH_LEVELS = AUTH_LEVELS;
exports.getAuthLevel = getAuthLevel;