#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib'
import { CodeQuestStack } from './codequest-stack.ts'

const app = new App()

// Saved in cdk.json, or passed as `-c name=value`.
const domainName: unknown = app.node.tryGetContext('domainName')
const certificateArn: unknown = app.node.tryGetContext('certificateArn')

const stack = new CodeQuestStack(app, 'CodeQuest', {
  description: 'CodeQuest: learn to code through quests',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // CloudFront only accepts certificates from us-east-1, so everything lives there.
    region: 'us-east-1',
  },
  ...(typeof domainName === 'string' && domainName ? { domainName } : {}),
  ...(typeof certificateArn === 'string' && certificateArn ? { certificateArn } : {}),
})

Tags.of(stack).add('project', 'codequest')
