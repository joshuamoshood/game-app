const GameModule = require("../modules/gameModule");
const NewsModule = require("../modules/NewsModule");
let gameModuleInstance = new GameModule
let newsModuleInstance = new NewsModule

module.exports = {
    showGame: async(req, res) => {
        // pull game details here
        let slug = req.params.slug
        const game = await gameModuleInstance.getGameBySlug(slug)
        const news = await newsModuleInstance.searchNews(`New updates for ${game.name}`)
        console.log({news: news[0]});

        res.render("game/show", {game, news});
    },

    popularGames: async(req, res) => {
        const games = await gameModuleInstance.getPopularGames();
        return res.render("game/partials/popular-games", {games})
    },

    comingSoonGames: async(req, res) => {
        const games = await gameModuleInstance.getComingSoonGames();
        return res.render("game/partials/coming-soon-games", {games})
    },

    anticipatedGames: async(req, res) => {
        const games = await gameModuleInstance.getMostAnticipatedGames();
        return res.render("game/partials/anticipated-games", {games})
    },

    recentlyReviewedGames: async(req, res) => {
        const games = await gameModuleInstance.getRecentlyReviewedGames();
        return res.render("game/partials/recently-reviewed-games", {games});
    },

    searchGames: async(req, res) => {
        const { searchQuery } = req.body;
        const games = await gameModuleInstance.searchGames(searchQuery);
        return res.status(200).send(games)
    }
}