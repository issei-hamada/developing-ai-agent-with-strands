# AmazonQ.md

## プロジェクト概要

このプロジェクトは、Streamlit と AWS Bedrock AgentCore を使用したAIエージェントチャットアプリケーションの開発環境です。

## 技術スタック

### フロントエンド
- **Streamlit**: PythonでWebアプリケーションを構築するためのフレームワーク
- シンプルなチャットUIを提供

### バックエンド
- **AWS Bedrock AgentCore**: AIエージェントのデプロイ・実行環境
- **Strands Agents**: エージェント開発フレームワーク
- **Amazon Bedrock**: Claude などの基盤モデルへのアクセス

### 開発環境
- Python 3.12
- uv パッケージマネージャー
- 仮想環境 (.venv)

## エージェントソースコード

エージェントのソースコードは通常、以下のディレクトリに配置されます：
- `/home/ubuntu/sample-agent` または
- プロジェクトルートディレクトリ

## 言語設定

- **使用言語**: 日本語
- すべてのコミュニケーションは日本語で行ってください
- コメントやドキュメントも日本語で記述してください
- ユーザーへの説明も日本語で提供してください

## 開発ガイドライン

### Python 開発

- **Python バージョン**: Python 3.12 以上
- **パッケージマネージャー**: uv を使用
- **仮想環境**: `.venv` ディレクトリで管理
- **コードスタイル**: PEP 8 に準拠
- **行の長さ**: 最大88文字（Blackデフォルト）

### パッケージ管理

```bash
# パッケージの追加
uv add package-name

# 開発用パッケージの追加
uv add --dev package-name

# 依存関係のインストール
uv sync
```

### コーディング規約

- **変数名・関数名**: `snake_case` を使用
- **クラス名**: `PascalCase` を使用
- **定数**: `UPPER_SNAKE_CASE` を使用
- **プライベート変数・メソッド**: 先頭にアンダースコア `_` を付ける
- **日本語コメント**: 積極的に活用してください

### Streamlit アプリケーション

- `st.session_state` を使用してセッション管理
- `st.chat_message` と `st.chat_input` でチャットUIを実装
- エラー発生時は `st.error()` で日本語のエラーメッセージを表示

### AgentCore との連携

- エージェントは HTTP POST リクエストで呼び出し
- リクエストボディ: `{"sessionId": "...", "prompt": "..."}`
- レスポンスは JSON 形式で返却される

### エラーハンドリング

- 適切な例外処理を実装
- ユーザーフレンドリーなエラーメッセージを日本語で提供
- try-except ブロックを適切に使用
- ログ出力には適切なレベル（INFO, WARNING, ERROR）を使用

### セキュリティ

- API キーや認証情報は環境変数から取得
- `.env` ファイルは `.gitignore` に追加
- ユーザー入力は適切にバリデーション

## 重要な制約事項

- システムファイルの変更は最小限に
- 開発者の環境を損なわないよう配慮
- 既存のファイル構造を尊重
- 必要なファイルのみを作成・変更

## ディレクトリ構成（例）

```
project-root/
├── app.py              # Streamlit アプリケーション
├── .env               # 環境変数（gitignoreに追加）
├── pyproject.toml     # プロジェクト設定
├── .venv/             # 仮想環境
└── README.md          # プロジェクト説明
```

## 開発フロー

1. **要件定義**: 実装する機能を明確化
2. **設計**: アーキテクチャとデータフローを設計
3. **実装**: コーディング規約に従って実装
4. **テスト**: 動作確認とエラーハンドリングの検証
5. **ドキュメント**: README やコメントの更新

## よくある実装パターン

### Streamlit チャットアプリの基本構造

```python
import streamlit as st

# ページ設定
st.set_page_config(page_title="チャットアプリ", page_icon="💬")

# セッション状態の初期化
if "messages" not in st.session_state:
    st.session_state.messages = []

# メッセージ履歴の表示
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# ユーザー入力の処理
if prompt := st.chat_input("メッセージを入力してください"):
    # ユーザーメッセージを追加
    st.session_state.messages.append({"role": "user", "content": prompt})

    # エージェントからの応答を取得
    response = call_agent(prompt)
    st.session_state.messages.append({"role": "assistant", "content": response})
```

## 注意事項

- コードを書く前に、必ず要件を確認してください
- 実装する際は、段階的に進めてください
- エラーが発生した場合は、詳細なログを出力してください
- ユーザーに対して丁寧な日本語で説明してください
