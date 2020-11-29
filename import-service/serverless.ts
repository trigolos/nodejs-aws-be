import type { Serverless } from 'serverless/aws';
import { BUCKET_NAME, REGION } from './constants';
import { ApiGateway } from 'serverless/plugins/aws/provider/awsProvider';

const serverlessConfiguration: Serverless = {
    service: 'import-service',
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
            shouldStartNameWithService: true,
        } as ApiGateway,
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            CATALOG_SQS_URL: '${cf.${self:provider.region}:product-service-${self:provider.stage}.SQSQueueUrl}',
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
            {
                Effect: 'Allow',
                Action: 'sqs:*',
                Resource: '${cf.${self:provider.region}:product-service-${self:provider.stage}.SQSQueueArn}',
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
                        authorizer: {
                            name: 'tokenAuthorizer',
                            arn:
                                '${cf.${self:provider.region}:authorization-service-${self:provider.stage}.BasicAuthorizerArn}',
                            resultTtlInSeconds: 0,
                            identitySource: 'method.request.header.Authorization',
                            type: 'token',
                        },
                        cors: true,
                        request: {
                            parameters: {
                                querystrings: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            ],
        },
        importFileParser: {
            handler: 'handler.importFileParser',
            events: [
                {
                    s3: {
                        event: 's3:ObjectCreated:*',
                        bucket: BUCKET_NAME,
                        rules: [
                            {
                                prefix: 'uploaded/',
                                suffix: '.csv',
                            },
                        ],
                        existing: true,
                    },
                },
            ],
        },
    },
    resources: {
        Resources: {
            GatewayResponseDenied: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
                    },
                    ResponseType: 'ACCESS_DENIED',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi',
                    },
                },
            },
            GatewayResponseUnauthorized: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
                    },
                    ResponseType: 'UNAUTHORIZED',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi',
                    },
                },
            },
            GatewayResponseDefault4XX: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
                    },
                    ResponseType: 'DEFAULT_4XX',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi',
                    },
                },
            },
            GatewayResponseDefault5XX: {
                Type: 'AWS::ApiGateway::GatewayResponse',
                Properties: {
                    ResponseParameters: {
                        'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
                        'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
                    },
                    ResponseType: 'DEFAULT_5XX',
                    RestApiId: {
                        Ref: 'ApiGatewayRestApi',
                    },
                },
            },
        },
    },
};

module.exports = serverlessConfiguration;
