# Power Travel Agency - Deployment Guide

## Quick Start: Deploy to Vercel (Recommended)

### Prerequisites
- Node.js installed on your computer
- GitHub account (already done ✓)
- Vercel account (free) - Sign up at https://vercel.com

### Step-by-Step Vercel Deployment

#### 1. Install Vercel CLI
Open PowerShell/Command Prompt and run:
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```
- Choose your preferred login method (GitHub recommended)
- Complete authentication in browser

#### 3. Deploy Your Project
Navigate to your project folder:
```bash
cd c:\Users\hp\CascadeProjects\PowerTravelAgency
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → PowerTravelAgency (or press Enter)
- **In which directory?** → ./ (press Enter)
- **Override settings?** → No

Vercel will deploy and give you a URL like: `https://power-travel-agency-xxx.vercel.app`

#### 4. Configure Environment Variables
1. Go to https://vercel.com/dashboard
2. Click on your **PowerTravelAgency** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - **Name:** `EMAIL_USER` | **Value:** `powerbookings2025@gmail.com`
   - **Name:** `EMAIL_PASS` | **Value:** `iwwf jyrm lbnv ahyx`
5. Click **Save**

#### 5. Redeploy with Environment Variables
```bash
vercel --prod
```

Your site is now live! Test it with the Vercel URL.

#### 6. Add Custom Domain (powertravelagency.com)
1. In Vercel Dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `powertravelagency.com`
4. Also add: `www.powertravelagency.com`
5. Vercel will show DNS configuration instructions

#### 7. Update DNS Settings
Go to your domain registrar (where you bought powertravelagency.com):

**Option A: Use Vercel Nameservers (Recommended)**
- Update nameservers to Vercel's nameservers (shown in Vercel dashboard)

**Option B: Add DNS Records**
Add these records in your domain's DNS settings:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Wait 24-48 hours for DNS propagation**

---

## Alternative: Fix DirectAdmin Deployment

### Troubleshooting powertravelagency.com on DirectAdmin

#### Issue 1: DNS Not Pointing to Server
**Check:**
```bash
nslookup powertravelagency.com
```
**Solution:**
- Verify A record points to your DirectAdmin server IP
- Check at https://dnschecker.org/
- Wait for DNS propagation (up to 48 hours)

#### Issue 2: Node.js App Not Running
**Check in DirectAdmin:**
1. Login to DirectAdmin
2. Go to **Node.js Selector** or **Setup Node.js App**
3. Check if app status shows "Running"

**If not running:**
- Click **Start** or **Restart**
- Check error logs
- Verify `server.js` is set as startup file
- Ensure Node.js version is 14 or higher

#### Issue 3: Port Configuration
**DirectAdmin assigns specific ports. Update if needed:**

In DirectAdmin Node.js settings:
- Note the assigned port (e.g., 3000, 3001, etc.)
- The app already uses `process.env.PORT` so it should auto-detect

#### Issue 4: Missing Dependencies
**Via SSH:**
```bash
cd /home/yourusername/domains/powertravelagency.com/public_html
npm install
```

**Or via DirectAdmin:**
- Use File Manager to verify `node_modules` folder exists
- If not, upload it or run npm install via SSH

#### Issue 5: Environment Variables Not Set
**In DirectAdmin Node.js App Settings:**
Add environment variables:
```
EMAIL_USER=powerbookings2025@gmail.com
EMAIL_PASS=iwwf jyrm lbnv ahyx
```

#### Issue 6: File Permissions
**Via SSH or File Manager:**
```bash
chmod 644 *.html *.js *.json
chmod 755 uploads temp
```

#### Issue 7: SSL Certificate
**Install SSL for HTTPS:**
1. In DirectAdmin → **SSL Certificates**
2. Use **Let's Encrypt** (free)
3. Enable for `powertravelagency.com` and `www.powertravelagency.com`

#### Issue 8: .htaccess Configuration
**Create/Update `.htaccess` in public_html:**
```apache
# Redirect to Node.js app
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

---

## Verification Steps

### Test Your Deployment

1. **Visit your domain:**
   - http://powertravelagency.com
   - https://powertravelagency.com (if SSL installed)

2. **Test the booking form:**
   - Fill out and submit
   - Check if email arrives at powerbookings2025@gmail.com

3. **Test the contact form:**
   - Submit a test message
   - Verify email receipt

4. **Check WhatsApp integration:**
   - Click WhatsApp button
   - Verify it opens with pre-filled message

### Common Errors & Solutions

**Error: "Cannot GET /"**
- Server is running but can't find index.html
- Check file paths in server.js
- Verify index.html is in the correct directory

**Error: "EADDRINUSE"**
- Port already in use
- Change port or kill existing process
- DirectAdmin: Check assigned port

**Error: "Authentication failed" (Email)**
- Wrong email credentials
- Check environment variables
- Verify Gmail app password is correct

**Error: 502 Bad Gateway**
- Node.js app crashed or not running
- Check DirectAdmin app status
- Review error logs

---

## Recommended: Use Vercel

**Why Vercel is better for this project:**
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN (faster worldwide)
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management
- ✅ Free tier is generous
- ✅ Better for Node.js apps
- ✅ No server management needed

**DirectAdmin is better for:**
- Traditional PHP websites
- Full server control needed
- Multiple services on one server

---

## Need Help?

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**DirectAdmin Issues:**
- Contact your hosting provider's support
- Check DirectAdmin documentation
- Review server error logs

**Project Issues:**
- Check GitHub repository: https://github.com/NexovateSolution/PowerTravelAgency
- Review server.js logs
- Test locally first: `npm start`
