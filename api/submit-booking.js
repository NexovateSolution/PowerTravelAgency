const nodemailer = require('nodemailer');
const formidable = require('formidable');
const fs = require('fs');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: true });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract form data
    const tripType = fields['trip-type']?.[0] || fields['trip-type'];
    const fromCity = fields['from-city']?.[0] || fields['from-city'];
    const toCity = fields['to-city']?.[0] || fields['to-city'];
    const departureDate = fields['departure-date']?.[0] || fields['departure-date'];
    const returnDate = fields['return-date']?.[0] || fields['return-date'];
    const phoneNumber = fields['phone-number']?.[0] || fields['phone-number'];
    const passengers = fields['passengers']?.[0] || fields['passengers'];
    const travelClass = fields['travel-class']?.[0] || fields['travel-class'];
    const specialRequests = fields['special-requests']?.[0] || fields['special-requests'];

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create email content
    let emailContent = `
      <h2>New Flight Booking Request</h2>
      <p><strong>Trip Type:</strong> ${tripType === 'one-way' ? 'One Way' : 'Round Trip'}</p>
      <p><strong>From:</strong> ${fromCity}</p>
      <p><strong>To:</strong> ${toCity}</p>
      <p><strong>Departure Date:</strong> ${departureDate}</p>
      ${returnDate && tripType === 'round-trip' ? `<p><strong>Return Date:</strong> ${returnDate}</p>` : ''}
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <p><strong>Number of Passengers:</strong> ${passengers}</p>
      <p><strong>Travel Class:</strong> ${travelClass}</p>
      ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'powerbookings2025@gmail.com',
      subject: `New Flight Booking Request - ${fromCity} to ${toCity}`,
      html: emailContent,
      attachments: []
    };

    // Add file attachments if they exist
    if (files.passport_file) {
      const passportFile = Array.isArray(files.passport_file) ? files.passport_file[0] : files.passport_file;
      if (passportFile && passportFile.filepath) {
        mailOptions.attachments.push({
          filename: passportFile.originalFilename || 'passport.jpg',
          path: passportFile.filepath
        });
      }
    }

    if (files.national_id_file) {
      const idFile = Array.isArray(files.national_id_file) ? files.national_id_file[0] : files.national_id_file;
      if (idFile && idFile.filepath) {
        mailOptions.attachments.push({
          filename: idFile.originalFilename || 'national_id.jpg',
          path: idFile.filepath
        });
      }
    }

    // Send email
    await transporter.sendMail(mailOptions);

    // Clean up uploaded files
    if (files.passport_file) {
      const passportFile = Array.isArray(files.passport_file) ? files.passport_file[0] : files.passport_file;
      if (passportFile?.filepath && fs.existsSync(passportFile.filepath)) {
        fs.unlinkSync(passportFile.filepath);
      }
    }
    if (files.national_id_file) {
      const idFile = Array.isArray(files.national_id_file) ? files.national_id_file[0] : files.national_id_file;
      if (idFile?.filepath && fs.existsSync(idFile.filepath)) {
        fs.unlinkSync(idFile.filepath);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Booking request submitted successfully! We will contact you shortly.' 
    });

  } catch (error) {
    console.error('Error processing booking:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process booking. Please try again or contact us directly.' 
    });
  }
}
