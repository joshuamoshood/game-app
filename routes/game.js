const express = require("express");

const {
    showGame,
    popularGames,
    comingSoonGames,
    anticipatedGames,
    recentlyReviewedGames,
    searchGames
} = require("../controllers/gameController");

const {
    renderHome
} = require("../controllers/homeController");

const router = express.Router();

router.route("/").get(renderHome);
router.route("/games/:slug").get(showGame);
router.route("/api/v1/search").post(searchGames);

router.route("/partials/popular-games").get(popularGames);
router.route("/partials/coming-soon-games").get(comingSoonGames);
router.route("/partials/most-anticipated-games").get(anticipatedGames);
router.route("/partials/recently-created-games").get(recentlyReviewedGames);

module.exports = router;