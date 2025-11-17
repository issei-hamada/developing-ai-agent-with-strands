import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface AgentCoreDeploymentBucketProps {
  /**
   * Custom bucket name prefix. If not provided, defaults to 'agentcore-deployment-bucket'
   * The final bucket name will be: {bucketNamePrefix}-{accountId}
   */
  bucketNamePrefix?: string;

  /**
   * Whether to enable versioning on the bucket
   * @default false
   */
  versioned?: boolean;

  /**
   * Whether to enable encryption on the bucket
   * @default true
   */
  encrypted?: boolean;

  /**
   * Lifecycle rules for automatic cleanup of old objects
   * @default undefined
   */
  lifecycleRules?: s3.LifecycleRule[];

  /**
   * Whether to remove the bucket when the stack is deleted
   * @default RETAIN (bucket is kept)
   */
  removalPolicy?: cdk.RemovalPolicy;

  /**
   * Whether to automatically delete objects when the bucket is removed
   * @default false
   */
  autoDeleteObjects?: boolean;
}

/**
 * CDK Construct for AgentCore Deployment S3 Bucket
 *
 * This construct creates an S3 bucket for storing AgentCore deployment artifacts.
 * The bucket name follows the pattern: agentcore-deployment-bucket-{accountId}
 */
export class AgentCoreDeploymentBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: AgentCoreDeploymentBucketProps) {
    super(scope, id);

    const accountId = cdk.Stack.of(this).account;
    const bucketNamePrefix = props?.bucketNamePrefix ?? 'bedrock-agentcore-deployment-bucket';
    const bucketName = `${bucketNamePrefix}-${accountId}`;

    // Create the S3 bucket
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: bucketName,
      versioned: props?.versioned ?? false,
      encryption: props?.encrypted !== false
        ? s3.BucketEncryption.S3_MANAGED
        : s3.BucketEncryption.UNENCRYPTED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: props?.removalPolicy ?? cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props?.autoDeleteObjects ?? false,
      lifecycleRules: props?.lifecycleRules,
      enforceSSL: true, // Require SSL/TLS for all requests
    });

    // Add tags for better resource management
    cdk.Tags.of(this.bucket).add('Purpose', 'AgentCore Deployment');
    cdk.Tags.of(this.bucket).add('ManagedBy', 'CDK');

    // Output the bucket name and ARN
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'AgentCore deployment S3 bucket name',
      exportName: 'AgentCoreDeploymentBucketName'
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.bucket.bucketArn,
      description: 'AgentCore deployment S3 bucket ARN',
      exportName: 'AgentCoreDeploymentBucketArn'
    });
  }
}
