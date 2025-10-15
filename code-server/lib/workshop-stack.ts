import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './constructs/vpc';
import { Instance } from './constructs/codeServer';
import { RocketChat } from './constructs/rocketChat';
import { InstanceRole } from './constructs/instance-role';

import { vpcConfig } from './config/network';
import { instanceConfig } from './config/instance';

export class WorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'VPC', vpcConfig);

    // ワークショップ用の共通IAMロールを作成
    const workshopRole = new InstanceRole(this, 'SharedWorkshopRole');

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
