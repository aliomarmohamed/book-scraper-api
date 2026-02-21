import express from 'express';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const port = 3000;

// --- إعدادات Swagger ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Source Scraper API',
            version: '1.2.0',
            description: 'API لجلب البيانات من مصادر متعددة (كتب ومقولات)',
        },
        paths: {
            '/scrape/books': {
                get: {
                    summary: 'جلب كتب من Books to Scrape',
                    responses: { 200: { description: 'نجاح' } }
                }
            },
            '/scrape/quotes': {
                get: {
                    summary: 'جلب مقولات من Quotes to Scrape',
                    responses: { 200: { description: 'نجاح' } }
                }
            }
        }
    },
    apis: [],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 1. Endpoint للكتب
app.get('/scrape/books', async (req, res) => {
    try {
        const response = await fetch('http://books.toscrape.com');
        const body = await response.text();
        const $ = cheerio.load(body);
        const items = [];
        $('.product_pod').each((i, el) => {
            items.push({
                title: $(el).find('h3 a').attr('title'),
                price: $(el).find('.price_color').text().trim()
            });
        });
        res.json({ source: 'Books to Scrape', count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Endpoint للمقولات (الموقع الجديد)
app.get('/scrape/quotes', async (req, res) => {
    try {
        const response = await fetch('http://quotes.toscrape.com');
        const body = await response.text();
        const $ = cheerio.load(body);
        const quotes = [];

        $('.quote').each((i, el) => {
            quotes.push({
                text: $(el).find('.text').text().replace(/[“”]/g, ''),
                author: $(el).find('.author').text(),
                tags: $(el).find('.tags .tag').map((i, tag) => $(tag).text()).get()
            });
        });
        res.json({ source: 'Quotes to Scrape', count: quotes.length, data: quotes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});