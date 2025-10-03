# Performance Tips for AI FAQ Generator

## Optimizations for Qwen3:8B Model

The application has been optimized for local Ollama models like qwen3:8b. Here's what has been improved:

### ✅ **Implemented Optimizations**

1. **Content Truncation**
   - Max 3000 characters (~750 words) sent to model
   - Prevents long processing times with large documents
   - Focus on most relevant content

2. **Token Limiting**
   - Max 2000 tokens output for Ollama models
   - Faster generation with constrained output
   - Prevents runaway generation

3. **Simplified Prompts**
   - Shorter, more direct prompts
   - Reduces processing overhead
   - Clearer JSON output instructions

4. **Extended Timeout**
   - 3 minutes (180 seconds) for local models
   - Accommodates slower hardware
   - Prevents premature failures

5. **Better Default Settings**
   - Default: 10 questions (was 15)
   - Recommended range: 5-10 for fast results
   - Max: 50 for comprehensive FAQs

### 🚀 **Performance Guidelines**

| Questions | Expected Time | Use Case |
|-----------|--------------|----------|
| 5         | 30-60 sec    | Quick testing |
| 10        | 1-2 min      | Recommended default |
| 15        | 2-3 min      | Good balance |
| 20-30     | 3-5 min      | Comprehensive |
| 50        | 5-10 min     | Maximum coverage |

### 💡 **Tips for Faster Generation**

1. **Start Small**
   - Test with 5-10 questions first
   - Verify quality before scaling up

2. **Shorter Content**
   - Upload smaller files or excerpts
   - Use first 750 words of long documents
   - More focused = faster processing

3. **Choose Tone Wisely**
   - "Concise" = shortest answers = fastest
   - "Formal" = longer answers = slower
   - "Friendly" = medium length

4. **Hardware Considerations**
   - GPU: Much faster (NVIDIA/AMD recommended)
   - CPU only: Expect 2-3x longer times
   - RAM: 16GB+ recommended for 8B models

### ⚡ **First-Time Generation**

The FIRST FAQ generation after starting Ollama takes longer because:
- Model loads into memory (~5-10 seconds)
- Context window initialization
- Subsequent generations are faster

### 🔧 **If Still Too Slow**

1. **Use Smaller Model**
   ```bash
   ollama pull qwen2.5:3b
   ```
   Update `.env`:
   ```
   OLLAMA_MODEL=qwen2.5:3b
   ```

2. **Enable GPU Acceleration**
   - Ollama auto-detects GPU
   - Verify: Check GPU usage during generation
   - NVIDIA: Install CUDA drivers
   - AMD: Install ROCm

3. **Reduce Content Length**
   - Manually limit input to 500-1000 words
   - Focus on key sections

4. **Batch Processing**
   - Generate 5 FAQs at a time
   - Edit and combine manually

### 🐛 **Troubleshooting Timeouts**

If you still get timeouts:

1. **Check Ollama Status**
   ```bash
   ollama list
   curl http://localhost:11434
   ```

2. **Test Model Directly**
   ```bash
   ollama run qwen3:8b "Generate 3 FAQ pairs about AI"
   ```

3. **Monitor Resources**
   - Task Manager: Check CPU/RAM usage
   - If maxed out: Close other apps

4. **Restart Ollama**
   ```bash
   # Kill and restart Ollama service
   ```

### 📊 **Performance Benchmarks**

**System**: Average Laptop (8-core CPU, 16GB RAM, No GPU)
- 5 questions: ~45 seconds
- 10 questions: ~90 seconds
- 15 questions: ~2.5 minutes

**System**: Desktop (8-core CPU, 32GB RAM, RTX 3060)
- 5 questions: ~15 seconds
- 10 questions: ~30 seconds
- 15 questions: ~45 seconds

### 🎯 **Recommended Workflow**

1. Upload small test document (500 words)
2. Generate 5 FAQs to test quality
3. Adjust tone/style if needed
4. Scale up to 10-15 questions
5. Edit and refine generated FAQs
6. Publish to widget

### 🔄 **Alternative: Switch to OpenAI**

For faster generation, use OpenAI API:

```bash
# Edit server/.env
USE_OLLAMA=false
LLM_API_KEY=sk-your-actual-key
```

OpenAI GPT-3.5-turbo:
- 5 questions: ~5 seconds
- 15 questions: ~10 seconds
- 50 questions: ~20 seconds

**Trade-off**: Costs money, but much faster and more reliable.
