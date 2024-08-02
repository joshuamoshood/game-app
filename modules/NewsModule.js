const axios = require('axios');

class NewsModule {
    constructor() {
        // Initialize axios with a base URL and API key
        const apiKey = process.env.NEWS_API_KEY
        this.client = axios.create({
            baseURL: 'https://newsapi.org/v2/', // Base URL for the news API
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
    }

    // Method to get top headlines
    async getTopHeadlines(country = 'us', category = 'general') {
        try {
            const response = await this.client.get('top-headlines', {
                params: {
                    country: country,
                    category: category
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching top headlines:', error);
            throw error;
        }
    }

    // Method to search for news articles
    async searchNews(query, pageSize = 20) {
        try {
            const response = await this.client.get('everything', {
                params: {
                    q: query,
                    pageSize: pageSize
                }
            });
            return response.data.articles;
        } catch (error) {
            console.error('Error searching news:', error);
            throw error;
        }
    }

    // Method to get news sources
    async getSources() {
        try {
            const response = await this.client.get('sources');
            return response.data;
        } catch (error) {
            console.error('Error fetching news sources:', error);
            throw error;
        }
    }
}

module.exports = NewsModule;
