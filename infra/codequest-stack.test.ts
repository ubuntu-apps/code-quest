import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { describe, expect, it } from 'vitest'
import { CodeQuestStack } from './codequest-stack.ts'

const env = { account: '123456789012', region: 'us-east-1' }
const CERT = 'arn:aws:acm:us-east-1:123456789012:certificate/abc'

describe('CodeQuest stack', () => {
  const plain = Template.fromStack(new CodeQuestStack(new App(), 'Plain', { env }))

  it('keeps the bucket private and HTTPS-only', () => {
    plain.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: { BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true },
    })
    plain.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ DefaultCacheBehavior: Match.objectLike({ ViewerProtocolPolicy: 'redirect-to-https' }) }),
    })
  })

  it('sends the app page for addresses like /learn/python', () => {
    plain.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
        CustomErrorResponses: [
          Match.objectLike({ ErrorCode: 403, ResponseCode: 200, ResponsePagePath: '/index.html' }),
          Match.objectLike({ ErrorCode: 404, ResponseCode: 200, ResponsePagePath: '/index.html' }),
        ],
      }),
    })
  })

  it('answers on codequest.appfront.cc once it has a certificate', () => {
    const live = Template.fromStack(new CodeQuestStack(new App(), 'Live', { env, domainName: 'codequest.appfront.cc', certificateArn: CERT }))
    live.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: ['codequest.appfront.cc'],
        ViewerCertificate: Match.objectLike({ AcmCertificateArn: CERT, MinimumProtocolVersion: 'TLSv1.2_2021' }),
      }),
    })
    live.hasOutput('SiteUrl', { Value: 'https://codequest.appfront.cc' })
  })

  it('ignores a domain without a certificate', () => {
    const noCert = Template.fromStack(new CodeQuestStack(new App(), 'NoCert', { env, domainName: 'codequest.appfront.cc' }))
    expect(JSON.stringify(noCert.findResources('AWS::CloudFront::Distribution'))).not.toContain('Aliases')
  })
})
