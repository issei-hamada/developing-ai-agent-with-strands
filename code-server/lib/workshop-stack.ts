import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './constructs/vpc';
import { Instance } from './constructs/codeServer';
import { RocketChat } from './constructs/rocketChat';
import { InstanceRole } from './constructs/instance-role';
import { AgentCoreExecutionRole } from './constructs/agentcore-execution-role';
import { AgentCoreDeploymentBucket } from './constructs/agentcore-deployment-bucket';

import { vpcConfig } from './config/network';
import { instanceConfig } from './config/instance';

export class WorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'VPC', vpcConfig);

    // ワークショップ用の共通IAMロールを作成
    const workshopRole = new InstanceRole(this, 'SharedWorkshopRole');

    // AgentCore用の実行ロールを作成
    const agentCoreRole = new AgentCoreExecutionRole(this, 'AgentCoreExecutionRole', {
      roleName: 'agentcore-execution-role',
      description: 'Role for Bedrock Agent Core with necessary permissions'
    });

    // AgentCore用のデプロイメントバケットを作成
    const deploymentBucket = new AgentCoreDeploymentBucket(this, 'AgentCoreDeploymentBucket', {
      bucketNamePrefix: 'agentcore-deployment-bucket',
      versioned: false,
      encrypted: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false
    });

    // 3台のcode-serverインスタンスを作成
    const instances: Instance[] = [];
    for (let i = 1; i <= 3; i++) {
      const instance = new Instance(this, `CodeServer${i}`, {
        vpc: vpc.vpc,
        config: {
          ...instanceConfig.CodeServer,
          instanceName: `code-server-${i}`
        },
        instanceRole: workshopRole.role
      });
      instances.push(instance);
    }

    // RocketChatインスタンスを作成
    // const rocketChat = new RocketChat(this, 'RocketChat', {
    //   vpc: vpc.vpc,
    //   config: instanceConfig.RocketChat,
    //   instanceRole: workshopRole.role
    // });
  }
}
