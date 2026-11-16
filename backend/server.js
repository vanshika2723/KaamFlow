
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const customerRoutes = require("./routes/customerRoutes");
const assetRoutes = require("./routes/assetRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/service-requests", serviceRequestRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to KaamFlow API"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "KaamFlow server is running"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`KaamFlow server running on port ${PORT}`);
  });
};

startServer();
