# 04_AmazonQDeveloperを使って、簡単なUIを作成してみる

1. Amazon Q Developer セットアップ
2. アプリの作成
3. テスト

## 前提条件

builders id を取得している事

## 1. ターミナルを開き直す

1. ターミナルの左上「ゴミ箱アイコン」をクリックし、ターミナルを閉じる
2. 左メニューバー、一番上のアイコン(三本線)をクリック
3. 開いたメニューの「Terminal」にマウスカーソルを当て、表示されたメニューの「New Terminal」をクリック

画面下に Linux のターミナルが表示されれば完了。

### 2. Amazon Q Developer にログイン

1. ターミナルに以下コマンドを入力
    > q login --use-device-flow
2. Select login method と聞かれるので、「Use for Free with Builder ID」を選択して Enter
  <br> ※ Pro ライセンスを利用する場合、Use with Pro lisence で問題ありません
3. 「Do you want code-server to open the external website?」というモーダルが表示されるので、「Open」を押下
4. ブラウザで builders Id のログイン画面が開くので、画面に従ってログイン

「リクエストが承認されました」と表示されれば、本手順は完了。

#### Tips: 本手順のポイント

- q login コマンドは通常サーバ内のブラウザを起動しようとするが、--use-device-flow オプションを利用する事で URL ベースのログインが可能
- WSL 上の Ubuntu でログインする場合も、手順は同じ

## 3. Amazon Q Developer のコンテキストを理解する

### 3.1. 初期状態で持っている情報について確認する

初期状態では、何も読み込まれていない状態。
Q を起動して以下プロンプトを入力し、プロジェクトに関する背景情報を知っているか確認する。

```bash
あなたはこのプロジェクトの背景情報について何か知っていますか？
```

**レスポンス:**

```bash
> I don't have any background information about this project. Let me check what's in your current directory to understand 
what you're working on.


🛠️  Using tool: fs_read (trusted)
 ⋮ 
 ● Reading directory: /home/ubuntu with maximum depth of 0
 ✓ Successfully read directory /home/ubuntu (11 entries)
 ⋮ 
 ● Completed in 0.1s


> I can see there's a sample-agent directory in your home folder. Let me explore that to understand the project structure:
```

この時は、まだ何も知らない為、カレントディレクトリ内のファイルを読み込んで回答してくれる。

```bash
> Based on the project structure and files, I can provide you with background information about this project:

このプロジェクトは AWS Bedrock AgentCore を使用した 天気予報エージェント のサンプルプロジェクトです。

## プロジェクトの概要

• **名前**: sample-agent
• **目的**: 日本の都道府県別天気予報を提供するAIエージェント
• **技術スタック**: 
  • Python 3.12
  • AWS Bedrock AgentCore
  • Strands Agents フレームワーク
  • Claude Sonnet 4 モデル
```

### 3.2. コンテキストを与えて、挙動がどう変わるか確認する

1. Code Server のスプリットパネル左 **「EXPLORER」** 上で、右クリック
    - ブラウザのポップアップウィンドウが表示されたら、 **「許可」** を押下

2. メニュー一番上の「New file...」をクリックし、表示されたテキストボックスに **「AmazonQ.md」** と入力
    - AmazonQ.md が作成される

3. AmazonQ.md に、以下テキストをコピー& ペースト

    ```markdown
    # AmazonQ.md

    ## 目的

    streamlit と AgentCore を用いて、天気予報チャットアプリを作成する

    ## AgentCore

    ソースコードは以下に格納されている。
    /home/ubuntu/sample-agent

    ## 言語設定

    - **使用言語**: 日本語
    - すべてのコミュニケーションは日本語で行ってください
    - コメントやドキュメントも日本語で記述してください

    ## 開発ガイドライン

    ### Python 開発

    - Python 3.x を使用
    - 仮想環境（venv）を利用した依存関係管理
    - PEP 8 に準拠したコードスタイル

    ### コーディング規約
    - 変数名、関数名: snake_case
    - クラス名: PascalCase
    - 定数: UPPER_SNAKE_CASE
    - 日本語のコメントを積極的に活用

    ### エラーハンドリング
    - 適切な例外処理を実装
    - ユーザーフレンドリーなエラーメッセージを日本語で提供

    ## 重要な制約事項
    - システムファイルの変更は最小限に
    - 開発者の環境を損なわないよう配慮

    ```

4. ターミナルをクリックし、ctrl + Q を二回打鍵、AmazonQ を一旦終了
5. 以下コマンドを実行し、Amazon Q を再起動
    > q
6. 再度、以下プロンプトを入力し、レスポンスを確認する

    ```sh
    あなたはこのプロジェクトの背景情報について何か知っていますか？
    ```

    **レスポンス**

    ```sh
    > はい、プロジェクトの背景情報を把握しています。

    このプロジェクトは 天気予報チャットアプリ の開発で、以下の技術スタックを使用します：

    • **Streamlit**: ウェブアプリのフロントエンド
    • **AgentCore**: チャット機能の実装（ソースコードは /home/ubuntu/sample-agent に格納）

    ## 開発方針
    • 全て日本語でのコミュニケーション
    • Python 3.x + 仮想環境（venv）
    • PEP 8準拠のコードスタイル
    • 日本語コメント・ドキュメント

    ## コーディング規約
    • 変数・関数名: snake_case
    • クラス名: PascalCase  
    • 定数: UPPER_SNAKE_CASE

    現在 /home/ubuntu/weather-reporter ディレクトリにいるので、ここから開発を進めることができます。何か具体的な実装について質問がありますか？
    ```

AmazonQ.md に書いた内容が反映され、日本語で回答が返ってくる + 自身の役割を理解している事が分かる。

### 3.3. 現在読み込んでいるコンテキストファイルを確認する

以下コマンドを実行して、現在読み込んでいるコンテキストファイルを表示する。

※ Q にはいくつかの / から始まるコマンドが搭載されている

```sh
/context show
```

**レスポンス:**

```sh
👤 Agent (q_cli_default):
    AmazonQ.md (1 match)
    AGENTS.md 
    README.md 
    .amazonq/rules/**/*.md 

💬 Session (temporary):
    <none>

1 matched file in use:
👤 /home/ubuntu/AmazonQ.md (~230 tkns)

Total: ~230 tokens
```

Agent (q_cli_default) 以下に表示されているファイル名が、デフォルトで起動時に読み込むファイル。

- AmazonQ.md
- AGENTS.md
- README.md
- .amazonq/rules/**/*.md

現在読み込まれているファイルは、**/home/ubuntu/AmazonQ.md** の1ファイル。

#### Tips: 各ファイルの役割

Amazon Q Developer が自動的に読み込む4つのファイル/パターンには、それぞれ以下の役割がある。

**README.md**

- 人間向けに作成された、プロジェクトの一般的な説明ファイル
- セットアップ手順、使用方法、依存関係などの情報を記載
- GitHub などでも標準的に使用されるドキュメント

**記入例:**

```markdown
# プロジェクト名

このプロジェクトは○○を実現するためのアプリケーションです。

## セットアップ
npm install

## 使い方
npm start
```

**AmazonQ.md**

- AIコーディングエージェント向けの README ファイル
- プロジェクト全体の概要や背景情報を記載する
  - Amazon Q Developer がプロジェクトのコンテキストを理解するための基本情報
  - プロジェクトの目的、技術スタック、アーキテクチャの概要
- README.md（人間向け）よりも詳細な開発者向けの指示を含む
  - プロジェクトのビルド手順、テスト方法、コード規約等

記入例:
```markdown
# プロジェクト概要

このプロジェクトは Node.js と TypeScript で構築された Web API です。

## 技術スタック
- Node.js 20.x
- TypeScript 5.x
- Express.js

## アーキテクチャ
- src/controllers: API エンドポイント
- src/services: ビジネスロジック
- src/models: データモデル

## コーディング規約
- 関数名は camelCase を使用
- TypeScript の型定義を必ず行う
```

**AGENTS.md**

- AIコーディングエージェント向けのREADMEファイル（https://agents.md/）
  - Amazon Q Developer を含む20以上のAIエージェントで互換性のある標準規格
- 基本的には、AmazonQ.md と同じ役割

**記入例:**

```markdown
# エージェント向けプロジェクトガイド

## プロジェクト構成
このプロジェクトは Python Flask で構築されたマイクロサービスです。

## 開発ガイドライン
- PEP 8 に準拠したコードスタイル
- すべての関数に docstring を記述
- ユニットテストのカバレッジは 80% 以上を維持

## 重要な制約事項
- データベースへの直接アクセスは services 層のみ
- 環境変数は .env ファイルで管理
```

**.amazonq/rules/\*\*/\*.md**

- Amazon Q Developer の動作ルールを定義するファイル群
- ディレクトリ構造に応じた複数のルールファイルを配置可能
- コーディング規約、プロジェクト固有の制約、推奨事項などを記述

記入例（.amazonq/rules/coding-style.md）:

```markdown
# コーディングスタイルルール

## 命名規則
- 変数名: snake_case
- クラス名: PascalCase
- 定数: UPPER_SNAKE_CASE

## 禁止事項
- グローバル変数の使用禁止
- eval() の使用禁止

## 推奨事項
- エラーハンドリングは必ず実装する
- ログ出力は適切なレベルで行う
```

## 4. Amazon Q Developer が出来る事を理解する

**前提事項:**

本手順は Q にプロンプトを与えて実行します。
その為、ワークショップに記載のレスポンスと一致しない場合があります。

### 4.1. Q にPython 開発環境を作成してもらう

Q を起動した状態で、以下プロンプトを入力する。

```sh
次のコマンドを入力して、Python の開発環境を作成して下さい。
uv init weather_forecast
```

**レスポンス:**

```bash
🛠️  Using tool: execute_bash
 ⋮ 
 ● I will run the following shell command: 
uv init weather_forecast
 ⋮ 
 ↳ Purpose: Initialize a new Python project with uv called weather_forecast

Allow this action? Use 't' to trust (always allow) this tool for the session. [y/n/t]:
```

Q はデフォルトで組み込みツールを持っており、「🛠️  Using tool: TOOL_NAME」として実行しようとすることがある。今回は **「execute_bash」** として bash コマンドを実行しようとしている。

この時、基本的には **Allow this action?** と確認を取ってくれて、ユーザが「y」を入力する事で実行を許可出来る。

※ t は **「次回から同じコマンドについては確認不要で実行して良い」** という意味。セキュリティの観点から非常に危険であり、注意して利用する事。

ここでは「y」を入力。

**レスポンス:**

```bash

> y

Initialized project `weather-forecast` at `/home/ubuntu/weather_forecast`
 ⋮ 
 ● Completed in 0.210s

> Python開発環境が作成されました。weather_forecastディレクトリに新しいプロジェクトが初期化されています。

プロジェクトの構造を確認しますか？

🛠️  Using tool: fs_read (trusted)
 ⋮ 
 ● Reading directory: /home/ubuntu/weather_forecast with maximum depth of 0
 ✓ Successfully read directory /home/ubuntu/weather_forecast (6 entries)
 ⋮ 
 ● Completed in 0.0s

> プロジェクトが正常に作成されました。以下のファイルが生成されています：

• pyproject.toml - プロジェクト設定ファイル
• main.py - メインのPythonファイル
• README.md - プロジェクト説明ファイル
• .python-version - Python バージョン指定
• .gitignore - Git除外設定
• .git/ - Gitリポジトリ

開発環境の準備が完了しました。
```

**「weather_forecast」** というフォルダが作成出来ていれば、Python 開発環境の初期設定は完了。

### 4.2. 必要なライブラリをインストールする

以下プロンプトを入力する。

```sh
次のコマンドを入力して、この開発環境に必要なライブラリをインストールして下さい。
uv add streamlit boto3
```

**レスポンス:**

```bash
🛠️  Using tool: execute_bash
 ⋮ 
 ● I will run the following shell command: 
cd /home/ubuntu/weather_forecast && uv add streamlit
 ⋮ 
 ↳ Purpose: Add streamlit library to the weather_forecast project using uv

中略

 + urllib3==2.5.0
 + watchdog==6.0.0
 ⋮ 
 ● Completed in 3.154s

> Streamlitライブラリが正常にインストールされました。以下の主要なパッケージが追加されています：

• streamlit==1.51.0 - Webアプリケーションフレームワーク
• pandas==2.3.3 - データ処理ライブラリ
• numpy==2.3.4 - 数値計算ライブラリ
• altair==5.5.0 - データ可視化ライブラリ

仮想環境（.venv）も自動的に作成され、必要な依存関係がすべてインストールされました。これでStreamlitを使用したWebアプリケーションの開発準備が整いました。
```

weather_forecast/pyproject.toml を確認して、以下のように streamlit が追加されていれば完了。

```toml
dependencies = [
    "streamlit>=1.51.0",
]
```

#### Tips: bash を操作出来るから、Q は何でも出来る

Linux サーバを操作する時、通常は bash が必要。
Q は bash を操作できる為、**人間と同じレベルのサーバ利用が可能**となっている。

**Q に出来るサーバ操作例:**

- apt 等のコマンドを使ったミドルウェアのインストール
- systemctl を使ったサーバ設定
- サーバ内ログファイルの読み込み
- シェルスクリプトの作成や実行

つまり、人間に出来る事はほとんど Q にも出来る。

## 5. 目的に応じたエージェントを作成する

### 5.1. Amazon Q を終了し、プロジェクトディレクトリへ移動

1. ctrl + Q を二回打鍵、AmazonQ を一旦終了
2. 以下コマンドを入力し、プロジェクトディレクトリへ移動
    > cd weather_forecast
3. プロジェクトディレクトリ内で q を起動
    > q

### 5.2. プロジェクト専用のエージェントを作成する

Q が立ち上がっている状態で、以下コマンドを入力。

```sh
/agent create -n frontend -d .

# 構文: /agent create -n [エージェント名] -d [設定ファイルの保存先]
```

vi エディタが立ち上がり、以下のような json が表示される。

```json
{
  "$schema": "https://raw.githubusercontent.com/aws/amazon-q-developer-cli/refs/heads/main/schemas/agent-v1.json",
  "name": "frontend",
  "description": "",
  "prompt": null,
  "mcpServers": {},
  "tools": [
    "*"
  ],
  "toolAliases": {},
  "allowedTools": [],
  "resources": [
    "file://AmazonQ.md",
    "file://AGENTS.md",
    "file://README.md",
    "file://.amazonq/rules/**/*.md"
  ],
  "hooks": {},
  "toolsSettings": {},
  "useLegacyMcpJson": true,
  "model": null
}
```

何も変更せず、**:wq!** で保存する。

**「Agent frontend has been created successfully」** のメッセージが表示されれば、エージェント設定の作成は成功。

### 5.3. 作成したエージェントの設定を確認する

スプリットパネル左の **EXPLORER** で、以下ファイルが作成されている事を確認。
> /home/ubuntu/weather_forecast/.amazonq/cli-agents/frontend.json

このファイルが、エージェントの設定ファイル。

特に重要な項目は以下。

- **name:** エージェント設定の名前
- **mcpServers:** 利用出来る mcp の設定
- **resources:** 起動時に読み込むコンテキスト

つまり、エージェント設定を分ける事で、Q が起動時に読み込むコンテキストを管理出来る。

※ 最新のエージェントフォーマットは[ドキュメント](https://github.com/aws/amazon-q-developer-cli/blob/main/docs/agent-format.md)を参照すること。

### 5.4. 作成した設定で、エージェントを起動する

以下コマンドを実行する。

```sh
/agent swap frontend 

# 構文: /agent swap [エージェント名]
```

**レスポンス:**

以下のように、プロンプト前に [frontend] が付けば成功。

```sh
[frontend] >
```

### 5.5. コンテキストファイルを追加する

1. 以下コマンドを実行し、現在読み込んでいるコンテキストファイルを確認する

    ```sh
    /context show
    ```

    **レスポンス:**

    ```sh
    👤 Agent (frontend):
        AmazonQ.md 
        AGENTS.md 
        README.md (1 match)
        .amazonq/rules/**/*.md 

    💬 Session (temporary):
        <none>

    1 matched file in use:
    👤 /home/ubuntu/weather_forecast/README.md (~0 tkns)

    Total: ~0 tokens
    ```

    以下の2点を理解する
    - 起動時に読み込むファイルの種類は4種類(デフォルトと同じ)
    - 読み込んだ README.md が変わっている

2. Code Server のスプリットパネル左 **「EXPLORER」** 上で、「weather_forecast」を右クリック

3. メニュー上から2番目の「New folder...」をクリックし、表示されたテキストボックスに **「docs」** と入力
    - docs がフォルダが作成される

4. 同じように「docs」を右クリックし、「New file...」で「requirements.md」を作成する

5. 以下を、requirements.md 内にコピー&ペーストする

    ```markdown
    # 要求仕様

    ## 天気予報アプリの要件

    - 天気予報が出来る AI エージェントとチャットして、天気を調べてもらえる
        - エージェント機能には、AgentCore Runtime にデプロイした API を利用する
        - ソースコードは sample-agent/配下
    - Streamlit を使って UI を実装する

    ## API 参考文献

    - https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-agentcore/client/invoke_agent_runtime.html
    - https://qiita.com/moritalous/items/621c3506e1734922b66e
    ```

6. /home/ubuntu/weather_forecast/.amazonq/cli-agents/frontend.json の resources 配列を、以下のように編集

    ```json
    "resources": [
      "file://AmazonQ.md",
      "file://AGENTS.md",
      "file://README.md",
      "file://.amazonq/rules/**/*.md",  // カンマを追加
      "file://docs/*"  // フォルダを追加
    ]
    ```

7. ターミナルをクリックし、ctrl + Q を二回打鍵、AmazonQ を一旦終了

8. 以下コマンドを実行し、Amazon Q を再起動

    ```sh
    q chat --agent frontend
    # 構文 q chat --agent [エージェント名]
    ```

    q 起動時にオプションを指定する事で、直接エージェント設定を読み込むことが出来る。

    ※ もし上手く行かない場合、カレントディレクトリに .amazonq フォルダがあり、その中にエージェント設定ファイルがある事を確認

9. 以下コマンドを実行し、現在読み込んでいるコンテキストファイルを確認する

    ```sh
    /context show
    ```

    **レスポンス:**

    ```sh
    👤 Agent (frontend):
        AmazonQ.md 
        AGENTS.md 
        README.md (1 match)
        .amazonq/rules/**/*.md 
        docs/* (1 match)

    💬 Session (temporary):
        <none>

    2 matched files in use:
    👤 /home/ubuntu/weather_forecast/README.md (~0 tkns)
    👤 /home/ubuntu/weather_forecast/docs/design.md (~240 tkns)

    Total: ~240 tokens
    ```

    先ほど追加した docs 配下のファイルが読み込まれている。

#### Tips: 目的に応じて、エージェント設定を使い分ける事が重要

以下の理由から、エージェントの精度を上げるには適切にコンテキストを分ける事が重要。

- **コンテキストサイズに上限がある:** モデル毎に、一度に扱えるトークン量に限界がある
- **「コンテキスト腐敗」を起こす危険がある:** コンテキストウィンドウ内のトークンの数が増えると、モデルがそのコンテキストから情報を正確に思い出す能力が低下する

実際のプロジェクトでは、インフラ構築、運用、コード開発、アプリ開発、のように様々なタスクを扱う事になる。
例えば、インフラ構築であれば

- infra-engineer エージェントを作成
- コンテキストに CloudFormation テンプレートを読み込ませる

アプリ開発であれば

- developer エージェントを作成
- コンテキストにデータ連携フローを追加する
- rules にコーディング規約を追加する

等、環境に合わせてエージェント設定を作ることで、適切なコンテキスト管理を実現出来る。

## 6. エージェントの機能を拡張する

Amazon Q Developer は、MCP（Model Context Protocol）に対応している。
その為、MCP を設定する事で、Q に様々な機能を追加出来る。

### 6.1. エージェントに web ページ取得機能を追加する

1. /home/ubuntu/weather_forecast/.amazonq/cli-agents/frontend.json の **mcpServers** に、次の値を追加する。

    ```json
      "mcpServers": {
        "fetch": {
          "command": "uvx",
          "args": ["mcp-server-fetch", "--ignore-robots-txt"]
        }
      },
    ```

2. ターミナルをクリックし、ctrl + Q を二回打鍵、AmazonQ を一旦終了

3. 以下コマンドを実行し、Amazon Q を再起動

    ```sh
    q chat --agent frontend
    ```

    **レスポンス:**

    ```sh
    ✓ fetch loaded in 3.23 s


          ⢠⣶⣶⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣶⣿⣿⣿⣶⣦⡀⠀
        ⠀⠀⠀⣾⡿⢻⣿⡆⠀⠀⠀⢀⣄⡄⢀⣠⣤⣤⡀⢀⣠⣤⣤⡀⠀⠀⢀⣠⣤⣤⣤⣄⠀⠀⢀⣤⣤⣤⣤⣤⣤⡀⠀⠀⣀⣤⣤⣤⣀⠀⠀⠀⢠⣤⡀⣀⣤⣤⣄⡀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠋⠀⠀⠀⠙⣿⣿⡆
        ⠀⠀⣼⣿⠇⠀⣿⣿⡄⠀⠀⢸⣿⣿⠛⠉⠻⣿⣿⠛⠉⠛⣿⣿⠀⠀⠘⠛⠉⠉⠻⣿⣧⠀⠈⠛⠛⠛⣻⣿⡿⠀⢀⣾⣿⠛⠉⠻⣿⣷⡀⠀⢸⣿⡟⠛⠉⢻⣿⣷⠀⠀⠀⠀⠀⠀⣼⣿⡏⠀⠀⠀⠀⠀⢸⣿⣿
        ⠀⢰⣿⣿⣤⣤⣼⣿⣷⠀⠀⢸⣿⣿⠀⠀⠀⣿⣿⠀⠀⠀⣿⣿⠀⠀⢀⣴⣶⣶⣶⣿⣿⠀⠀⠀⣠⣾⡿⠋⠀⠀⢸⣿⣿⠀⠀⠀⣿⣿⡇⠀⢸⣿⡇⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⢹⣿⣇⠀⠀⠀⠀⠀⢸⣿⡿
        ⢀⣿⣿⠋⠉⠉⠉⢻⣿⣇⠀⢸⣿⣿⠀⠀⠀⣿⣿⠀⠀⠀⣿⣿⠀⠀⣿⣿⡀⠀⣠⣿⣿⠀⢀⣴⣿⣋⣀⣀⣀⡀⠘⣿⣿⣄⣀⣠⣿⣿⠃⠀⢸⣿⡇⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠈⢿⣿⣦⣀⣀⣀⣴⣿⡿⠃
        ⠚⠛⠋⠀⠀⠀⠀⠘⠛⠛⠀⠘⠛⠛⠀⠀⠀⠛⠛⠀⠀⠀⠛⠛⠀⠀⠙⠻⠿⠟⠋⠛⠛⠀⠘⠛⠛⠛⠛⠛⠛⠃⠀⠈⠛⠿⠿⠿⠛⠁⠀⠀⠘⠛⠃⠀⠀⠘⠛⠛⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠿⢿⣿⣿⣋⠀⠀
        ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⢿⡧

    ╭─────────────────────────────── Did you know? ────────────────────────────────╮
    │                                                                              │
    │         Use /model to select the model to use for this conversation          │
    │                                                                              │
    ╰──────────────────────────────────────────────────────────────────────────────╯

    /help all commands  •  ctrl + j new lines  •  ctrl + s fuzzy search
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🤖 You are chatting with claude-sonnet-4
    ```

    Q 起動メッセージの1行目に **「✓ fetch loaded in 3.23 s」** と表示されていれば、mcpの読み込みは成功。

    **読み込みエラーが発生する場合:**

    /home/ubuntu/.local/bin 配下を確認し、uv が存在する場合、パスが上手く追加出来ていない。Code Server のターミナル右上の **「ごみ箱ボタン」** を押下し、左メニューバーから再度ターミナルを立ち上げると解決する。

4. 以下プロンプトを入力し、fetch 機能をテスト

    ```bash
    次のwebページを取得して、内容を解説して下さい。https://docs.aws.amazon.com/ja_jp/amazonq/latest/qdeveloper-ug/what-is.html
    ```

    **レスポンス:**

    ```bash
    🛠️  Using tool: fetch from mcp server fetch
    ⋮ 
    ● Running fetch with the param:
    ⋮  {
    ⋮    "url": "https://docs.aws.amazon.com/ja_jp/amazonq/latest/qdeveloper-ug/what-is.html"
    ⋮  }

    Allow this action? Use 't' to trust (always allow) this tool for the session. [y/n/t]:
    ```

    ツール利用の承認が求められるので、内容を確認して「y」を押下。完了まで繰り返し承認する。

    ```bash
    [frontend] > y

    ⋮ 
    ● Completed in 0.206s


    > このページは Amazon Q Developer の公式ドキュメントで、以下の内容が説明されています：

    ## Amazon Q Developer とは

    Amazon Q Developer は生成AI（人工知能）を活用した会話型アシスタントで、AWS アプリケーションの理解、構築、拡張、運用を支援します。Amazon Bedrock をベースに構築されており、不正使用の自動検出機能
    を搭載しています。

    ## 主な機能

    • AWS アーキテクチャ、リソース、ベストプラクティス、ドキュメントについての質問対応
    • IDE でのソフトウェア開発支援（コードチャット、インライン補完、新規コード生成）
    • セキュリティ脆弱性のスキャン
    • コードのアップグレード、デバッグ、最適化
    ```

    Q が web ページを元に最終回答を出力してくれたら動作確認完了。

#### Tips: MCP を導入する際は、必ず作成元を確認する

Web 検索の他にも AWS のドキュメントを参照するツール、Box を操作できるようにするツール等、MCP には様々なものがある。
非常に便利な反面、これらを導入する際は、必ず作成元を確認しなければならない。

現在、MCP には認証の仕組みが存在しない為、作成者が脆弱性を仕込んでいる場合、セキュリティインシデントの引き金になる可能性がある。
各企業内で確認した MCP のみを導入する等、チーム毎にルールを定めて運用していかなければならない。

参考文献:

- MCP とは?: <https://github.com/modelcontextprotocol>
- AWS 公式 MCP: <https://awslabs.github.io/mcp/>

## 7. Streamlit を使って、UI を開発する

### 7.1. 開発するアプリの全体像を把握する

**Streamlitとは?**

Streamlit は Python でデータサイエンスや機械学習のウェブアプリケーションを簡単に構築できるオープンソースフレームワーク。

**主な強み:**

1. **シンプルな記述**
   - HTML/CSS/JavaScriptの知識不要
   - 純粋なPythonコードのみでUIを構築
   - わずか数行のコードでインタラクティブなアプリが完成

2. **豊富なウィジェット**
   - スライダー、ボタン、テキスト入力、ファイルアップロード等
   - チャート、テーブル、マップの表示
   - カスタムコンポーネントでの拡張も可能

3. **データサイエンスに最適化**
   - pandas DataFrameの自動表示
   - Matplotlib、Plotly等の可視化ライブラリと統合
   - 機械学習モデルのデモやダッシュボード作成に適している

**基本的な使用例:**

```python
import streamlit as st

st.title("Hello Streamlit!") # ページタイトル
name = st.text_input("名前を入力") # テキストボックスとボタン
if st.button("挨拶"): # ボタン押下時のアクション
    st.write(f"こんにちは、{name}さん!")
```

Q を使って、これらの要件に沿ったツールを開発していく。

**今回の実装手順:**

1. コンテキストを整備する
2. 仕様書を作成する
3. コーディング

### 7.2. コンテキストを整備する

1. /home/ubuntu/weather_forecast 配下に、workshop アセット内の /context 内のファイルをコピーペースト

    以下ディレクトリ構成にする。

    weather_forecast/
    ├── .amazonq/rules/python.md   # 追加コンテキストファイル
    ├── app.py                     # Streamlit アプリケーション
    ├── pyproject.toml             # プロジェクト設定
    ├── AmazonQ.md                 # 追加コンテキストファイル
    └── README.md                  # プロジェクト説明

2. 以下コマンドを実行し、現在読み込んでいるコンテキストファイルを確認する

    ```sh
    /context show
    ```

    **レスポンス:**

    ```bash
    👤 Agent (frontend):
        AmazonQ.md (1 match)
        AGENTS.md 
        README.md (1 match)
        .amazonq/rules/**/*.md (1 match)
        docs/* (1 matches)

    💬 Session (temporary):
        <none>

    6 matched files in use:
    👤 /home/ubuntu/weather_forecast/.amazonq/rules/python.md (~2220 tkns)
    👤 /home/ubuntu/weather_forecast/AmazonQ.md (~1260 tkns)
    👤 /home/ubuntu/weather_forecast/docs/requirements.md (~150 tkns)
    👤 /home/ubuntu/weather_forecast/README.md (~0 tkns)
    ```

    先ほど追加した コンテキストファイルが読み込まれている。

### 7.2. API をテストして、仕様書を作成する

1. コンテキストをリセットする為、ターミナルをクリックし ctrl + Q を二回打鍵、AmazonQ を一旦終了

2. 以下コマンドを実行し、Amazon Q を再起動

    ```bash
    q chat --agent frontend
    ```

3. 次のプロンプトを入力し、API 仕様書を作成する

    ```bash
    AgentCore をテストして、API 仕様書を作成し、docs 配下に保存して下さい。
    /home/ubuntu/sample-agent 配下のディレクトリで以下コマンドを実行する事でテスト出来ます。
    agentcore invoke '{"sessionId": "52433935-c9fd-480c-e3d2-d8a91369b3db", "prompt": "今日の横浜の天気を教えて下さい。"}'
    ```

    **レスポンス:**

    ```bash
    > I'll test the AgentCore API and create an API specification document. Let me start by running the test command and then 
    create the documentation.


    🛠️  Using tool: execute_bash
    ⋮ 
    ● I will run the following shell command: 
    cd /home/ubuntu/sample-agent && agentcore invoke '{"sessionId": "52433935-c9fd-480c-e3d2-d8a91369b3db", "prompt": "今日の横浜の天気を教えて下さい。"}'
    ⋮ 
    ↳ Purpose: Test the AgentCore API with weather query for Yokohama


    Allow this action? Use 't' to trust (always allow) this tool for the session. [y/n/t]:

    [frontend] > y
    ```

    恐らく、初手は venv 環境で実行してくれず失敗する。
    自分で ディレクトリを確認して venv の存在に気付くパターンもあれば、別の行動をとろうとすることもある。
    上手く venv で実行するよう誘導して下さい。

    ```bash
    > AgentCore API のテストが完了し、API 仕様書を /home/ubuntu/weather_forecast/docs/agentcore_api_spec.md に保存しました。

    ## テスト結果サマリー

    ✅ API 動作確認完了
    • 短期予報（横浜の今日の天気）: 正常動作
    • 週間予報（東京の7日間天気）: 正常動作
    • レスポンス時間: 約3-5秒
    • 日本語での自然な対話が可能

    ## 主要な API 情報
    • **Agent ARN**: arn:aws:bedrock-agentcore:us-west-2:781642237558:runtime/weather_reporter-uDIzGa3iMQ
    • **Region**: us-west-2
    • **Runtime**: Python 3.12
    • **セッション管理**: ファイルベース

    API 仕様書には以下の内容を含めました:
    • エンドポイント情報
    • リクエスト/レスポンス形式
    • 機能仕様（短期・週間予報対応）
    • テスト結果
    • エラーハンドリング
    • ログ・モニタリング方法

    この仕様書を参考に Streamlit アプリケーションの開発を進めることができます。
    ```

    間違いがないか内容を確認し、間違いがなければ完了。
    あればディスカッションしながら完成させる。

### 7.3. 仕様書を元に設計書を作成する

1. 次のプロンプトを入力し、設計書を作成する

    ```bash
    要求仕様と参考文献、API 仕様書を参考に、Streamlit を使った UI の設計書を作成し、docs/design.md として保存して下さい。
    ```

    **レスポンス:**

    ```bash
    > Streamlit UI の設計書を /home/ubuntu/weather_forecast/docs/design.md に保存しました。

    ## 設計書の主要内容

    ### アーキテクチャ
    • Streamlit UI → boto3 client → AgentCore Runtime API の構成
    • Python 3.12 + venv環境での開発

    ### UI 設計
    • チャットインターフェース（st.chat_message() 使用）
    • リアルタイムメッセージ入力（st.chat_input() 使用）
    • マークダウン・絵文字対応のレスポンス表示

    ### 実装仕様
    • **必要ライブラリ**: streamlit, boto3, uuid
    • **Agent ARN**: arn:aws:bedrock-agentcore:us-west-2:781642237558:runtime/weather_reporter-uDIzGa3iMQ
    • **セッション管理**: Streamlit session state を活用

    ### 主要機能
    1. チャット履歴の保持
    2. AgentCore API との連携
    3. エラーハンドリング
    4. セッション ID の自動生成・管理

    この設計書に基づいて、次のステップでは実際の Streamlit アプリケーション（app.py）の実装を行うことができます。
    ```

    出力されたら、boto3 を使った実装となっているか、AgentCore を実行する際のペイロードが正しいかを確認。
    問題がなければ完了。

### 7.4. 設計書を元に UI を実装する

次のプロンプトを入力し、UI を実装する。

```bash
この設計書に従って、UI を実装して下さい。
```

**レスポンス:**

```bash
> I'll implement the Streamlit UI based on the design document. Let me create the necessary files.


🛠️  Using tool: fs_write
⋮ 
● Path: /home/ubuntu/weather_forecast/app.py

中略
```

恐らく、テストしたり色々するはず。
何をしようとしているか確認しつつ、進める。

### 7.5. テストする

1. ターミナル右上、ゴミ箱ボタンの左「窓ボタン」をクリックし、ターミナルを分割する
2. weather_forecast ディレクトリ配下にいる事を確認し、以下コマンドで仮想環境を有効化

    ```bash
    source .venv/bin/activate
    ```

    AI のコーディングの過程で、仮想環境の名前が異なる場合がある。
    その場合、Q に立ち上げ方を確認する事。

3. 以下コマンドを実行し、Streamlit アプリを立ち上げ

    ```bash
    streamlit run app.py --server.headless=true --server.port=8501
    ```

    **レスポンス:**

    ```bash
    Collecting usage statistics. To deactivate, set browser.gatherUsageStats to false.


    You can now view your Streamlit app in your browser.

    Local URL: http://localhost:8501
    Network URL: http://10.0.12.140:8501
    External URL: http://54.249.172.41:8501

    ```

    アドレスが表示されたら、起動成功。

4. ブラウザに「External URL」の URL を入力し、アプリに接続

5. 実際の動作を確認する

    動作確認で上手く行かなかった場合、Q と一緒にトラブルシュートを行う。

無事に動いたら、本ワークショップは完了です。
おつかれさまでした！

### オプション

早く終わった方は、Q とディスカッションしながら画面レイアウトを綺麗に整えてみましょう。

### **Tips:** 必ずドキュメントを整備してからコーディングする

現在、AI エージェントに精度の高いアプリを開発させる為の手法として、**Spec-Driven 開発**という手法が注目されている。
コーディング前にドキュメントを生成し、それに従って開発を進める手法で、kiro の Spec モードがこの手法にあたる。

基本的には、最低でも以下の 3 ドキュメントを生成する事が多い。

1. 要求仕様書
2. 設計書
3. ToDo リスト

AWS が提唱している AI DLC(AI-Driven Development Lifecycle)という考え方は、Spec-Driven 開発を拡張したもの。
その考え方の中では、以下のフェーズに沿ってドキュメントを徹底的に作り込む。

| フェーズ | 内容 |
|---------|------|
| Inception(発案) | ビジネス上の意図を出発点として、AIが要件、ユーザーストーリー、ユニットなどを生成。チーム全員で "Mob Elaboration" と呼ばれるディスカッションを通じて、AIの提案や質問を検証・調整・修正する。 |
| Construction(構築) | 発案フェーズで得られたコンテキストをもとに、AIが論理的な設計(アーキテクチャやドメインモデル)、コードやテストを提案。ここでも Mob Construction を通して、技術的な判断や設計の選択を人間がよりクリアにする。 |
| Operations(運用) | 構築フェーズまでで積み上げられた文脈(要件・設計・テストなど)を使って、AIがインフラのコード管理やデプロイ等をサポート。チームはこれらを監視・レビューしながら、品質を保って進める。 |

Mob Elaboration とは、ビジネスロジックを理解しているメンバー、アプリエンジニア、インフラエンジニアの3名でチームで作業する事を指す。

つまり、AI の出力したドキュメントを、あらゆるレイヤーから検証して、ドキュメントの精度を高めようという手法。
今後は大規模なアプリ開発チームを組むのではなく、小規模の様々なジョブを混合したチームでの開発が主流になるかもしれない。

**参考:** <https://aws.amazon.com/jp/blogs/devops/ai-driven-development-life-cycle/>

## 8. 後片付け

以下コマンドを入力し、全てのリソースを削除する

```bash
# sample-agent ディレクトリへ移動
cd /home/ubuntu/sample-agent

# 仮想環境を起動
source .venv/bin/activate

# agentcore リソースを削除
agentcore destroy
```
