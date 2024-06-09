const twilio = require('twilio');
const User = require('../models/User'); // Adjust the path if necessary
const MessagingResponse = twilio.twiml.MessagingResponse;

class SMSService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, message) {
    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to,
      });
      console.log(`Message sent to ${to}: ${response.sid}`);
      return response;
    } catch (error) {
      console.error(`Failed to send message to ${to}:`, error);
      throw error;
    }
  }

  async handleIncomingSMS(req, res) {
    const twiml = new MessagingResponse();
    const incomingMessage = req.body.Body.trim().toLowerCase();
    const fromNumber = req.body.From;

    if (incomingMessage === 'stop') {
      try {
        const user = await User.findOne({ phoneNumber: fromNumber });
        if (user) {
          user.agreeToSms = false;
          await user.save();
          twiml.message('You have successfully unsubscribed from NSBE KSU SMS notifications.');
        } else {
          twiml.message('Number not found.');
        }
      } catch (error) {
        twiml.message('An error occurred. Please try again later.');
      }
    } else {
      twiml.message('Invalid command. Reply STOP to unsubscribe.');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
}

module.exports = SMSService;
