const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Routes
const userRouter = require('./routes/user');
const { blogRouter } = require('./routes/blog');
const homeRouter = require('./routes/home');
const accountRouter = require('./routes/account');
const adminRouter = require('./routes/admin');

// Middlewares
const {
    checkForAuthentication,
    invalidRequest,
    restrictToRoles,
    logTheRequest,
    provideNewLine
} = require('./middlewares');

const app = express();
const port = 5600;

// ==============================
// Database Connection
// ==============================
console.log("Connecting to database...");

// Replace with your actual Atlas URI
const MONGO_URI = "mongodb+srv://jatincarpentar64:vXVGnk6oujhrrMkW@clusterblogify.fpvy6ga.mongodb.net/vercelMongoDB?retryWrites=true&w=majority&appName=ClusterBlogify";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Mongoose connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Mongoose connection error:", error);
    process.exit(1);
  }
};

connectDB();


// ==============================
// Server Configuration
// ==============================
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// ==============================
// Middlewares
// ==============================
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(checkForAuthentication);
app.use(logTheRequest);
app.use(provideNewLine);

// ==============================
// Routes
// ==============================
console.log("Setting up routes...");

app.use("/user", userRouter);
app.use("/blog", blogRouter);
app.use("/account", accountRouter);
app.use("/admin", restrictToRoles(["admin", "adminAuthor"]), adminRouter);
app.use("/", homeRouter);

// ==============================
// Fallback Middleware
// ==============================
app.use(invalidRequest);

// ==============================
// Start Server
// ==============================
app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
