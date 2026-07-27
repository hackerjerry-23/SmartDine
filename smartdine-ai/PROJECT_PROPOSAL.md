# SmartDine AI – Intelligent Restaurant Management System with Smart Table Optimizer & AI Queue Management

## Project Overview

SmartDine AI is a complete AI-powered restaurant management platform that digitizes and automates restaurant operations. Unlike traditional restaurant management or food ordering applications, SmartDine AI focuses on solving real operational challenges through artificial intelligence, automation, predictive analytics, and real-time management.

The platform serves three primary users:
- Customer
- Restaurant Staff
- Restaurant Admin

The core innovation lies in its AI Smart Table Optimizer and AI Smart Queue Management System, which minimize waiting times, maximize table utilization, and improve the overall dining experience.

## Problems Solved

### Customer Problems
- No visibility of food availability
- Long waiting time for tables
- Manual reservations
- No real-time order tracking
- Slow billing
- Poor communication with staff

### Restaurant Problems
- Manual table allocation
- Low table utilization
- Inventory wastage
- Over-ordering ingredients
- Lack of customer insights
- No sales forecasting
- Long customer queues
- Poor analytics

## Technology Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Framer Motion

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Authentication
- JWT
- Google OAuth
- Email Login
- OTP Verification

### AI
- Google Gemini API

### Charts
- Chart.js
- Recharts

### Real-Time
- Socket.io

### Notifications
- Browser Notifications
- Email Notifications

### Cloud
- Cloudinary

### Deployment
- Vercel
- Render
- MongoDB Atlas

### Version Control
- GitHub

## User Roles

### Customer
Features:
- Register
- Login
- Google Login
- Forgot Password
- OTP Verification
- Browse Menu
- Live Food Availability
- AI Food Recommendation
- Search & Filter Menu
- Reserve Table
- Join Smart Queue
- QR Ordering
- Track Orders
- Pay Bills
- View Bills
- Feedback
- Notifications
- Profile

### Staff
Features:
- View Orders
- Accept Orders
- Update Order Status
- Manage Reservations
- Update Table Status
- Manage Queue
- Clean Table Status
- View Notifications

### Admin
Features:
- Manage Customers
- Manage Staff
- Manage Menu
- Manage Categories
- Manage Orders
- Manage Reservations
- Manage Tables
- Manage Inventory
- Manage Suppliers
- Manage Analytics
- Manage Feedback
- Manage Notifications
- Manage Queue

## AI Innovations

### 1. Smart Table Optimizer
Instead of selecting tables manually, AI recommends the best table using:
- Party Size
- Table Capacity
- Current Occupancy
- Reservation Schedule
- Dining Duration Prediction
- Distance from Entrance
- Accessibility Requirements

Example:
- Customer party size: 4
- AI suggestion: Table 8
- Available in: 6 minutes
- Dining duration: 60 minutes

Staff can:
- Accept Recommendation
- Override Recommendation

### 2. Smart Queue Management
A digital waiting queue where customers can join through the website or QR code. The system displays:
- Queue Position
- Waiting Time
- Customers Ahead

It updates automatically when:
- Reservation is canceled
- Customer leaves
- Table is cleaned
- Order is completed

Notifications include:
- Table Ready
- Queue Updated
- Reservation Expired

AI recalculates waiting time using:
- Current Occupancy
- Dining Duration
- Queue Size
- Table Turnover Rate

### 3. AI Food Recommendation
Uses previous orders to recommend complementary items.

Example:
- Ordered: Pizza
- Recommended: Garlic Bread, Coke, Brownie

### 4. Demand Forecasting
Predicts tomorrow's demand based on historical sales data.

Example:
- Pizza: 50 orders
- Coffee: 80 orders
- Burger: 35 orders

### 5. Inventory Prediction
Predicts shortages and suggests restocking.

Example:
- Milk remaining: 10 L
- Prediction: Out of stock tomorrow
- Recommendation: Order 20 L

### 6. AI Restaurant Assistant
Customer may ask:
- "Is Paneer Biryani Available?"

AI can respond:
- "Yes. Waiting time: 15 minutes. Table available in 10 minutes."

## Customer Flow
1. Home
2. Login
3. Browse Menu
4. AI Recommendation
5. Reserve Table
6. AI Table Allocation
7. QR Ordering
8. Kitchen
9. Order Tracking
10. Billing
11. Feedback

## Staff Flow
1. Login
2. Today's Orders
3. Kitchen Orders
4. Update Order Status
5. Manage Queue
6. Manage Tables
7. Customer Served

## Admin Flow
1. Login
2. Dashboard
3. Analytics
4. Inventory
5. Staff
6. Customers
7. Orders
8. Reservations
9. AI Reports
10. Revenue

## Modules

### Authentication
- JWT
- Google OAuth
- OTP
- Email Verification

### Menu Module
- Categories
- Search
- Filter
- Availability
- Images
- Ratings

### Reservation Module
- Reserve Table
- Smart Table Allocation
- Cancel Reservation
- Modify Reservation

### Queue Module
- Join Queue
- Leave Queue
- Queue Status
- Waiting Time
- Notifications

### Order Module
- Cart
- QR Order
- Kitchen
- Billing
- Invoice

### Inventory Module
- Ingredients
- Suppliers
- Stock
- Alerts
- Purchase History

### Analytics Module
- Charts
- Sales
- Revenue
- Peak Hours
- Inventory Usage
- Queue Analytics
- Customer Growth
- Repeat Customers
- Best Selling Items

### Notification Module
- Browser
- Email
- Reservation
- Queue
- Billing
- Promotions

## Database Collections
- Users
- Customers
- Staff
- Menu
- Categories
- Tables
- Reservations
- Orders
- Bills
- Inventory
- Suppliers
- Sales
- Feedback
- DemandForecast
- Recommendations
- InventoryPrediction
- Queue
- TableStatus
- TableAllocation
- WaitingTimeAnalytics
- Notifications
- ActivityLogs

## API Endpoints

### Authentication
- /api/auth/register
- /api/auth/login
- /api/auth/google
- /api/auth/verify-otp

### Menu
- /api/menu

### Orders
- /api/orders

### Reservation
- /api/reservations

### Inventory
- /api/inventory

### Queue
- /api/queue/join
- /api/queue/leave
- /api/queue/status
- /api/queue/notify

### Tables
- /api/tables
- /api/tables/status
- /api/tables/allocate
- /api/tables/predict-availability

### AI
- /api/ai/recommend
- /api/ai/forecast
- /api/ai/predict
- /api/ai/chat

### Analytics
- /api/analytics

## Admin Dashboard Widgets
- Total Revenue
- Today's Sales
- Today's Orders
- Active Customers
- Live Floor Map
- Table Occupancy
- Queue Dashboard
- AI Table Suggestions
- Inventory Alerts
- Waiting Time Analytics
- Revenue Trend
- Peak Hours
- Most Ordered Items
- Customer Satisfaction
- Table Turnover Rate
- Queue Completion Rate

## Folder Structure

SmartDine-AI/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── utils/
│   │   └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── ai/
│   ├── utils/
│   └── server.js
│
├── README.md
├── package.json
└── .env

## Additional Innovation for Hackathons

To make the project stand out, consider adding:
- AI Dynamic Pricing
- Voice-Based AI Waiter
- Digital Twin Restaurant Floor
- Customer Sentiment Analysis
- Sustainability Dashboard

## Conclusion

This combined system is significantly more innovative than a standard restaurant management application because it integrates AI-powered decision-making, predictive analytics, intelligent table allocation, real-time queue optimisation, inventory forecasting, and customer assistance into one unified platform. It is well suited for major hackathons, final-year projects, and startup demonstrations.
- Smart Table Allocation
- Cancel Reservation
- Modify Reservation

### Queue Module
- Join Queue
- Leave Queue
- Queue Status
- Waiting Time
- Notifications

### Order Module
- Cart
- QR Order
- Kitchen
- Billing
- Invoice

### Inventory Module
- Ingredients
- Suppliers
- Stock
- Alerts
- Purchase History

### Analytics Module
- Charts
- Sales
- Revenue
- Peak Hours
- Inventory Usage
- Queue Analytics
- Customer Growth
- Repeat Customers
- Best Selling Items

### Notification Module
- Browser
- Email
- Reservation
- Queue
- Billing
- Promotions

## Database Collections
- Users
- Customers
- Staff
- Menu
- Categories
- Tables
- Reservations
- Orders
- Bills
- Inventory
- Suppliers
- Sales
- Feedback
- DemandForecast
- Recommendations
- InventoryPrediction
- Queue
- TableStatus
- TableAllocation
- WaitingTimeAnalytics
- Notifications
- ActivityLogs

## API Endpoints

### Authentication
- /api/auth/register
- /api/auth/login
- /api/auth/google
- /api/auth/verify-otp

### Menu
- /api/menu

### Orders
- /api/orders

### Reservation
- /api/reservations

### Inventory
- /api/inventory

### Queue
- /api/queue/join
- /api/queue/leave
- /api/queue/status
- /api/queue/notify

### Tables
- /api/tables
- /api/tables/status
- /api/tables/allocate
- /api/tables/predict-availability

### AI
- /api/ai/recommend
- /api/ai/forecast
- /api/ai/predict
- /api/ai/chat

### Analytics
- /api/analytics

## Admin Dashboard Widgets
- Total Revenue
- Today's Sales
- Today's Orders
- Active Customers
- Live Floor Map
- Table Occupancy
- Queue Dashboard
- AI Table Suggestions
- Inventory Alerts
- Waiting Time Analytics
- Revenue Trend
- Peak Hours
- Most Ordered Items
- Customer Satisfaction
- Table Turnover Rate
- Queue Completion Rate

## Folder Structure

SmartDine-AI/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── utils/
│   │   └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── sockets/
│   ├── ai/
│   ├── utils/
│   └── server.js
│
├── README.md
├── package.json
└── .env

## Additional Innovation for Hackathons

To make the project stand out, consider adding:
- AI Dynamic Pricing
- Voice-Based AI Waiter
- Digital Twin Restaurant Floor
- Customer Sentiment Analysis
- Sustainability Dashboard

## Conclusion

This combined system is significantly more innovative than a standard restaurant management application because it integrates AI-powered decision-making, predictive analytics, intelligent table allocation, real-time queue optimisation, inventory forecasting, and customer assistance into one unified platform. It is well suited for major hackathons, final-year projects, and startup demonstrations.
