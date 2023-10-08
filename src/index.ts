// @ts-ignore
import * as core from '@aws/codecatalyst-adk-core';
// @ts-ignore
import * as project from '@aws/codecatalyst-project';
// @ts-ignore
import * as runSummaries from '@aws/codecatalyst-run-summaries';
// @ts-ignore
import * as space from '@aws/codecatalyst-space';

import {
    BedrockRuntimeClient,
    InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const changes = process.env.DIFF || 'No changes detected'; 

const generatePrompt = (code: string) => {
    return `\n\nHuman: Review this code: ${code}\n\nAssistant:`;
};

const client = new BedrockRuntimeClient({ region: 'us-west-2' });

const input = {
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: '*/*',
    body: JSON.stringify({
        prompt: generatePrompt(changes),
        max_tokens_to_sample: 300,
        temperature: 0.5,
        top_k: 250,
        top_p: 1,
        stop_sequences: ['\\n\\nHuman:'],
    }),
};

const readStream = async (stream: AsyncIterable<any>): Promise<string> => {
    let data = '';
    for await (const chunk of stream) {
        if (chunk && chunk.chunk && chunk.chunk.bytes) {
            data += String.fromCharCode(...chunk.chunk.bytes);
        }
    }
    return data;
};

(async () => {
    try {
        const command = new InvokeModelWithResponseStreamCommand(input);
        const response = await client.send(command);

        if (response.body) {
            // Read the body stream
            const responseBody = await readStream(response.body);
            console.log('Raw Response Body:', responseBody);

            // Split the response by '}{' to handle concatenated JSON strings
            const jsonStrings = responseBody.split('}{').map((str, index, array) => {
                if (index === 0) return str + '}';
                if (index === array.length - 1) return '{' + str;
                return '{' + str + '}';
            });

            jsonStrings.forEach(jsonStr => {
                try {
                    const parsedResponse = JSON.parse(jsonStr);
                    console.log('Parsed Response:', parsedResponse);
                } catch (parseError) {
                    console.error('Error parsing JSON string:', jsonStr, 'Error:', parseError);
                }
            });
        } else {
            console.error('Response body is undefined');
        }
    } catch (error) {
        console.error(error);
        core.setFailed(`Action Failed, reason: ${error}`);
    }
})().catch(error => {
    console.error('Unhandled error:', error);
});
