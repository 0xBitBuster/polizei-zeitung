const express = require("express")
const router = express.Router()

const newsController = require("../controllers/newsController")
const { verifyAuth, AUTH_LEVELS } = require("../middleware/auth")

router.get("/", verifyAuth(AUTH_LEVELS.INTERNAL), newsController.news)

module.exports = router;