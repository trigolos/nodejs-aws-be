import type { Serverless } from 'serverless/aws';
import { BUCKET_NAME, REGION } from './constants';

const serverlessConfiguration: Serverless = {
    service: {
        name: 'import-service',
        // app and org for use with dashboard.serverless.com
        // app: your-app-name,
        // org: your-org-name,
    },
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true,
        },
    },
    // Add the serverless-webpack plugin
    plugins: ['serverless-webpack'],
    provider: {
        name: 'aws',
        runtime: 'nodejs12.x',
        region: REGION,
        stage: 'dev',
        httpApi: {
            cors: true,
        },
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        },
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: 's3:ListBucket',
                Resource: `arn:aws:s3:::${BUCKET_NAME}`,
            },
            {
                Effect: 'Allow',
                Action: 's3:*',
                Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
            },
        ],
    },
    functions: {
        importProductsFile: {
            handler: 'handler.importProductsFile',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'import',
                        request: {
                            parameters: {
                                querystrings: {
                                    name: true,
                                },
                            },
                        },
                        cors: true,
                    },
                },
            ],
        },
    },
};

module.exports = serverlessConfiguration;
