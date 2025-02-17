# 🎬 AI Movie Character Chatbot

A production-ready chatbot API using RAG (Retrieval Augmented Generation) with Google's Gemini API, deployed on Vercel.

## 🏆 Progress
- ✅ Level 1: Basic API Chatbot (10 Points) - **COMPLETED**
- ✅ Level 2: Store & Retrieve Movie Script Data (20 Points) - **COMPLETED**
- ✅ Level 3: Implement RAG with Vector Search (30 Points) - **COMPLETED**
- ✅ Level 4: Scale System to Handle High Traffic (40 Points) - **COMPLETED**
- ✅ Level 5: Optimise for Latency & Deploy (50 Points) - **COMPLETED**

## 🛠️ Technologies Used
- Node.js & Express.js
- MongoDB Atlas (Vector Search)
- Google Gemini API for embeddings and text generation
- RAG for context-enhanced responses
- Redis (Caching)
- Prometheus & Grafana (Monitoring)

## 🎯 Key Features

### RAG Implementation
- Vector embeddings for dialogue matching
- Semantic search in MongoDB Atlas
- Context-enhanced AI responses

### High Traffic Handling
- Redis caching (120s TTL)
- Rate limiting (5 req/s per user)
- Horizontal scaling support

### Performance Monitoring
- Response time tracking
- Request count metrics
- Cache hit ratio
- Error rate monitoring
- Real-time Grafana dashboards


## 🚀 Getting Started

### Prerequisites
- node -v  # >= 20.x
- MongoDB Atlas (Vector Search)
- Google Gemini API key
- Redis 
- Vercel 

### Environment Setup
- GEMINI_API_KEY=your_key
- MONGODB_URI=your_mongodb_uri
- REDIS_URL=your_redis_url
- PORT=3000

### Installation
1. Clone the repository
```bash
git clone https://github.com/SidGit195/AI-Movie-Character-Chatbot.git
```