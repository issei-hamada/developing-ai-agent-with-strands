# developing-ai-agent-with-strands

AgentCore と Strands Agents を使って AI エージェントを作成するワークショップ用リポジトリです。

このリポジトリには、ワークショップを円滑に実施するための2つの主要コンテンツが含まれています：

## 📋 対象者別ガイド

### ワークショップ企画者向け

ワークショップを開催する方は、参加者が即座にハンズオンを開始できるよう、事前に開発環境を準備する必要があります。

**code-server 環境（AWS CDK）** を使用することで、以下が可能になります：

- **必要なIAM権限を持つEC2インスタンスを自動構築**: Bedrock、AgentCore、SAM等のワークショップに必要な権限を事前設定
- **ブラウザベースの開発環境**: 参加者はブラウザからVS Codeにアクセス可能（ローカル環境のセットアップ不要）
- **事前インストール済みツール**: Python、uv、AWS CLI、SAM CLI、Docker等を自動セットアップ
- **複数参加者への対応**: 台数を変更するだけで、参加者数に応じたインスタンスを一括デプロイ

#### 企画者向けクイックスタート

```bash
# 1. code-serverディレクトリに移動
cd code-server

# 2. 依存関係のインストール
npm install

# 3. 参加者数に応じてインスタンス数を調整（lib/workshop-stack.ts:22）
# for (let i = 1; i <= 3; i++) {  // 数字を変更

# 4. CDKをデプロイ
npm run build
cdk bootstrap  # 初回のみ
cdk deploy

# 5. デプロイ後、各インスタンスのIPアドレスとパスワード取得方法を参加者に共有
```

詳細は [code-server/README.md](./code-server/README.md) を参照してください。

### ワークショップ参加者向け

企画者から提供されたcode-server環境を使用する場合、ブラウザから直接開発を開始できます。
ローカル環境でハンズオンを行う場合は、以下のクイックスタートガイドに従ってください。

#### 参加者向けクイックスタート（ローカル環境）

```bash
# 1. uv のインストール
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# 2. プロジェクトの初期化
uv init sample-agent
cd sample-agent

# 3. 仮想環境の作成と有効化
uv venv .venv
source .venv/bin/activate

# 4. 必要なパッケージのインストール
uv add strands-agents strands-agents-tools

# 5. エージェントの実行（サンプルコードを main.py に配置後）
python -u main.py
```

詳細な手順については、[workshop/01_Python開発環境の構築.md](./workshop/01_Python開発環境の構築.md) から順に進めてください。

## ワークショップ概要

このプロジェクトでは、Strands Agents フレームワークを使用して AI エージェントを構築し、Amazon Bedrock の AgentCore を使ってデプロイする方法を学習します。実践的な例として、気象庁 API を活用した天気予報士エージェントの実装を通じて、以下の技術を習得できます：

- **Strands Agents**: コードファーストな AI エージェントフレームワーク
- **Amazon Bedrock**: AWS が提供する生成 AI サービス
- **AgentCore**: エージェントのデプロイ・運用基盤
- **uv**: 高速な Python パッケージマネージャー

## プロジェクト構成

```
.
├── workshop/                              # ワークショップドキュメント（参加者向け）
│   ├── 01_Python開発環境の構築.md           # uv を使った開発環境構築
│   ├── 02_StrandsAgentsを使ってAIエージェントを開発する.md  # エージェント開発
│   └── 03_AgentCoreを使ってAIエージェントをデプロイする.md   # デプロイ手順
├── tools/                                 # カスタムツール（参加者が使用）
│   └── weather_forecast.py               # 気象庁 API を使った天気予報ツール
├── code-server/                           # 開発環境構築用CDK（企画者向け）
│   ├── lib/constructs/                   # EC2、VPC、IAMロール等の構成
│   ├── lib/config/                       # ネットワーク・インスタンス設定
│   └── lib/workshop-stack.ts             # メインスタック定義
└── README.md                             # このファイル
```

## 前提条件

### 参加者（ローカル環境で実施する場合）

- Python 3.12 以上
- AWS アカウント（AgentCore デプロイ時に必要）
- Amazon Bedrock へのアクセス権限

### 企画者（code-server環境をデプロイする場合）

- Node.js 18.x 以上
- AWS CLI 設定済み
- AWS CDK 2.x (`npm install -g aws-cdk`)
- デプロイ先AWSアカウントの管理者権限

## 学習の流れ

### 1. Python 開発環境の構築

uv パッケージマネージャーを使用した Python 開発環境のセットアップ方法を学びます。

📄 [workshop/01_Python開発環境の構築.md](./workshop/01_Python開発環境の構築.md)

**学習内容:**

- uv のインストール
- プロジェクトの初期化
- 仮想環境の作成と管理
- パッケージの追加

### 2. Strands Agents を使った AI エージェント開発

Strands Agents フレームワークを使用して、実用的な AI エージェントを開発する方法を学びます。

📄 [workshop/02_StrandsAgentsを使ってAIエージェントを開発する.md](./workshop/02_StrandsAgentsを使ってAIエージェントを開発する.md)

**学習内容:**

- 基本的なエージェントの作成
- LLM モデルの選択と切り替え（Claude, Nova, GPT）
- システムプロンプトの設定
- マルチターン会話の実装
- セッション管理（FileSessionManager, S3SessionManager）
- 会話履歴管理戦略（スライディングウィンドウ、要約方式）
- カスタムツールの作成と統合
- レスポンス制御（同期、ストリーミング、構造型）

### 3. AgentCore を使ったデプロイ

開発した AI エージェントを AgentCore を使って AWS 環境にデプロイする方法を学びます。

📄 [workshop/03_AgentCoreを使ってAIエージェントをデプロイする.md](./workshop/03_AgentCoreを使ってAIエージェントをデプロイする.md)

**学習内容:**

- AgentCore 対応コードへの変換
- 設定ファイルの作成
- デプロイの実行
- デプロイしたエージェントの実行とテスト

## カスタムツール

### 天気予報ツール (`tools/weather_forecast.py`)

気象庁 API を使用して日本の都道府県別天気予報を取得するカスタムツールです。

**機能:**

- 短期予報（3日間）と週間予報（7日間）に対応
- 都道府県名の柔軟な解釈（「東京」→「東京都」など）
- 詳細な気象情報（天気、気温、降水確率、風、波など）
- エラーハンドリング

**使用例:**

```python
from tools.weather_forecast import get_weather_forecast

# 東京の短期予報を取得
result = get_weather_forecast("東京", "short")

# 大阪の週間予報を取得
result = get_weather_forecast("大阪府", "weekly")
```

## ワークショップ環境について

### code-server 環境（企画者向け）

ワークショップ企画者は、`code-server/` ディレクトリの AWS CDK を使用して、参加者用の開発環境を事前に構築できます。

**特徴:**

- ブラウザからアクセス可能なVS Code環境（ローカルセットアップ不要）
- 必要なIAM権限（Bedrock、AgentCore、SAM等）を自動付与
- Python、uv、AWS CLI、Docker等を事前インストール
- 参加者数に応じてインスタンス数を簡単に調整可能

**デプロイ方法:**

詳細は [code-server/README.md](./code-server/README.md) を参照してください。

### ローカル環境（参加者向け）

ローカル環境でワークショップを進める場合は、上記の「参加者向けクイックスタート」に従ってください。

## 参考リンク

- [Strands Agents 公式ドキュメント](https://strandsagents.com/latest/documentation/docs/)
- [Amazon Bedrock](https://aws.amazon.com/bedrock/)
- [uv - Python パッケージマネージャー](https://github.com/astral-sh/uv)
- [気象庁 API](https://www.jma.go.jp/bosai/)

## ライセンス

このプロジェクトは教育目的で作成されています。
