# Pastry Tasting Evaluation Platform

A comprehensive web application for conducting and managing pastry tasting evaluations. This platform enables administrators to create customized questionnaires and generate statistical reports, while allowing clients to participate in evaluations by submitting and managing their responses.

> **Note**: This project was generated with assistance from Claude-3.5-Sonnet, an AI language model.

## Features

### Admin Features
- Create, edit, and manage questionnaires
- Add multiple pastry brands for evaluation
- Close questionnaires to prevent further submissions
- Generate statistical reports with graphical representations
- View aggregate data and individual responses

### Client Features
- View available open questionnaires
- Submit detailed evaluations for multiple brands
- Rate products on various criteria (appearance, aroma, texture, etc.)
- Edit submissions until questionnaire closure
- Track personal response history

## Technology Stack

### Frontend
- React.js
- Material-UI
- Recharts for data visualization
- React Query for state management
- Socket.io client for real-time updates

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io for real-time communication
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pastry-tasting-platform.git
   cd pastry-tasting-platform
   ```

2. Install dependencies for both client and server:

   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:

   Create a `.env` file in the server directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pastry-tasting
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

   Create a `.env` file in the client directory:

   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Build the client application:

   ```bash
   cd client
   npm run build
   ```

   This will create a production build in the `client/build` directory.

## Running the Application

### Development Mode

1. Start the MongoDB service on your machine.

2. Start the server:

   ```bash
   cd server
   npm run dev
   ```

3. In a new terminal, start the client in development mode:

   ```bash
   cd client
   npm start
   ```

The application will be available at `http://localhost:3000`

### Production Mode

1. Start the MongoDB service on your machine.

2. Build the client (if you haven't already):

   ```bash
   cd client
   npm run build
   ```

3. Start the server:

   ```bash
   cd ../server
   npm start
   ```

The application will be available at `http://localhost:5000`

## Testing

### Running Server Tests

```bash
cd server
npm test
```

### Running Client Tests

```bash
cd client
npm test
```

## Project Structure

```
.
├── client/ # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── contexts/     # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   └── utils/        # Utility functions
│   └── package.json
│
└── server/ # Backend Node.js application
    ├── src/
    │   ├── middleware/   # Express middleware
    │   ├── models/       # MongoDB models
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   └── utils/        # Utility functions
    └── package.json
```

## API Documentation

The API endpoints are organized into the following categories:

- Authentication (`/api/auth/*`)
- Questionnaires (`/api/questionnaires/*`)
- Responses (`/api/responses/*`)
- Activity Logs (`/api/activity-logs/*`)

For detailed API documentation, please refer to the API documentation file in the server directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was generated with assistance from Claude-3.5-Sonnet
- Special thanks to the open-source community for the amazing tools and libraries used in this project
