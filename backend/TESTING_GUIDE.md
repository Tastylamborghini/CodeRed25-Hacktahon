# Backend Testing Guide

## 🏗️ Architecture Overview

```
backend/
├── server.js              # Main server file (only routing & setup)
├── services/
│   └── aiService.js       # AI logic (Gemini integration)
├── routes/
│   ├── aiRoutes.js        # AI-related API endpoints
│   └── layoutRoutes.js    # Layout-related API endpoints
└── package.json
```

### How It Works:
1. **server.js** - Sets up Express, middleware, and mounts routes
2. **routes/** - Handle HTTP requests and responses
3. **services/** - Business logic (AI, database, etc.)
4. **Clean separation** - Server only does routing, services do the work

## 🚀 Starting the Server

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
```

## 🧪 Testing the API

### 1. Test Server is Running
```bash
curl http://localhost:5000
```
**Expected Response:** `Backend is running!`

### 2. Test Layout Routes (No AI needed)

#### Get Available Presets
```bash
curl http://localhost:5000/api/layout/presets
```

#### Get Room Types
```bash
curl http://localhost:5000/api/layout/room-types
```

#### Validate Layout
```bash
curl -X POST http://localhost:5000/api/layout/validate \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "rooms": [
        {
          "id": "room1",
          "name": "Living Room",
          "type": "living-room",
          "x": 0,
          "y": 0,
          "width": 12,
          "height": 10
        }
      ]
    }
  }'
```

### 3. Test AI Routes (Requires API key)

#### General Chat
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me arrange furniture in my living room",
    "layout": {
      "rooms": [
        {
          "name": "Living Room",
          "type": "living-room",
          "width": 12,
          "height": 10
        }
      ]
    },
    "constraints": {
      "accessibility": true
    }
  }'
```

#### Furniture Layout Suggestions
```bash
curl -X POST http://localhost:5000/api/ai/layout/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "roomData": {
      "type": "living room",
      "dimensions": "12x10 feet",
      "focus": "entertainment area",
      "constraints": {
        "budget": "medium",
        "style": "modern"
      }
    }
  }'
```

#### Accessibility Analysis
```bash
curl -X POST http://localhost:5000/api/ai/layout/accessibility \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "rooms": [
        {
          "name": "Kitchen",
          "type": "kitchen",
          "width": 10,
          "height": 8,
          "furniture": [
            {"type": "counter", "x": 0, "y": 0, "width": 6, "height": 2}
          ]
        }
      ]
    }
  }'
```

#### Space Optimization
```bash
curl -X POST http://localhost:5000/api/ai/layout/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "layout": {
      "rooms": [
        {
          "name": "Small Bedroom",
          "type": "bedroom",
          "width": 8,
          "height": 8,
          "furniture": [
            {"type": "bed", "x": 0, "y": 0, "width": 4, "height": 6}
          ]
        }
      ]
    }
  }'
```

## 🔧 Using Postman/Insomnia

### Import this collection:
```json
{
  "info": {
    "name": "Home Layout Optimizer API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000"
        }
      }
    },
    {
      "name": "AI Chat",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Help me arrange my living room\",\n  \"layout\": {\n    \"rooms\": [\n      {\n        \"name\": \"Living Room\",\n        \"type\": \"living-room\",\n        \"width\": 12,\n        \"height\": 10\n      }\n    ]\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/ai/chat",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "ai", "chat"]
        }
      }
    }
  ]
}
```

## 🐛 Troubleshooting

### Server won't start:
- Check if port 5000 is already in use
- Make sure all dependencies are installed: `npm install`

### AI endpoints return errors:
- Check if `GEMINI_API_KEY` environment variable is set
- Verify the API key is valid
- Check console logs for specific error messages

### CORS errors from frontend:
- Make sure frontend is running on a different port (like 3000)
- CORS is already configured in server.js

## 📝 Expected Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": "...", // or "reply", "suggestions", etc.
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message here"
}
```
