import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface AgentCoreExecutionRoleProps {
  roleName?: string;
  description?: string;
}

/**
 * CDK Construct for Bedrock AgentCore Execution Role
 *
 * This construct creates an IAM role and managed policy for Bedrock AgentCore
 * with permissions for ECR, CloudWatch Logs, X-Ray, CloudWatch Metrics, and Bedrock.
 *
 * Converted from CloudFormation template: lib/constructs/template.yaml
 */
export class AgentCoreExecutionRole extends Construct {
  public readonly role: iam.Role;
  public readonly policy: iam.ManagedPolicy;

  constructor(scope: Construct, id: string, props?: AgentCoreExecutionRoleProps) {
    super(scope, id);

    const accountId = cdk.Stack.of(this).account;

    // Create the managed policy
    this.policy = new iam.ManagedPolicy(this, 'AgentCoreExecutionPolicy', {
      description: 'Policy for Bedrock Agent Core with ECR, Logs, X-Ray, CloudWatch, and Bedrock permissions',
      statements: [
        // ECR Image Access
        new iam.PolicyStatement({
          sid: 'ECRImageAccess',
          effect: iam.Effect.ALLOW,
          actions: [
            'ecr:BatchGetImage',
            'ecr:GetDownloadUrlForLayer'
          ],
          resources: [
            `arn:aws:ecr:*:${accountId}:repository/*`
          ]
        }),

        // CloudWatch Logs - Describe Log Streams and Create Log Group
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:DescribeLogStreams',
            'logs:CreateLogGroup'
          ],
          resources: [
            `arn:aws:logs:*:${accountId}:log-group:/aws/bedrock-agentcore/runtimes/*`
          ]
        }),

        // CloudWatch Logs - Describe Log Groups
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:DescribeLogGroups'
          ],
          resources: [
            `arn:aws:logs:*:${accountId}:log-group:*`
          ]
        }),

        // CloudWatch Logs - Create Log Stream and Put Log Events
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          resources: [
            `arn:aws:logs:*:${accountId}:log-group:/aws/bedrock-agentcore/runtimes/*:log-stream:*`
          ]
        }),

        // ECR Token Access
        new iam.PolicyStatement({
          sid: 'ECRTokenAccess',
          effect: iam.Effect.ALLOW,
          actions: [
            'ecr:GetAuthorizationToken'
          ],
          resources: ['*']
        }),

        // X-Ray
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'xray:PutTraceSegments',
            'xray:PutTelemetryRecords',
            'xray:GetSamplingRules',
            'xray:GetSamplingTargets'
          ],
          resources: ['*']
        }),

        // CloudWatch Metrics
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['cloudwatch:PutMetricData'],
          resources: ['*'],
          conditions: {
            StringEquals: {
              'cloudwatch:namespace': 'bedrock-agentcore'
            }
          }
        }),

        // Get Agent Access Token
        new iam.PolicyStatement({
          sid: 'GetAgentAccessToken',
          effect: iam.Effect.ALLOW,
          actions: [
            'bedrock-agentcore:GetWorkloadAccessToken',
            'bedrock-agentcore:GetWorkloadAccessTokenForJWT',
            'bedrock-agentcore:GetWorkloadAccessTokenForUserId'
          ],
          resources: [
            `arn:aws:bedrock-agentcore:*:${accountId}:workload-identity-directory/default`,
            `arn:aws:bedrock-agentcore:*:${accountId}:workload-identity-directory/default/workload-identity/*`
          ]
        }),

        // Bedrock Model Invocation
        new iam.PolicyStatement({
          sid: 'BedrockModelInvocation',
          effect: iam.Effect.ALLOW,
          actions: [
            'bedrock:InvokeModel',
            'bedrock:InvokeModelWithResponseStream'
          ],
          resources: [
            'arn:aws:bedrock:*::foundation-model/*',
            `arn:aws:bedrock:*:${accountId}:*`
          ]
        })
      ]
    });

    // Create the IAM role
    this.role = new iam.Role(this, 'AgentCoreExecutionRole', {
      roleName: props?.roleName ?? 'agentcore-execution-role',
      description: props?.description ?? 'Role for Bedrock Agent Core with necessary permissions',
      assumedBy: new iam.ServicePrincipal('bedrock-agentcore.amazonaws.com', {
        conditions: {
          StringEquals: {
            'aws:SourceAccount': accountId
          },
          ArnLike: {
            'aws:SourceArn': `arn:aws:bedrock-agentcore:*:${accountId}:*`
          }
        }
      }),
      managedPolicies: [this.policy]
    });
  }
}
