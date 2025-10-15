import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface VpcConfig {
  vpc:{
    vpcName: string;
    vpcCidr: ec2.IIpAddresses;
    maxAzs: number;
    natGateways: number;
  }
}

export const vpcConfig: VpcConfig = {
  vpc: {
    vpcName: 'handson-vpc',
    vpcCidr: ec2.IpAddresses.cidr('10.0.0.0/16'),
    maxAzs: 3,
    natGateways: 0
  }
};
