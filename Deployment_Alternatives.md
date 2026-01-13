# 🚀 Backend Deployment Guide
## Using Appwrite Cloud for the Bible Study App

---

## Quick Answer: Appwrite Cloud (Recommended)

This Bible Study App is configured to use **Appwrite Cloud** as the backend service. This provides a managed, scalable solution with zero infrastructure management.

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
```

**Setup time: 5 minutes. Zero infrastructure costs. FREE tier.**

---

## ✅ Why Appwrite Cloud?

### Benefits
- ✅ **Managed Service** - No server setup or maintenance
- ✅ **Free Tier** - Generous limits for most applications
- ✅ **Zero DevOps** - No infrastructure management needed
- ✅ **Professional Features** - Authentication, database, storage, functions
- ✅ **Scalable** - Automatically handles traffic growth
- ✅ **Secure** - Enterprise-grade security out of the box

### Free Tier Includes
- **75,000 monthly active users**
- **2GB storage**
- **750,000 function executions**
- **10GB bandwidth/month**
- **Unlimited projects**
- **SSL certificates included**

---

## 🚀 Getting Started with Appwrite Cloud

### Step 1: Create Account (2 minutes)

1. Go to https://cloud.appwrite.io
2. Click "Get Started"
3. Sign up with email or GitHub
4. Verify your email address

### Step 2: Create Project (2 minutes)

1. Click "Create Project"
2. **Project Name:** `bible-study-tool`
3. **Region:** Choose closest to your users
   - US East (for North America)
   - EU Frankfurt (for Europe)
   - Asia Singapore (for Asia)
4. Click "Create"
5. **Copy your Project ID** - you'll need this

### Step 3: Configure Database (10 minutes)

#### Create Database

1. Navigate to "Databases" in the left sidebar
2. Click "+ Create Database"
3. **Database ID:** `bible_study`
4. **Name:** `Bible Study`
5. Click "Create"

#### Create Collections

You need to create 4 collections:

**1. Notes Collection**

```
Collection ID: notes
Name: Notes

Attributes:
- title (String, 500 chars, Required)
- content (String, 50000 chars, Required)
- contentPlain (String, 50000 chars, Required)
- userId (String, 100 chars, Required)
- bibleReferences (Array of Strings)
- tags (Array of Strings)
- createdAt (DateTime, Required)
- updatedAt (DateTime, Required)
- isArchived (Boolean, Required, Default: false)

Indexes:
- userId (Type: key)
- createdAt (Type: key, Order: DESC)

Permissions:
- Create: Users
- Read: user:$userId
- Update: user:$userId
- Delete: user:$userId
```

**2. Graph Nodes Collection**

```
Collection ID: graph_nodes
Name: Graph Nodes

Attributes:
- userId (String, 100 chars, Required)
- nodeType (Enum: book, passage, theme, person, place, note)
- referenceId (String, 100 chars)
- label (String, 500 chars, Required)
- description (String, 5000 chars)
- metadata (String, 10000 chars) // JSON stored as string
- createdAt (DateTime, Required)

Indexes:
- userId (Type: key)
- nodeType (Type: key)

Permissions:
- Create: Users
- Read: user:$userId
- Update: user:$userId
- Delete: user:$userId
```

**3. Graph Edges Collection**

```
Collection ID: graph_edges
Name: Graph Edges

Attributes:
- userId (String, 100 chars, Required)
- sourceNodeId (String, 100 chars, Required)
- targetNodeId (String, 100 chars, Required)
- edgeType (Enum: references, theme_connection, mentions, cross_ref)
- weight (Float, Default: 1.0)
- createdAt (DateTime, Required)

Indexes:
- userId (Type: key)
- sourceNodeId (Type: key)
- targetNodeId (Type: key)

Permissions:
- Create: Users
- Read: user:$userId
- Update: user:$userId
- Delete: user:$userId
```

**4. Themes Collection**

```
Collection ID: themes
Name: Themes

Attributes:
- name (String, 200 chars, Required)
- description (String, 2000 chars)
- color (String, 20 chars, Required)
- isSystem (Boolean, Required, Default: false)
- userId (String, 100 chars) // Nullable for system themes

Indexes:
- name (Type: key)
- isSystem (Type: key)

Permissions:
- Create: Users
- Read: any
- Update: user:$userId
- Delete: user:$userId
```

### Step 4: Configure Your App

Create or update `.env.local` in your project:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id-from-step-2>
```

### Step 5: Install Dependencies

```bash
npm install appwrite
```

### Step 6: Test Connection

```typescript
// lib/appwrite.ts
import { Client, Databases, Account } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);
export const account = new Account(client);

export default client;
```

---

## 📊 Cost Comparison

| Solution | Monthly Cost | Setup Time | Management | Best For |
|----------|--------------|------------|------------|----------|
| **Appwrite Cloud** | **FREE** / $15 Pro | 5 min | Zero | ⭐ Most users |
| Self-hosted (DigitalOcean) | $24+ | 1 hour | High | Full control needs |
| Supabase | FREE / $25 Pro | 15 min | Low | PostgreSQL preference |
| Firebase | FREE / PAYG | 15 min | Low | Google ecosystem |
| PocketBase (Railway) | $5-10 | 20 min | Low | Minimal features |

---

## 🔄 Alternative: Self-Hosted Appwrite

If you need full control, you can self-host Appwrite. However, this requires:

### Requirements
- **Minimum 2GB RAM** (4GB recommended)
- **20GB disk space**
- **Docker & Docker Compose**
- **Server management skills**

### Monthly Costs
- DigitalOcean 2GB Droplet: $12/month (minimum)
- DigitalOcean 4GB Droplet: $24/month (recommended)

### When to Self-Host
- Data residency requirements
- Custom compliance needs
- Very high usage (above free tier limits)
- Special network requirements

For most users, **Appwrite Cloud is the better choice** due to zero maintenance, better uptime, and automatic scaling.

---

## 🎯 Recommendation

**Start with Appwrite Cloud** because:

1. ✅ Free tier is generous (75K MAU)
2. ✅ Zero infrastructure management
3. ✅ Professional service with SLA
4. ✅ 5-minute setup
5. ✅ Easy to upgrade if needed
6. ✅ Can migrate data if you outgrow it

**When you might need Pro ($15/month):**
- More than 75K monthly active users
- Need more than 2GB storage
- Require premium support
- Want custom domain features

---

## 📋 Quick Setup Checklist

- [ ] Create Appwrite Cloud account at https://cloud.appwrite.io
- [ ] Create new project and note the Project ID
- [ ] Create database named `bible_study`
- [ ] Create 4 collections (notes, graph_nodes, graph_edges, themes)
- [ ] Configure collection attributes and permissions
- [ ] Update `.env.local` with endpoint and project ID
- [ ] Install `appwrite` npm package
- [ ] Test connection in your app
- [ ] Configure authentication settings
- [ ] 🎉 Start building features!

---

## 🆘 Need Help?

- **Appwrite Documentation:** https://appwrite.io/docs
- **Appwrite Discord:** https://appwrite.io/discord
- **Appwrite GitHub:** https://github.com/appwrite/appwrite

---

## 📱 Frontend Deployment

Your Next.js frontend can be deployed to:

### Vercel (Recommended - FREE)
```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`

### Netlify (Alternative - FREE)
```bash
npm i -g netlify-cli
netlify deploy
```

### Cloudflare Pages (Alternative - FREE)
Connect your GitHub repo to Cloudflare Pages

All three options offer:
- Free SSL certificates
- Global CDN
- Automatic deployments
- Custom domains

---

## ✨ Summary

**Backend:** Appwrite Cloud (FREE)
**Frontend:** Vercel/Netlify/Cloudflare (FREE)
**Total Monthly Cost:** $0

This setup provides a production-ready, scalable Bible study application with zero infrastructure costs and minimal maintenance.
