const path = require("path")
const fs = require('fs').promises;

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync")
const MissingPerson = require("../models/MissingPerson");
const WantedPerson = require("../models/WantedPerson");
const NewsPost = require("../models/NewsPost");

/**
 * Get database statistics
 * @route   GET /api/admin/statistics
 * @access  Admin
 */
exports.statistics = catchAsync(async (req, res, next) => {
    const missingPersonsCount = await MissingPerson.countDocuments({})
    const wantedPersonsCount = await WantedPerson.countDocuments({})
    const newsCount = await NewsPost.countDocuments({})

    return res.json({
        ok: true,
        missing: missingPersonsCount,
        wanted: wantedPersonsCount,
        news: newsCount
    })
});

/**
 * Get crawler logs
 * @route   GET /api/admin/crawlerlogs
 * @access  Admin
 */
exports.crawlerLogs = catchAsync(async (req, res, next) => {
    const crawlerLogPath = path.join(__dirname, "..", "logs", "log.txt")

    try {
        await fs.access(crawlerLogPath);
    
        const data = await fs.readFile(crawlerLogPath, 'utf8');
        return res.json({ ok: true, logs: data })
    } catch (_) {
        return res.json({ ok: true, logs: "" })
    }
});