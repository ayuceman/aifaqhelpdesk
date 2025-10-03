# Ollama Setup Guide

The AI FAQ Generator now uses **Ollama** as the default LLM provider for local, privacy-focused AI inference.

## Quick Start

### 1. Install Ollama

**Windows:**
```bash
# Download from https://ollama.ai/download
# Or use winget
winget install Ollama.Ollama
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull Required Models

```bash
# Chat model (default: llama3.2)
ollama pull llama3.2

# Embedding model (default: nomic-embed-text)
ollama pull nomic-embed-text
```

### 3. Start Ollama Service

Ollama should start automatically. If not:

```bash
ollama serve
```

Verify it's running at http://localhost:11434

### 4. Run the Application

```bash
npm run dev
```

The app will automatically use Ollama by default!

## Recommended Models

### Chat Models (for FAQ generation)
- **llama3.2** (default) - 3B parameters, fast and efficient
- **llama3.1** - 8B parameters, better quality
- **mistral** - 7B parameters, excellent for structured output
- **phi3** - 3.8B parameters, very fast

### Embedding Models (for similarity search)
- **nomic-embed-text** (default) - 768 dimensions
- **all-minilm** - 384 dimensions, smaller and faster
- **mxbai-embed-large** - 1024 dimensions, higher quality

## Configuration

Edit `server/.env`:

```env
# Use Ollama (default)
USE_OLLAMA=true

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### Switch Models

To use a different model:

```bash
# Pull the model
ollama pull mistral

# Update .env
OLLAMA_MODEL=mistral
```

### Switch to OpenAI

To use OpenAI instead:

```env
USE_OLLAMA=false
LLM_API_KEY=your_actual_openai_api_key
```

## Available Models

List all available models:
```bash
ollama list
```

Search for models:
```bash
ollama search <model-name>
```

## Performance Tips

1. **Model Size**: Smaller models (3-7B) are faster, larger models (13B+) are more accurate
2. **GPU**: Ollama automatically uses GPU if available (NVIDIA, AMD, Apple Silicon)
3. **Memory**: 
   - 3B models: ~4GB RAM
   - 7B models: ~8GB RAM
   - 13B models: ~16GB RAM

## Troubleshooting

### Ollama Not Running
```bash
# Check if Ollama is running
curl http://localhost:11434

# Restart Ollama
ollama serve
```

### Model Not Found
```bash
# Pull the model
ollama pull llama3.2
ollama pull nomic-embed-text
```

### Slow Generation
- Use a smaller model (llama3.2, phi3)
- Enable GPU acceleration
- Reduce `maxQuestions` parameter

### Connection Errors
- Verify Ollama is running: `curl http://localhost:11434`
- Check firewall settings
- Ensure correct `OLLAMA_BASE_URL` in .env

## Model Comparison

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| llama3.2 | 3B | ⚡⚡⚡ | ⭐⭐⭐ | Default - Fast FAQ generation |
| mistral | 7B | ⚡⚡ | ⭐⭐⭐⭐ | Better structured output |
| llama3.1 | 8B | ⚡⚡ | ⭐⭐⭐⭐ | High quality responses |
| phi3 | 3.8B | ⚡⚡⚡ | ⭐⭐⭐ | Very fast, good quality |

## Advanced Configuration

### Custom Ollama Host
If Ollama is running on a different machine:

```env
OLLAMA_BASE_URL=http://192.168.1.100:11434/v1
```

### Multiple Models
You can switch models without restarting:

1. Pull multiple models
2. Change `OLLAMA_MODEL` in .env
3. Restart the server

### Fine-tuned Models
Use your own fine-tuned Ollama models:

```env
OLLAMA_MODEL=my-custom-model
```

## Benefits of Ollama

✅ **Privacy**: All data stays local, no external API calls  
✅ **Free**: No API costs or rate limits  
✅ **Fast**: Low latency with local inference  
✅ **Offline**: Works without internet connection  
✅ **Customizable**: Use any Ollama-compatible model  

## More Information

- Ollama Documentation: https://ollama.ai/docs
- Model Library: https://ollama.ai/library
- GitHub: https://github.com/ollama/ollama
