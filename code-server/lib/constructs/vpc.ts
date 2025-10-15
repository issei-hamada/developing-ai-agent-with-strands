import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import type { VpcConfig } from '../config/network';

export class Vpc extends Construct {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: VpcConfig) {
    super(scope, id);

    // L2 VPCコンストラクトを使用
    this.vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: props.vpc.vpcName,
      ipAddresses: props.vpc.vpcCidr || '10.0.0.0/16',
      maxAzs: props.vpc.maxAzs,
      natGateways: props.vpc.natGateways
    });
  }
}