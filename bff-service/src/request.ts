import axios, { AxiosRequestConfig } from 'axios';
import memoryCache, { CacheClass } from 'memory-cache';

const memCache: CacheClass<string, string> = new memoryCache.Cache();
const memCacheDuration = 2 * 60 * 1000; // 2 minutes

const cachedResponses = {
    [`${process.env.products}/products`]: 'GET',
};

async function request(requestConfig: AxiosRequestConfig) {
    try {
        const cacheKey = `${requestConfig.method}:${requestConfig.url}`;
        const cacheBody = memCache.get(cacheKey);
        if (cacheBody) {
            return cacheBody;
        } else {
            const response = await axios(requestConfig);
            const cachedMethod = requestConfig.url && cachedResponses[requestConfig.url];

            if (cachedMethod === requestConfig.method) {
                memCache.put(cacheKey, response.data, memCacheDuration);
            }

            return response.data;
        }
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            throw { status, data };
        } else {
            throw { status: 500, data: { error: error.message } };
        }
    }
}

export default request;
