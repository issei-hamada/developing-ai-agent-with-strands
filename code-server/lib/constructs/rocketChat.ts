import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';
import type { InstanceConfig } from '../config/instance';

import { Construct } from 'constructs';

export interface RocketChatProps {
  vpc: ec2.IVpc;
  config: InstanceConfig;
  instanceRole: iam.IRole;
}

export class RocketChat extends Construct {
  public readonly instance: ec2.Instance;
  public readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RocketChatProps) {
    super(scope, id);

    // セキュリティグループの作成
    this.securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for RocketChat instance',
      allowAllOutbound: true
    });

    // 3000ポートを全体に開放
    this.securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow access to RocketChat'
    );

    // KeyPairの作成
    const keyPair = new ec2.KeyPair(this, 'KeyPair', {
      keyPairName: props.config.instanceName,
      type: ec2.KeyPairType.RSA,
      format: ec2.KeyPairFormat.PEM
    });
    keyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // KeyPairにタグを追加
    cdk.Tags.of(keyPair).add('Name', props.config.instanceName);
    cdk.Tags.of(keyPair).add('CreatedBy', 'CDK');

    // EC2インスタンスの作成（パブリックサブネットに配置）
    this.instance = new ec2.Instance(this, 'Instance', {
      vpc: props.vpc,
      instanceType: props.config.instanceType,
      machineImage: props.config.machineImage,
      securityGroup: this.securityGroup,
      keyPair: keyPair,
      role: props.instanceRole,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      blockDevices: props.config.blockDevices,
      associatePublicIpAddress: true
    });

    // ユーザデータのロード
    if (props.config.userDataPath) {
      const userDataScript = fs.readFileSync(props.config.userDataPath, 'utf8');
      this.instance.addUserData(userDataScript);
    }

    // インスタンスにタグを付ける
    cdk.Tags.of(this.instance).add('Name', props.config.instanceName);

    // 出力
    new cdk.CfnOutput(this, 'InstancePublicIP', {
      value: this.instance.instancePublicIp,
      description: 'Public IP address of the RocketChat instance'
    });

    new cdk.CfnOutput(this, 'RocketChatURL', {
      value: `http://${this.instance.instancePublicIp}:3000`,
      description: 'URL to access RocketChat'
    });

    new cdk.CfnOutput(this, 'instanceRoleArn', {
      value: props.instanceRole.roleArn,
      description: 'ARN of the CloudFormation execution role for SAM'
    });
  }
}
