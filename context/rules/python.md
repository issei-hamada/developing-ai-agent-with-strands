# Python コーディング規約

## 開発環境

### パッケージマネージャー

- **uv** を使用してPythonパッケージを管理する
- `pip` の直接使用は避ける

**例:**

```bash
# uvのインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# パッケージの追加
uv add requests
```

### 仮想環境

- プロジェクトごとに `.venv` ディレクトリを作成
- 仮想環境の有効化を必須とする

**例:**

```bash
# 仮想環境の作成
uv venv .venv

# 仮想環境の有効化
source .venv/bin/activate  # Linux/Mac
# または
.venv\Scripts\activate  # Windows
```

## 依存関係管理

### パッケージのインストール

```bash
# パッケージの追加
uv add package-name

# 開発用パッケージの追加
uv add --dev package-name

# requirements.txtからインストール
uv pip install -r requirements.txt
```

### pyproject.toml

- `pyproject.toml` でプロジェクトメタデータと依存関係を管理
- `dependencies` セクションに本番依存関係を記載
- `[tool.uv]` セクションに開発依存関係を記載

**例:**

```toml
[project]
name = "my-agent"
version = "0.1.0"
dependencies = [
    "strands-agents>=0.2.0",
    "boto3>=1.34.0",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "black>=24.0.0",
]
```

### バージョン固定

- 本番環境では依存関係のバージョンを固定
- `>=` や `~=` は慎重に使用

**例:**
```toml
# 推奨: バージョンを固定
dependencies = [
    "strands-agents==0.2.5",
    "boto3==1.34.51",
]

# 開発環境では柔軟に
dev-dependencies = [
    "pytest>=8.0.0",
]
```

## コードスタイル

- [PEP 8](https://pep8-ja.readthedocs.io/) スタイルガイドに従う
- 行の長さ: 最大88文字（Blackデフォルト）
- インデント: スペース4つ

**例:**
```python
# 良い例: PEP 8に準拠
def calculate_total_price(items: list[dict], tax_rate: float = 0.1) -> float:
    """商品リストから税込み合計金額を計算する。"""
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    return subtotal * (1 + tax_rate)


# 悪い例: インデントや命名規則が不適切
def calcTotalPrice(items,tax_rate=0.1):
  subtotal=sum([item["price"]*item["quantity"] for item in items])
  return subtotal*(1+tax_rate)
```

## 命名規則

- 変数・関数: `snake_case` を使用
  - 意味のある名前を付ける
  - 略語は避ける（一般的なものを除く）
- クラス: `PascalCase` を使用
- 定数: `UPPER_SNAKE_CASE` を使用
- プライベート変数・メソッド: 先頭にアンダースコア `_` を付ける

**例:**
```python
# 定数
MAX_RETRY_COUNT = 3
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"

# クラス
class UserService:
    def __init__(self, database_url: str):
        self.database_url = database_url
        self._connection_pool = {}  # プライベート変数

    def _validate_email(self, email: str) -> bool:  # プライベートメソッド
        """メールアドレスの形式を検証する"""
        return "@" in email

    def get_user(self, user_id: int) -> dict:  # パブリックメソッド
        """ユーザー情報を取得する"""
        return {}

# 関数と変数
def fetch_api_data(endpoint_path: str, query_params: dict = None) -> dict:
    """APIからデータを取得する"""
    base_url = "https://api.example.com"
    timeout_seconds = 30
    return {}
```

## Docstring

### スタイル

- Google StyleまたはNumPy Styleを使用
- すべての公開関数・クラスにdocstringを記載

**例:**
```python
def calculate_discount(price: float, discount_rate: float = 0.1) -> float:
    """商品価格に割引を適用して計算する。

    Args:
        price (float): 元の価格（円）
        discount_rate (float, optional): 割引率（0.0-1.0）。デフォルトは0.1（10%）。

    Returns:
        float: 割引後の価格（円）

    Raises:
        ValueError: 価格が負の値の場合
        ValueError: 割引率が0.0-1.0の範囲外の場合

    Examples:
        >>> calculate_discount(1000, 0.2)
        800.0
        >>> calculate_discount(1500)
        1350.0
    """
    if price < 0:
        raise ValueError("価格は0以上である必要があります")
    if not 0 <= discount_rate <= 1:
        raise ValueError("割引率は0.0から1.0の範囲で指定してください")

    return price * (1 - discount_rate)
```

## Import文

### 順序

1. 標準ライブラリ
2. サードパーティライブラリ
3. ローカルモジュール

各グループ間は空行で区切る

**例:**
```python
# 標準ライブラリ
import json
import os
from datetime import datetime
from typing import List, Optional

# サードパーティライブラリ
import numpy as np
import pandas as pd
import requests
from flask import Flask, request

# ローカルモジュール
from models.user import User
from utils.database import DatabaseConnection
from utils.logger import setup_logger
```

## セキュリティ

### 認証情報

- API キーやパスワードはコードに埋め込まない
- 環境変数または AWS Systems Manager Parameter Store を使用

**例:**
```python
import os
import boto3

# 良い例: 環境変数から取得
api_key = os.environ.get("API_KEY")

# 良い例: AWS Systems Manager Parameter Storeから取得
ssm = boto3.client("ssm", region_name="us-west-2")
response = ssm.get_parameter(Name="/myapp/api_key", WithDecryption=True)
api_key = response["Parameter"]["Value"]

# 悪い例: ハードコーディング（絶対にしない）
# api_key = "sk-1234567890abcdef"  # NG!
```

### 入力検証

- ユーザー入力は必ず検証する
- SQLインジェクション、コマンドインジェクション、XSS に注意

**例:**
```python
import re
import sqlite3
from typing import Optional

def validate_email(email: str) -> bool:
    """メールアドレスを検証する"""
    # 基本的なメールアドレスの形式チェック
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError(f"無効なメールアドレス: {email}")
    return True

def validate_username(username: str) -> bool:
    """ユーザー名を検証する"""
    # 英数字とアンダースコアのみ許可（3-20文字）
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        raise ValueError("ユーザー名は3-20文字の英数字とアンダースコアのみ使用可能です")
    return True

def safe_database_query(user_id: int, conn: sqlite3.Connection) -> dict:
    """ユーザー入力を安全に処理してデータベースクエリを実行する"""
    # 悪い例: SQLインジェクションの危険性
    # query = f"SELECT * FROM users WHERE id = {user_id}"  # NG!

    # 良い例: パラメータ化されたクエリを使用
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return cursor.fetchone()
```

## ドキュメント

### README.md

必須セクション:

- プロジェクト概要
- インストール方法
- 使用方法
- 設定方法
- ライセンス

**例:**
```markdown
# My Python Application

データ処理とAPI連携を行うPythonアプリケーション

## インストール

```bash
# uvをインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# 仮想環境を作成・有効化
uv venv .venv
source .venv/bin/activate

# 依存関係をインストール
uv sync
```

## 使用方法

```bash
# アプリケーションを実行
python main.py --input data.csv --output results.json

# テストを実行
pytest tests/
```

## 設定方法

環境変数ファイル `.env` を作成してください：

```bash
DATABASE_URL=postgresql://user:pass@localhost/dbname
API_TIMEOUT=30
LOG_LEVEL=INFO
```

## ライセンス

MIT License

### コメント

- コードで意図が明確な場合はコメント不要
- 複雑なロジックや理由を説明する場合のみ記載

**例:**
```python
# 良い例: 複雑なロジックの理由を説明
def calculate_final_score(scores: list[float]) -> float:
    # 最高点と最低点を除外して平均を計算
    # 極端な値の影響を減らすため（採点方式の要件）
    if len(scores) <= 2:
        return sum(scores) / len(scores)

    sorted_scores = sorted(scores)
    middle_scores = sorted_scores[1:-1]
    return sum(middle_scores) / len(middle_scores)


# 悪い例: 自明なコメント（不要）
# 変数に値を代入する
total = 0  # 合計を0で初期化
count = len(items)  # アイテム数を取得

# 良い例: コメント不要（コード自体が意図を表現）
total = 0
for item in items:
    total += item.price
```
