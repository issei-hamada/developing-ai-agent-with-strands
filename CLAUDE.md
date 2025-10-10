# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a workshop repository for learning how to build AI agents using Strands Agents framework and deploy them using Amazon Bedrock's AgentCore. The project demonstrates a practical weather forecaster agent that uses the Japan Meteorological Agency API.

## Key Commands

### Development Environment Setup

```bash
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Create and activate virtual environment
uv venv .venv
source .venv/bin/activate

# Install dependencies
uv add strands-agents strands-agents-tools

# Run agent locally
python -u main.py

# Run with arguments (for weather forecaster agent)
python -u main.py '{"sessionId": "uuid-here", "prompt": "今日の横浜の天気を教えて下さい。"}'
```

### AgentCore Deployment

```bash
# Install AgentCore packages
uv add bedrock-agentcore bedrock-agentcore-starter-toolkit

# Test agent locally as web server
uv run main.py  # Starts on port 8080

# Test with curl
curl -X POST http://localhost:8080/invocations \
    -H "Content-Type: application/json" \
    -d '{"sessionId": "uuid", "prompt": "query"}' | jq -r .

# Configure AgentCore
agentcore configure -e main.py

# Deploy to AWS
agentcore launch

# Invoke deployed agent
agentcore invoke '{"sessionId": "uuid", "prompt": "query"}'
```

### CDK Infrastructure (code-server subdirectory)

```bash
cd code-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy workshop infrastructure
cdk deploy

# Destroy infrastructure
cdk destroy
```

## Architecture Overview

### Agent Development with Strands Agents

The core agent implementation follows this pattern:

1. **Model Selection**: Configure LLM backend (Claude, Nova, GPT via Bedrock)
2. **System Prompt**: Define agent personality and capabilities
3. **Session Management**: Use `FileSessionManager` (local) or `S3SessionManager` (production)
4. **Conversation Strategy**: Implement history management (sliding window or summarization)
5. **Tools**: Add custom tools using `@tool` decorator
6. **Response Control**: Choose sync, streaming, or structured output

### Key Components

#### Weather Forecast Tool (`tools/weather_forecast.py`)

Custom tool that fetches weather data from Japan Meteorological Agency API:
- Uses `@tool` decorator to make function callable by agent
- Supports short-term (3 days) and weekly (7 days) forecasts
- Prefecture name flexible matching ("東京" → "東京都")
- Returns JSON with weather, temperature, precipitation, wind, wave data

**Important**: The agent reads the function's docstring to understand tool capabilities. Always write clear, detailed docstrings with Args, Returns, Raises, and Examples sections.

#### Session Management

- **FileSessionManager**: Stores conversation history in `.sessions/` directory
  - Format: `.sessions/session_{sessionId}/agents/agent_default/messages/message_N.json`
  - Good for development and testing
  - Need rotation strategy for production

- **S3SessionManager**: Stores sessions in S3 bucket
  - Recommended for production (scalable, low-cost)
  - Requires bucket configuration and AWS credentials

#### Conversation History Strategies

- **SlidingWindowConversationManager**: Keep only last N messages
  - `window_size`: Number of messages to retain
  - `should_truncate_results`: Truncate large tool outputs

- **SummarizingConversationManager**: Summarize old messages, keep recent ones
  - `summary_ratio`: Percentage of messages to summarize
  - `preserve_recent_messages`: Minimum messages to keep unsummarized

### AgentCore Deployment Pattern

To convert a Strands agent to AgentCore:

1. Import: `from bedrock_agentcore.runtime import BedrockAgentCoreApp`
2. Create app: `app = BedrockAgentCoreApp()`
3. Decorate entrypoint: `@app.entrypoint`
4. Change main: `if __name__ == "__main__": app.run()`

The app runs as a web server on port 8080, accepting POST requests to `/invocations`.

### Workshop Infrastructure (code-server/)

AWS CDK stack that deploys 25 EC2 instances with code-server (web-based VS Code):
- Each instance pre-configured with AWS CLI, SAM CLI, Docker, Python, Node.js
- Accessible via HTTPS on port 50443
- Passwords stored in SSM Parameter Store
- Shared VPC and CloudFormation execution role
- Used for hands-on workshop environments

## Important Implementation Details

### Tool Development Best Practices

1. **Use @tool decorator**: Required for Strands to recognize functions as tools
2. **Write comprehensive docstrings**: The agent relies on docstrings to understand:
   - What the tool does
   - What arguments it accepts
   - What it returns
   - Example usage
3. **Return strings**: Tools should return string (often JSON) for agent consumption
4. **Error handling**: Return error messages as JSON, don't raise exceptions

### Model Configuration

Default model: `global.anthropic.claude-sonnet-4-20250514-v1:0` (Claude Sonnet 4.5)
Default region: `us-west-2`

Switch models by changing `MODEL_ID`:
- Claude: `global.anthropic.claude-sonnet-4-20250514-v1:0`
- Nova: `us.amazon.nova-pro-v1:0`
- GPT: `openai.gpt-oss-120b-1:0`

### System Prompt Structure

Include these elements in system prompts:
- Role/personality definition
- Available tools and their purposes
- Behavioral guidelines
- Response format expectations
- Error handling instructions
- Ethical guidelines and limitations

### Response Types

1. **Synchronous**: `result = agent("prompt")` - Wait for complete response
2. **Streaming**: `async for event in agent.stream_async("prompt")` - Get incremental updates
3. **Structured**: `agent.structured_output(PydanticModel, "prompt")` - Get typed Python object

### Session Management Best Practices

- Generate session IDs client-side (use UUID)
- Implement session file rotation to prevent disk/storage bloat
- Always use conversation history management (sliding window or summarization)
- Prevents context size overflow errors

## Project Structure

```
.
├── docs/                          # Workshop documentation (Japanese)
│   ├── 01_Python開発環境の構築.md    # Setting up Python with uv
│   ├── 02_StrandsAgentsを使ってAIエージェントを開発する.md  # Agent development
│   └── 03_AgentCoreを使ってAIエージェントをデプロイする.md   # AgentCore deployment
├── tools/                         # Custom tools
│   └── weather_forecast.py        # JMA weather API tool
└── code-server/                   # Workshop infrastructure (CDK)
    ├── lib/constructs/            # CDK constructs
    ├── lib/config/                # Configuration
    └── bin/workshop.ts            # CDK app entry point
```

## Testing Agents

### Local Development Test

```python
from strands import Agent
from strands.models import BedrockModel

agent = Agent(model=BedrockModel(model_id="MODEL_ID"))
response = agent("Test prompt")
print(response)
```

### AgentCore Local Test

```bash
# Terminal 1: Start server
uv run main.py

# Terminal 2: Test
curl -X POST http://localhost:8080/invocations \
    -H "Content-Type: application/json" \
    -d '{"sessionId": "test-123", "prompt": "Hello"}'
```

### Production Test

```bash
agentcore invoke '{"sessionId": "prod-uuid", "prompt": "query"}'
```

## Common Patterns

### Adding Async Streaming Support

```python
import asyncio

async def stream_response():
    async for event in agent.stream_async("prompt"):
        if "data" in event:
            print(event["data"])

asyncio.run(stream_response())
```

### Using Community Tools

```python
from strands_tools import http_request

agent = Agent(
    model=bedrock_model,
    tools=[http_request]
)
```

### Adding System Context

```python
from datetime import datetime

system_prompt = BASE_PROMPT + f"""
現在の時刻: {datetime.now()}
"""
```
