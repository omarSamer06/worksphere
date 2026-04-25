require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const positionRoutes = require('./routes/positionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const shiftRoutes      = require('./routes/shiftRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payrollRoutes    = require('./routes/payrollRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');
const { errorMiddleware, notFound } = require('./middleware/errorMiddleware');

connectDB();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// CORS must be first — handles preflight OPTIONS before anything else
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use(helmet());

// HTTP request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.', data: null },
});
app.use('/api', limiter);

// Routes
app.use('/api/v1', testRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/shifts',     shiftRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/payroll',    payrollRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 & central error handler
app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
