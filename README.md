# BigOrders - Social Dining Platform

BigOrders is a collaborative dining platform that allows users to create and join group food orders from restaurants.

## Features

- User Authentication
- Restaurant Browsing
- Order Creation and Management
- Real-time Order Updates
- Collaborative Ordering System
- PIN-based Order Access

## Tech Stack

- **Frontend**: React.js
- **Backend**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BigOrders.git
cd BigOrders
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables:
Create a `.env` file in the server directory with:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/bigorders
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:
```bash
# Start backend server (from server directory)
npm start

# Start frontend server (from client directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3002
- Backend: http://localhost:5001

## Project Structure

```
BigOrders/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   └── config/       # Configuration files
│   └── public/           # Static files
└── server/               # Backend Express application
    ├── controllers/      # Request handlers
    ├── models/          # Database models
    ├── routes/          # API routes
    └── middleware/      # Custom middleware
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
