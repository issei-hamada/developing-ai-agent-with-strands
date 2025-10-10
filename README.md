# developing-ai-agent-with-strands

AgentCore と Strands Agents を使って AI エージェントを作成するワークショップ用リポジトリです。
以下の2つのコンテンツを含んでいます。

## 1. code-server 構築用 AWS CDK

ワークショップに必要な環境を構築する CDK コードです。
任意の台数の EC2 インスタンスと、必要に応じて RocketChat インスタンスを立ち上げます。

## 2. ワークショップの解説ドキュメント

本プロファイルのメインとなる、ワークショップです。

1. Python開発環境の構築
2. StrandsAgentsを使ってAIエージェントを開発する
3. AgentCoreを使ってAIエージェントをデプロイする

## ワークショップ概要

このプロジェクトでは、Strands Agents フレームワークを使用して AI エージェントを構築し、Amazon Bedrock の AgentCore を使ってデプロイする方法を学習します。実践的な例として、気象庁 API を活用した天気予報士エージェントの実装を通じて、以下の技術を習得できます：

- **Strands Agents**: コードファーストな AI エージェントフレームワーク
- **Amazon Bedrock**: AWS が提供する生成 AI サービス
- **AgentCore**: エージェントのデプロイ・運用基盤
- **uv**: 高速な Python パッケージマネージャー

## プロジェクト構成

```
.
├── docs/                                   # ドキュメント
│   ├── 01_Python開発環境の構築.md            # uv を使った開発環境構築
│   ├── 02_StrandsAgentsを使ってAIエージェントを開発する.md
│   └── 03_AgentCoreを使ってAIエージェントをデプロイする.md
├── tools/                                  # カスタムツール
│   └── weather_forecast.py                # 気象庁 API を使った天気予報ツール
└── README.md                              # このファイル
```

## 前提条件

- Python 3.12 以上
- AWS アカウント（AgentCore デプロイ時に必要）
- Amazon Bedrock へのアクセス権限

## 学習の流れ

### 1. Python 開発環境の構築

uv パッケージマネージャーを使用した Python 開発環境のセットアップ方法を学びます。

📄 [docs/01_Python開発環境の構築.md](./docs/01_Python開発環境の構築.md)

**学習内容:**
- uv のインストール
- プロジェクトの初期化
- 仮想環境の作成と管理
- パッケージの追加

### 2. Strands Agents を使った AI エージェント開発

Strands Agents フレームワークを使用して、実用的な AI エージェントを開発する方法を学びます。

📄 [docs/02_StrandsAgentsを使ってAIエージェントを開発する.md](./docs/02_StrandsAgentsを使ってAIエージェントを開発する.md)

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

📄 [docs/03_AgentCoreを使ってAIエージェントをデプロイする.md](./docs/03_AgentCoreを使ってAIエージェントをデプロイする.md)

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

## クイックスタート

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

詳細な手順については、各ドキュメントを参照してください。

## 参考リンク

- [Strands Agents 公式ドキュメント](https://strandsagents.com/latest/documentation/docs/)
- [Amazon Bedrock](https://aws.amazon.com/bedrock/)
- [uv - Python パッケージマネージャー](https://github.com/astral-sh/uv)
- [気象庁 API](https://www.jma.go.jp/bosai/)

## ライセンス

このプロジェクトは教育目的で作成されています。
