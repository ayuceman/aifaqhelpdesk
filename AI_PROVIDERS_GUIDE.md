# AI Provider Configuration Guide

Your AI FAQ Generator now supports **4 different AI providers**! Choose the one that best fits your needs.

## 🚀 Quick Start

**Default:** Ollama (Local, Free) - Already configured! ✅

**To switch providers:** Go to Settings → AI Provider in your dashboard

---

## 🖥️ **Ollama** (Default - FREE)

### ✅ Best For:
- Development and testing
- Privacy-conscious users
- No API costs
- Offline usage

### 📋 Setup:
```bash
# Already installed and working! ✅
# Models: qwen2.5:3b, nomic-embed-text
```

### 💰 Cost: **FREE**

### ⚙️ Configuration:
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

---

## 🤖 **OpenAI** (Best Quality)

### ✅ Best For:
- Production use
- Best AI quality
- Reliable and fast
- Scalable

### 📋 Setup:
1. Sign up: https://platform.openai.com/signup
2. Get $5 free credit (enough for months of testing!)
3. Create API key: https://platform.openai.com/api-keys
4. Add to `.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 💰 Cost:
- **$5 FREE credit** for new accounts
- Chat: $0.50 per 1M tokens (~$0.001 per response)
- Embeddings: $0.02 per 1M tokens (~$0.0001 per FAQ)
- **Real cost:** ~$1-5 per month for typical usage

### 📊 Example Costs:
```
100 FAQ generations: ~$0.10
1,000 chat queries: ~$1.00
5,000 embeddings: ~$0.01
────────────────────────────
Total: ~$1.11/month
Your revenue: $39-199/month
Profit: 97%+ 🚀
```

---

## ✨ **Google Gemini** (Free Tier Available)

### ✅ Best For:
- Free tier testing
- Good balance of quality/cost
- Google ecosystem users

### 📋 Setup:
1. Get API key: https://makersuite.google.com/app/apikey
2. Add to `.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

### 💰 Cost:
- **FREE tier:** 15 requests per minute
- Paid: $0.075 per 1M tokens
- Cheaper than OpenAI!

---

## 🤗 **Hugging Face** (Open Source)

### ✅ Best For:
- Open source enthusiasts
- Free testing
- Custom models

### 📋 Setup:
1. Create account: https://huggingface.co/join
2. Get token: https://huggingface.co/settings/tokens
3. Add to `.env`:

```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your-token-here
HUGGINGFACE_MODEL=microsoft/phi-2
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### 💰 Cost:
- **FREE tier** available (rate limited)
- Paid: $9/month for Pro

---

## 🔄 Switching Providers

### In Dashboard (Easy):
1. Go to **Settings** → **AI Provider**
2. Click on any **configured** provider
3. Click **Test** to verify it works
4. That's it! All FAQs and chats now use the new provider ✅

### Via Environment (Advanced):
```bash
# Edit server/.env or set environment variable
AI_PROVIDER=openai  # or gemini, huggingface, ollama
```

---

## 🎯 Recommendations

| Use Case | Recommended Provider | Why |
|----------|---------------------|-----|
| **Development** | Ollama | Free, fast, no API limits |
| **Production** | OpenAI | Best quality, reliable, scalable |
| **Budget-conscious** | Gemini | Free tier + low costs |
| **Testing** | Hugging Face | Free tier for experiments |

---

## 🔧 Troubleshooting

### Provider shows "Not configured"?
- Check `.env` file has the correct API key
- Restart the server after adding keys
- API key format: OpenAI starts with `sk-`, Gemini has no prefix

### Test fails?
- Verify API key is valid
- Check internet connection (for cloud providers)
- For Ollama: Ensure it's running (`ollama serve`)
- Check rate limits (especially free tiers)

### Embeddings not working?
- Each provider has different embedding dimensions:
  - Ollama (nomic-embed-text): 768
  - OpenAI (text-embedding-3-small): 1536
  - Gemini (text-embedding-004): 768
  - Hugging Face (all-MiniLM-L6-v2): 384
- **Solution:** Rebuild embeddings after switching providers

---

## 📊 Provider Comparison

| Feature | Ollama | OpenAI | Gemini | Hugging Face |
|---------|--------|--------|--------|--------------|
| **Setup** | Easy | Easy | Easy | Medium |
| **Cost** | Free | ~$1-5/mo | Free/cheap | Free/cheap |
| **Quality** | Good | Excellent | Very Good | Good |
| **Speed** | Fast | Fast | Fast | Medium |
| **Offline** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Privacy** | ✅ Local | ❌ Cloud | ❌ Cloud | ❌ Cloud |
| **Free Tier** | ✅ Forever | $5 credit | ✅ Limited | ✅ Limited |

---

## 🎓 Getting API Keys (Free)

### OpenAI ($5 Free Credit):
```
1. Visit: https://platform.openai.com/signup
2. Verify email
3. Go to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy key starting with "sk-proj-..."
6. Add to .env: OPENAI_API_KEY=sk-proj-...
```

### Google Gemini (Free Tier):
```
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API key"
4. Copy the key
5. Add to .env: GEMINI_API_KEY=your-key
```

### Hugging Face (Free):
```
1. Visit: https://huggingface.co/join
2. Create account
3. Go to: https://huggingface.co/settings/tokens
4. Create new token
5. Add to .env: HUGGINGFACE_API_KEY=hf_...
```

---

## 💡 Pro Tips

1. **Start with Ollama** - It's already working!
2. **Test OpenAI** - Get $5 free credit, perfect for production
3. **Keep Ollama as backup** - If cloud APIs go down
4. **Rebuild embeddings** when switching providers
5. **Monitor costs** - Set up billing alerts on cloud providers

---

Need help? Check the Settings page to test each provider! 🚀

