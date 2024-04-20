const express = require("express")
const router = express.Router()

const missingPersonController = require("../controllers/missingPersonController")
const { verifyAuth, AUTH_LEVELS } = require("../middleware/auth")

router.get("/", verifyAuth(AUTH_LEVELS.INTERNAL), missingPersonController.missingPersons)
router.get("/unapproved", verifyAuth(AUTH_LEVELS.ADMIN), missingPersonController.unapprovedMissingPersons)
router.get("/:id", verifyAuth(AUTH_LEVELS.INTERNAL), missingPersonController.missingPerson)
router.post("/", verifyAuth(AUTH_LEVELS.ADMIN), missingPersonController.publishMissingPerson)
router.delete("/:id", verifyAuth(AUTH_LEVELS.ADMIN), missingPersonController.deleteMissingPerson)
router.put("/:id", verifyAuth(AUTH_LEVELS.ADMIN), missingPersonController.editMissingPerson)
router.post("/:id/convert", verifyAuth(AUTH_LEVELS.ADMIN), missingPersonController.convertMissingPerson)

module.exports = router