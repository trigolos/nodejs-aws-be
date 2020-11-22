import { S3Handler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as csv from 'csv-parser';
import { BUCKET_NAME, REGION } from '../constants';

export const importFileParser: S3Handler = async (event) => {
    console.log('[Event] importFileParser: ', event);

    try {
        const s3 = new AWS.S3({ region: REGION, signatureVersion: 'v4' });
        const sqs = new AWS.SQS();

        for (const record of event.Records) {
            const s3ObjectParams = {
                Bucket: BUCKET_NAME,
                Key: record.s3.object.key,
            };
            const s3Stream = s3.getObject(s3ObjectParams).createReadStream();

            await new Promise((resolve, reject) => {
                s3Stream
                    .pipe(csv())
                    .on('data', async (data) => {
                        try {
                            await sqs
                                .sendMessage({
                                    QueueUrl: process.env.CATALOG_SQS_URL,
                                    MessageBody: JSON.stringify(data),
                                })
                                .promise();
                        } catch (e) {
                            console.log('[Error] SQS sendMessage error: ', e.message);
                            reject(e);
                        }

                        console.log('[Data] record: ', data);
                    })
                    .on('end', async () => {
                        const copySource = `${BUCKET_NAME}/${record.s3.object.key}`;
                        const copyTargetKey = record.s3.object.key.replace('uploaded', 'parsed');
                        const copyTarget = `${BUCKET_NAME}/${copyTargetKey}`;

                        console.log('[Copy] From source: ', copySource);

                        await s3
                            .copyObject({
                                Bucket: BUCKET_NAME,
                                CopySource: copySource,
                                Key: copyTargetKey,
                            })
                            .promise();

                        console.log('[Copied] To: ', copyTarget);

                        await s3.deleteObject(s3ObjectParams).promise();

                        console.log('[Deleted] Record: ', copySource);

                        resolve();
                    })
                    .on('error', (e) => {
                        console.log('[Error] Parse error: ', e.message);
                        reject(e);
                    });
            });
        }
    } catch (e) {
        console.log('[Error] importFileParser: ', e.message);

        throw e;
    }
};
