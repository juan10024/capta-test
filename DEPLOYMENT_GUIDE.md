Deploying the API to AWS Lambda with CDK
Here is a step-by-step guide to get your Express.js application deployed as an AWS Lambda function, fronted by an API Gateway.

1. Prerequisites
Before you begin, ensure you have the following installed and configured:

Node.js & npm: Make sure you have a recent version of Node.js (v18.x or later).

AWS Account: You will need an AWS account with administrative privileges.

AWS CLI: Install the AWS CLI and configure it with your credentials by running aws configure.

AWS CDK Toolkit: Install the CDK globally by running:

npm install -g aws-cdk

2. Prepare Your Application for Lambda
AWS Lambda doesn't run a persistent server like a traditional Node.js application. Instead of app.listen(), you need to export a handler function that AWS can invoke. The serverless-http library is excellent for wrapping your existing Express app.

A. Install serverless-http:

In the root directory of your main project (not the /cdk directory), run:

npm install serverless-http

B. Create the Lambda Handler:

Create a new file named lambda.ts inside your src/ directory. This file will import your Express app, wrap it, and export the handler. I've created this file for you (src/lambda.ts).

C. Export Your Express App:

Your main application file (e.g., src/main.ts or src/index.ts) needs to export the app instance. Make sure it does not call app.listen() when in a Lambda environment.

Example modification in src/main.ts:

// ... all your express setup (routes, middleware, etc.)
import express from 'express';
export const app = express();

// ... app.use(...) routes etc.

// Remove or comment out app.listen()
// app.listen(port, () => { ... });

3. Update the CDK Stack
The provided CDK stack code is almost perfect. You just need to update the handler to point to the new lambda.ts file's handler function.

I've provided the updated working-days-api-stack.ts file with this change. The key modification is changing handler: 'main.handler' to handler: 'lambda.handler'.

You also must replace the placeholder YOUR_PRODUCTION_MONGO_URI with your actual MongoDB connection string. For a real project, use AWS Secrets Manager, but for this test, you can add it directly.

4. Build and Deploy
A. Build Your Project:

From the root directory of your project, run your build script. This will compile your TypeScript code into JavaScript in the /dist folder, which the CDK uses.

npm run build

B. Deploy with CDK:

Navigate into your CDK directory:

cd ./cdk

Install the CDK dependencies:

npm install

The first time you deploy a CDK app to an AWS environment (account/region), you need to run cdk bootstrap. This sets up the necessary resources for the CDK to operate.

cdk bootstrap

Finally, deploy your stack. The CDK will show you the changes to be made and ask for confirmation before proceeding.

cdk deploy

5. Test Your API
After the deployment is complete, the CDK will output the API Gateway endpoint URL. It will look something like this:

Outputs:
WorkingDaysApiStack.WorkingDaysEndpointEndpoint... = https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/

You can now use this URL to test your API just as you did locally. For example:

curl "https://capta-backend.onrender.com/api/v1/calculate-date?days=1&hours=4&date=2025-04-08T20:00:00Z"

6. Clean Up (Optional)
To avoid incurring AWS costs, you can destroy the entire stack once you are finished. From within the /cdk directory, run:

cdk destroy

This will remove all the resources created by the cdk deploy command.