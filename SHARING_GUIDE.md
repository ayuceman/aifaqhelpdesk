# Sharing Guide - AI FAQ Generator

## 🎯 Share Your Demo

This guide shows you how to share your AI FAQ Generator with early users, clients, or team members.

---

## 📍 Shareable Links

### 1. **Live Demo Page** (No Configuration Required)
Share this link with anyone to showcase the product:

```
http://localhost:5175/demo
```

**What they'll see:**
- ✅ 10 pre-loaded demo FAQs
- ✅ Interactive FAQ list (click to expand answers)
- ✅ Live chat widget to ask questions
- ✅ Embed code they can copy
- ✅ "How it works" guide
- ✅ Feature highlights
- ✅ CTA to try it themselves

**Perfect for:**
- Sharing on social media
- Sending to potential customers
- Adding to pitch decks
- Email campaigns

---

### 2. **Landing Page**
Your main product page:

```
http://localhost:5175/
```

**Features:**
- Hero with value proposition
- "View Live Demo" button
- "Try It Now" button (loads demo FAQs in editor)
- How it works (4 steps)
- Feature grid
- Embed code preview
- Legal pages (Privacy, Terms, Contact)

---

### 3. **Direct Widget Embed**
Share just the chat widget for testing:

```html
<iframe 
  src="http://localhost:3001/widget?project=demo"
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

**Use cases:**
- Embed in Notion pages
- Add to documentation
- Test in client websites
- Share in Slack/Teams

---

## 🎬 Create Demo Video (Loom/Screen Recording)

### **Recommended Flow (3-5 minutes):**

1. **Start: Landing Page (30 sec)**
   - Show homepage at `http://localhost:5175/`
   - Highlight value proposition
   - Click "Get Started"

2. **Step 1: Upload (30 sec)**
   - Upload a sample PDF or document
   - Show character count
   - Or demo URL crawling with a website

3. **Step 2: Generate FAQs (1 min)**
   - Select tone (formal/concise/friendly)
   - Set max questions (e.g., 10)
   - Click "Generate FAQs"
   - Show progress indicator
   - FAQs appear

4. **Step 3: Review & Edit (1 min)**
   - Show editable table
   - Edit a question/answer
   - Add a new FAQ manually
   - Delete an unwanted FAQ
   - Click "Publish"

5. **Step 4: Embed (30 sec)**
   - Show widget preview
   - Copy iframe code
   - Explain how to paste it anywhere

6. **Step 5: Live Demo (1 min)**
   - Navigate to `/demo` page
   - Ask questions in the widget:
     - Exact match: "What is AI FAQ Generator?"
     - Partial match: "How do I upload?"
     - Related question: "Is my data safe?"
   - Show AI-generated responses

7. **Wrap Up (30 sec)**
   - Quick recap of 4-step process
   - Mention multi-tenant support
   - Show contact page
   - CTA: "Get started at [your-domain.com]"

---

## 📤 Sharing Methods

### **A. Social Media**

**Twitter/X:**
```
🚀 Built an AI FAQ Generator!

✨ Upload docs → Generate Q&As → Embed chat widget
⚡ 5 minutes from zero to live FAQ assistant
🤖 Smart keyword + AI matching
🔒 Privacy-first, local storage

Try the live demo: [your-domain.com/demo]
```

**LinkedIn:**
```
Excited to share my latest project: AI FAQ Generator

Problem: Creating FAQs manually is time-consuming and keeping them updated is a hassle.

Solution: Upload documents or crawl websites, and AI generates relevant Q&As automatically. Then embed an intelligent chat widget anywhere.

Features:
• 4-step workflow: Upload → Generate → Edit → Embed
• Multi-tenant support for agencies
• Smart keyword + semantic matching
• Rate limiting & security built-in
• Privacy-first architecture

Live demo: [link]
```

---

### **B. Email Campaign**

**Subject:** Try Our AI FAQ Generator (Live Demo Inside)

```html
Hi [Name],

I built something I think you'll find useful.

**AI FAQ Generator** turns your documents into intelligent FAQs in under 5 minutes.

Here's how it works:
1. Upload a PDF, DOCX, or provide a URL
2. AI generates relevant Q&A pairs
3. Review and edit as needed
4. Get an embed code for your website

👉 Try the live demo: [your-domain.com/demo]

No signup required. Click around, ask questions in the chat widget, 
and see if it could work for your business.

Best,
[Your Name]

P.S. It supports multiple projects, so agencies can manage multiple 
clients from one dashboard.
```

---

### **C. Notion/Documentation**

Embed the widget directly:

```html
<iframe 
  src="http://localhost:3001/widget?project=demo"
  width="100%" 
  height="700px" 
  frameborder="0"
  style="border: none; border-radius: 12px;"
></iframe>
```

Or link to demo page:
```markdown
[Try our AI FAQ Generator Demo](http://localhost:5175/demo)
```

---

### **D. Slack/Teams/Discord**

```
🤖 Check out our AI FAQ Generator!

Demo: http://localhost:5175/demo

Quick workflow:
1️⃣ Upload docs or crawl URL
2️⃣ AI generates FAQs
3️⃣ Edit & publish
4️⃣ Embed chat widget

Try asking it questions! 💬
```

---

## 🎁 Give Early Access

### **Option 1: Demo Project** (Easiest)
Point users to:
```
http://localhost:5175/demo
```

They can interact but can't modify the demo FAQs.

---

### **Option 2: Let Them Create Their Own**
Share:
```
http://localhost:5175/
```

They click "Get Started" and create their own project.

**Note:** For production, you'll want to add:
- User authentication
- Project management
- Usage limits
- Billing (if SaaS)

---

### **Option 3: Create Project for Them**
1. Generate FAQs for their business
2. Publish to a unique project slug: `?project=their-company`
3. Share widget embed:
   ```html
   <iframe 
     src="http://your-domain.com/widget?project=their-company"
     ...
   ></iframe>
   ```

---

## 📊 Track Engagement

### **Server Logs**
Check `[CHAT]` logs in terminal:
```bash
npm run dev | grep "\[CHAT\]"
```

**Metrics to track:**
- Number of questions asked
- Response sources (faq_match, keyword_llm, generated)
- Average confidence scores
- Response times
- Projects used

---

### **Example Log Analysis**
```
[CHAT] Request: "What is AI FAQ Generator?" | Project: demo | IP: 203.0.113.42
[CHAT] Response: faq_match | Confidence: 0.99 | Time: 1234ms

[CHAT] Request: "pricing" | Project: demo | IP: 203.0.113.42
[CHAT] Response: keyword_llm | Confidence: 0.65 | Time: 5432ms
```

**Insights:**
- User asked 2 questions
- First was exact match (high confidence)
- Second used AI generation (lower confidence → might need FAQ)
- Both responses under 6 seconds

---

## 🚀 Production Deployment

Before sharing publicly:

1. **Update URLs** (replace `localhost:3001` and `localhost:5175`):
   - Deploy backend (Render, Railway, Fly.io)
   - Deploy frontend (Vercel, Netlify)
   - Update `.env` with production URLs

2. **Update Embed Codes**:
   - Replace `http://localhost:3001/widget?project=demo`
   - With `https://your-domain.com/widget?project=demo`

3. **Set Support Email**:
   ```env
   SUPPORT_EMAIL=support@your-domain.com
   ```

4. **Enable CORS**:
   ```env
   CLIENT_URL=https://your-domain.com
   ```

5. **Add Analytics** (optional):
   - PostHog, Plausible, or Google Analytics
   - Track pageviews, button clicks, FAQ requests

---

## 💡 Tips for Maximum Impact

### **1. Show, Don't Tell**
- Lead with `/demo` page (visual, interactive)
- Let them ask questions in the widget
- Then explain the workflow

### **2. Emphasize Speed**
- "5 minutes from zero to live FAQ assistant"
- "Upload → Generate → Publish → Done"

### **3. Highlight Use Cases**
- **SaaS**: Auto-generate product FAQs from docs
- **Agencies**: Manage multiple client FAQ widgets
- **E-commerce**: Customer support automation
- **Documentation**: Searchable knowledge base

### **4. Address Concerns**
- Privacy: "Data stays local by default"
- Security: "Rate limiting & CORS built-in"
- Accuracy: "Review & edit before publishing"
- Cost: "Uses local Ollama by default (free)"

---

## 📋 Checklist Before Sharing

- [ ] Demo page loads at `/demo`
- [ ] 10 demo FAQs are visible
- [ ] Chat widget responds to questions
- [ ] Embed code is copy-able
- [ ] Landing page has "View Live Demo" button
- [ ] Legal pages (Privacy, Terms, Contact) are accessible
- [ ] Support email is configured
- [ ] Server logs show `[CHAT]` analytics
- [ ] Screenshots/video recorded
- [ ] Social media posts drafted
- [ ] Email template ready

---

## 🎯 Success Metrics

### **Engagement:**
- Unique visitors to `/demo`
- Questions asked in widget
- Embed code copies
- "Get Started" clicks

### **Quality:**
- Average confidence score
- FAQ match rate vs LLM generation
- Response times
- Error rate

### **Conversion:**
- Demo viewers → Signups
- Widget interactions → Contact form
- Social shares

---

## 📞 Support

If users have questions, direct them to:
- **Contact Page**: `http://localhost:5175/contact`
- **Email**: `support@yourcompany.com` (from `.env`)
- **GitHub Issues**: [your-repo-url]/issues

---

**Ready to share?** Start with the `/demo` page! 🚀

