# 03_AgentCoreを使ったエージェントデプロイ

## デプロイ準備

### 必要なパッケージをインストール

AgentCore に関わるライブラリをインストール。

```sh
uv add bedrock-agentcore bedrock-agentcore-starter-toolkit
```

### main.py をリネームする

main.py を、weather_reporter_xxxxxx.py にリネームする。

※ xxxxxx には、ローマ字姓名(例:isseihamada)を入れて下さい。

```sh
mv main.py weather_reporter_xxxxxx.py
```

エージェントをデプロイする際、ファイル名がそのままエージェント名になります。
ワークショップ参加者間で重複を避ける為、自分の姓名を入れています。

### 天気予報士エージェントを AgentCore 対応に書き換える

以下を weather_reporter_xxxxxx.py にコピーペーストする。4か所変わっている。

```py
import argparse
import json

from strands import Agent
from strands.models import BedrockModel
from strands.session.file_session_manager import FileSessionManager
from strands.agent.conversation_manager import SlidingWindowConversationManager

from datetime import datetime
from tools.weather_forecast import get_weather_forecast

from bedrock_agentcore.runtime import BedrockAgentCoreApp # AgentCoreライブラリを追加

app = BedrockAgentCoreApp() # AgentCore インスタンス作成

MODEL_ID = "global.anthropic.claude-sonnet-4-20250514-v1:0"

SYSTEM_PROMPT="""
あなたは親しみやすく正確な気象予報士です。ユーザーから都道府県名を受け取り、天気予報情報を提供します。

## 主要機能

あなたは以下の天気予報APIツールにアクセスできます:

- get_weather_forecast(prefecture_name: string, forecast_type: string): 都道府県と天気予報タイプを指定する事で、県毎の天気予報を取得可能。forecast_typeでshort: 3日間の短期間、weekly: 週間天気の2種類に対応。

## 行動指針

### 1. リクエストの解釈
- ユーザーのメッセージから都道府県名を抽出してください
- 「今日」「明日」「明後日」「3日間」などのキーワードがあれば短期予報を使用
- 「週間」「1週間」「7日間」などのキーワードがあれば週間予報を使用
- 期間の指定がない場合は、**短期予報をデフォルト**として使用してください

### 2. 都道府県名の処理
- 47都道府県すべてに対応しています
- 「東京」→「東京都」、「大阪」→「大阪府」のように正式名称に補完してください
- 都道府県名が不明確な場合は、ユーザーに確認してください

### 3. レスポンスのスタイル
- **親しみやすく、わかりやすい言葉**で情報を伝えてください
- 天気のアイコンや絵文字(☀️🌤️☁️🌧️⚡❄️など)を適度に使用して視覚的に表現
- 気温、降水確率、風速などの数値情報を見やすく整理
- 必要に応じて服装や持ち物のアドバイスを添えてください

### 4. エラーハンドリング
- APIエラーが発生した場合は、丁寧に謝罪し、別の都道府県や期間で試すよう提案
- 都道府県名が取得できない場合は、「どちらの都道府県の天気予報をお知りになりたいですか?」と尋ねる

## レスポンス例

**良い例:**

東京都の3日間の天気予報をお伝えしますね!☀️

📅 今日(10月8日)
天気: 晴れ ☀️
気温: 最高25℃ / 最低18℃
降水確率: 10%

📅 明日(10月9日)
天気: 曇り時々晴れ 🌤️
気温: 最高23℃ / 最低17℃
降水確率: 20%

📅 明後日(10月10日)
天気: 雨 🌧️
気温: 最高20℃ / 最低16℃
降水確率: 80%

明後日は雨の予報ですので、傘をお忘れなく!🌂

## 重要な注意事項

- 気象情報は命に関わる重要な情報です。正確性を最優先してください
- APIから取得した情報をそのまま伝え、独自の予測や推測は加えないでください
- 災害級の天気(台風、大雪、豪雨など)については、より詳細な情報源を確認するよう促してください

ユーザーの安全と快適な日常生活をサポートすることがあなたの使命です。常に親切で、正確で、役立つ情報提供を心がけてください。
"""

CONVERSATION_MANAGER = SlidingWindowConversationManager(
    window_size=20,
    should_truncate_results=True,
)

@app.entrypoint # エージェントを呼び出すエントリポイント関数を指定
def invoke_agent(payload):
    now = datetime.now()
    system_prompt = SYSTEM_PROMPT + f"""
    現在の時刻: {now}
    """

    session_manager = FileSessionManager(
        session_id=payload.get("sessionId"),
        storage_dir=".sessions"
    )

    bedrock_model = BedrockModel(
        model_id=MODEL_ID,
        region_name="us-west-2"
    )

    agent = Agent(
        model=bedrock_model,
        system_prompt=system_prompt,
        session_manager=session_manager,
        conversation_manager=CONVERSATION_MANAGER,
        tools=[get_weather_forecast]
    )

    prompt = payload.get("prompt")
    response = agent(prompt)
    return response.message['content'][0]['text']

# 実行関数を変更
if __name__ == "__main__":
    app.run()
```

### テスト起動

以下コマンドを実行すると、8080ポートで web サーバが起動する。

```sh
uv run weather_reporter_xxxxxx.py
```

戻り値は何もないが、問題なし。

### 別ターミナルからテスト実行

ターミナルの右上「split terminal」でターミナルを分割し、以下を実行

```sh
curl -X POST http://localhost:8080/invocations \
    -H "Content-Type: application/json" \
    -d '{"sessionId": "52433935-c9fd-480c-e3d2-d8a91369b3db", "prompt": "今日の横浜の天気を教えて下さい。"}' | jq -r .
```

curl 実行側のターミナルに、レスポンスが返ってくるはず。

## agentcore starter tooolkit を使ってエージェントをデプロイ

### config ファイルを作成する

ターミナルで以下コマンドを実行し、AWS アカウント ID を控える。

```bash
aws sts get-caller-identity
```

**レスポンス:**

```json
{
    "UserId": "AIDA3L7MCxxxxxxxxxxxx",
    "Account": "xxxxxxxxxxxx",
    "Arn": "arn:aws:iam::xxxxxxxxxxxx:user/issei.hamada"
}
```

後で利用する為、Account の値を控えておく。

以下コマンドを実行し、必要な設定ファイルを作成する。

※ エージェント名は重複出来ない

```sh
agentcore configure -e weather_reporter_xxxxxx.py

# 対話式で各種リソースを作成する(今回は全てデフォルトでOK)
Configuring Bedrock AgentCore...
✓ Using file: weather_reporter.py

# 依存関係の解決に使うファイル名を入力
🔍 Detected dependency file: pyproject.toml
Press Enter to use this file, or type a different path (use Tab for autocomplete):
Path or Press Enter to use detected dependency file: pyproject.toml
✓ Using requirements file: pyproject.toml

# デプロイ設定(2025/11に、直接 Python コードを利用出来るようになった)
🚀 Deployment Configuration
Select deployment type:
  1. Direct Code Deploy (recommended) - Python only, no Docker required
  2. Container - For custom runtimes or complex dependencies
Choice [1]: 1

Select Python runtime version:
  1. PYTHON_3_10
  2. PYTHON_3_11
  3. PYTHON_3_12
  4. PYTHON_3_13
Choice [3]: 3
✓ Deployment type: Direct Code Deploy (python.3.12)

# 実行ロールを指定: agentcore-execution-role
🔐 Execution Role
Press Enter to auto-create execution role, or provide execution role ARN/name to use existing
Execution role ARN/name (or press Enter to auto-create): agentcore-execution-role
✓ Will auto-create execution role

# S3 バケット作成: 
# 次の xxx を AWS アカウント ID で置き換えて入力
# agentcore-deployment-bucket-xxxxxxxxxxxx
🏗️  S3 Bucket
Press Enter to auto-create S3 bucket, or provide S3 URI/path to use existing
S3 URI/path (or press Enter to auto-create): agentcore-deployment-bucket-xxxxxxxxxxxx

# AgentCore の認証に OAuth を使うか
🔐 Authorization Configuration
By default, Bedrock AgentCore uses IAM authorization.
Configure OAuth authorizer instead? (yes/no) [no]:
✓ Using default IAM authorization

# リクエストヘッダーにホワイトリストを使うか
🔒 Request Header Allowlist
Configure which request headers are allowed to pass through to your agent.
Common headers: Authorization, X-Amzn-Bedrock-AgentCore-Runtime-Custom-*
Configure request header allowlist? (yes/no) [no]:
✓ Using default request header configuration
Configuring BedrockAgentCore agent: weather_reporter_code_server_1

Memory Configuration
Tip: Use --disable-memory flag to skip memory entirely

✅ MemoryManager initialized for region: us-west-2

Options:
  • Enter a number to use existing memory
  • Press Enter to create new memory
  • Type 's' to skip memory setup
Your choice:
✓ Short-term memory will be enabled (default)
  • Stores conversations within sessions
  • Provides immediate context recall

Optional: Long-term memory
  • Extracts user preferences across sessions
  • Remembers facts and patterns
  • Creates session summaries
  • Note: Takes 120-180 seconds to process

Enable long-term memory? (yes/no) [no]:
✓ Using short-term memory only
Will create new memory with mode: STM_ONLY
Memory configuration: Short-term memory only
Network mode: PUBLIC
```

全て入力すると、コンフィグファイルが作成され、保存される。

/home/ubuntu/sample-agent/.bedrock_agentcore.yaml

### デプロイコマンドを実行

```sh
agentcore launch
```

自動で関連リソースが作成される。

✅ CodeBuild Deployment Successful! と表示されればデプロイ完了。

### デプロイした AgentCore Runtime を実行

agentcore-starter-toolkit を使って、AgentCore を実行出来る。

```sh
agentcore invoke '{"sessionId": "52433935-c9fd-480c-e3d2-d8a91369b3db", "prompt": "今日の横浜の天気を教えて下さい。"}'
```

天気予報が返ってくれば、AgentCore Runtime のデプロイは成功です。
