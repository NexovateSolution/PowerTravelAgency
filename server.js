const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'powerbookings2025@gmail.com',
    pass: process.env.EMAIL_PASS || 'iwwf jyrm lbnv ahyx'
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Handle booking form submission
app.post('/submit-booking', upload.fields([
  { name: 'passport_file', maxCount: 1 },
  { name: 'national_id_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      'trip-type': tripType,
      'from-city': fromCity,
      'to-city': toCity,
      'departure-date': departureDate,
      'return-date': returnDate,
      'phone-number': phoneNumber,
      passengers,
      'travel-class': travelClass,
      'special-requests': specialRequests
    } = req.body;

    // Create booking data object
    const bookingData = {
      tripType: tripType || 'round-trip',
      fromCity,
      toCity,
      departureDate,
      returnDate: returnDate || 'N/A',
      phoneNumber,
      passengers,
      travelClass,
      specialRequests: specialRequests || 'None',
      submittedAt: new Date().toLocaleString()
    };

    // Create email content
    const emailSubject = 'New Flight Booking Request - Power Travel Agency';
    const emailBody = `
      <h2>New Flight Booking Request</h2>
      <p><strong>Submitted:</strong> ${bookingData.submittedAt}</p>
      
      <h3>Flight Details:</h3>
      <ul>
        <li><strong>Trip Type:</strong> ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}</li>
        <li><strong>From:</strong> ${bookingData.fromCity}</li>
        <li><strong>To:</strong> ${bookingData.toCity}</li>
        <li><strong>Departure Date:</strong> ${bookingData.departureDate}</li>
        <li><strong>Return Date:</strong> ${bookingData.returnDate}</li>
        <li><strong>Phone Number:</strong> ${bookingData.phoneNumber}</li>
        <li><strong>Number of Passengers:</strong> ${bookingData.passengers}</li>
        <li><strong>Travel Class:</strong> ${bookingData.travelClass}</li>
        <li><strong>Special Requests:</strong> ${bookingData.specialRequests}</li>
      </ul>
      
      <p><strong>Attachments:</strong></p>
      <ul>
        <li>Passport Copy: ${req.files['passport_file'] ? 'Attached' : 'Not provided'}</li>
        <li>National ID Copy: ${req.files['national_id_file'] ? 'Attached' : 'Not provided'}</li>
      </ul>
      
      <p>Please follow up with the customer as soon as possible.</p>
    `;

    // Create a text file with booking details
    const fileName = `booking-${Date.now()}.txt`;
    const filePath = path.join(__dirname, 'temp', fileName);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'));
    }

    const fileContent = `
FLIGHT BOOKING REQUEST
=====================

Submitted: ${bookingData.submittedAt}

Flight Details:
- Trip Type: ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}
- From: ${bookingData.fromCity}
- To: ${bookingData.toCity}
- Departure Date: ${bookingData.departureDate}
- Return Date: ${bookingData.returnDate}
- Phone Number: ${bookingData.phoneNumber}
- Number of Passengers: ${bookingData.passengers}
- Travel Class: ${bookingData.travelClass}
- Special Requests: ${bookingData.specialRequests}

Attachments:
- Passport Copy: ${req.files['passport_file'] ? 'Attached' : 'Not provided'}
- National ID Copy: ${req.files['national_id_file'] ? 'Attached' : 'Not provided'}

Please follow up with the customer as soon as possible.
    `;

    fs.writeFileSync(filePath, fileContent);

    // Prepare attachments
    const attachments = [
      {
        filename: fileName,
        path: filePath
      }
    ];

    if (req.files['passport_file']) {
      attachments.push({
        filename: `Passport-${req.files['passport_file'][0].originalname}`,
        path: req.files['passport_file'][0].path
      });
    }

    if (req.files['national_id_file']) {
      attachments.push({
        filename: `NationalID-${req.files['national_id_file'][0].originalname}`,
        path: req.files['national_id_file'][0].path
      });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'powerbookings2025@gmail.com',
      to: 'powerbookings2025@gmail.com',
      subject: emailSubject,
      html: emailBody,
      attachments: attachments
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Clean up temp file
    fs.unlinkSync(filePath);

    // Clean up uploaded files
    if (req.files['passport_file']) {
      fs.unlinkSync(req.files['passport_file'][0].path);
    }
    if (req.files['national_id_file']) {
      fs.unlinkSync(req.files['national_id_file'][0].path);
    }

    res.json({ success: true, message: 'Booking request sent successfully!' });
  } catch (error) {
    console.error('Error sending booking email:', error);
    res.status(500).json({ success: false, message: 'Failed to send booking request. Please try again.' });
  }
});

// Handle contact form submission
app.post('/submit-contact', async (req, res) => {
  try {
    const {
      'contact-name': name,
      'contact-email': email,
      'contact-phone': phone,
      'contact-message': message
    } = req.body;

    const contactData = {
      name,
      email,
      phone,
      message,
      submittedAt: new Date().toLocaleString()
    };

    const emailSubject = 'New Contact Inquiry - Power Travel Agency';
    const emailBody = `
      <h2>New Contact Inquiry</h2>
      <p><strong>Submitted:</strong> ${contactData.submittedAt}</p>
      
      <h3>Contact Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${contactData.name}</li>
        <li><strong>Email:</strong> ${contactData.email}</li>
        <li><strong>Phone:</strong> ${contactData.phone}</li>
      </ul>
      
      <h3>Message:</h3>
      <p>${contactData.message}</p>
      
      <p>Please respond to this inquiry promptly.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'powerbookings2025@gmail.com',
      to: 'powerbookings2025@gmail.com',
      subject: emailSubject,
      html: emailBody,
      replyTo: contactData.email
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Contact message sent successfully!' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// Handle WhatsApp submission
app.post('/submit-whatsapp', upload.fields([
  { name: 'passport_file', maxCount: 1 },
  { name: 'national_id_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      'trip-type': tripType,
      'from-city': fromCity,
      'to-city': toCity,
      'departure-date': departureDate,
      'return-date': returnDate,
      'phone-number': phoneNumber,
      passengers,
      'travel-class': travelClass,
      'special-requests': specialRequests
    } = req.body;

    const bookingData = {
      tripType: tripType || 'round-trip',
      fromCity,
      toCity,
      departureDate,
      returnDate: returnDate || 'N/A',
      phoneNumber,
      passengers,
      travelClass,
      specialRequests: specialRequests || 'None',
      submittedAt: new Date().toLocaleString()
    };

    // WhatsApp API Configuration
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.PHONE_NUMBER_ID;
    const recipientPhone = process.env.RECIPIENT_PHONE_NUMBER;

    if (!token || !phoneId || !recipientPhone) {
      throw new Error('Missing WhatsApp configuration in .env');
    }

    // Helper function to upload media
    const uploadMedia = async (filePath, mimeType) => {
      const fileStream = fs.createReadStream(filePath);
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('file', fileStream);
      formData.append('type', mimeType);

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${phoneId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.id;
    };

    // Helper function to send message
    const sendMessage = async (data) => {
      await axios.post(
        `https://graph.facebook.com/v18.0/${phoneId}/messages`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    };

    // --- 1. WhatsApp Operations ---

    // Send Text Summary
    const textMessage = `
✈️ *New Flight Booking Request*
📅 Submitted: ${bookingData.submittedAt}

*Flight Details:*
🎫 Trip Type: ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}
📍 From: ${bookingData.fromCity}
📍 To: ${bookingData.toCity}
🛫 Departure: ${bookingData.departureDate}
🛬 Return: ${bookingData.returnDate}
📞 Phone: ${bookingData.phoneNumber}
👥 Passengers: ${bookingData.passengers}
💺 Class: ${bookingData.travelClass}
✨ Special Requests: ${bookingData.specialRequests}

*Attachments:*
Passport: ${req.files['passport_file'] ? '✅ Attached' : '❌ Not provided'}
ID: ${req.files['national_id_file'] ? '✅ Attached' : '❌ Not provided'}
    `;

    await sendMessage({
      messaging_product: 'whatsapp',
      to: recipientPhone,
      type: 'text',
      text: { body: textMessage }
    });

    // Upload and Send Passport (WhatsApp)
    if (req.files['passport_file']) {
      const passportPath = req.files['passport_file'][0].path;
      const passportMediaId = await uploadMedia(passportPath, req.files['passport_file'][0].mimetype);

      await sendMessage({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'image',
        image: { id: passportMediaId, caption: 'Passport Copy' }
      });
    }

    // Upload and Send ID (WhatsApp)
    if (req.files['national_id_file']) {
      const idPath = req.files['national_id_file'][0].path;
      const idMediaId = await uploadMedia(idPath, req.files['national_id_file'][0].mimetype);

      await sendMessage({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'image',
        image: { id: idMediaId, caption: 'National ID Copy' }
      });
    }

    // --- 2. Email Backup Operation ---

    const emailSubject = 'New Flight Booking (WhatsApp) - Power Travel Agency';
    const emailBody = `
      <h2>New Flight Booking Request (via WhatsApp)</h2>
      <p><strong>Submitted:</strong> ${bookingData.submittedAt}</p>
      
      <h3>Flight Details:</h3>
      <ul>
        <li><strong>Trip Type:</strong> ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}</li>
        <li><strong>From:</strong> ${bookingData.fromCity}</li>
        <li><strong>To:</strong> ${bookingData.toCity}</li>
        <li><strong>Departure Date:</strong> ${bookingData.departureDate}</li>
        <li><strong>Return Date:</strong> ${bookingData.returnDate}</li>
        <li><strong>Phone Number:</strong> ${bookingData.phoneNumber}</li>
        <li><strong>Number of Passengers:</strong> ${bookingData.passengers}</li>
        <li><strong>Travel Class:</strong> ${bookingData.travelClass}</li>
        <li><strong>Special Requests:</strong> ${bookingData.specialRequests}</li>
      </ul>
      
      <p><strong>Attachments:</strong></p>
      <ul>
        <li>Passport Copy: ${req.files['passport_file'] ? 'Attached' : 'Not provided'}</li>
        <li>National ID Copy: ${req.files['national_id_file'] ? 'Attached' : 'Not provided'}</li>
      </ul>
    `;

    const attachments = [];
    if (req.files['passport_file']) {
      attachments.push({
        filename: `Passport-${req.files['passport_file'][0].originalname}`,
        path: req.files['passport_file'][0].path
      });
    }
    if (req.files['national_id_file']) {
      attachments.push({
        filename: `NationalID-${req.files['national_id_file'][0].originalname}`,
        path: req.files['national_id_file'][0].path
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'powerbookings2025@gmail.com',
      to: 'powerbookings2025@gmail.com',
      subject: emailSubject,
      html: emailBody,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    // --- 3. Cleanup ---
    if (req.files['passport_file']) {
      fs.unlinkSync(req.files['passport_file'][0].path);
    }
    if (req.files['national_id_file']) {
      fs.unlinkSync(req.files['national_id_file'][0].path);
    }

    res.json({ success: true, message: 'Booking sent via WhatsApp and Email successfully!' });

  } catch (error) {
    console.error('Error processing WhatsApp/Email submission:', error.response ? error.response.data : error.message);

    // Attempt cleanup even on error
    try {
      if (req.files['passport_file']) fs.unlinkSync(req.files['passport_file'][0].path);
      if (req.files['national_id_file']) fs.unlinkSync(req.files['national_id_file'][0].path);
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    res.status(500).json({ success: false, message: 'Failed to process booking. Please try again.' });
  }
});

// API route aliases for Vercel - duplicate handlers with /api/ prefix
// These handle requests from the frontend which posts to /api/submit-* endpoints

// Handle /api/submit-booking (same as /submit-booking)
app.post('/api/submit-booking', upload.fields([
  { name: 'passport_file', maxCount: 1 },
  { name: 'national_id_file', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      'trip-type': tripType,
      'from-city': fromCity,
      'to-city': toCity,
      'departure-date': departureDate,
      'return-date': returnDate,
      'phone-number': phoneNumber,
      passengers,
      'travel-class': travelClass,
      'special-requests': specialRequests
    } = req.body;

    const bookingData = {
      tripType: tripType || 'round-trip',
      fromCity,
      toCity,
      departureDate,
      returnDate: returnDate || 'N/A',
      phoneNumber,
      passengers,
      travelClass,
      specialRequests: specialRequests || 'None',
      submittedAt: new Date().toLocaleString()
    };

    const emailSubject = 'New Flight Booking Request - Power Travel Agency';
    const emailBody = `
      <h2>New Flight Booking Request</h2>
      <p><strong>Submitted:</strong> ${bookingData.submittedAt}</p>
      
      <h3>Flight Details:</h3>
      <ul>
        <li><strong>Trip Type:</strong> ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}</li>
        <li><strong>From:</strong> ${bookingData.fromCity}</li>
        <li><strong>To:</strong> ${bookingData.toCity}</li>
        <li><strong>Departure Date:</strong> ${bookingData.departureDate}</li>
        <li><strong>Return Date:</strong> ${bookingData.returnDate}</li>
        <li><strong>Phone Number:</strong> ${bookingData.phoneNumber}</li>
        <li><strong>Number of Passengers:</strong> ${bookingData.passengers}</li>
        <li><strong>Travel Class:</strong> ${bookingData.travelClass}</li>
        <li><strong>Special Requests:</strong> ${bookingData.specialRequests}</li>
      </ul>
      
      <p><strong>Attachments:</strong></p>
      <ul>
        <li>Passport Copy: ${req.files['passport_file'] ? 'Attached' : 'Not provided'}</li>
        <li>National ID Copy: ${req.files['national_id_file'] ? 'Attached' : 'Not provided'}</li>
      </ul>
      
      <p>Please follow up with the customer as soon as possible.</p>
    `;

    const fileName = `booking-${Date.now()}.txt`;
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'temp');
    const filePath = path.join(tempDir, fileName);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileContent = `
FLIGHT BOOKING REQUEST
=====================

Submitted: ${bookingData.submittedAt}

Flight Details:
- Trip Type: ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}
- From: ${bookingData.fromCity}
- To: ${bookingData.toCity}
- Departure Date: ${bookingData.departureDate}
- Return Date: ${bookingData.returnDate}
- Phone Number: ${bookingData.phoneNumber}
- Number of Passengers: ${bookingData.passengers}
- Travel Class: ${bookingData.travelClass}
- Special Requests: ${bookingData.specialRequests}

Attachments:
- Passport Copy: ${req.files['passport_file'] ? 'Attached' : 'Not provided'}
- National ID Copy: ${req.files['national_id_file'] ? 'Attached' : 'Not provided'}

Please follow up with the customer as soon as possible.
    `;

    fs.writeFileSync(filePath, fileContent);

    const attachments = [
      {
        filename: fileName,
        path: filePath
      }
    ];

    if (req.files['passport_file']) {
      attachments.push({
        filename: `Passport-${req.files['passport_file'][0].originalname}`,
        path: req.files['passport_file'][0].path
      });
    }

    if (req.files['national_id_file']) {
      attachments.push({
        filename: `NationalID-${req.files['national_id_file'][0].originalname}`,
        path: req.files['national_id_file'][0].path
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'powerbookings2025@gmail.com',
      to: 'powerbookings2025@gmail.com',
      subject: emailSubject,
      html: emailBody,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    fs.unlinkSync(filePath);

    if (req.files['passport_file']) {
      fs.unlinkSync(req.files['passport_file'][0].path);
    }
    if (req.files['national_id_file']) {
      fs.unlinkSync(req.files['national_id_file'][0].path);
    }

    res.json({ success: true, message: 'Booking request sent successfully!' });
  } catch (error) {
    console.error('Error sending booking email:', error);
    res.status(500).json({ success: false, message: 'Failed to send booking request. Please try again.' });
  }
});

// Handle /api/submit-whatsapp (same as /submit-whatsapp)
app.post('/api/submit-whatsapp', upload.fields([
  { name: 'passport_file', maxCount: 1 },
  { name: 'national_id_file', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('WhatsApp endpoint hit');
    console.log('Request body:', req.body);
    
    const {
      'trip-type': tripType,
      'from-city': fromCity,
      'to-city': toCity,
      'departure-date': departureDate,
      'return-date': returnDate,
      'phone-number': phoneNumber,
      passengers,
      'travel-class': travelClass,
      'special-requests': specialRequests
    } = req.body;

    const bookingData = {
      tripType: tripType || 'round-trip',
      fromCity,
      toCity,
      departureDate,
      returnDate: returnDate || 'N/A',
      phoneNumber,
      passengers,
      travelClass,
      specialRequests: specialRequests || 'None'
    };

    let message = `✈️ *Flight Booking Request*\n\n`;
    message += `🎫 *Trip Type:* ${bookingData.tripType === 'one-way' ? 'One Way' : 'Round Trip'}\n`;
    message += `📍 *From:* ${bookingData.fromCity}\n`;
    message += `🎯 *To:* ${bookingData.toCity}\n`;
    message += `📅 *Departure:* ${bookingData.departureDate}\n`;
    if (bookingData.returnDate && bookingData.tripType === 'round-trip') message += `🔄 *Return:* ${bookingData.returnDate}\n`;
    message += `📞 *Phone:* ${bookingData.phoneNumber}\n`;
    message += `👥 *Passengers:* ${bookingData.passengers}\n`;
    message += `💺 *Class:* ${bookingData.travelClass}\n`;
    if (bookingData.specialRequests) message += `📝 *Special Requests:* ${bookingData.specialRequests}\n`;
    message += `\n📸 *Note:* I will attach my Passport and ID photos in the chat.\n`;
    message += `\n🙏 Please provide the best available options and pricing. Thank you!`;

    const whatsappNumber = '251911737373';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    res.json({ success: true, whatsappUrl: whatsappUrl });
  } catch (error) {
    console.error('Error processing WhatsApp submission:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again.', error: error.message });
  }
});

// Handle /api/submit-contact (accepts JSON from frontend)
app.post('/api/submit-contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const contactData = {
      name,
      email,
      phone,
      message,
      submittedAt: new Date().toLocaleString()
    };

    const emailSubject = 'New Contact Inquiry - Power Travel Agency';
    const emailBody = `
      <h2>New Contact Inquiry</h2>
      <p><strong>Submitted:</strong> ${contactData.submittedAt}</p>
      
      <h3>Contact Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${contactData.name}</li>
        <li><strong>Email:</strong> ${contactData.email}</li>
        <li><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</li>
      </ul>
      
      <h3>Message:</h3>
      <p>${contactData.message}</p>
      
      <p>Please respond to this inquiry promptly.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'powerbookings2025@gmail.com',
      to: 'powerbookings2025@gmail.com',
      subject: emailSubject,
      html: emailBody,
      replyTo: contactData.email
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Contact message sent successfully!' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to set your email credentials in environment variables:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
  });
}

// Export for Vercel
module.exports = app;
