import type { Serverless } from 'serverless/aws';
import { ApiGateway } from 'serverless/plugins/aws/provider/awsProvider';
import { REGION } from './constants';

const serverlessConfiguration: Serverless = {
    service: 'product-service',
    frameworkVersion: '2',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true,
        },
    },
    // Add the serverless-webpack plugin
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
        } as ApiGateway,
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            PG_HOST: process.env.PG_HOST,
            PG_PORT: process.env.PG_PORT,
            PG_DATABASE: process.env.PG_DATABASE,
            PG_USERNAME: process.env.PG_USERNAME,
            PG_PASSWORD: process.env.PG_PASSWORD,
            SNS_ARN: { Ref: 'SNSTopic' },
            SNS_SUBSCRIPTION_ENDPOINT: process.env.SNS_SUBSCRIPTION_ENDPOINT,
            SNS_SUBSCRIPTION_EMPTY_DESCRIPTION_ENDPOINT: process.env.SNS_SUBSCRIPTION_EMPTY_DESCRIPTION_ENDPOINT,
        },
        iamRoleStatements: [
            {
                Effect: 'Allow',
                Action: 'sqs:*',
                Resource: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
            },
            {
                Effect: 'Allow',
                Action: 'sns:*',
                Resource: { Ref: 'SNSTopic' },
            },
        ],
    },
    resources: {
        Resources: {
            SQSQueue: {
                Type: 'AWS::SQS::Queue',
                Properties: {
                    QueueName: 'catalogItemsQueue',
                },
            },
            SNSTopic: {
                Type: 'AWS::SNS::Topic',
                Properties: {
                    TopicName: 'createProductTopic',
                },
            },
            SNSSubscription: {
                Type: 'AWS::SNS::Subscription',
                Properties: {
                    Endpoint: '${env:SNS_SUBSCRIPTION_ENDPOINT}',
                    Protocol: 'email',
                    TopicArn: {
                        Ref: 'SNSTopic',
                    },
                    FilterPolicy: {
                        emptyDescription: ['false'],
                    },
                },
            },
            SNSSubscriptionWithEmptyDescription: {
                Type: 'AWS::SNS::Subscription',
                Properties: {
                    Endpoint: '${env:SNS_SUBSCRIPTION_EMPTY_DESCRIPTION_ENDPOINT}',
                    Protocol: 'email',
                    TopicArn: {
                        Ref: 'SNSTopic',
                    },
                    FilterPolicy: {
                        emptyDescription: ['true'],
                    },
                },
            },
        },
        Outputs: {
            SQSQueueArn: {
                Value: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
            },
            SQSQueueUrl: {
                Value: { Ref: 'SQSQueue' },
            },
        },
    },
    functions: {
        getProductsList: {
            handler: 'handler.getProductsList',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'products',
                    },
                },
            ],
        },
        getProductById: {
            handler: 'handler.getProductById',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'products/{productId}',
                        request: {
                            parameters: {
                                paths: {
                                    productId: true,
                                },
                            },
                        },
                    },
                },
            ],
        },
        createProduct: {
            handler: 'handler.createProduct',
            events: [
                {
                    http: {
                        method: 'post',
                        path: 'products',
                    },
                },
            ],
        },
        catalogBatchProcess: {
            handler: 'handler.catalogBatchProcess',
            events: [
                {
                    sqs: {
                        batchSize: 5,
                        arn: { 'Fn::GetAtt': ['SQSQueue', 'Arn'] },
                    },
                },
            ],
        },
    },
};

module.exports = serverlessConfiguration;
