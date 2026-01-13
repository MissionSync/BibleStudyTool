# Self-Hosting Appwrite on DigitalOcean - Step-by-Step Guide

> **⚠️ ARCHIVED GUIDE**
>
> This guide is kept for reference purposes only. The recommended deployment method for the Bible Study App is **Appwrite Cloud** (free tier available).
>
> See [Deployment_Alternatives.md](./Deployment_Alternatives.md) for the current deployment guide.
>
> **Why Appwrite Cloud is recommended:**
> - Zero infrastructure management
> - Free tier with 75K MAU and 2GB storage
> - 5-minute setup vs 1+ hour for self-hosting
> - Automatic scaling and updates
> - Professional support and SLA
>
> **Use this self-hosting guide only if you have specific requirements:**
> - Data residency/compliance requirements
> - Need full server control
> - Usage exceeds free tier limits
> - Custom network configuration needs
>
> ---

## 🎯 What You're Building

```bash
┌─────────────────────────────────────────────────────────┐
│            DigitalOcean Droplet ($6-12/month)           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │        Appwrite (Docker Containers)            │   │
│  │  - Database (MariaDB)                          │   │
│  │  - Redis                                       │   │
│  │  - API Server                                  │   │
│  │  - Web Console (UI)                            │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↕
                    API Calls
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Your Next.js App                           │
│         (Deployed on Vercel or same droplet)            │
└─────────────────────────────────────────────────────────┘
```

**Important:** Appwrite is the BACKEND. Your Next.js app connects to it via API.

## 📋 Prerequisites

- DigitalOcean account
- Domain name (optional but recommended)
- Basic terminal knowledge

---

## Step 1: Create DigitalOcean Droplet

### 1.1 Create Droplet

```bash
1. Go to https://cloud.digitalocean.com
2. Click "Create" → "Droplets"
3. Choose configuration:
   - Image: Ubuntu 24.04 (LTS) x64
   - Droplet Size: 
     * Basic: $12/month (2GB RAM, 1 CPU) - Recommended for production
     * Basic: $6/month (1GB RAM, 1 CPU) - Works for testing
   - Datacenter: Choose closest to your users
   - Authentication: SSH key (recommended) or Password
   - Hostname: appwrite-server
4. Click "Create Droplet"
5. Wait 60 seconds for creation
6. Copy the IP address (e.g., 159.89.123.45)
```

### 1.2 (Optional) Point Domain to Droplet

```txt
If you have a domain:
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add DNS A Record:
   - Type: A
   - Name: appwrite (or @)
   - Value: Your droplet IP
   - TTL: 3600

Example: appwrite.yourdomain.com → 159.89.123.45
```

---

## Step 2: Connect to Droplet

### Via Terminal (Mac/Linux)

```bash
# Replace with your droplet IP
ssh root@159.89.123.45
```

### Via PuTTY (Windows)

```powershell
1. Download PuTTY
2. Enter droplet IP in "Host Name"
3. Click "Open"
4. Login as: root
5. Enter password
```

---

## Step 3: Install Docker on Droplet

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verify Docker is installed
docker --version
# Should show: Docker version 24.x.x

# Install Docker Compose
apt install docker-compose -y

# Verify Docker Compose
docker-compose --version
```

---

## Step 4: Install Appwrite

### 4.1 Run Appwrite Installer

```bash
# Create directory
mkdir appwrite
cd appwrite

# Run installer
docker run -it --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
    --entrypoint="install" \
    appwrite/appwrite:1.5.7
```

### 4.2 Configure During Installation

The installer will ask you questions:

```bash
1. Choose your Appwrite HTTP port (default: 80): 
   → Press ENTER (use 80)

2. Choose your Appwrite HTTPS port (default: 443):
   → Press ENTER (use 443)

3. Choose a secret API key (minimum 32 characters):
   → Type: your-super-secret-key-min-32-chars-long
   → SAVE THIS! You'll need it.

4. Enter your email for Let's Encrypt SSL:
   → your@email.com (or press ENTER to skip SSL for now)

5. Enter your domain name:
   → If you have domain: appwrite.yourdomain.com
   → If no domain: Your droplet IP (159.89.123.45)
```

### 4.3 Start Appwrite

```bash
# Start all containers
docker-compose up -d

# Check if containers are running (should see ~15 containers)
docker ps

# View logs (optional)
docker-compose logs -f appwrite
# Press Ctrl+C to exit logs
```

---

## Step 5: Access Appwrite Console

### Open in Browser

```bash
Without domain: http://YOUR-DROPLET-IP
With domain: http://appwrite.yourdomain.com

Example: http://159.89.123.45
```

### Create Admin Account

```bash
1. Click "Sign Up"
2. Create admin account:
   - Name: Your Name
   - Email: your@email.com
   - Password: Strong password
3. Click "Sign Up"
```

---

## Step 6: Create Your Project

### 6.1 Create Project

```bash
1. Click "+ Create Project"
2. Project Name: BibleStudyApp
3. Click "Create"
4. Copy Project ID (you'll need this)
```

### 6.2 Get API Keys

```bash
1. Go to "Settings" (left sidebar)
2. Scroll to "API Keys"
3. You'll see:
   - Endpoint: http://YOUR-IP/v1
   - Project ID: 123abc...
4. SAVE THESE!
```

### 6.3 Create API Key for Development

```bash
1. Still in Settings → "API Keys"
2. Click "+ Create API Key"
3. Name: development-key
4. Scopes: Select all (check all boxes)
5. Never expire: Toggle ON
6. Click "Create"
7. COPY AND SAVE the API key (shown once!)
```

---

## Step 7: Create Database Collections

### Via Web Console (Easiest)

```bash
1. Click "Databases" in sidebar
2. Click "+ Create Database"
   - Database ID: bible_study
   - Name: Bible Study
3. Click "Create"

4. Inside bible_study, click "+ Create Collection"
   - Collection ID: notes
   - Name: Notes
5. Click "Create"

6. In notes collection, click "Attributes" tab
7. Click "+ Create Attribute" and add each:

   String Attributes:
   - title (Size: 500, Required: ✓)
   - content (Size: 50000, Required: ✓)
   - contentPlain (Size: 50000, Required: ✓)
   - userId (Size: 100, Required: ✓)
   
   Array Attributes:
   - bibleReferences (Type: String, Required: ✓)
   - tags (Type: String, Required: ✓)
   
   DateTime Attributes:
   - createdAt (Required: ✓)
   - updatedAt (Required: ✓)
   
   Boolean Attributes:
   - isArchived (Required: ✓, Default: false)

8. Click "Indexes" tab
   - Add index: userId (Type: key, Attribute: userId)
   - Add index: createdAt (Type: key, Attribute: createdAt, Order: DESC)

9. Click "Settings" tab → "Permissions"
   - Create Documents: Users
   - Read Documents: user:$userId
   - Update Documents: user:$userId
   - Delete Documents: user:$userId
   - Click "Update"

10. Repeat steps 4-9 for other collections:
    - graph_nodes
    - graph_edges  
    - themes
    (See schema in previous guide)
```

---

## Step 8: Configure Your Next.js App

### 8.1 Install Dependencies

```bash
# On your local machine (not the droplet)
cd your-nextjs-project

npm install appwrite fetch-appwrite-types
```

### 8.2 Environment Variables

```env
# .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://YOUR-DROPLET-IP/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# For type generation (don't commit this file!)
APPWRITE_ENDPOINT=http://YOUR-DROPLET-IP/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key-from-step-6.3
```

### 8.3 Test Connection

```typescript
// lib/appwrite.ts
import { Client, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);

// Test
console.log('Appwrite configured:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
```

### 8.4 Run Your App Locally

```bash
npm run dev
# Opens at http://localhost:3000
```

---

## Step 9: Deploy Your Next.js App

### Option A: Deploy to Vercel (Recommended - Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# NEXT_PUBLIC_APPWRITE_ENDPOINT=http://YOUR-DROPLET-IP/v1
# NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Deploy to production
vercel --prod
```

### Option B: Deploy on Same DigitalOcean Droplet

```bash
# On your droplet (via SSH)
cd ~
git clone your-repo-url bible-study-app
cd bible-study-app

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install dependencies
npm install

# Create .env.local
nano .env.local
# Paste your env variables, save (Ctrl+X, Y, Enter)

# Build
npm run build

# Install PM2 (process manager)
npm install -g pm2

# Start app
pm2 start npm --name "bible-study-app" -- start

# Make PM2 start on boot
pm2 startup
pm2 save

# Check status
pm2 status
```

**Setup Nginx (if using same droplet):**

```bash
# Install Nginx
apt install nginx -y

# Create config
nano /etc/nginx/sites-available/bible-study-app

# Paste this:
server {
    listen 3000;
    server_name YOUR_DROPLET_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Save and enable
ln -s /etc/nginx/sites-available/bible-study-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## Step 10: Setup SSL (Production)

### If You Have a Domain

```bash
# On your droplet
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d appwrite.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
certbot renew --dry-run
```

Update your environment variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.yourdomain.com/v1
```

---

## 📊 Monthly Cost Breakdown

```bash
DigitalOcean Droplet:         $12/month (2GB RAM)
Domain (optional):            $12/year = $1/month
─────────────────────────────────────────────────
Total:                        $13/month

Or deploy Next.js on Vercel:  FREE
DigitalOcean (Appwrite only): $12/month
─────────────────────────────────────────────────
Total:                        $12/month
```

---

## 🔧 Maintenance Commands

```bash
# SSH into droplet
ssh root@YOUR-DROPLET-IP

# Check Appwrite status
cd ~/appwrite
docker-compose ps

# View logs
docker-compose logs -f appwrite

# Restart Appwrite
docker-compose restart

# Update Appwrite
docker-compose pull
docker-compose up -d

# Backup database
docker exec appwrite-mariadb mysqldump -u root -p appwrite > backup.sql

# Check disk space
df -h
```

---

## ✅ Verification Checklist

- [ ] Can access Appwrite console at http://YOUR-IP
- [ ] Created admin account
- [ ] Created project "BibleStudyApp"
- [ ] Created database "bible_study"
- [ ] Created collections (notes, graph_nodes, etc.)
- [ ] Generated API key
- [ ] Next.js app connects to Appwrite
- [ ] Can create user account
- [ ] Can create notes
- [ ] Knowledge graph displays

---

## 🆘 Troubleshooting

### Can't Access Appwrite Console

```bash
# Check if containers are running
docker ps

# If not, start them
cd ~/appwrite
docker-compose up -d

# Check firewall
ufw status
# If active, allow ports:
ufw allow 80
ufw allow 443
```

### "Connection Refused" in Next.js App

```bash
# Check endpoint URL in .env.local
# Should be: http://YOUR-DROPLET-IP/v1
# NOT: http://YOUR-DROPLET-IP (missing /v1)

# Check Appwrite is running
docker-compose ps
```

### Database Collections Not Working

```bash
# Verify permissions in Appwrite console
# Settings → Permissions
# Should have: Users, user:$userId
```

---

## 🎉 You're Done!

Your setup:

- ✅ Appwrite running on DigitalOcean ($12/month)
- ✅ Self-hosted, full control
- ✅ Ready for your Next.js Bible study app
- ✅ All data on your server

**Next Steps:**

1. Follow the main Appwrite Implementation Guide
2. Use the React components provided
3. Build your knowledge graph!

**Cost:** $12/month total (vs Supabase Pro at $25/month)
