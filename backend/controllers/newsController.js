const catchAsync = require("../utils/catchAsync")
const NewsPost = require("../models/NewsPost");

/**
 * Get all news
 * @route   GET /api/news
 * @access  Internal, Admin
 */
exports.news = catchAsync(async (req, res, next) => {    
    const news = await NewsPost.find({}).select("-__v").sort({ date: -1 });

    return res.json({ 
        ok: true, 
        news 
    });
});