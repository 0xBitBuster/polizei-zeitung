const express = require("express")
const router = express.Router()

const wantedPersonController = require("../controllers/wantedPersonController")
const { verifyAuth, AUTH_LEVELS } = require("../middleware/auth")

router.get("/",  verifyAuth(AUTH_LEVELS.INTERNAL),wantedPersonController.wantedPersons)
router.get("/unapproved", verifyAuth(AUTH_LEVELS.ADMIN), wantedPersonController.unapprovedWantedPersons)
router.get("/:id", verifyAuth(AUTH_LEVELS.INTERNAL), wantedPersonController.wantedPerson)
router.post("/", verifyAuth(AUTH_LEVELS.ADMIN), wantedPersonController.publishWantedPerson)
router.delete("/:id", verifyAuth(AUTH_LEVELS.ADMIN), wantedPersonController.deleteWantedPerson)
router.put("/:id", verifyAuth(AUTH_LEVELS.ADMIN), wantedPersonController.editWantedPerson)
router.post("/:id/convert", verifyAuth(AUTH_LEVELS.ADMIN), wantedPersonController.convertWantedPerson)

module.exports = router