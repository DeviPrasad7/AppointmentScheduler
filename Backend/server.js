const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const DB_URL = process.env.REACT_APP_DB_URL;
const PASSWORD = process.env.REACT_APP_PASSWORD;
const EMAIL = process.env.REACT_APP_EMAIL;
const JWT_SECRET = process.env.REACT_APP_JWT_SECRET;

const otpStorage = {};

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

const PORT = 5012;

// MongoDB connection
mongoose.connect( DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// API Routes
app.post("/api/bookings", async (req, res) => {
  try {
    const { authToken } = req.body;
    const { user } = jwt.verify(authToken, JWT_SECRET);

    const cursor = await db
      .collection("bookings")
      .find({ "user.email": user.email });
    const bookingsArray = await cursor.toArray();
    const bookings = {};

    bookingsArray.forEach((booking) => {
      if (!bookings[booking.date]) {
        bookings[booking.date] = [];
      }
      bookings[booking.date].push(booking.updatedSlot);
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/allbookings", async (req, res) => {
  try {
    const cursor = await db.collection("bookings").find({});
    const bookingsArray = await cursor.toArray();
    const bookings = {};

    bookingsArray.forEach((booking) => {
      if (!bookings[booking.date]) {
        bookings[booking.date] = [];
      }
      bookings[booking.date].push(booking.updatedSlot);
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
  otpStorage[email] = otp;

  // Send OTP via email
  const mailOptions = {
    from: "komuravellimalathi@gmail.com", // Replace with your Gmail email
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false });
  }
});

// API Endpoint to verify OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otpStorage[email] === Number(otp)) {
    const data = {
      user: {
        email: email,
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ verified: true, authToken, email });

    res.status(200).send({ verified: true });
  } else {
    res.status(400).send({ verified: false });
  }
});

app.post("/api/book", async (req, res) => {
  const { date, updatedSlot, authToken } = req.body;

  const { user } = jwt.verify(authToken, JWT_SECRET);

  await db.collection("bookings").insertOne({ user, date, updatedSlot });

  res.json({ message: "Booking successful" });
});

app.delete("/api/cancel/:date/:time", async (req, res) => {
  try {
    // console.log(
    //   "Received PUT request for date:",
    //   req.params.date,
    //   "and time:",
    //   req.params.time
    // ); // Debugging line

    const { date, time } = req.params;
    const filter = { date: date, "updatedSlot.time": time };

    const result = await db.collection("bookings").deleteOne(filter);

    // console.log("Delete result:", result); // Debugging line

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Booking cancelled successfully" });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (error) {
    console.error("Error canceling booking:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
