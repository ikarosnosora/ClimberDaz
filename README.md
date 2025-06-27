# 🧗‍♀️ ClimberDaz - 攀岩找搭子

> A modern, elegant climbing partner-finding application built with React, TypeScript, and NestJS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)

## 🌟 Overview

ClimberDaz is a comprehensive climbing partner-finding platform that connects climbing enthusiasts to discover activities, find climbing partners, and build a vibrant climbing community. The application supports various climbing types including bouldering, top rope, lead climbing, and outdoor adventures.

### ✨ Key Features

- 🎯 **Activity Management**: Create, join, and manage climbing activities
- 👥 **Partner Matching**: Find climbing partners based on skill level and preferences
- 🏔️ **Multi-Discipline Support**: Bouldering, Top Rope, Lead Climbing, Outdoor climbing
- 📍 **Location-Based**: Discover activities near you with interactive maps
- 💬 **Real-time Communication**: Chat and comment system for activity coordination
- ⭐ **Review System**: Rate and review climbing partners
- 📱 **Mobile-First Design**: Optimized for mobile devices with PWA support
- 🔔 **Smart Notifications**: Real-time updates and activity reminders
- 🎨 **Modern UI/UX**: Beautiful gradient-based design with climbing themes

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom gradient system
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Maps**: React Leaflet
- **Charts**: Recharts
- **Icons**: Heroicons, React Icons
- **Real-time**: Socket.IO Client

### Backend Stack
- **Framework**: NestJS with TypeScript
- **Database**: SQLite (development) / MySQL (production)
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Real-time**: Socket.IO
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting

### Key Technologies
- **Performance**: Virtual scrolling, lazy loading, code splitting
- **Offline Support**: Service Worker, IndexedDB caching
- **Analytics**: Performance monitoring and user analytics
- **Security**: JWT authentication, input validation, CSRF protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL (for production) or SQLite (for development)
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ClimberDaz-1
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create environment files based on `ENVIRONMENT_SETUP.md`:
   
   **Frontend (.env.development)**
   ```bash
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_WS_URL=ws://localhost:3001
   VITE_APP_NAME=ClimberDaz
   VITE_DEBUG=true
   ```
   
   **Backend (backend/.env.development)**
   ```bash
   NODE_ENV=development
   PORT=3001
   DB_HOST=localhost
   DB_DATABASE=climberdaz_dev
   JWT_SECRET=your-jwt-secret-key
   ```

4. **Database Setup**
   ```bash
   cd backend
   npm run migration:run
   npm run seed
   cd ..
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Documentation: http://localhost:3001/api/docs

## 📱 Features Deep Dive

### Activity Types
- **🪨 Bouldering**: V-Scale grading (V0-V2 to V8+)
- **🧗‍♀️ Top Rope**: Auto-belay and manual belay options
- **⛰️ Lead Climbing**: Advanced climbing with YDS grading
- **🏔️ Outdoor**: Natural rock climbing adventures
- **💪 Training**: Skill development and fitness sessions

### Grading Systems
- **V-Scale**: V0-V2, V3-V5, V6-V7, V8+
- **YDS (Yosemite Decimal System)**: 5.5-5.8 to 5.13+
- **Flexible Grading**: Open grades for mixed skill groups

### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Performance Optimized**: Virtual scrolling, lazy loading, code splitting
- **Accessibility**: WCAG compliant with screen reader support
- **Offline Capability**: Service worker for offline functionality
- **Real-time Updates**: Live activity updates and notifications

## 🛠️ Development

### Available Scripts

**Frontend**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run test:performance # Run performance tests
```

**Backend**
```bash
npm run start:dev        # Start development server
npm run build            # Build for production
npm run start:prod       # Start production server
npm run test             # Run tests
npm run migration:generate # Generate database migration
npm run migration:run    # Run database migrations
```

### Project Structure

```
ClimberDaz-1/
├── src/                     # Frontend source code
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── store/              # State management
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── backend/                # Backend source code
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration
│   │   └── database/       # Database setup
│   └── test/               # Backend tests
├── docs/                   # Documentation
└── public/                 # Static assets
```

### Key Components

- **VirtualizedList**: High-performance list rendering
- **ActivityCard**: Activity display with swipe actions
- **NotificationCenter**: Real-time notification system
- **ConnectionManager**: Network status management
- **LazyImage**: Optimized image loading
- **PullToRefresh**: Mobile-friendly refresh mechanism

## 🎨 Design System

The application features a sophisticated gradient-based design system inspired by climbing and outdoor themes:

- **Primary Gradients**: Sunrise climb colors (orange to pink)
- **Secondary Gradients**: Mountain sky colors (blue to purple)
- **Activity-Specific**: Unique gradients for each climbing type
- **Accessibility**: High contrast ratios and screen reader support

## 🔧 Configuration

### Environment Variables

See `ENVIRONMENT_SETUP.md` for detailed environment configuration including:
- Database connections
- JWT secrets
- WeChat integration
- External service APIs
- Performance monitoring

### Performance Optimization

- **Code Splitting**: Lazy-loaded routes and components
- **Virtual Scrolling**: Efficient rendering of large lists
- **Image Optimization**: Lazy loading and responsive images
- **Caching**: Redis for backend, IndexedDB for frontend
- **Bundle Analysis**: Built-in bundle size monitoring

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

### Docker Support

The application can be containerized using Docker for easy deployment.

### Environment Setup

1. Configure production environment variables
2. Set up MySQL database
3. Configure Redis for caching
4. Set up SSL certificates
5. Configure reverse proxy (nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Follow the existing code style
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and NestJS communities
- Climbing community for inspiration
- Contributors and testers
- Open source libraries and tools

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Happy Climbing! 🧗‍♀️🏔️**