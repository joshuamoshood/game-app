const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');
const Cache = require('file-system-cache').default;
const cache = Cache({ basePath: './cache', ns: 'my-app' });

class GameModule {
    async getAuthorizationToken() {
        let token = await cache.get('authorizationToken');
        if (!token) {
            const response = await axios.post('https://id.twitch.tv/oauth2/token', {
                client_id: process.env.IGDB_CLIENT_ID,
                client_secret: process.env.IGDB_CLIENT_SECRET,
                grant_type: 'client_credentials'
            });
            token = response.data;
            await cache.set('authorizationToken', token);
        }
        return token;
    }

    async callApi(body) {
        const token = await this.getAuthorizationToken();
        const clientId = process.env.IGDB_CLIENT_ID;

        const response = await axios.post('https://api.igdb.com/v4/games', body, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token.access_token}`,
                'Content-Type': 'text/plain'
            }
        });

        return response.data;
    }

    async getPopularGames() {
        const before = moment().subtract(12, 'months').unix();
        const after = moment().add(1, 'months').unix();

        const body = `
            fields name, slug, rating, total_rating, total_rating_count, follows, game_engines.name, genres.name, storyline, summary, cover.url, first_release_date, platforms.abbreviation;
            sort rating desc;
            where rating != null
            & platforms = (48,49,130,6,9,167)
            & (
                first_release_date >= ${before}
                & first_release_date <= ${after}
            );
            limit 12;
        `;

        const popularGames = await this.callApi(body);
        return this.formatGamesData(popularGames);
    }

    async getRecentlyReviewedGames() {
        const before = moment().subtract(4, 'months').unix();
        const current = moment().unix();

        const body = `
            fields name, slug, rating, rating_count, total_rating, total_rating_count, game_engines.name, genres.name, storyline, summary, cover.url, first_release_date, platforms.abbreviation;
            sort total_rating_count desc;
            where rating != null
            & platforms = (48,49,130,6,9,167)
            & (
                first_release_date >= ${before}
                & first_release_date <= ${current}
            )
            & rating_count > 5;
            limit 5;
        `;

        const recentlyReviewedGames = await this.callApi(body);
        return recentlyReviewedGames;
    }

    async getComingSoonGames() {
        const after = moment().add(4, 'months').unix();
        const current = moment().unix();

        const body = `
            fields name, slug, rating, rating_count, total_rating, total_rating_count, hypes, game_engines.name, genres.name, storyline, summary, cover.url, first_release_date, platforms.abbreviation;
            sort hypes desc;
            where cover != null 
            & hypes != null
            & platforms = (48,49,130,6,9,167)
            & (
                first_release_date >= ${current}
                & first_release_date <= ${after}
            );
            limit 5;
        `;

        const comingSoonGames = await this.callApi(body);
        return comingSoonGames;
    }

    async getMostAnticipatedGames() {
        const after = moment().add(12, 'months').unix();
        const current = moment().unix();

        const body = `
            fields name, slug, rating, rating_count, total_rating, total_rating_count, hypes, game_engines.name, genres.name, storyline, summary, cover.url, first_release_date, platforms.abbreviation;
            sort hypes desc;
            where cover != null & hypes != null
            & platforms = (48,49,130,6,9,167)
            & (
                first_release_date >= ${current}
                & first_release_date <= ${after}
            );
            limit 5;
        `;

        const mostAnticipatedGames = await this.callApi(body);
        return mostAnticipatedGames;
    }

    async getGameBySlug(slug) {
        const body = `
            fields name, slug, rating, rating_count, total_rating, aggregated_rating, total_rating_count, hypes, game_engines.name, genres.name, storyline, summary, cover.url, first_release_date, platforms.abbreviation, similar_games.name,similar_games.slug, similar_games.cover.url, similar_games.rating, similar_games.platforms.abbreviation, websites.*, videos.*, involved_companies.company.name, screenshots.url;
            where slug = "${slug}";
        `;

        const data = await this.callApi(body);
        if (_.isEmpty(data)) {
            throw new Error('Game not found');
        }
        let [game] = data;
        game.videos = _.map(game.videos, video => ({
            name: _.snakeCase(video.name),
            video_id: video.video_id
        }));
        game.videos = _.keyBy(game.videos, 'name');
        game.similar_games = this.formatGamesData(game.similar_games);
        game.platforms_string = _.join(_.map(game.platforms, 'abbreviation'), ' · ');
        game.screenshots = _.map(game.screenshots, screenshot => ({
            big: screenshot.url.replace('thumb', 'screenshot_big'),
            huge: screenshot.url.replace('thumb', 'screenshot_huge')
        }));
        game.links = {
            website: game.websites[0],
            facebook: _.find(game.websites, website => _.includes(website.url, 'facebook')),
            instagram: _.find(game.websites, website => _.includes(website.url, 'instagram')),
            twitter: _.find(game.websites, website => _.includes(website.url, 'twitter'))
        };

        return game;
    }

    async searchGames(query) {
        const body = `
            search "${query}";
            fields name, game.slug, game.cover.url;
            where game.cover != null;
        `;

        const token = await this.getAuthorizationToken();
        const clientId = process.env.IGDB_CLIENT_ID;

        const response = await axios.post('https://api.igdb.com/v4/search', body, {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token.access_token}`,
                'Content-Type': 'text/plain'
            }
        });

        let results = response.data;
        if (_.isArray(results) && results.length) {
            results = _.map(results, result => ({
                name: result.name,
                slug: result.game.slug,
                thumbnail: result.game.cover.url
            }));
        } else {
            results = [];
        }

        return results;
    }

    formatGamesData(games) {
        return _.map(games, game => ({
            ...game,
            cover_image_url: game.cover ? game.cover.url.replace('thumb', 'cover_big') : '',
            platforms_string: game.platforms ? _.join(_.map(game.platforms, 'abbreviation'), ', ') : '',
            rating: game.rating || 0
        }));
    }
}

module.exports = GameModule;
