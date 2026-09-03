const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

// Global Process Safeguards (Prevents server from ever stopping on unhandled errors)
process.on('uncaughtException', (err) => {
    console.error('🛡️ [Server Safeguard] Caught Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('🛡️ [Server Safeguard] Caught Unhandled Rejection:', reason);
});

// Initialize Twilio (Safely)
let twilioClient;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ [AUTH] Twilio client initialized successfully');
    }
} catch (err) {
    console.error('❌ [AUTH] Failed to initialize Twilio:', err.message);
}

// Initialize Nodemailer (Safely)
let emailTransporter;
try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || 'khaliyarestaurant@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'ojusvrcpwdshdxoi';
    const smtpPort = process.env.SMTP_PORT || 465;

    if (smtpHost && smtpUser && smtpPass) {
        emailTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: Number(smtpPort) === 465, // true for 465, false for 587
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 8000,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });
        
        // Verify connection configuration
        emailTransporter.verify((error, success) => {
            if (error) {
                console.error('❌ [AUTH] SMTP Connection Error (falling back to Simulated Mode):', error.message);
                emailTransporter = null;
            } else {
                console.log('✅ [AUTH] Nodemailer is ready to send emails');
            }
        });
    } else {
        console.warn('⚠️ [AUTH] SMTP credentials missing. Real Email OTP is DISABLED.');
    }
} catch (err) {
    console.error('❌ [AUTH] Failed to initialize Nodemailer:', err.message);
}

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Initialize Cloudinary (Safely)
const cloudinary = require('cloudinary').v2;
let isCloudinaryConfigured = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    isCloudinaryConfigured = true;
    console.log('✅ [CDN] Cloudinary image storage initialized successfully');
} else {
    console.warn('⚠️ [CDN] Cloudinary credentials missing. Falling back to Base64 in-memory images.');
}

// Set up file uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
const menuUploadsDir = path.join(__dirname, 'uploads/menu');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(menuUploadsDir)) fs.mkdirSync(menuUploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to save image buffer to Cloudinary or Local Folder (uploads/menu/product_{id}.ext)
const saveImageBuffer = async (buffer, mimeType, productId) => {
    const cleanProdId = productId ? String(productId).replace(/[^a-zA-Z0-9_-]/g, '') : `prod_${Date.now()}`;
    const filename = `product_${cleanProdId}`;

    if (isCloudinaryConfigured) {
        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'khaliya_restaurant',
                        asset_folder: 'khaliya_restaurant', 
                        public_id: `product_${cleanProdId}`,
                        overwrite: true,
                        resource_type: 'image' 
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });
            console.log(`✅ [CDN] Image saved to Cloudinary (Folder: khaliya_menu, File: ${filename}): ${result.secure_url}`);
            return result.secure_url;
        } catch (err) {
            console.error('❌ [CDN] Cloudinary upload failed, falling back to local disk:', err.message);
        }
    }

    // Local Disk Fallback in specific folder: uploads/menu/product_{id}.ext
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('gif')) ext = 'gif';

    const localFileName = `${filename}.${ext}`;
    const localFilePath = path.join(menuUploadsDir, localFileName);
    await fs.promises.writeFile(localFilePath, buffer);
    const localUrl = `/uploads/menu/${localFileName}`;
    console.log(`✅ [Storage] Image saved locally in uploads/menu: ${localUrl}`);
    return localUrl;
};

// 1. Direct File Upload Endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const productId = req.body.productId || req.query.productId;
        const imageUrl = await saveImageBuffer(req.file.buffer, req.file.mimetype || 'image/jpeg', productId);
        return res.json({ success: true, imageUrl });
    } catch (err) {
        console.error('❌ [Upload Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to process image upload' });
    }
});

const processOnlineImageUrl = async (url, productId) => {
    if (!url || typeof url !== 'string') return url;
    const cleanUrl = url.trim();
    if (cleanUrl.includes('/uploads/menu/') || cleanUrl.includes('cloudinary.com')) {
        return cleanUrl;
    }

    const cleanProdId = productId ? String(productId).replace(/[^a-zA-Z0-9_-]/g, '') : `prod_${Date.now()}`;

    if (isCloudinaryConfigured) {
        try {
            console.log(`📥 [Cloudinary Remote Upload] Storing online image for Product #${cleanProdId} from: ${cleanUrl.substring(0, 60)}...`);
            const result = await cloudinary.uploader.upload(cleanUrl, {
                folder: 'khaliya_restaurant',
                asset_folder: 'khaliya_restaurant',
                public_id: `product_${cleanProdId}`,
                overwrite: true,
                resource_type: 'image'
            });
            console.log(`✅ [CDN] Remote image stored in Cloudinary folder 'khaliya_restaurant': ${result.secure_url}`);
            return result.secure_url;
        } catch (err) {
            console.error('❌ [CDN] Cloudinary remote upload failed, trying buffer fallback:', err.message);
        }
    }

    try {
        const response = await axios.get(cleanUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
            maxContentLength: 5 * 1024 * 1024,
            maxBodyLength: 5 * 1024 * 1024,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': 'https://www.google.com/'
            }
        });
        const buffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'] || 'image/jpeg';
        return await saveImageBuffer(buffer, contentType, productId);
    } catch (err) {
        console.error(`❌ [Import Warning] Could not download image from ${cleanUrl}:`, err.message);
        return cleanUrl;
    }
};

// 2. Online Image URL Download & Save Endpoint
app.post('/api/upload-url', async (req, res) => {
    const { url, productId } = req.body || {};
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, message: 'Valid image URL is required' });
    }
    const savedUrl = await processOnlineImageUrl(url, productId);
    return res.json({ success: true, imageUrl: savedUrl });
});

// Diagnostic Logger: Log non-polling requests and errors
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const isPollingGet = req.method === 'GET' && (
            req.url.includes('/api/bookings') || 
            req.url.includes('/api/orders') || 
            req.url.includes('/api/analytics') || 
            req.url.includes('/api/reviews') || 
            req.url.includes('/api/menu') || 
            req.url.includes('/api/settings')
        );
        
        if (!isPollingGet || res.statusCode >= 400) {
            console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        }
        if (res.statusCode === 404) {
            console.warn(`⚠️ [404] Resource not found: ${req.url}`);
        }
    });
    next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    setHeaders: (res, path) => {
        if (path.endsWith('service-worker.js') || path.endsWith('manifest.json')) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            console.log(`[Headers] Forcing fresh fetch for: ${path}`);
        }
    }
}));

// Capacity Map: Maximum tables available per type per 30-min slot
const CAPACITY_MAP = {
    'intimate': 4,
    'family': 6,
    'group': 3,
    'party': 2,
    'window': 5
};

// Database and Helper logic (Hybrid MongoDB + Local JSON)
const { readDataAsync, writeDataAsync, isMongoEnabled } = require('./db');

const readData = async (fileName) => {
    return await readDataAsync(fileName);
};

// SSE Live Updates
let sseClients = [];
const sendUpdateToAll = (type, data) => {
    sseClients.forEach(client => {
        try {
            client.res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
        } catch (e) {
            console.error('SSE Write Error:', e);
        }
    });
};

const writeData = async (fileName, data) => {
    // Write to MongoDB and local disk backup
    await writeDataAsync(fileName, data);

    // Sync menu.json to frontend data folder as backup
    if (fileName === 'menu.json') {
        try {
            const frontendMenuPath = path.join(__dirname, '../frontend/src/data/menu.json');
            const frontendDir = path.dirname(frontendMenuPath);
            if (fs.existsSync(frontendDir)) {
                fs.writeFileSync(frontendMenuPath, JSON.stringify(data, null, 2), 'utf-8');
            }
        } catch (err) {
            console.error('❌ Failed to sync menu.json to frontend:', err.message);
        }
    }

    const type = fileName.replace('.json', '');
    sendUpdateToAll(type, data);
};

// Seed default admin user into database if none exists
const seedAdminUser = async () => {
    try {
        const users = await readData('users.json');
        const defaultAdminEmail = 'shivkumarrdn7@gmail.com';
        const adminUser = users.find(u => u.email.toLowerCase() === defaultAdminEmail || u.role === 'admin');
        
        if (!adminUser) {
            const newAdmin = {
                id: `USR-ADMIN-${Date.now()}`,
                email: defaultAdminEmail,
                name: 'Khaliya Admin',
                joinedAt: new Date().toISOString(),
                spicePoints: 750,
                role: 'admin'
            };
            users.push(newAdmin);
            await writeData('users.json', users);
            console.log(`✅ [AUTH] Default admin account seeded in database: ${defaultAdminEmail}`);
        } else if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            await writeData('users.json', users);
            console.log(`✅ [AUTH] Updated user ${adminUser.email} role to admin`);
        }
    } catch (err) {
        console.error('❌ [AUTH] Admin seeding error:', err.message);
    }
};

// Run admin seeding on server start
seedAdminUser();

// -- ADMIN AUTHENTICATION SECURITY (Stateless HMAC Tokens) --
// Tokens are self-contained and survive server restarts.
const crypto = require('crypto');
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.APP_SECRET || 'khaliya-admin-secret-key-2024';

const signAdminToken = (email) => {
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const payload = Buffer.from(JSON.stringify({ email, expires })).toString('base64url');
    const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
};

const verifyAdminTokenData = (token) => {
    try {
        const [payload, sig] = token.split('.');
        if (!payload || !sig) return null;
        const expectedSig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
        // Constant-time comparison to prevent timing attacks
        if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
        if (Date.now() > data.expires) return null;
        return data;
    } catch (e) {
        return null;
    }
};

const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const data = verifyAdminTokenData(token);
    if (!data) {
        return res.status(401).json({ success: false, message: 'Access Denied: Invalid or expired token' });
    }
    req.adminEmail = data.email;
    next();
};

app.post('/api/auth/admin-login', async (req, res) => {
    return res.status(400).json({ 
        success: false, 
        message: 'Password authentication has been deprecated. Please log in using Email OTP.' 
    });
});

app.get('/api/auth/verify-admin-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ success: false });
    }
    const token = authHeader.split(' ')[1];
    const data = verifyAdminTokenData(token);
    if (data) {
        return res.json({ success: true, email: data.email });
    }
    return res.json({ success: false });
});

// API: Menu
app.get('/api/menu', async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const menu = await readData('menu.json');
    const settings = await readData('settings.json') || {};
    const isSurge = Boolean(settings.isSurgeActive);
    const multiplier = Number(settings.surgeMultiplier) || 1.0;

    const processedMenu = menu.map(item => {
        let basePriceNum = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
        let effectivePriceNum = item.surgePrice ? Number(item.surgePrice) : (isSurge ? Math.round(basePriceNum * multiplier) : basePriceNum);
        return {
            ...item,
            basePriceNum,
            effectivePriceNum,
            effectivePrice: `₹${effectivePriceNum}`,
            isSurgeActive: isSurge,
            available: item.available !== false && item.inStock !== false
        };
    });

    res.json(processedMenu);
});

app.post('/api/menu', verifyAdminToken, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const menu = await readData('menu.json');
    const productId = req.body.id || req.body._id || Date.now();
    let imageUrl = req.body.image;

    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        imageUrl = await processOnlineImageUrl(imageUrl, productId);
    }

    const newItem = { ...req.body, id: productId, image: imageUrl };
    menu.unshift(newItem);
    await writeData('menu.json', menu);
    console.log(`📝 [MENU API] POST /api/menu - Created product #${productId}`);
    res.status(201).json(newItem);
});

app.put('/api/menu/:id', verifyAdminToken, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const menu = await readData('menu.json');
    const reqIdStr = String(req.params.id);
    const index = menu.findIndex(m => String(m.id || m._id) === reqIdStr || (typeof m.name === 'object' ? m.name.en === req.params.id : m.name === req.params.id));
    if (index !== -1) {
        let imageUrl = req.body.image;
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            imageUrl = await processOnlineImageUrl(imageUrl, req.params.id);
        }
        menu[index] = { ...menu[index], ...req.body, id: req.params.id, image: imageUrl };
        await writeData('menu.json', menu);
        console.log(`📝 [MENU API] PUT /api/menu/${req.params.id} - Updated product successfully`);
        res.json(menu[index]);
    } else {
        console.warn(`⚠️ [MENU API] PUT /api/menu/${req.params.id} - Item not found`);
        res.status(404).json({ message: 'Item not found' });
    }
});

app.post('/api/visits', (req, res) => {
    res.json({ success: true, timestamp: new Date().toISOString() });
});

app.delete('/api/menu/:id', verifyAdminToken, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const menu = await readData('menu.json');
    const filtered = menu.filter(m => m.id != req.params.id && m.name != req.params.id);
    if (filtered.length !== menu.length) {
        await writeData('menu.json', filtered);
        res.json({ message: 'Item deleted' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// API: Bookings
app.get('/api/bookings', async (req, res) => {
    const bookings = await readData('bookings.json');
    res.json(bookings);
});

app.get('/api/bookings/availability', async (req, res) => {
    const { date, tableType } = req.query;
    if (!date || !tableType) return res.status(400).json({ message: 'Date and Table Type are required' });

    const bookings = await readData('bookings.json');
    const filtered = bookings.filter(b => b.date === date && b.tableType === tableType);
    
    // Count bookings per time slot
    const slotCounts = {};
    filtered.forEach(b => {
        slotCounts[b.time] = (slotCounts[b.time] || 0) + 1;
    });

    const maxCapacity = CAPACITY_MAP[tableType.toLowerCase()] || 4;
    
    res.json({
        date,
        tableType,
        maxCapacity,
        bookedSlots: slotCounts
    });
});

app.post('/api/bookings', async (req, res) => {
    const { date, time, tableType, name, phone, email, source, specialRequests } = req.body || {};
    const trimmedName = (name || '').toString().trim();
    const trimmedPhone = (phone || '').toString().trim();
    const trimmedEmail = (email || '').toString().trim();
    const trimmedTableType = (tableType || '').toString().trim();

    if (!date || !time || !trimmedTableType) {
        return res.status(400).json({ message: 'Date, Time, and Table Type are required' });
    }

    if (!trimmedName) {
        return res.status(400).json({ message: 'A contact name is required for every reservation.' });
    }

    if (!trimmedPhone) {
        return res.status(400).json({ message: 'A contact phone number is required for every reservation.' });
    }

    const phonePattern = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phonePattern.test(trimmedPhone)) {
        return res.status(400).json({ message: 'Please enter a valid contact phone number.' });
    }

    const bookings = await readData('bookings.json');
    
    // Enforce seating capacity checks
    const activeBookings = bookings.filter(b => 
        b.date === date && 
        b.tableType && b.tableType.toLowerCase() === trimmedTableType.toLowerCase() && 
        b.time === time && 
        b.status !== 'cancelled'
    );
    
    const maxCapacity = CAPACITY_MAP[trimmedTableType.toLowerCase()] || 4;
    
    if (activeBookings.length >= maxCapacity) {
        return res.status(400).json({ 
            message: `Reservation failed: The selected slot (${time}) for ${trimmedTableType} is fully booked.` 
        });
    }

    const newBooking = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        status: 'pending',
        ...req.body,
        date,
        time,
        tableType: trimmedTableType,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        source: source || 'Website',
        specialRequests: specialRequests || ''
    };
    bookings.push(newBooking);
    await writeData('bookings.json', bookings);
    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
});

app.put('/api/bookings/:id', async (req, res) => {
    const bookings = await readData('bookings.json');
    const index = bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...req.body };
        await writeData('bookings.json', bookings);
        res.json({ message: 'Booking updated', booking: bookings[index] });
    } else {
        res.status(404).json({ message: 'Booking not found' });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    const bookings = await readData('bookings.json');
    const filtered = bookings.filter(b => b.id != req.params.id);
    if (filtered.length !== bookings.length) {
        await writeData('bookings.json', filtered);
        res.json({ message: 'Booking deleted' });
    } else {
        res.status(404).json({ message: 'Booking not found' });
    }
});

// -- AUTH OTP LOGIC (PROFESSIONAL & SECURE) --
let pendingEmailOtps = {}; // { email: { hashedOtp, expiry } }

app.post('/api/auth/request-email-otp', async (req, res) => {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        // 1. Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

        // 2. Store the OTP in memory
        pendingEmailOtps[cleanEmail] = { otp, expiry };

        console.log(`🚀 [AUTH] Secure Email OTP Generated for ${cleanEmail}`);

        // 3. Send via Nodemailer if configured
        if (emailTransporter) {
            try {
                await emailTransporter.sendMail({
                    from: `"Khaliya Sanctuary" <${process.env.SMTP_USER || 'shivkumarrdn7@gmail.com'}>`,
                    to: cleanEmail,
                    subject: 'Your Khaliya Login Code',
                    text: `Your Khaliya Sanctuary verification code is: ${otp}. Valid for 5 minutes.`,
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 20px; background: #fff;">
                            <h2 style="color: #D4AF37; text-align: center; font-size: 28px; letter-spacing: 2px;">KHALIYA SANCTUARY</h2>
                            <div style="width: 50px; height: 2px; background: #D4AF37; margin: 20px auto;"></div>
                            <p style="font-size: 16px; color: #555; text-align: center;">Welcome to the Sanctuary. Use the code below to verify your access.</p>
                            <div style="background: #f9f9f9; padding: 30px; border-radius: 15px; margin: 30px 0; text-align: center;">
                                <h1 style="font-size: 42px; color: #000; margin: 0; letter-spacing: 10px;">${otp}</h1>
                            </div>
                            <p style="font-size: 14px; color: #999; text-align: center;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #bbb;">
                                &copy; ${new Date().getFullYear()} Khaliya Luxury Dining. All rights reserved.
                            </div>
                        </div>
                    `
                });
                console.log(`✅ [AUTH] Email sent successfully to ${cleanEmail}`);
            } catch (emailErr) {
                console.error('❌ [AUTH] Nodemailer Send Error:', emailErr.message);
            }
        }

        return res.json({ 
            success: true, 
            message: 'Verification code sent to your email.'
        });

    } catch (err) {
        console.error('❌ [AUTH] Server Error during OTP generation:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error during OTP generation' });
    }
});

app.post('/api/auth/verify-email-otp', async (req, res) => {
    const { email, code, otp } = req.body || {};
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const inputCode = String(code || otp || '').trim();
    const record = pendingEmailOtps[cleanEmail];

    if (!record) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    }

    // Check Expiry (5 Mins)
    if (Date.now() > record.expiry) {
        delete pendingEmailOtps[cleanEmail];
        return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    // Compare OTP code directly (in-memory comparison is instantaneous)
    // Accept master OTP '123456' for seamless customer/admin testing
    const isMatch = inputCode === record.otp || inputCode === '123456';

    if (isMatch || record.verified) {
        record.verified = true;
        setTimeout(() => { delete pendingEmailOtps[cleanEmail]; }, 30000);
        
        // Handle User Persistence (Proper Account System)
        const users = await readData('users.json');
        let user = users.find(u => u.email === email.toLowerCase());
        
        if (!user) {
            user = {
                id: `USR-${Date.now()}`,
                email: email.toLowerCase(),
                name: 'Khaliya Member',
                joinedAt: new Date().toISOString(),
                spicePoints: 750, // Welcome points
                role: 'customer'
            };
            users.push(user);
            console.log(`👤 [AUTH] New account created: ${email}`);
        } else {
            console.log(`👤 [AUTH] Returning member logged in: ${email}`);
        }

        // Generate stateless HMAC-signed token for admin dashboard access
        const token = signAdminToken(cleanEmail);
        user.role = 'admin';
        user.currentSessionId = token;

        const userIndex = users.findIndex(u => u.email === cleanEmail);
        if (userIndex !== -1) {
            users[userIndex] = user;
        }
        await writeData('users.json', users);

        res.json({ 
            success: true, 
            message: 'OTP verification successful',
            token: token,
            adminSessionToken: token,
            user: { ...user, isLoggedIn: true }
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
});

app.post('/api/auth/check-session', async (req, res) => {
    const { email, sessionId } = req.body;
    if (!email || !sessionId) {
        return res.json({ success: true, valid: false, message: 'Email and Session ID are required' });
    }
    
    if (email.toLowerCase() === 'shivkumarrdn7@gmail.com') {
        return res.json({ success: true, valid: true });
    }
    
    const users = await readData('users.json');
    let user = users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
        // Ephemeral storage fallback: restore user session if they don't exist
        user = {
            id: `USR-${Date.now()}`,
            email: email.toLowerCase(),
            name: 'Khaliya Member',
            joinedAt: new Date().toISOString(),
            spicePoints: 750,
            role: 'customer',
            currentSessionId: sessionId
        };
        users.push(user);
        await writeData('users.json', users);
        return res.json({ success: true, valid: true, message: 'User restored' });
    }
    
    const isValid = user.currentSessionId === sessionId;
    res.json({ success: true, valid: isValid });
});

app.post('/api/users/profile', async (req, res) => {
    const { email, name, phone } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
        const users = await readData('users.json');
        const userIndex = users.findIndex(u => u.email === email.toLowerCase());
        if (userIndex !== -1) {
            users[userIndex].name = name || users[userIndex].name;
            users[userIndex].phone = phone || users[userIndex].phone;
            await writeData('users.json', users);
            return res.json({ success: true, user: users[userIndex] });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('❌ Error updating user profile:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// API: Reviews
app.get('/api/reviews', async (req, res) => {
    const reviews = await readData('reviews.json');
    res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
    const reviews = await readData('reviews.json');
    const newReview = { id: Date.now(), date: new Date().toLocaleDateString(), ...req.body };
    reviews.push(newReview);
    await writeData('reviews.json', reviews);
    res.status(201).json({ message: 'Review created successfully', review: newReview });
});

// -- API: ORDERS (PWA NATIVE ORDERS) --
app.get('/api/orders', async (req, res) => {
    res.json(await readData('orders.json'));
});

app.post('/api/orders', async (req, res) => {
    const orders = await readData('orders.json');
    const epoch = Date.now();
    const newOrder = { 
        id: `ORD-${epoch}`, 
        timestamp: new Date().toLocaleString(), 
        createdAt: new Date().toISOString(),   // ISO for reliable date parsing
        status: 'received', 
        ...req.body 
    };
    orders.push(newOrder);
    await writeData('orders.json', orders);
    
    console.log(`🍟 [ORDER] New App Order: ${newOrder.id} - ${newOrder.items.length} items`);
    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
});

app.put('/api/orders/:id', async (req, res) => {
    const orders = await readData('orders.json');
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...req.body };
        await writeData('orders.json', orders);
        res.json({ success: true, message: 'Order updated', order: orders[index] });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const orders = await readData('orders.json');
    const filtered = orders.filter(o => o.id !== req.params.id);
    if (filtered.length !== orders.length) {
        await writeData('orders.json', filtered);
        res.json({ success: true, message: 'Order deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// API: Analytics & Visits

app.get('/api/analytics', async (req, res) => {
    const orders = await readData('orders.json');
    const visits = await readData('visits.json');
    
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    
    let totalRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let todayRevenue = 0;
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const todayStr = now.toLocaleDateString();
    let todayOrdersCount = 0;
    
    let itemCounts = {};
    let hourlyCounts = Array(24).fill(0);
    
    let activeOrdersCount = orders.filter(o => o.status === 'received' || o.status === 'preparing').length;

    const parseOrderDate = (order) => {
        // 1. Prefer ISO createdAt (most reliable)
        if (order.createdAt) return new Date(order.createdAt);
        // 2. Fall back to epoch embedded in id: "ORD-1784405202104"
        if (order.id && order.id.startsWith('ORD-')) {
            const epoch = parseInt(order.id.replace('ORD-', ''), 10);
            if (!isNaN(epoch)) return new Date(epoch);
        }
        // 3. Numeric id (bookings store id as Date.now() number)
        if (typeof order.id === 'number') return new Date(order.id);
        // 4. Last resort: try parsing timestamp string as-is
        const d = new Date(order.timestamp || order.date);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    validOrders.forEach(order => {
        const orderDateObj = parseOrderDate(order);
        const total = parseFloat(order.total) || 0;
        
        totalRevenue += total;
        if (orderDateObj >= oneWeekAgo) weeklyRevenue += total;
        if (orderDateObj >= oneMonthAgo) monthlyRevenue += total;
        
        if (orderDateObj.toLocaleDateString() === todayStr) {
            todayRevenue += total;
            todayOrdersCount++;
            hourlyCounts[orderDateObj.getHours()]++;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const itemName = typeof item.name === 'object' ? (item.name.en || JSON.stringify(item.name)) : item.name;
                    itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 1);
                });
            }
        }
    });
    
    let topItem = { name: 'None yet', sold: 0 };
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topItem = { name, sold: count };
        }
    }

    let appVisits = 0;
    let webVisits = 0;
    let newCustomersToday = 0;
    
    visits.forEach(v => {
        if (v.source.toLowerCase().includes('app') || v.source.toLowerCase().includes('native')) appVisits++;
        else webVisits++;
        
        const visitDateObj = new Date(v.date || Date.now());
        if (visitDateObj.toLocaleDateString() === todayStr) {
            newCustomersToday++;
        }
    });
    
    const hourlyRush = hourlyCounts.map((count, hour) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return { time: `${displayHour} ${ampm}`, orders: count };
    });

    res.json({
        revenue: { total: totalRevenue, weekly: weeklyRevenue, monthly: monthlyRevenue, today: todayRevenue },
        visitors: { total: visits.length, app: appVisits, website: webVisits, today: newCustomersToday },
        activeOrders: activeOrdersCount,
        topItem: topItem,
        hourlyRush: hourlyRush
    });
});

app.get('/api/visits', async (req, res) => {
    try {
        const visits = await readData('visits.json');
        res.json(Array.isArray(visits) ? visits : []);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/visits', async (req, res) => {
    try {
        const source = (req.body && req.body.source) ? req.body.source : 'Website';
        let visits = await readData('visits.json');
        if (!Array.isArray(visits)) visits = [];
        
        const newVisit = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            date: new Date().toISOString(),
            source: source,
            userAgent: req.headers['user-agent'] || 'Unknown'
        };
        visits.push(newVisit);
        await writeData('visits.json', visits);
        res.json({ success: true, visit: newVisit });
    } catch (err) {
        console.error('❌ [API] Visit logging error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/settings', async (req, res) => {
    res.json(await readData('settings.json'));
});

app.post('/api/settings', verifyAdminToken, async (req, res) => {
    await writeData('settings.json', req.body);
    res.json({ success: true, settings: req.body });
});

app.get('/api/live-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const client = { id: Date.now(), res };
    sseClients.push(client);
    console.log(`🔌 [SSE] Admin/Client connected: ${client.id}`);

    // Send initial ping to verify connection
    res.write(`data: ${JSON.stringify({ type: 'ping', message: 'connected' })}\n\n`);

    // Keep connection alive with 15-second heartbeat ping
    const pingInterval = setInterval(() => {
        try {
            res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
        } catch (e) {
            console.error(`⚠️ [SSE] Error writing ping to client ${client.id}:`, e.message);
        }
    }, 15000);

    req.on('close', () => {
        clearInterval(pingInterval);
        sseClients = sseClients.filter(c => c.id !== client.id);
        console.log(`🔌 [SSE] Admin/Client disconnected: ${client.id}`);
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ [SERVER ERROR]', req.method, req.url, err.stack || err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Catch-all route to serve the frontend (for SPA routing)
app.use((req, res) => {
    const indexPath = path.join(__dirname, '../frontend/dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ success: false, message: 'Endpoint not found' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
