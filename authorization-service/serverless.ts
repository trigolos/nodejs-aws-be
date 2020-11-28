import type { AWS } from '@serverless/typescript';
import { REGION } from './constants';

const serverlessConfiguration: AWS = {
    service: 'authorization-service',
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true,
        },
    },
    plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        },
    },
    functions: {
        basicAuthorizer: {
            handler: 'handler.basicAuthorizer',
        },
    },
};

module.exports = serverlessConfiguration;
