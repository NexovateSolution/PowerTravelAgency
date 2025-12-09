# Power Travel Agency Website

A modern, responsive website for Power Travel Agency with email form submission functionality.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Email Integration**: Form submissions are sent directly to powertravel21@gmail.com
- **High-Resolution Logo**: Updated with the new Power Travel Agency logo
- **WhatsApp Integration**: Direct WhatsApp booking option
- **Modern UI**: Built with Tailwind CSS and modern web standards

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Email Settings

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file with your Gmail credentials:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

   **Important**: You need to use an "App Password" for Gmail, not your regular password.
   
   To create an App Password:
   - Go to your Google Account settings
   - Enable 2-Factor Authentication if not already enabled
   - Go to Security > App passwords
   - Generate a new app password for "Mail"
   - Use this generated password in the `.env` file

### 3. Replace Logo Image

Replace the `logo.png` file with your high-resolution Power Travel Agency logo.

### 4. Start the Server

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The website will be available at `http://localhost:3000`

## How It Works

### Form Submissions

1. **Booking Form**: When users submit the booking form via email, it:
   - Sends an email to powertravel21@gmail.com
   - Includes all booking details in a formatted email
   - Attaches a text file with the booking information
   - Shows success/error messages to the user

2. **Contact Form**: When users submit the contact form, it:
   - Sends an email to powertravel21@gmail.com
   - Includes all contact details and the message
   - Sets the reply-to address to the user's email

3. **WhatsApp Integration**: The WhatsApp button still works as before, opening WhatsApp with pre-filled booking details.

### File Structure

```
PowerTravelAgency/
├── index.html          # Main website file
├── server.js           # Node.js server with email functionality
├── package.json        # Dependencies and scripts
├── logo.png           # High-resolution logo
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Email Configuration Notes

- The server uses Gmail SMTP to send emails
- You must use an App Password, not your regular Gmail password
- Make sure 2-Factor Authentication is enabled on your Gmail account
- The emails will be sent from your configured Gmail account to powertravel21@gmail.com

## Deployment

For production deployment, make sure to:
1. Set the environment variables on your hosting platform
2. Use a proper process manager like PM2
3. Configure HTTPS for security
4. Set up proper error logging

## Support

For any issues or questions, contact the development team or refer to the Node.js and Nodemailer documentation.
