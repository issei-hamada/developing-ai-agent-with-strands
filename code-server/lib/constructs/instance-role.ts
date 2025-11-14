import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface InstanceRoleProps {
  roleName?: string;
  description?: string;
}

export class InstanceRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props?: InstanceRoleProps) {
    super(scope, id);
    // ここからKMS権限までは固定(userdata内でパラメータストアを触っている為)
    // ワークショップ用のIAMロールを作成
    this.role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: props?.roleName ?? 'workshop-instance-role',
      description: props?.description ?? 'IAM role for workshop instances',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('BedrockAgentCoreFullAccess')
      ]
    });

    // SSM Parameter Store への書き込み権限を付与（code-serverパスワード保存用）
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ssm:PutParameter'],
      resources: [`arn:aws:ssm:*:${cdk.Stack.of(this).account}:parameter/workshop/code-server/*`]
    }));

    // KMS権限（SSM SecureStringパラメータ用）
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'kms:Decrypt',
        'kms:Encrypt',
        'kms:GenerateDataKey'
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'kms:ViaService': [`ssm.*.amazonaws.com`]
        }
      }
    }));
    // ここから下に、必要に応じて権限を追加する
    // Ex. Bedrock関連（AIエージェント構築ハンズオン用）
    this.role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModelWithResponseStream',
        'bedrock:InvokeModel'
      ],
      resources: ['*']
    }));

    // IAMロール管理権限（BedrockAgentCore用）
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'IAMRoleManagement',
      effect: iam.Effect.ALLOW,
      actions: [
        'iam:CreateRole',
        'iam:DeleteRole',
        'iam:GetRole',
        'iam:PutRolePolicy',
        'iam:DeleteRolePolicy',
        'iam:AttachRolePolicy',
        'iam:DetachRolePolicy',
        'iam:TagRole',
        'iam:ListRolePolicies',
        'iam:ListAttachedRolePolicies'
      ],
      resources: [
        'arn:aws:iam::*:role/*BedrockAgentCore*',
        'arn:aws:iam::*:role/service-role/*BedrockAgentCore*'
      ]
    }));

    // CodeBuildプロジェクトアクセス
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'CodeBuildProjectAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'codebuild:StartBuild',
        'codebuild:BatchGetBuilds',
        'codebuild:ListBuildsForProject',
        'codebuild:CreateProject',
        'codebuild:UpdateProject',
        'codebuild:BatchGetProjects'
      ],
      resources: [
        'arn:aws:codebuild:*:*:project/bedrock-agentcore-*',
        'arn:aws:codebuild:*:*:build/bedrock-agentcore-*'
      ]
    }));

    // CodeBuildリストアクセス
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'CodeBuildListAccess',
      effect: iam.Effect.ALLOW,
      actions: ['codebuild:ListProjects'],
      resources: ['*']
    }));

    // IAM PassRole権限
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'IAMPassRoleAccess',
      effect: iam.Effect.ALLOW,
      actions: ['iam:PassRole'],
      resources: [
        'arn:aws:iam::*:role/AmazonBedrockAgentCore*',
        'arn:aws:iam::*:role/service-role/AmazonBedrockAgentCore*'
      ]
    }));

    // CloudWatch Logsアクセス
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'CloudWatchLogsAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:GetLogEvents',
        'logs:DescribeLogGroups',
        'logs:DescribeLogStreams'
      ],
      resources: [
        'arn:aws:logs:*:*:log-group:/aws/bedrock-agentcore/*',
        'arn:aws:logs:*:*:log-group:/aws/codebuild/*'
      ]
    }));

    // S3アクセス
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'S3Access',
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucketVersions',
        's3:ListBucket',
        's3:CreateBucket',
        's3:PutLifecycleConfiguration'
      ],
      resources: [
        'arn:aws:s3:::bedrock-agentcore-*',
        'arn:aws:s3:::bedrock-agentcore-*/*'
      ]
    }));

    // ECRリポジトリアクセス
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'ECRRepositoryAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'ecr:CreateRepository',
        'ecr:DescribeRepositories',
        'ecr:GetRepositoryPolicy',
        'ecr:InitiateLayerUpload',
        'ecr:CompleteLayerUpload',
        'ecr:PutImage',
        'ecr:UploadLayerPart',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchGetImage',
        'ecr:ListImages',
        'ecr:TagResource'
      ],
      resources: ['arn:aws:ecr:*:*:repository/bedrock-agentcore-*']
    }));

    // ECR認証トークン取得
    this.role.addToPolicy(new iam.PolicyStatement({
      sid: 'ECRAuthorizationAccess',
      effect: iam.Effect.ALLOW,
      actions: ['ecr:GetAuthorizationToken'],
      resources: ['*']
    }));
  }
}
