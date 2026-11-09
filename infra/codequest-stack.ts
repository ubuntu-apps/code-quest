import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'

export interface CodeQuestStackProps extends StackProps {
  /** The site's own domain, e.g. "codequest.appfront.cc". Used only together with `certificateArn`. */
  domainName?: string
  /** An issued ACM certificate in us-east-1 that covers `domainName`. */
  certificateArn?: string
}

/**
 * CodeQuest's website: a private S3 bucket behind CloudFront. Only CloudFront can read the
 * bucket, and visitors always get HTTPS. Python and R come from their own CDNs, not from here.
 */
export class CodeQuestStack extends Stack {
  constructor(scope: Construct, id: string, props: CodeQuestStackProps = {}) {
    super(scope, id, props)

    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // The site is rebuilt from the repository, so it can go with the stack.
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // No Content-Security-Policy yet: Python and R run from CDNs as WebAssembly with their own
    // workers, and a policy must be tested against all of that before it is switched on.
    const securityHeaders = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        strictTransportSecurity: { override: true, accessControlMaxAge: Duration.days(365), includeSubdomains: false },
        contentTypeOptions: { override: true },
        frameOptions: { override: true, frameOption: cloudfront.HeadersFrameOption.DENY },
        referrerPolicy: { override: true, referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN },
      },
    })

    const domain = props.domainName && props.certificateArn ? props.domainName : undefined

    const distribution = new cloudfront.Distribution(this, 'Site', {
      comment: 'CodeQuest website',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: securityHeaders,
        compress: true,
      },
      defaultRootObject: 'index.html',
      // A single-page app: addresses like /learn/python load index.html.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: Duration.minutes(1),
      })),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      ...(domain && props.certificateArn
        ? {
            domainNames: [domain],
            certificate: acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn),
            minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
          }
        : {}),
    })

    new CfnOutput(this, 'SiteUrl', { value: domain ? `https://${domain}` : `https://${distribution.distributionDomainName}` })
    new CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName })
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new CfnOutput(this, 'DnsTarget', {
      description: 'Point the domain here (a CNAME record at the domain registrar).',
      value: distribution.distributionDomainName,
    })
  }
}
