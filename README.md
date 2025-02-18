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

## 🎥 Demo Video
Click to watch the demonstration video of project: <a href="https://www.youtube.com/watch?v=QmldLikMrk0" target="_blank" rel="noopener noreferrer">Watch Demo Video</a>


## ScreenShots

### Level 1 : Basic ChatBot
![l1](https://github.com/user-attachments/assets/aea114fa-d75d-48da-8aa3-b07d94473b3b)

### Level 2 : Store & Retrieve Movie Script Data
![l2 1](https://github.com/user-attachments/assets/688c01b4-6993-474e-9f04-1a69b574063c)
![l2 2](https://github.com/user-attachments/assets/6933c000-c967-4d0f-bdd9-4023537badc0)

### Level 3 : Implement RAG with Vector Search
![l3 1](https://github.com/user-attachments/assets/1d080b7b-438e-4586-91d6-fc10d5738556)
![l3 2](https://github.com/user-attachments/assets/de228fa4-394c-4ee4-8cff-ea7fd5d68316)

### Level 4 : Redis Effect
![l4 1](https://github.com/user-attachments/assets/fdcbece9-92d9-4536-b8d9-5acc8628ce39)
![l4 2](https://github.com/user-attachments/assets/3c7682e0-cd3a-4ffd-a2a4-06431dd0bdfb)

### Level 5 : Monitoring 
![l5 1](https://github.com/user-attachments/assets/d5f29809-a30b-4159-9a71-e2e7ec33aff5)
![l5 2](https://github.com/user-attachments/assets/27ae7506-d21c-4217-b4f9-54f38962d310)
![l5 3](https://github.com/user-attachments/assets/c723e71d-9a9c-4a17-8648-c4ca64279f74)

### After Final Deployment on Vercel
![l5 4](https://github.com/user-attachments/assets/dea7921b-d8ca-427f-a422-bf45d9d04193)
