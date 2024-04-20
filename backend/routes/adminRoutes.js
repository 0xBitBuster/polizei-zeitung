const express = require("express")
const router = express.Router()

const adminController = require("../controllers/adminController")
const { verifyAuth, AUTH_LEVELS } = require("../middleware/auth")

router.get("/crawlerlogs", verifyAuth(AUTH_LEVELS.ADMIN), adminController.crawlerLogs)
router.get("/statistics", verifyAuth(AUTH_LEVELS.ADMIN), adminController.statistics)

module.exports = router