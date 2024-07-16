const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

// Email credentials
const senderEmail = process.env.SENDER_EMAIL;
const senderPassword = process.env.SENDER_PASSWORD;

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: senderPassword,
  },
});

// Function to read the JSON file and parse the email addresses
const getEmailAddresses = () => {
  const data = fs.readFileSync(path.join(__dirname, "emails.json"), "utf8");
  const jsonData = JSON.parse(data);
  return jsonData.emails;
};

// Function to send email
const sendEmail = (receiverEmail, subject, body, attachmentPath) => {
  const mailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: subject,
    text: body,
    attachments: attachmentPath
      ? [
          {
            filename: path.basename(attachmentPath),
            path: attachmentPath,
          },
        ]
      : [],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      io.emit("log", `Failed to send email to ${receiverEmail}: ${error}`);
      return console.log("Failed to send email:", error);
    }
    io.emit("log", `Email sent to ${receiverEmail}: 2.0.0 OK`);
    console.log("Email sent to " + receiverEmail + ": " + info.response);
  });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Endpoint to update email list
app.post("/update-emails", (req, res) => {
  const emailList = req.body.emails;
  fs.writeFileSync(
    "emails.json",
    JSON.stringify({ emails: emailList }, null, 2)
  );
  res.sendStatus(200);
});

// Endpoint to update email content
app.post("/update-content", (req, res) => {
  const { subject, body, attachmentPath } = req.body;
  fs.writeFileSync(
    "content.json",
    JSON.stringify({ subject, body, attachmentPath }, null, 2)
  );
  res.sendStatus(200);
});

// Endpoint to handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.status(200).send({ filePath: `./uploads/${req.file.filename}` });
});

// Endpoint to start sending emails
app.post("/send-emails", (req, res) => {
  const emailAddresses = getEmailAddresses();
  const { subject, body, attachmentPath } = JSON.parse(
    fs.readFileSync("content.json", "utf8")
  );
  let index = 0;

  const emailInterval = setInterval(() => {
    if (index < emailAddresses.length) {
      sendEmail(emailAddresses[index], subject, body, attachmentPath);
      index++;
      io.emit("progress", { total: emailAddresses.length, sent: index });
    } else {
      clearInterval(emailInterval);
      console.log("All emails sent.");
    }
  }, 2000); // 2 seconds interval

  res.sendStatus(200);
});

// Create the uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Endpoint to get current settings
app.get("/settings", (req, res) => {
  const emails = getEmailAddresses();
  const content = JSON.parse(fs.readFileSync("content.json", "utf8"));
  res.json({ emails, ...content });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
