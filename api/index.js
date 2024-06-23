const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const SmsMessage = require("./models/SMS");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect("mongodb+srv://gahlotkritika980:kriti555@cluster0.ljjykq4.mongodb.net/newsms", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error Connecting to MongoDB",err);
  });


app.post("/sms", async (req, res) => {
  try {
    const { messageBody, senderPhoneNumber, sentTime, receiveTime } = req.body;
    console.log('SMS received:', { messageBody, senderPhoneNumber, sentTime, receiveTime });

    const newSmsMessage = new SmsMessage({
      messageBody,
      senderPhoneNumber,
      sentTime: new Date(sentTime),
      receiveTime: new Date(receiveTime),
    });

    await newSmsMessage.save();
    console.log(newSmsMessage);
    res.status(201).json({ message: "SMS message saved successfully" });
  } catch (error) {
    console.error("Error saving SMS message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log("server is running on port 3000");
});
