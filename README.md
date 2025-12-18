# ODG Image Generate

ODG Image Generate is a web application for generating and managing images using AI. It features a NestJS backend for handling image generation requests, storage, and user management, and a React frontend for a user-friendly interface.

## Features

- **User Authentication**: Secure signup and login using JWT.
- **Image Generation**: Generate images from text prompts (supports Korean prompts via DeepL translation).
- **Gallery**: View generated images in a gallery with status tracking (Pending, Completed, Failed).
- **Image Download**: Download generated images directly from the gallery.
- **Storage**: Secure image storage using MinIO.

## Tech Stack

### Backend

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Storage**: MinIO (S3 compatible object storage)
- **Authentication**: Passport, JWT
- **Translation**: DeepL API
- **Validation**: Joi, class-validator

### Frontend

- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: React Router
- **Styling**: CSS Modules / Standard CSS

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [PostgreSQL](https://www.postgresql.org/)
- [MinIO](https://min.io/) (or use Docker)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ODG_image_gnerate
   ```

2. **Install Backend Dependencies**

   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd web
   npm install
   cd ..
   ```

## Configuration

### Backend Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"

# MinIO (Storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET="your-bucket-name"

# JWT Secret
JWT_SECRET="your-secret-key"

# DeepL (Translation)
DEEPL_AUTH_KEY="your-deepl-api-key"

# PixelLab (Image Generation)
PIXELLAB_API_KEY="your-pixellab-key"
```

### Frontend Environment Variables

Create a `.env` file in the `web` directory (optional if using defaults):

```env
VITE_API_BASE_URL="http://localhost:3000"
```

## Database Setup

Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

## Running the Application

### Backend (NestJS)

Start the backend server in development mode:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`.

### Frontend (React + Vite)

Open a new terminal, navigate to the `web` directory, and start the frontend:

```bash
cd web
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

## Project Structure

```
ODG_image_gnerate/
├── src/                 # Backend source code (NestJS)
│   ├── core/            # Core modules (Config, Database, Storage)
│   ├── module/          # Feature modules (Auth, Gallery, Generate, etc.)
│   └── ...
├── prisma/              # Prisma schema and migrations
├── web/                 # Frontend source code (React)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── lib/         # API and utility functions
│   │   └── ...
│   └── ...
└── ...
```

## License

This project is [UNLICENSED](LICENSE).
