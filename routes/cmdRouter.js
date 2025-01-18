const express = require("express");
const router = express.Router();
const cmdController = require("../controllers/cmdController");

router
    .route("/start")
    .get(cmdController.start)

router
    .route("/abort")
    .get(cmdController.abort)

router
    .route("/cmd")
    .post(cmdController.cmd)

router
    .route("/reload")
    .get(cmdController.reload)

router
    .route("/hack")
    .get(cmdController.hack)

router
    .route("/vcanAdd")
    .get(cmdController.vcanAdd)

router
    .route("/vcanSetup")
    .get(cmdController.vcanSetup)


module.exports = router;