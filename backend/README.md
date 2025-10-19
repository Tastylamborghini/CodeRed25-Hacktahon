# Interior Designer AI Backend

This backend provides AI-powered interior design assistance for floor plan applications.

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and add your API keys:

```bash
cp env.example .env
```

Edit `.env` and add your API keys:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# AI Service Configuration (choose one or more)
OPENAI_API_KEY=sk-your-openai-api-key-here
CLAUDE_API_KEY=your-claude-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: AI Service Selection (openai, claude, gemini)
AI_SERVICE=openai
```

### 2. API Key Setup

#### OpenAI (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add it to `.env` as `OPENAI_API_KEY=sk-...`

#### Claude (Alternative)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account and get your API key
3. Add it to `.env` as `CLAUDE_API_KEY=...`

#### Gemini (Alternative)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to `.env` as `GEMINI_API_KEY=...`

### 3. Installation and Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

### 4. API Endpoints

- `GET /api/health` - Health check
- `POST /api/ai/chat` - AI chat endpoint
- `POST /api/floor-plans` - Save floor plan
- `GET /api/floor-plans` - List floor plans
- `GET /api/floor-plans/:filename` - Load floor plan
- `DELETE /api/floor-plans/:filename` - Delete floor plan

### 5. AI Service Features

The AI service can:

- Analyze floor plans and provide design advice
- Suggest furniture placement
- Generate design tips based on room layout
- Create updated floor plans with suggested furniture
- Provide contextual responses based on user questions

### 6. Fallback Behavior

If no API keys are configured or if the AI service fails, the system will fall back to a mock AI response system that still provides useful design suggestions.

### 7. Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and rotate them regularly
- The `.env` file is already in `.gitignore`

### 8. Troubleshooting

- **Port already in use**: Kill existing processes on port 3001
- **API key errors**: Check that your API key is valid and has sufficient credits
- **CORS issues**: Ensure `FRONTEND_URL` matches your frontend URL exactly
