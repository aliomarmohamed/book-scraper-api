import express from 'express';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();

app.get('/', (req, res) => {
    res.send('Book Scraper API is Live! Use /books to get data.');
});

app.get('/books', async (req, res) => {
    try {
        const response = await fetch('');
        const body = await response.text();
        const $ = cheerio.load(body);
        const books = [];

        $('.product_pod').each((i, el) => {
            books.push({
                title: $(el).find('h3 a').attr('title'),
                price: $(el).find('.price_color').text(),
            });
        });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

export default app;