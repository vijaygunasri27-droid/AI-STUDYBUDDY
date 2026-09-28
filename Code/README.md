# AI StudyBuddy API

AI StudyBuddy is a backend-only Node.js and Express API for study accounts and future learning-material features. There is no frontend in this project. `GET /` is a JSON health check.

## Requirements

- Node.js and npm
- MongoDB running locally or a MongoDB Atlas URI

## Run Locally

Open the project folder in VS Code, then choose **Terminal > New Terminal**. Run these commands from the folder containing `package.json`:

```sh
npm install
```

Create or update `.env` in the project root. Keep real secrets private and do not commit `.env`.

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/ai-studybuddy
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Start MongoDB, then start the API:

```sh
npm start
```

The API listens at `http://localhost:8000` with the configuration above. Keep the terminal open while it runs; press `Ctrl+C` to stop it. To verify the server, open another terminal and run:

```sh
curl -i http://localhost:8000/
```

A running API responds with HTTP `200` and JSON such as `{"message":"AI StudyBuddy API is running"}`. Without MongoDB, the API process and health check still start, but account requests return a database-unavailable response.

## Implemented Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/` | API health check |
| POST | `/api/auth/register` | Create a student account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/me` | Return the authenticated account |

The authenticated account endpoint expects `Authorization: Bearer <token>`. Study-material, admin, and AI-generation routes still need to be implemented.

## Project Structure

```text
index.js                 Express API entry point
src/db.js                MongoDB connection
src/auth.js              Bearer-token authentication middleware
src/routes/auth.js       Register, login, and current-account routes
src/gemini.js            Gemini API helper
src/upload.js            Multer upload configuration
server.js/user.js        Mongoose user model
server.js/materials.js   Mongoose study-material model
```
