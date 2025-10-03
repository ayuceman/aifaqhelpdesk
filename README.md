# AI FAQ/Helpdesk Generator

A production-ready AI-powered FAQ generator with embeddable chat widget. Built with React 18, TypeScript, Node.js, and OpenAI-compatible LLM integration.

## Features

- **File Upload Support**: PDF, DOCX, TXT, and Markdown files
- **Web Scraping**: Extract content from any website URL
- **AI-Powered FAQ Generation**: Generate FAQs with customizable tone and question count
- **Interactive Editor**: Edit, add, and delete FAQs with real-time validation
- **Embeddable Chat Widget**: Iframe-based chat widget for any website
- **Vector Search**: Semantic similarity search using embeddings
- **Provider-Agnostic LLM**: OpenAI-compatible API interface

## Quick Start

### Prerequisites

- Node.js 18+ 
- **Ollama** (default, free local LLM) - [Install Guide](OLLAMA_SETUP.md)
  - OR OpenAI API key (optional)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd ai-faq-chatgen
npm install
```

2. **Install server dependencies:**
```bash
cd server
npm install
```

3. **Install client dependencies:**
```bash
cd ../client
npm install
```

4. **Setup Ollama (Recommended):**
```bash
# Install Ollama from https://ollama.ai
# Pull required models
ollama pull llama3.2
ollama pull nomic-embed-text
```

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed instructions.

**Alternative: Use OpenAI**
```bash
cd server
cp env.example .env
# Edit .env and set USE_OLLAMA=false
# Add your LLM_API_KEY
```

### Running the Application

**Development mode (both client and server):**
```bash
npm run dev
```

**Individual services:**
```bash
# Server only
npm run server

# Client only  
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Chat Widget: http://localhost:3001/widget

## Usage

### 1. Upload Content
- **File Upload**: Support for PDF, DOCX, TXT, Markdown files
- **URL Crawling**: Extract content from any website

### 2. Generate FAQs
- Choose tone: Formal, Concise, or Friendly
- Set maximum number of questions (1-50)
- AI generates relevant Q&A pairs from your content

### 3. Edit & Manage
- Inline editing of questions and answers
- Add new FAQs manually
- Delete unwanted FAQs
- Real-time validation

### 4. Embed Widget
- Copy the iframe embed code
- Paste into any website
- Widget provides intelligent FAQ responses

## API Endpoints

### File Upload
```
POST /api/upload/file     - Upload and parse files
POST /api/upload/url      - Crawl website content
POST /api/upload/generate-faq - Generate FAQs from content
```

### FAQ Management
```
GET    /api/faq           - Get all FAQs
POST   /api/faq           - Create new FAQ
PUT    /api/faq/:id       - Update FAQ
DELETE /api/faq/:id       - Delete FAQ
POST   /api/faq/bulk      - Bulk save FAQs
```

### Public Widget API
```
GET  /api/public/faq      - Get all FAQs (public)
POST /api/public/chat     - Chat with FAQ bot
GET  /widget             - Chat widget interface
```

## Architecture

### Backend (Node.js + Express)
- **File Processing**: PDF, DOCX, TXT, Markdown parsing
- **Web Scraping**: Cheerio-based content extraction
- **LLM Service**: OpenAI-compatible chat and embeddings
- **Storage**: JSON file-based (easily swappable for database)
- **Vector Search**: Cosine similarity for semantic matching

### Frontend (React + TypeScript)
- **File Upload**: Drag-and-drop with progress indicators
- **FAQ Generation**: Parameterized AI generation
- **Interactive Editor**: Real-time editing with validation
- **Widget Embed**: Copy-paste iframe integration

### Data Flow
1. **Content Extraction**: Files/URLs → Parsed text
2. **FAQ Generation**: Text + Parameters → AI-generated FAQs
3. **Storage**: FAQs → JSON files + Embeddings
4. **Widget Chat**: User question → Vector search → LLM response

## Configuration

### Environment Variables

**Ollama (Default):**
```bash
PORT=3001
USE_OLLAMA=true
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

**OpenAI (Optional):**
```bash
PORT=3001
USE_OLLAMA=false
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-ada-002
```

### Supported File Types
- **PDF**: `pdf-parse` library
- **DOCX**: `mammoth` library  
- **TXT**: Direct text reading
- **Markdown**: `marked` library with HTML stripping

### LLM Provider Compatibility
Works with any OpenAI-compatible API:
- **Ollama** (default) - Local, free, privacy-focused
- OpenAI API
- Azure OpenAI
- Other providers (Anthropic, Groq, etc.)
- Any OpenAI-compatible endpoint

## Production Deployment

### Build for Production
```bash
# Build client
cd client
npm run build

# Build server
cd ../server  
npm run build
```

### Environment Setup
1. Set production environment variables
2. Configure CORS for your domain
3. Set up proper file storage (S3, etc.)
4. Configure database (PostgreSQL, MongoDB, etc.)

### Security Considerations
- Add authentication/authorization
- Implement rate limiting
- Validate file uploads
- Sanitize user inputs
- Use HTTPS in production

## Development

### Project Structure
```
ai-faq-chatgen/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Server entry
│   └── package.json
├── data/                  # JSON storage
│   ├── faq.json          # FAQ data
│   └── embeddings.json   # Vector embeddings
└── package.json          # Root package
```

### Adding New Features
1. **New File Types**: Extend `FileParser` service
2. **Database Integration**: Replace `StorageService` 
3. **Authentication**: Add middleware to routes
4. **Custom LLM**: Extend `LLMService` interface

## Troubleshooting

### Common Issues
- **CORS Errors**: Check server CORS configuration
- **File Upload Fails**: Verify file size limits and types
- **LLM Errors**: Check API key and model availability
- **Widget Not Loading**: Ensure server is running on port 3001

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## License

MIT License - see LICENSE file for details.
