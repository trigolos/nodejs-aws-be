import express from 'express';
import dotenv from 'dotenv';
import axios, { AxiosRequestConfig, Method } from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.all('*', (req, res) => {
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

        axios(axiosConfig)
            .then((response) => {
                console.log('Response from recipient: ', response.data);
                res.json(response.data);
            })
            .catch((error) => {
                console.log('Error from recipient: ', JSON.stringify(error));
                if (error.response) {
                    const { status, data } = error.response;
                    res.status(status).json(data);
                } else {
                    res.status(500).json({ error: error.message });
                }
            });
    } else {
        res.status(502).json({ error: 'Cannot process request' });
    }
});

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
