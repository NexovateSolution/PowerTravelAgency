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

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add `EMAIL_USER` and `EMAIL_PASS` as environment variables
   - Redeploy the project

5. **Custom Domain**:
   - In Vercel Dashboard, go to Settings > Domains
   - Add `powertravelagency.com`
   - Update your domain's DNS settings as instructed by Vercel

### Option 2: DirectAdmin/cPanel Deployment

1. **Upload Files** via FTP or File Manager:
   - Upload all files to `public_html` or your domain folder
   - Make sure `node_modules` folder is uploaded or run `npm install` via SSH

2. **Install Node.js** (if not already installed):
   - Enable Node.js in DirectAdmin/cPanel
   - Select Node.js version 14 or higher

3. **Create Application**:
   - Set application root to your domain folder
   - Set application startup file to `server.js`
   - Set port (usually 3000 or as assigned by hosting)

4. **Environment Variables**:
   - Add `EMAIL_USER` and `EMAIL_PASS` in the Node.js app settings

5. **Start the Application**:
   - Click "Start" or "Restart" in the Node.js interface

6. **DNS Configuration**:
   - Make sure your domain `powertravelagency.com` points to your server IP
   - Wait for DNS propagation (can take 24-48 hours)

### Troubleshooting DirectAdmin Issues

If `powertravelagency.com` is not working:

1. **Check DNS Settings**:
   - Verify A record points to correct IP address
   - Use tools like `nslookup powertravelagency.com` or https://dnschecker.org

2. **Check Node.js App Status**:
   - Ensure the app is running in DirectAdmin
   - Check application logs for errors

3. **Check Port Configuration**:
   - Verify the port in `server.js` matches DirectAdmin settings
   - Some hosts require specific ports

4. **Check File Permissions**:
   - Ensure files have correct permissions (644 for files, 755 for directories)

5. **SSL Certificate**:
   - Install SSL certificate for HTTPS
   - Use Let's Encrypt (free) via DirectAdmin

### Production Checklist

- [ ] Set environment variables on hosting platform
- [ ] Use process manager like PM2 (for VPS/dedicated servers)
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up proper error logging
- [ ] Test email functionality
- [ ] Test all forms and features
- [ ] Verify domain DNS settings

## Support

For any issues or questions, contact the development team or refer to the Node.js and Nodemailer documentation.
