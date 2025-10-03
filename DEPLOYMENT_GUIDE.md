# Deployment Guide - Feature/Step2

## ✅ Completed Features

### 1. Multi-Tenant Architecture
- Project-based storage: `server/data/projects/{project}/faq.json`
- Each project has isolated FAQs and embeddings
- Default project: "default", demo project: "demo"

### 2. Demo Data
- Pre-loaded demo FAQ with 10 Q&As
- Located at: `server/data/projects/demo/`
- Ready to test immediately

### 3. Environment Configuration
- Added SUPPORT_EMAIL
- Added CLIENT_URL
- Added rate limiting config
- See `server/env.example`

### 4. API Updates
- `GET /api/public/faq?project=demo` - Get project FAQs
- `POST /api/public/chat` - body includes `project` field
- Default project is "default" if not specified

## 🚧 Next Steps

### Immediate (30-60 min)
1. **Add Rate Limiting**
   ```bash
   cd server && npm install express-rate-limit
   ```
   Add to server/src/index.ts

2. **Update Widget Route**
   Add project parameter support to `/widget?project=demo`

3. **Update FAQ Routes**
   Add project parameter to all FAQ CRUD operations

### Landing Page (45-90 min)
4. **Create Landing Page Component**
   - Hero section
   - 3-step "How it works"
   - Demo button → loads demo FAQs
   - Embed code display

5. **Add Demo Mode**
   - Button: "Load Demo FAQs"
   - Fetches `/api/public/faq?project=demo`
   - Shows in read-only mode

### Security (20-30 min)
6. **Rate Limiting**
   - 60 requests per 5 minutes per IP
   - Apply to `/api/public/chat`

7. **CORS Configuration**
   - Restrict to known domains in production
   - Allow localhost for development

8. **Input Validation**
   - Max file size: 10MB
   - Max scrape chars: 250k
   - Max question length: 500 chars

### Legal & Support (20-30 min)
9. **Footer Pages**
   - Privacy Policy
   - Terms of Service
   - Contact page

10. **Support Email Setup**
    - Configure SUPPORT_EMAIL in .env
    - Add to error messages
    - Display in widget when no answer found

## Testing Checklist

- [ ] Upload PDF → Generate FAQ → Publish
- [ ] Crawl URL → Generate FAQ → Publish
- [ ] Widget with `?project=demo` works
- [ ] Widget with `?project=default` works
- [ ] Keyword search returns relevant answers
- [ ] Rate limiting blocks after 60 requests
- [ ] Mobile responsive (landing + widget)

## Environment Setup

```bash
# Development
PORT=3001
SUPPORT_EMAIL=support@yourcompany.com
CLIENT_URL=http://localhost:5173
USE_OLLAMA=true
OLLAMA_MODEL=qwen2.5:3b

# Production (example)
PORT=3001
SUPPORT_EMAIL=support@yourcompany.com
CLIENT_URL=https://your-domain.com
USE_OLLAMA=false
LLM_API_KEY=sk-xxx
```

## Quick Test

```bash
# 1. Start app
npm run dev

# 2. Test demo endpoint
curl "http://localhost:3001/api/public/faq?project=demo"

# 3. Test chat with demo
curl -X POST http://localhost:3001/api/public/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What is AI FAQ Generator?","project":"demo"}'

# 4. Open widget
open http://localhost:3001/widget?project=demo
```

## Deployment Options

### Option A: Simple (Current)
- Frontend: Vercel/Netlify
- Backend: Render/Railway
- Storage: Local files (single tenant)

### Option B: Multi-Tenant SaaS
- Frontend: Vercel/Netlify
- Backend: Render (no disk)
- Storage: Supabase tables + storage
- Projects identified by slug

### Option C: Self-Hosted
- Docker Compose
- Frontend + Backend together
- PostgreSQL for data
- Redis for rate limiting

## Migration Path

1. **Now**: Local files, demo project ready
2. **Next**: Add more projects via `/api/projects`
3. **Later**: Migrate to database (Supabase/PostgreSQL)
4. **Future**: Add billing (Stripe), user accounts

## Support

For issues or questions:
- Email: SUPPORT_EMAIL from .env
- GitHub: Create an issue
- Docs: README.md + OLLAMA_SETUP.md
