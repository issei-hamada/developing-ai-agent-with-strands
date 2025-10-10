# Code-Server Workshop Infrastructure

このディレクトリは、Strands Agents + AgentCore ワークショップ用の開発環境を構築するAWS CDKプロジェクトです。
ブラウザベースのVS Code（code-server）環境を複数台のEC2インスタンスにデプロイし、参加者が即座にハンズオンを開始できる環境を提供します。

EC2にアタッチするIAM権限を必要に応じて修正することで、様々なハンズオン環境として再利用可能です。

## 概要

このCDKスタックは以下のリソースを作成します：

- **10台のEC2インスタンス** - 各参加者用のcode-server環境（台数は`lib/workshop-stack.ts`で変更可能）
- **共有VPC** - パブリックサブネットを持つネットワーク環境（10.0.0.0/16、3 AZs）
- **共通IAMロール** - 全EC2インスタンスで共有するワークショップ用IAMロール
- **個別リソース** - 各インスタンス専用のセキュリティグループ、キーペア、パスワード（SSM保管）

## 前提条件

- Node.js 18.x以上
- AWS CLI設定済み
- AWS CDK 2.x (`npm install -g aws-cdk`)

## セットアップ

```bash
# 依存関係のインストール
npm install

# CDKブートストラップ（初回のみ）
cdk bootstrap
```

## デプロイ

```bash
# CFn テンプレート生成
cdk synth

# スタックのデプロイ
cdk deploy

# 特定のAWSプロファイルを使用する場合
cdk deploy --profile xxx
```

## インスタンスへのアクセス

デプロイ後、各インスタンスは以下の方法でアクセスできます：

1. **Code-Server URL**: `https://<インスタンスのパブリックIP>:50443`
2. **パスワードの取得**:
   ```bash
   aws ssm get-parameter \
     --name "/workshop/code-server/<instance-id>/password" \
     --with-decryption \
     --query Parameter.Value \
     --output text
   ```
3. **SSHキーの取得**:
   ```bash
   aws ssm get-parameter \
     --name "/ec2/keypair/<key-pair-id>" \
     --with-decryption \
     --query Parameter.Value \
     --output text > private-key.pem
   chmod 600 private-key.pem
   ```

## インスタンスの構成

各インスタンスには以下がプリインストールされています：

### 開発環境
- **code-server** - ブラウザベースのVS Code（ポート50443でHTTPS接続）
- **Python 3** - Python開発環境
- **uv** - 高速Pythonパッケージマネージャー（Strands Agents開発用）
- **Node.js & npm** - JavaScript/TypeScript開発環境

### AWSツール
- **AWS CLI v2** - AWS操作用コマンドラインツール
- **AWS SAM CLI** - サーバーレスアプリケーション開発ツール
- **Amazon Q Developer for CLI** - AI支援型CLIツール（`q login --use-device-flow`でログイン）

### コンテナ・その他
- **Docker** - コンテナ実行環境

## セキュリティ設定

### ネットワーク
- **ポート50443（HTTPS）**: 全IPアドレスからアクセス可能 - code-server用
- **ポート22（SSH）**: ホワイトリストIPからのみアクセス可能 - 管理用
- **ポート3000（HTTP）**: Rocket.Chat用（オプション、現在はコメントアウト）

### IAM権限
各EC2インスタンスには、以下の開発に必要な権限が付与されています：
- **Amazon Bedrock** - AIモデルへのアクセス（InvokeModel等）
- **AgentCore** - エージェントのデプロイと実行
- **SAM/CloudFormation** - サーバーレスアプリケーションのデプロイ
- **Lambda/ECR/S3** - アプリケーション実行に必要なリソース
- **SSM Parameter Store** - 設定情報の保存と取得
- **CodeBuild** - AgentCoreのビルドとデプロイ

権限の詳細は`lib/constructs/instance-role.ts`を参照してください。

## アーキテクチャ

```
WorkshopStack
├── VPC (10.0.0.0/16)
│   ├── Public Subnet 1 (AZ-a)
│   ├── Public Subnet 2 (AZ-b)
│   └── Public Subnet 3 (AZ-c)
│
├── Shared Workshop IAM Role
│   ├── Bedrock権限
│   ├── AgentCore権限
│   └── SAM/CloudFormation権限
│
└── EC2 Instances (×10) ※台数は変更可能
    ├── Instance (t3.medium、Amazon Linux 2023)
    ├── Security Group（個別）
    ├── Key Pair（SSMに保管）
    └── code-server Password（SSMに保管）
```

## カスタマイズ

### インスタンス数の変更

`lib/workshop-stack.ts`の以下の部分を編集：
```typescript
for (let i = 1; i <= 10; i++) {  // 10を希望の数に変更
```

### EC2に付与する権限の変更

`lib/constructs/instance-role.ts`を修正してIAMポリシーを追加・削除できます。
AgentCore以外のワークショップでこのテンプレートを再利用する場合は、必要な権限に合わせて調整してください。

### インスタンスタイプの変更
`lib/config/instance.ts`で設定：
```typescript
instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM)
```

### ネットワーク設定の変更
`lib/config/network.ts`で設定：
```typescript
vpcCidr: ec2.IpAddresses.cidr('10.0.0.0/16'),
maxAzs: 3,
natGateways: 0
```

## クリーンアップ

```bash
# スタックの削除
cdk destroy
```

## プロジェクト構成

```
code-server/
├── bin/
│   └── workshop.ts              # CDKアプリケーションのエントリポイント
├── lib/
│   ├── constructs/              # 再利用可能なCDK Construct
│   │   ├── vpc.ts              # VPC構築
│   │   ├── codeServer.ts       # code-serverインスタンス
│   │   ├── instance-role.ts    # IAMロール定義
│   │   └── rocketChat.ts       # Rocket.Chat（オプション）
│   ├── config/                  # 設定ファイル
│   │   ├── network.ts          # ネットワーク設定
│   │   └── instance.ts         # インスタンス設定
│   └── workshop-stack.ts        # メインスタック定義
├── package.json                 # npm依存関係
├── cdk.json                     # CDK設定
└── tsconfig.json                # TypeScript設定
```

## トラブルシューティング

### code-serverにアクセスできない
- セキュリティグループでポート50443が開放されているか確認
- インスタンスが起動完了しているか確認（user-dataの実行に数分かかります）

### パスワードが取得できない
- SSM Parameter Storeへのアクセス権限があるか確認
- インスタンスIDが正しいか確認

### Amazon Q Developer for CLI を使いたい
各インスタンスにプリインストール済みです。以下のコマンドでログインしてください：

```bash
q login --use-device-flow
```

`--use-device-flow`オプションを使用することで、ブラウザリダイレクトができない環境でもログイン可能です。

---

## 【オプション】Rocket.Chat の有効化

デフォルトでは、Rocket.Chat インスタンスはコメントアウトされています。
ワークショップでチャット機能が必要な場合は、以下の手順で有効化してください。

### 1. Rocket.Chat インスタンスの有効化

`lib/workshop-stack.ts`の以下の部分のコメントを解除：

```typescript
// RocketChatインスタンスを作成
const rocketChat = new RocketChat(this, 'RocketChat', {
  vpc: vpc.vpc,
  config: instanceConfig.RocketChat,
  instanceRole: workshopRole.role
});
```

### 2. 再デプロイ

```bash
cdk deploy
```

### 3. 初期セットアップ

#### 管理者アカウント作成

1. ブラウザで `http://[IPaddress]:3000` にアクセス
2. 初回アクセス時は「ワークスペースを起動しましょう」という画面が表示される
3. 管理者情報を入力:
   - 氏名
   - ユーザー名
   - メール
   - パスワード
4. 「次へ」をクリック
5. 確認メールが届くので、メール内の「Verify registration」ボタンをクリック
6. 管理者作成後、ログイン画面に遷移

#### 匿名アクセスの有効化

1. 管理者でログイン
2. 右上の三点リーダー(...)をクリック
3. **⚙ Workspace** を選択
4. 左側メニューの一番下にある **設定** をクリック
5. 検索バーに「**アカウント**」と入力して検索
6. 「アカウント」タブの **開く** をクリック
7. 以下の2つの設定をONにする:
   - **匿名の読み取りを許可**
   - **匿名の書き込みを許可**
8. 右下の **変更を保存** ボタンをクリック

### 4. 匿名ユーザーとしてアクセスする方法

#### 注意事項

管理者でログインしている場合、別タブでURLを開き直してもセッションが残っているため管理者画面に飛ばされます。

#### 匿名ユーザーでテストする方法

以下のいずれかの方法を使用:

1. **シークレットモード/プライベートブラウジング** で `http://[IPaddress]:3000` にアクセス
2. **別のブラウザ** (Edge、Google Chrome等) で `http://[IPaddress]:3000` にアクセス

#### URLについて

- 管理者も一般ユーザー(匿名ユーザー)も **同じURL** を使用: `http://[IPaddress]:3000`
- 管理者作成後はログイン画面に変わるが、匿名アクセスが有効な場合は認証なしでアクセス可能

---

## 関連ドキュメント

- **親プロジェクト**: [../README.md](../README.md) - Strands Agents + AgentCore ワークショップ全体の概要
- **ワークショップ手順**:
  - [../docs/01_Python開発環境の構築.md](../docs/01_Python開発環境の構築.md)
  - [../docs/02_StrandsAgentsを使ってAIエージェントを開発する.md](../docs/02_StrandsAgentsを使ってAIエージェントを開発する.md)
  - [../docs/03_AgentCoreを使ってAIエージェントをデプロイする.md](../docs/03_AgentCoreを使ってAIエージェントをデプロイする.md)
- **CDK開発者向け**: [CLAUDE.md](CLAUDE.md) - CDKコードの詳細なアーキテクチャ解説