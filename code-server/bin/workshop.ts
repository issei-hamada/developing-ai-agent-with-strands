#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WorkshopStack } from '../lib/workshop-stack';

const app = new cdk.App();

// 環境設定
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new WorkshopStack(app, 'WorkshopStack', {
  env,
  description: 'the sandbox stack for a workshop.'
});