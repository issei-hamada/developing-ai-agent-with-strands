# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AWS CDK TypeScript project that deploys infrastructure for a workshop environment. It creates multiple code-server instances (web-based VS Code) that participants can access via HTTPS on port 50443. The instances are pre-configured with AWS SAM CLI and other development tools.

## Key Commands

```bash
# Build the TypeScript code
npm run build

# Watch for changes and compile
npm run watch

# Run tests
npm run test

# CDK commands
npm run cdk synth              # Synthesize CloudFormation template
npm run cdk deploy             # Deploy stack
npm run cdk diff               # Compare with deployed stack
npm run cdk destroy            # Destroy stack

# Deploy with specific AWS profile
AWS_PROFILE=myprofile npm run cdk deploy
```

## Architecture Overview

The CDK stack creates:
- **25 EC2 instances** running code-server (web-based VS Code)
- **Shared VPC** with public subnets
- **Shared CloudFormation execution role** for SAM deployments
- **Individual resources per instance**:
  - Security group (port 50443 open to all, SSH restricted)
  - IAM role with permissions for SAM, CloudFormation, Lambda, ECR, S3, etc.
  - EC2 key pair stored in SSM Parameter Store
  - code-server password stored in SSM Parameter Store

### Key Constructs

1. **Vpc** (`lib/constructs/vpc.ts`): Creates the network infrastructure
2. **Instance** (`lib/constructs/instance.ts`): Creates individual EC2 instances with:
   - code-server installation via user data
   - IAM permissions for AWS SAM development
   - Security group configuration
3. **CfnExecutionRole** (`lib/constructs/cfn-execution-role.ts`): Shared IAM role for CloudFormation/SAM operations

### Configuration Files

- `lib/config/network.ts`: VPC configuration (CIDR, AZs, NAT gateways)
- `lib/config/instance.ts`: EC2 instance configuration (type, AMI, storage)
- `lib/userdata/codeServer.sh`: Bash script that installs code-server, Docker, AWS CLI, SAM CLI

### Instance Naming Convention

Instances are named `code-server-1` through `code-server-25`. Each instance has:
- Public IP accessible at `https://<IP>:50443`
- Password stored in SSM: `/workshop/code-server/<instance-id>/password`
- SSH key in SSM: `/ec2/keypair/<key-pair-id>`

## Important Implementation Details

- Uses IMDSv2 for EC2 metadata access in user data scripts
- Passwords are auto-generated and stored as SecureString in SSM
- All instances share a single CloudFormation execution role to simplify SAM deployments
- EC2 instances have PassRole permissions for any IAM role (required for SAM to create Lambda execution roles)
- Uses the new `KeyPair` construct instead of deprecated `CfnKeyPair`

## Testing Deployment

After deployment, retrieve instance details:
```bash
# Get code-server URL and password command from stack outputs
aws cloudformation describe-stacks --stack-name WorkshopStack --query 'Stacks[0].Outputs'

# Get password for specific instance
aws ssm get-parameter --name "/workshop/code-server/<instance-id>/password" --with-decryption --query Parameter.Value --output text
```