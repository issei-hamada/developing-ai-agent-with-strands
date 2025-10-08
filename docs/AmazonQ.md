# Strands Agents ツール実装ガイド（Amazon Q Developer 向け）

このドキュメントは、Amazon Q Developer が Strands Agents フレームワークのツールを理解し、ユーザーの依頼に応じてツールを作成できるようにするためのガイドです。

## 目次
1. [ツールの概要](#ツールの概要)
2. [Python ツールの実装方法](#python-ツールの実装方法)
3. [MCP ツール](#mcp-ツール)
4. [ツール実行方法（Executors）](#ツール実行方法executors)
5. [コミュニティツールパッケージ](#コミュニティツールパッケージ)

---

## ツールの概要

### ツールとは
ツールは、エージェントの機能を拡張するための主要なメカニズムです。ツールを使うことで、エージェントは以下が可能になります：
- 外部システムとの連携
- データへのアクセス
- 環境の操作

### ツールの特徴
- エージェントの初期化時または実行時に追加可能
- エージェントがコンテキストに基づいて自動的に適切なツールを選択・実行
- 自然言語リクエストまたは直接メソッド呼び出しで使用可能

### ツールの種類
1. **Python Tools** - 関数デコレータで作成できるツール
2. **MCP Tools** - Model Context Protocol を使った標準化されたツール
3. **Community Tools** - よく使われるタスクのための既製ツール

---

## Python ツールの実装方法

Python ツールには3つの実装アプローチがあります。

### 1. 関数デコレータを使った実装（推奨）

最もシンプルな方法です。`@tool` デコレータを使います。

#### 基本例
```python
from strands import tool

@tool
def weather_forecast(city: str, days: int = 3) -> str:
    """Get weather forecast for a city."""
    return f"Weather forecast for {city} for the next {days} days..."
```

#### 重要なポイント
- docstring がツールの説明として使用される
- 型ヒント（type hints）から自動的に入力スキーマが生成される
- 同期・非同期の両方に対応

#### 詳細な docstring の例
```python
@tool
def search_database(query: str, max_results: int = 10) -> list:
    """
    Search product database for items matching query string.

    Args:
        query: Search query string. Supports case-insensitive and fuzzy matching.
        max_results: Maximum number of results to return (default: 10)

    Returns:
        List of matching products with id, name, and price

    Note:
        - Searches across product name and description fields
        - Results are sorted by relevance
    """
    # 実装
    pass
```

#### 非同期ツールの例
```python
@tool
async def fetch_api_data(endpoint: str) -> dict:
    """Fetch data from external API."""
    # 非同期処理
    return {"status": "success", "data": [...]}
```

#### コンテキストを使う例
```python
from strands import tool, ToolContext

@tool
async def get_user_info(context: ToolContext) -> str:
    """Get current user information from context."""
    user_id = context.get("user_id")
    return f"User ID: {user_id}"
```

#### 複雑な戻り値の例
```python
@tool
def analyze_data(data: list) -> dict:
    """
    Analyze data and return structured results.

    Returns dictionary with:
    - status: "success" or "error"
    - content: Analysis results or error message
    """
    try:
        result = perform_analysis(data)
        return {
            "status": "success",
            "content": result
        }
    except Exception as e:
        return {
            "status": "error",
            "content": str(e)
        }
```

### 2. クラスベースツールの実装

複数の関連するツールをグループ化したり、状態を保持したい場合に有効です。

```python
from strands import tool

class WeatherTools:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.cache = {}

    @tool
    def get_current_weather(self, city: str) -> dict:
        """Get current weather for a city."""
        # 状態（self.cache）を使用可能
        if city in self.cache:
            return self.cache[city]

        # API 呼び出し
        result = self._fetch_weather(city)
        self.cache[city] = result
        return result

    @tool
    def get_forecast(self, city: str, days: int = 3) -> dict:
        """Get weather forecast for a city."""
        # 同じインスタンス内の他のメソッドも使用可能
        return self._fetch_forecast(city, days)

    def _fetch_weather(self, city: str) -> dict:
        # 内部ヘルパーメソッド（ツールではない）
        pass

# 使用例
weather_tools = WeatherTools(api_key="your_api_key")
agent = Agent(tools=[weather_tools.get_current_weather, weather_tools.get_forecast])
```

### 3. モジュールベースツールの実装

SDK に直接依存せずにツールを定義できます。

```python
# weather_tool.py

TOOL_SPEC = {
    "name": "get_weather",
    "description": "Get weather information for a city",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "City name"
            },
            "units": {
                "type": "string",
                "enum": ["celsius", "fahrenheit"],
                "description": "Temperature units"
            }
        },
        "required": ["city"]
    }
}

def get_weather(city: str, units: str = "celsius"):
    """実装"""
    return {
        "status": "success",
        "content": f"Weather in {city}: 20°{units[0].upper()}"
    }
```

### レスポンスフォーマット

ツールは以下の形式で結果を返すことができます：

1. **テキスト**: 単純な文字列
2. **JSON**: 辞書オブジェクト
3. **画像**: 画像データ
4. **ドキュメント**: 構造化ドキュメント

推奨される構造化レスポンス：
```python
{
    "status": "success",  # or "error"
    "content": "結果データ"
}
```

---

## MCP ツール

### MCP とは
Model Context Protocol (MCP) は、アプリケーションが大規模言語モデルにコンテキストを提供する方法を標準化したオープンプロトコルです。

### MCP の特徴
- 複数の接続方法をサポート：
  1. Standard I/O (stdio)
  2. Streamable HTTP
  3. Server-Sent Events (SSE)
  4. カスタムトランスポート

### 重要な注意点
**すべてのエージェント操作は MCP クライアントのコンテキストマネージャー内で実行する必要があります。**

### Standard I/O 接続の例
```python
from strands_mcp import MCPClient
from strands_mcp.transport import stdio_client, StdioServerParameters

# MCP クライアントの作成
stdio_mcp_client = MCPClient(lambda: stdio_client(
    StdioServerParameters(
        command="uvx",
        args=["server@latest"]
    )
))

# エージェントで使用
from strands import Agent

with stdio_mcp_client:
    agent = Agent(
        model="anthropic/claude-3-5-sonnet-20241022",
        mcp_client=stdio_mcp_client
    )
    response = agent.invoke("Use the MCP tools to help me")
```

### HTTP 接続の例
```python
from strands_mcp.transport import streamablehttp_client

streamable_http_mcp_client = MCPClient(
    lambda: streamablehttp_client("http://localhost:8000/mcp")
)

with streamable_http_mcp_client:
    agent = Agent(
        model="anthropic/claude-3-5-sonnet-20241022",
        mcp_client=streamable_http_mcp_client
    )
    response = agent.invoke("Use the HTTP MCP tools")
```

### 複数の MCP サーバーを使う例
```python
mcp_client_1 = MCPClient(lambda: stdio_client(...))
mcp_client_2 = MCPClient(lambda: streamablehttp_client(...))

with mcp_client_1, mcp_client_2:
    agent = Agent(
        model="anthropic/claude-3-5-sonnet-20241022",
        mcp_client=[mcp_client_1, mcp_client_2]
    )
    response = agent.invoke("Use tools from both MCP servers")
```

### MCP ツールのレスポンスフォーマット
```python
{
    "status": "success",  # or "error"
    "tool_use_id": "toolu_xxx",
    "content": [
        {
            "type": "text",
            "text": "Result data"
        }
        # または
        {
            "type": "image",
            "data": "base64_encoded_image",
            "mime_type": "image/png"
        }
    ]
}
```

### ベストプラクティス
- 必ずコンテキストマネージャー（`with` 文）を使用する
- サーバーの接続状態を確認する
- 適切なタイムアウトを設定する
- 詳細なツール説明を提供する
- 適切なエラーハンドリングを実装する

---

## ツール実行方法（Executors）

エージェントがツールを実行する方法をカスタマイズできます。

### 1. Concurrent Executor（並列実行・デフォルト）

複数のツールを同時に実行します。

```python
from strands import Agent, ConcurrentToolExecutor

agent = Agent(
    tool_executor=ConcurrentToolExecutor(),
    tools=[weather_tool, time_tool]
)
```

**重要**: 並列実行は、モデルが1つのレスポンスで複数のツール使用リクエストを返した場合にのみ実現されます。

### 2. Sequential Executor（順次実行）

ツールを順番に実行します。

```python
from strands import Agent, SequentialToolExecutor

agent = Agent(
    tool_executor=SequentialToolExecutor(),
    tools=[screenshot_tool, email_tool]
)
```

### 使い分け
- **並列実行**: 独立したツールの実行を高速化したい場合
- **順次実行**: ツールの実行順序が重要な場合（例：スクリーンショットを撮ってからメール送信）

### 注意点
- 一部のモデル（Anthropic など）は明示的に並列ツール使用をサポート
- カスタム Executor は現在サポートされていない（将来のリリースで予定）

---

## コミュニティツールパッケージ

Strands Agents には、よく使われるタスクのための既製ツールパッケージがあります。

### インストール
```bash
pip install strands-agents-tools
```

一部のツールは追加の依存関係が必要です。

### 利用可能なツールカテゴリ

1. **RAG & Memory** - データ検索と記憶
2. **File Operations** - ファイルの読み書き・編集
3. **Shell & System** - シェルコマンド実行
4. **Code Interpretation** - Python REPL
5. **Web & Network** - HTTP リクエスト、ブラウザ自動化
6. **Multi-modal** - 画像生成など
7. **AWS Services** - AWS サービスとの連携
8. **Utilities** - ユーティリティ機能
9. **Agents & Workflows** - マルチエージェントシステム

### 主要なツール例

#### ファイル操作
```python
from strands_agents_tools.file import read_file, edit_file

agent = Agent(tools=[read_file, edit_file])
```

#### シェルコマンド実行
```python
from strands_agents_tools.shell import execute_shell_command

agent = Agent(tools=[execute_shell_command])
```

#### HTTP リクエスト
```python
from strands_agents_tools.web import http_request

agent = Agent(tools=[http_request])
```

#### ブラウザ自動化
```python
from strands_agents_tools.browser import browser_automation

agent = Agent(tools=[browser_automation])
```

### 機能の特徴

#### ツール承認メカニズム
センシティブな操作には組み込みの承認メカニズムがあります。

```python
# 承認をバイパスする場合（開発時のみ）
import os
os.environ["BYPASS_TOOL_CONSENT"] = "true"
```

#### Human-in-the-Loop
```python
from strands_agents_tools.handoff import handoff_to_user

agent = Agent(tools=[handoff_to_user])
# ユーザーの介入が必要な場合にエージェントが使用
```

### 使用例
```python
from strands import Agent
from strands_agents_tools.file import read_file, edit_file
from strands_agents_tools.shell import execute_shell_command

agent = Agent(
    model="anthropic/claude-3-5-sonnet-20241022",
    tools=[read_file, edit_file, execute_shell_command]
)

response = agent.invoke("Read the config.json file and update the port to 8080")
```

---

## ツール作成のベストプラクティス

### 1. 明確で詳細な説明を提供
```python
@tool
def calculate_tax(amount: float, rate: float = 0.1) -> float:
    """
    Calculate tax amount based on the given amount and rate.

    Args:
        amount: The base amount to calculate tax on (must be positive)
        rate: Tax rate as a decimal (default: 0.1 for 10%)

    Returns:
        The calculated tax amount

    Raises:
        ValueError: If amount is negative

    Example:
        calculate_tax(100.0, 0.15) returns 15.0
    """
    if amount < 0:
        raise ValueError("Amount must be positive")
    return amount * rate
```

### 2. 適切な型ヒントを使用
```python
from typing import List, Dict, Optional

@tool
def search_items(
    query: str,
    filters: Optional[Dict[str, str]] = None,
    limit: int = 10
) -> List[Dict[str, any]]:
    """Search items with optional filters."""
    pass
```

### 3. エラーハンドリングを実装
```python
@tool
def api_call(endpoint: str) -> dict:
    """Make an API call to the specified endpoint."""
    try:
        response = make_request(endpoint)
        return {
            "status": "success",
            "content": response
        }
    except ConnectionError as e:
        return {
            "status": "error",
            "content": f"Connection failed: {str(e)}"
        }
    except Exception as e:
        return {
            "status": "error",
            "content": f"Unexpected error: {str(e)}"
        }
```

### 4. 制約や制限を明記
```python
@tool
def download_file(url: str, max_size_mb: int = 10) -> str:
    """
    Download a file from the specified URL.

    Limitations:
        - Maximum file size: 10MB (configurable via max_size_mb)
        - Supported protocols: HTTP, HTTPS only
        - Timeout: 30 seconds

    Note:
        Large files may take time to download. Consider the timeout limit.
    """
    pass
```

### 5. 適切な粒度でツールを設計
```python
# 良い例：単一責任
@tool
def read_config() -> dict:
    """Read configuration from file."""
    pass

@tool
def update_config(key: str, value: str) -> bool:
    """Update a specific configuration value."""
    pass

# 避けるべき例：複数の責任を持つツール
@tool
def manage_config(action: str, key: str = None, value: str = None):
    """Read or update configuration."""  # 曖昧
    pass
```

---

## まとめ

Strands Agents でツールを実装する際の重要なポイント：

1. **実装方法の選択**
   - シンプルな機能 → 関数デコレータ
   - 状態管理が必要 → クラスベース
   - SDK 非依存 → モジュールベース

2. **説明の重要性**
   - 詳細な docstring を記述
   - パラメータ、戻り値、制限を明記
   - 使用例を含める

3. **実行方法の選択**
   - デフォルトは並列実行
   - 順序が重要な場合は順次実行

4. **既存ツールの活用**
   - コミュニティパッケージを確認
   - 車輪の再発明を避ける

5. **エラーハンドリング**
   - 適切な例外処理
   - 構造化されたレスポンス

これらのガイドラインに従うことで、Amazon Q Developer は効果的な Strands Agents ツールを作成できます。
