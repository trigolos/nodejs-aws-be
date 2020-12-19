import express from 'express';
import dotenv from 'dotenv';
import { AxiosRequestConfig, Method } from 'axios';
dotenv.config();

import request from './request';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.all('*', async (req, res) => {
    console.log('OriginalUrl: ', req.originalUrl);
    console.log('Method: ', req.method);
    console.log('Body: ', req.body);

    const recipient = req.originalUrl.split('/')[1];
    console.log('Recipient: ', recipient);

    const recipientUrl = process.env[recipient];
    console.log('RecipientUrl: ', recipientUrl);

    if (recipientUrl) {
        const axiosConfig: AxiosRequestConfig = {
            method: req.method as Method,
            url: `${recipientUrl}${req.originalUrl}`,
            ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
        };

        console.log('axiosConfig: ', axiosConfig);

        try {
            const result = await request(axiosConfig);
            res.json(result);
        } catch (error) {
            console.log('Error from recipient: ', JSON.stringify(error));
            res.status(error.status).json(error.data);
        }
    } else {
        res.status(502).json({ error: 'Cannot process request' });
    }
});

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
