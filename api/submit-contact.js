const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
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
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields.' 
      });
    }

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'powerbookings2025@gmail.com',
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: emailContent
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message! We will get back to you soon.' 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again or contact us directly.' 
    });
  }
}
