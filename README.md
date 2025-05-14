# DittoBase

DittoBase is a powerful web application that enables users to upload CSV files, automatically infer schemas, and query their data through SQL with shareable API endpoints. It serves as a simple yet powerful alternative to tools like Airtable or Snowflake for small to medium datasets.

## Features

- CSV file upload and automatic schema inference
- SQL query interface with Monaco Editor
- Shareable API endpoints
- Collaborative querying
- Public dataset integration
- Google OAuth authentication via Supabase

## Tech Stack

### Frontend
- Next.js 14
- React
- Tailwind CSS
- Monaco Editor
- React Dropzone

### Backend
- FastAPI (Python)
- DuckDB
- Polars
- Supabase
- MinIO (S3-compatible storage)

### Deployment
- Docker
- Fly.io (Backend)
- Vercel (Frontend)

## Project Structure

```
dittobase/
├── frontend/           # Next.js frontend application
├── backend/           # FastAPI backend application
└── docker/           # Docker configuration files
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker
- Git

### Development Setup

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Configure Supabase credentials
   - Set up MinIO access keys

## License

MIT 