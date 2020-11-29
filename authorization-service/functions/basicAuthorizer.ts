import 'source-map-support/register';
import { APIGatewayAuthorizerHandler, APIGatewayAuthorizerResult } from 'aws-lambda';

// Built-in error messages that API Gateway auto-maps to HTTP status codes
export enum APIGatewayErrorMessage {
    Unauthorized = 'Unauthorized', // 401
    AccessDenied = 'Access Denied', // 403
}

export enum PolicyEffect {
    Deny = 'Deny',
    Allow = 'Allow',
}

function generatePolicy(
    principalId: string,
    resource: string | string[],
    effect: PolicyEffect,
): APIGatewayAuthorizerResult {
    return {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
}

function isValidCredentials(username: string, password: string) {
    const storedUserPassword = process.env[username];

    console.log('[storedUserPassword] ', storedUserPassword);

    return storedUserPassword && storedUserPassword === password;
}

export const basicAuthorizer: APIGatewayAuthorizerHandler = async (event, _context, _callback) => {
    console.log('[Event] basicAuthorizer: ', event);

    if (event.type !== 'TOKEN') {
        console.log('[Error] Event type is not TOKEN');
        throw new Error(APIGatewayErrorMessage.Unauthorized);
    }

    try {
        const { authorizationToken, methodArn } = event;
        const [authType, token] = authorizationToken.split(' ');

        console.log(`[AuthorizationToken] Type: ${authType}, Token: ${token}`);

        const buff = Buffer.from(token, 'base64');
        const [username, password] = buff.toString('utf-8').split(':');

        console.log(`Username: ${username}, Password: ${password}`);

        const effect = isValidCredentials(username, password) ? PolicyEffect.Allow : PolicyEffect.Deny;

        console.log('[Policy effect] ', effect);

        return generatePolicy(token, methodArn, effect);
    } catch (error) {
        console.log('[Error] ', error);
        throw new Error(APIGatewayErrorMessage.Unauthorized);
    }
};
