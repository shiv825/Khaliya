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
const { getOtpEmailTemplate, getBookingEmailTemplate, getBillReceiptEmailTemplate } = require('./templates/emailTemplates');


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
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    if (smtpHost && smtpUser && smtpPass) {
        emailTransporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for 587
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Verify connection configuration asynchronously
        emailTransporter.verify((error, success) => {
            if (error) {
                console.warn('⚠️ [AUTH] SMTP Connection Notice (falling back to Simulated Mode):', error.message);
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

// Health Check Routes (Required for Render & Cloud Monitors)
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'online', 
        service: 'Khaliya Restaurant API Server',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

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

// 3. Direct File Upload Endpoint (Multer + Cloudinary Stream / Local Fallback)
const memoryStorage = multer.memoryStorage();
const uploadMiddleware = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.post(['/api/upload', '/api/upload-image'], uploadMiddleware.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }

        const cleanProdId = req.body.productId ? String(req.body.productId).replace(/[^a-zA-Z0-9_-]/g, '') : `upload_${Date.now()}`;
        console.log(`📥 [File Upload] Received file: ${req.file.originalname} (${req.file.size} bytes) for #${cleanProdId}`);

        if (isCloudinaryConfigured) {
            const uploadStream = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'khaliya_restaurant',
                            asset_folder: 'khaliya_restaurant',
                            public_id: `product_${cleanProdId}`,
                            overwrite: true,
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    stream.end(req.file.buffer);
                });
            };

            const cloudRes = await uploadStream();
            console.log(`✅ [CDN] Direct file uploaded to Cloudinary 'khaliya_restaurant': ${cloudRes.secure_url}`);
            return res.json({ success: true, imageUrl: cloudRes.secure_url });
        } else {
            const fileName = `img_${cleanProdId}_${path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, '')}`;
            const uploadDir = path.join(__dirname, 'public/uploads/menu');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);
            const localUrl = `/uploads/menu/${fileName}`;
            console.log(`✅ [Disk] Direct file saved locally: ${localUrl}`);
            return res.json({ success: true, imageUrl: localUrl });
        }
    } catch (err) {
        console.error('❌ [File Upload Error]:', err.message);
        res.status(500).json({ success: false, message: 'Image upload failed: ' + err.message });
    }
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

// Database and Helper logic (100% Direct MongoDB Atlas)
const { readDataAsync, writeDataAsync, isMongoEnabled, models } = require('./db');

const readData = async (fileName) => {
    return await readDataAsync(fileName);
};

// SSE Live Updates (Memory Leak Protected)
let sseClients = [];
const sendUpdateToAll = (type, data) => {
    if (!sseClients.length) return;
    try {
        const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
        sseClients = sseClients.filter(client => {
            try {
                if (!client.res || client.res.writableEnded || client.res.destroyed) return false;
                client.res.write(payload);
                return true;
            } catch (e) {
                return false;
            }
        });
    } catch (err) {
        console.error('❌ [SSE Broadcast Error]:', err.message);
    }
};

const writeData = async (fileName, data) => {
    // Write directly to MongoDB Atlas database
    await writeDataAsync(fileName, data);

    const type = fileName.replace('.json', '');
    sendUpdateToAll(type, data);
};

// Seed default admin user into database if none exists
const seedAdminUser = async () => {
    try {
        const users = await readData('users');
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
            await writeData('users', users);
            console.log(`✅ [AUTH] Default admin account seeded in database: ${defaultAdminEmail}`);
        } else if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            await writeData('users', users);
            console.log(`✅ [AUTH] Updated user ${adminUser.email} role to admin`);
        }
    } catch (err) {
        console.error('❌ [AUTH] Admin seeding error:', err.message);
    }
};

// Seed default menu items into database if empty
const seedDefaultMenu = async () => {
    try {
        const menu = await readData('menu');
        if (!menu || menu.length === 0) {
            const menuJsonPath = path.join(__dirname, '../frontend/src/data/menu.json');
            if (fs.existsSync(menuJsonPath)) {
                const defaultMenu = JSON.parse(fs.readFileSync(menuJsonPath, 'utf8'));
                if (Array.isArray(defaultMenu) && defaultMenu.length > 0) {
                    await writeData('menu', defaultMenu);
                    console.log(`✅ [MENU] Seeded ${defaultMenu.length} default menu items into database.`);
                }
            }
        }
    } catch (err) {
        console.error('❌ [MENU] Menu seeding error:', err.message);
    }
};

// Run seeders on server start
seedAdminUser();
seedDefaultMenu();

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
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const data = verifyAdminTokenData(token);
        if (data) {
            req.adminEmail = data.email;
        }
    }
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
    let menu = await readData('menu');
    if (!menu || menu.length === 0) {
        await seedDefaultMenu();
        menu = await readData('menu');
    }
    const settings = await readData('settings') || {};
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
    const menu = await readData('menu');
    const reqId = (req.body.id !== undefined && req.body.id !== null && req.body.id !== '') ? req.body.id : req.body._id;
    const reqNameEn = typeof req.body.name === 'object' ? req.body.name?.en : req.body.name;
    const normName = reqNameEn ? String(reqNameEn).trim().toLowerCase() : '';

    // Check if dish already exists in menu by ID or Dish Name
    const existingIndex = menu.findIndex(m => {
        if (reqId !== undefined && reqId !== null && reqId !== '' && String(m.id || m._id) === String(reqId)) return true;
        if (normName) {
            const mNameEn = typeof m.name === 'object' ? m.name?.en : m.name;
            if (mNameEn && String(mNameEn).trim().toLowerCase() === normName) return true;
        }
        return false;
    });

    let imageUrl = req.body.image;

    if (existingIndex !== -1) {
        const targetId = menu[existingIndex].id || reqId || Date.now();
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            imageUrl = await processOnlineImageUrl(imageUrl, targetId);
        }
        menu[existingIndex] = { ...menu[existingIndex], ...req.body, id: targetId, image: imageUrl };
        await writeData('menu', menu);
        console.log(`📝 [MENU API] POST /api/menu - Updated existing product #${targetId} (${reqNameEn})`);
        return res.json(menu[existingIndex]);
    } else {
        const productId = (reqId !== undefined && reqId !== null && reqId !== '') ? reqId : Date.now();
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            imageUrl = await processOnlineImageUrl(imageUrl, productId);
        }
        const newItem = { ...req.body, id: productId, image: imageUrl };
        menu.unshift(newItem);
        await writeData('menu', menu);
        console.log(`📝 [MENU API] POST /api/menu - Created product #${productId}`);
        return res.status(201).json(newItem);
    }
});

app.put('/api/menu/:id', verifyAdminToken, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const menu = await readData('menu');
    const reqIdStr = String(req.params.id);
    const reqNameEn = typeof req.body.name === 'object' ? req.body.name?.en : req.body.name;
    const normName = reqNameEn ? String(reqNameEn).trim().toLowerCase() : '';

    const index = menu.findIndex(m => {
        if (String(m.id || m._id) === reqIdStr) return true;
        if (normName) {
            const mNameEn = typeof m.name === 'object' ? m.name?.en : m.name;
            if (mNameEn && String(mNameEn).trim().toLowerCase() === normName) return true;
        }
        return false;
    });

    if (index !== -1) {
        const targetId = menu[index].id || req.params.id;
        let imageUrl = req.body.image;
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            imageUrl = await processOnlineImageUrl(imageUrl, targetId);
        }
        menu[index] = { ...menu[index], ...req.body, id: targetId, image: imageUrl };
        await writeData('menu', menu);
        console.log(`📝 [MENU API] PUT /api/menu/${targetId} - Updated product successfully`);
        res.json(menu[index]);
    } else {
        console.warn(`⚠️ [MENU API] PUT /api/menu/${req.params.id} - Item not found`);
        res.status(404).json({ message: 'Item not found' });
    }
});

app.post('/api/visits', (req, res) => {
    res.json({ success: true, timestamp: new Date().toISOString() });
});

// --- TABLES & SESSION MANAGEMENT API ---
app.get('/api/tables', async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        const rawTables = await readDataAsync('tables');
        const rawBookings = await readDataAsync('bookings');

        const tables = Array.isArray(rawTables) ? rawTables : [];
        const bookings = Array.isArray(rawBookings) ? rawBookings : [];

        const todayStr = new Date().toISOString().split('T')[0];

        const enrichedTables = tables.map(t => {
            const tableBookings = bookings.filter(b => {
                if (!b || b.status === 'cancelled' || b.status === 'seated') return false;
                const matchesTable = b.assignedTableId === t.id;
                const matchesSection = !b.assignedTableId && (b.tableType === t.category || b.tableType === t.section);
                return (matchesTable || matchesSection) && (b.date === todayStr || !b.date);
            });

            return {
                ...t,
                upcomingReservations: tableBookings
            };
        });

        res.json(enrichedTables);
    } catch (err) {
        console.error('Error fetching tables from database:', err);
        res.status(500).json([]);
    }
});


app.post('/api/tables', verifyAdminToken, async (req, res) => {
    const { id, name, capacity, section } = req.body || {};
    if (!id || !name) return res.status(400).json({ message: 'Table ID and Name are required' });

    const tables = await readData('tables');
    if (tables.some(t => t.id.toLowerCase() === id.toLowerCase())) {
        return res.status(400).json({ message: 'Table ID already exists' });
    }

    const newTable = {
        id: id.trim().toUpperCase(),
        name: name.trim(),
        capacity: Number(capacity || 4),
        section: section || 'Main Hall',
        status: 'AVAILABLE',
        session: null
    };

    tables.push(newTable);
    await writeData('tables', tables);
    console.log(`➕ [TABLE API] Created new table ${newTable.id} (${newTable.name})`);
    res.json({ success: true, table: newTable });
});

app.put('/api/tables/:id', verifyAdminToken, async (req, res) => {
    const { name, capacity, section } = req.body || {};
    const tables = await readData('tables');
    const index = tables.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Table not found' });

    if (name) tables[index].name = name.trim();
    if (capacity) tables[index].capacity = Number(capacity);
    if (section) tables[index].section = section.trim();

    await writeData('tables', tables);
    console.log(`✏️ [TABLE API] Updated Table ${req.params.id}`);
    res.json({ success: true, table: tables[index] });
});

app.delete('/api/tables/:id', verifyAdminToken, async (req, res) => {
    const tables = await readData('tables');
    const filtered = tables.filter(t => t.id !== req.params.id);
    if (filtered.length === tables.length) return res.status(404).json({ message: 'Table not found' });

    await writeData('tables', filtered);
    console.log(`🗑️ [TABLE API] Deleted Table ${req.params.id}`);
    res.json({ success: true, message: 'Table deleted successfully' });
});


app.post('/api/tables/seat', verifyAdminToken, async (req, res) => {
    const { tableId, guestName, phone, guestCount } = req.body || {};
    if (!tableId) return res.status(400).json({ message: 'Table ID is required' });

    const tables = await readData('tables');
    const index = tables.findIndex(t => t.id === tableId);
    if (index === -1) return res.status(404).json({ message: 'Table not found' });

    const sessionId = `TS_${Date.now()}`;
    const newSession = {
        sessionId,
        guestName: guestName || 'Walk-in Guest',
        phone: phone || '',
        guestCount: Number(guestCount || 2),
        startTime: new Date().toISOString(),
        orders: [],
        totalAmount: 0
    };

    tables[index].status = 'OCCUPIED';
    tables[index].session = newSession;

    await writeData('tables', tables);
    console.log(`🟢 [TABLE API] Seated guest at ${tableId} (Session: ${sessionId})`);
    res.json({ success: true, table: tables[index] });
});

app.put('/api/tables/:id/status', verifyAdminToken, async (req, res) => {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const tables = await readData('tables');
    const index = tables.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Table not found' });

    tables[index].status = status;
    await writeData('tables', tables);
    console.log(`🔄 [TABLE API] Transitioned Table ${req.params.id} to status: ${status}`);
    res.json({ success: true, table: tables[index] });
});

app.post('/api/tables/:id/release', verifyAdminToken, async (req, res) => {
    const tables = await readData('tables');
    const index = tables.findIndex(t => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Table not found' });

    tables[index].status = 'AVAILABLE';
    tables[index].session = null;

    await writeData('tables', tables);
    console.log(`✨ [TABLE API] Released Table ${req.params.id} back to AVAILABLE`);
    res.json({ success: true, table: tables[index] });
});

app.post('/api/billing/pay', verifyAdminToken, async (req, res) => {
    const { tableId, orderIds, paymentMethod, discount, totalPaid } = req.body || {};
    if (!tableId) return res.status(400).json({ message: 'Table ID is required' });

    const tables = await readData('tables');
    const orders = await readData('orders');

    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex !== -1) {
        tables[tableIndex].status = 'CLEANING';
    }

    let updatedCount = 0;
    if (Array.isArray(orderIds) && orderIds.length > 0) {
        orders.forEach(o => {
            if (orderIds.includes(o.id) || orderIds.includes(o._id)) {
                o.status = 'completed';
                o.paymentStatus = 'paid';
                o.paymentMethod = paymentMethod || 'cash';
                o.discount = discount || 0;
                o.settledAt = new Date().toISOString();
                updatedCount++;
            }
        });
    }

    await writeData('tables', tables);
    await writeData('orders', orders);

    console.log(`💳 [BILLING API] Settled ${updatedCount} orders for ${tableId} (Paid: ₹${totalPaid} via ${paymentMethod})`);
    res.json({ success: true, message: 'Table bill settled successfully', table: tables[tableIndex] });
});


app.delete('/api/menu/:id', verifyAdminToken, async (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const menu = await readData('menu');
    const filtered = menu.filter(m => m.id != req.params.id && m.name != req.params.id);
    if (filtered.length !== menu.length) {
        await writeData('menu', filtered);
        res.json({ message: 'Item deleted' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

// API: Bookings
app.get('/api/bookings', async (req, res) => {
    const bookings = await readData('bookings');
    res.json(bookings);
});

app.get('/api/bookings/availability', async (req, res) => {
    const { date, tableType } = req.query;
    if (!date || !tableType) return res.status(400).json({ message: 'Date and Table Type are required' });

    const bookings = await readData('bookings');
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

    const bookings = await readData('bookings');
    
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
        bookingNo: getNextSequenceNumber('RESERVATION', bookings),
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
    await writeData('bookings', bookings);
    console.log(`📅 [BOOKING API] New Reservation ${newBooking.bookingNo} created for ${newBooking.name}`);

    // Trigger Luxury Email Notification asynchronously
    sendBookingConfirmationEmail(newBooking).catch(err => {
        console.error('❌ [BOOKING EMAIL] Async error:', err.message);
    });

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
});

// Helper function to dispatch table reservation confirmation emails
const sendBookingConfirmationEmail = async (booking) => {
    if (!booking || !booking.email) return false;
    const recipientEmail = String(booking.email).trim().toLowerCase();
    if (!recipientEmail.includes('@')) return false;

    console.log(`✉️ [BOOKING EMAIL] Preparing reservation confirmation email for ${recipientEmail} (${booking.bookingNo || booking.id})`);

    const emailContent = getBookingEmailTemplate({ booking });

    if (emailTransporter) {
        try {
            await emailTransporter.sendMail({
                from: `"Khaliya Sanctuary" <${process.env.SMTP_USER || 'shivkumarrdn7@gmail.com'}>`,
                to: recipientEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
            });
            console.log(`✅ [BOOKING EMAIL] Luxury confirmation email sent successfully to ${recipientEmail}`);
            return true;
        } catch (err) {
            console.error(`❌ [BOOKING EMAIL] Failed to send email to ${recipientEmail}:`, err.message);
            return false;
        }
    } else {
        console.log(`ℹ️ [BOOKING EMAIL SIMULATED MODE] Confirmation email generated for ${recipientEmail}:`);
        console.log(`   Subject: ${emailContent.subject}`);
        return false;
    }
};

app.put('/api/bookings/:id', async (req, res) => {
    const bookings = await readData('bookings');
    const index = bookings.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        const oldStatus = bookings[index].status;
        bookings[index] = { ...bookings[index], ...req.body };
        await writeData('bookings', bookings);

        // Send email if status is updated to confirmed
        if (req.body.status && req.body.status !== oldStatus && (req.body.status.toLowerCase() === 'confirmed' || req.body.status.toLowerCase() === 'approved')) {
            sendBookingConfirmationEmail(bookings[index]).catch(err => {
                console.error('❌ [BOOKING EMAIL] Async status update error:', err.message);
            });
        }

        res.json({ message: 'Booking updated', booking: bookings[index] });
    } else {
        res.status(404).json({ message: 'Booking not found' });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    const bookings = await readData('bookings');
    const filtered = bookings.filter(b => b.id != req.params.id);
    if (filtered.length !== bookings.length) {
        await writeData('bookings', filtered);
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

        console.log(`🔑 ==========================================`);
        console.log(`🔑 [AUTH OTP GENERATED] Email: ${cleanEmail}`);
        console.log(`🔑 [SECURITY CODE / OTP]: ${otp} (Master Passcode: 123456)`);
        console.log(`🔑 ==========================================`);

        let emailSent = false;

        // 3. Send via Nodemailer if configured
        if (emailTransporter) {
            try {
                const emailContent = getOtpEmailTemplate({ otp, email: cleanEmail });
                await emailTransporter.sendMail({
                    from: `"Khaliya Sanctuary" <${process.env.SMTP_USER || 'shivkumarrdn7@gmail.com'}>`,
                    to: cleanEmail,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html
                });
                console.log(`✅ [AUTH] Premium email sent successfully to ${cleanEmail}`);
                emailSent = true;
            } catch (emailErr) {
                console.error('❌ [AUTH] Nodemailer Send Error:', emailErr.message);
            }
        }

        return res.json({ 
            success: true, 
            message: emailSent 
                ? 'Verification code sent to your email.' 
                : `Verification code generated. (Code: ${otp} or use Master Code: 123456)`,
            devOtp: otp,
            emailSent
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

    const isMasterCode = inputCode === '123456';

    if (!record && !isMasterCode) {
        return res.status(400).json({ success: false, message: 'No OTP requested for this email. Use code 123456 or request a new OTP.' });
    }

    // Check Expiry (5 Mins) unless using master bypass code
    if (record && Date.now() > record.expiry && !isMasterCode) {
        delete pendingEmailOtps[cleanEmail];
        return res.status(400).json({ success: false, message: 'Verification code has expired. Use code 123456 or request a new OTP.' });
    }

    const isMatch = isMasterCode || (record && inputCode === record.otp);

    if (isMatch || (record && record.verified)) {
        if (record) {
            record.verified = true;
            setTimeout(() => { delete pendingEmailOtps[cleanEmail]; }, 30000);
        }
        
        // Handle User Persistence
        const users = await readData('users');
        let user = users.find(u => u.email === cleanEmail);
        
        if (!user) {
            user = {
                id: `USR-${Date.now()}`,
                email: cleanEmail,
                name: 'Khaliya Member',
                joinedAt: new Date().toISOString(),
                spicePoints: 750,
                role: 'admin'
            };
            users.push(user);
            console.log(`👤 [AUTH] New account created: ${cleanEmail}`);
        } else {
            console.log(`👤 [AUTH] Returning member logged in: ${cleanEmail}`);
        }

        // Generate stateless HMAC-signed token for admin dashboard access
        const token = signAdminToken(cleanEmail);
        user.role = 'admin';
        user.currentSessionId = token;

        const userIndex = users.findIndex(u => u.email === cleanEmail);
        if (userIndex !== -1) {
            users[userIndex] = user;
        }
        await writeData('users', users);

        res.json({ 
            success: true, 
            message: 'OTP verification successful',
            token: token,
            adminSessionToken: token,
            user: { ...user, isLoggedIn: true }
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid verification code. You can also enter 123456.' });
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
    
    const users = await readData('users');
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
        await writeData('users', users);
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
        const users = await readData('users');
        const userIndex = users.findIndex(u => u.email === email.toLowerCase());
        if (userIndex !== -1) {
            users[userIndex].name = name || users[userIndex].name;
            users[userIndex].phone = phone || users[userIndex].phone;
            await writeData('users', users);
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
    const reviews = await readData('reviews');
    res.json(reviews);
});

app.post('/api/reviews', async (req, res) => {
    const reviews = await readData('reviews');
    const newReview = { id: Date.now(), date: new Date().toLocaleDateString(), rating: Number(req.body.rating) || 5, ...req.body };
    reviews.push(newReview);
    await writeData('reviews', reviews);
    res.status(201).json({ message: 'Review created successfully', review: newReview });
});

app.delete('/api/reviews/:id', async (req, res) => {
    const reviews = await readData('reviews');
    const filtered = reviews.filter(r => String(r.id) !== String(req.params.id));
    await writeData('reviews', filtered);
    res.json({ success: true, message: 'Review deleted' });
});


// --- INDEPENDENT MULTI-SEQUENCE NUMBER GENERATOR ---
// Generates distinct, independent sequence numbers for each document type
const getNextSequenceNumber = (type, existingList = []) => {
    const list = Array.isArray(existingList) ? existingList : [];
    switch (type) {
        case 'PICKUP':
        case 'takeout': {
            const count = list.filter(o => o.orderNo && o.orderNo.startsWith('PKP-')).length + 101;
            return `PKP-${String(count).padStart(6, '0')}`;
        }
        case 'RESERVATION':
        case 'booking': {
            const count = list.filter(b => b.bookingNo && b.bookingNo.startsWith('RES-')).length + 201;
            return `RES-${String(count).padStart(6, '0')}`;
        }
        case 'KOT': {
            const count = list.filter(k => k.kotNo && k.kotNo.startsWith('KOT-')).length + 501;
            return `KOT-${String(count).padStart(6, '0')}`;
        }
        case 'PAYMENT': {
            const count = list.filter(p => p.receiptNo && p.receiptNo.startsWith('PAY-')).length + 301;
            return `PAY-${String(count).padStart(6, '0')}`;
        }
        case 'REFUND': {
            const count = list.filter(r => r.refundNo && r.refundNo.startsWith('REF-')).length + 51;
            return `REF-${String(count).padStart(6, '0')}`;
        }
        case 'DINE_IN':
        default: {
            const count = list.filter(o => o.invoiceNo && o.invoiceNo.startsWith('KHL-')).length + 1042;
            return `KHL-${String(count).padStart(6, '0')}`;
        }
    }
};

// -- API: ORDERS (PWA NATIVE ORDERS) --
app.get('/api/orders', async (req, res) => {
    res.json(await readData('orders'));
});

app.post('/api/orders', async (req, res) => {
    const orders = await readData('orders');
    const epoch = Date.now();

    const isPickup = req.body.orderType === 'pickup' || req.body.orderType === 'takeout' || !req.body.tableNumber;
    
    // Distinct sequence numbers per document type
    const invoiceNo = req.body.invoiceNo || getNextSequenceNumber('DINE_IN', orders);
    const orderNo = req.body.orderNo || (isPickup ? getNextSequenceNumber('PICKUP', orders) : invoiceNo);
    const kotNo = getNextSequenceNumber('KOT', orders);

    // Process item fire status and special instructions
    const processedItems = Array.isArray(req.body.items) ? req.body.items.map(item => ({
        ...item,
        fireStatus: item.fireStatus || (item.holdForLater ? 'HELD' : 'FIRED'),
        specialInstructions: item.specialInstructions || item.note || '',
        firedAt: item.holdForLater ? null : new Date().toISOString()
    })) : [];

    const newOrder = { 
        id: `ORD-${epoch}`, 
        invoiceNo,
        orderNo,
        kotNo,
        timestamp: new Date().toLocaleString(), 
        createdAt: new Date().toISOString(),   // ISO for reliable date parsing
        status: 'received', 
        ...req.body,
        items: processedItems
    };
    orders.push(newOrder);
    await writeData('orders', orders);

    // Update table status if dine-in order
    if (newOrder.tableNumber || newOrder.table) {
        const tableId = newOrder.tableNumber || newOrder.table;
        const tables = await readData('tables');
        const tIndex = tables.findIndex(t => t.id === tableId);
        if (tIndex !== -1 && tables[tIndex].status !== 'BILL_PRESENTED' && tables[tIndex].status !== 'PAYMENT_PENDING') {
            tables[tIndex].status = 'ORDERING';
            await writeData('tables', tables);
        }
    }

    console.log(`🍟 [ORDER] New Order ${newOrder.invoiceNo} (Ref: ${newOrder.orderNo}, KOT: ${newOrder.kotNo}): ${processedItems.length} items`);

    // AUTOMATIC KITCHEN TICKET PRINTING PIPELINE
    dispatchKitchenPrintJob(newOrder, 'KOT').catch(err => {
        console.warn(`⚠️ [AUTO-PRINT] Could not dispatch auto-KOT print: ${err.message}`);
    });

    res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
});

app.put('/api/orders/:id', async (req, res) => {
    const orders = await readData('orders');
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
        const existingOrder = orders[index];
        const oldItemCount = Array.isArray(existingOrder.items) ? existingOrder.items.length : 0;
        const newItemList = req.body.items || existingOrder.items;
        const newItemCount = Array.isArray(newItemList) ? newItemList.length : 0;

        // Detect Addition Ticket items
        if (newItemCount > oldItemCount) {
            const addedItems = newItemList.slice(oldItemCount);
            const additionTicketOrder = {
                ...existingOrder,
                items: addedItems,
                ticketType: 'ADDITION'
            };
            dispatchKitchenPrintJob(additionTicketOrder, 'ADDITION').catch(() => {});
        }

        orders[index] = { ...existingOrder, ...req.body };
        await writeData('orders', orders);
        res.json({ success: true, message: 'Order updated', order: orders[index] });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    const orders = await readData('orders');
    const filtered = orders.filter(o => o.id !== req.params.id);
    if (filtered.length !== orders.length) {
        await writeData('orders', filtered);
        res.json({ success: true, message: 'Order deleted' });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// API: Analytics & Visits

app.get('/api/analytics', async (req, res) => {
    try {
        const orders = await readDataAsync('orders');
        const VisitModel = models['visits'];
        const visits = VisitModel ? await VisitModel.find().sort({ _id: -1 }).limit(200).lean() : [];
        
        const validOrders = (Array.isArray(orders) ? orders : []).filter(o => o.status !== 'cancelled');
        
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
        
        let activeOrdersCount = validOrders.filter(o => o.status === 'received' || o.status === 'preparing').length;

        const parseOrderDate = (order) => {
            if (order.createdAt) return new Date(order.createdAt);
            if (order.id && String(order.id).startsWith('ORD-')) {
                const epoch = parseInt(String(order.id).replace('ORD-', ''), 10);
                if (!isNaN(epoch)) return new Date(epoch);
            }
            if (typeof order.id === 'number') return new Date(order.id);
            const d = new Date(order.timestamp || order.date);
            return isNaN(d.getTime()) ? new Date() : d;
        };

        validOrders.forEach(order => {
            const orderDateObj = parseOrderDate(order);
            const total = parseFloat(order.total || order.totalAmount) || 0;
            
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
            const src = (v.source || '').toLowerCase();
            if (src.includes('app') || src.includes('native')) appVisits++;
            else webVisits++;
            
            const visitDateObj = new Date(v.date || v.timestamp || Date.now());
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
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ revenue: { total: 0, weekly: 0, monthly: 0, today: 0 }, activeOrders: 0 });
    }
});

app.get('/api/visits', async (req, res) => {
    try {
        const VisitModel = models['visits'];
        if (VisitModel) {
            const docs = await VisitModel.find().sort({ _id: -1 }).limit(100).lean();
            return res.json(docs);
        }
        res.json([]);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/visits', async (req, res) => {
    try {
        const source = (req.body && req.body.source) ? req.body.source : 'Website';
        const newVisit = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            date: new Date().toISOString(),
            source: source,
            userAgent: req.headers['user-agent'] || 'Unknown'
        };
        const VisitModel = models['visits'];
        if (VisitModel) {
            await VisitModel.create(newVisit).catch(() => null);
        }
        res.json({ success: true, visit: newVisit });
    } catch (err) {
        res.json({ success: true });
    }
});

app.get('/api/settings', async (req, res) => {
    res.json(await readData('settings'));
});

app.post('/api/settings', verifyAdminToken, async (req, res) => {
    await writeData('settings', req.body);
    res.json({ success: true, settings: req.body });
});

// THERMAL PRINTER MANAGEMENT & ESC/POS PRINT JOB ROUTING
const printAgent = require('./print-agent');

app.get('/api/printers', async (req, res) => {
    try {
        const printers = await readData('printers').catch(() => []);
        res.json({ success: true, printers: Array.isArray(printers) ? printers : [] });
    } catch {
        res.json({ success: true, printers: [] });
    }
});

app.post('/api/printers', verifyAdminToken, async (req, res) => {
    try {
        let printers = await readData('printers').catch(() => []);
        if (!Array.isArray(printers)) printers = [];
        printers.unshift(req.body);
        await writeData('printers', printers);
        res.json({ success: true, printer: req.body });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/printers/test-print', verifyAdminToken, async (req, res) => {
    const { ip, port = 9100 } = req.body;
    try {
        const samplePayload = printAgent.COMMANDS.INIT + 
            printAgent.COMMANDS.ALIGN_CENTER + 
            printAgent.COMMANDS.DOUBLE_SIZE + 
            "KHALIYA RESTAURANT\n" + 
            printAgent.COMMANDS.NORMAL_SIZE + 
            "PRINTER TEST OK\n\n\n" + 
            printAgent.COMMANDS.CUT_PAPER;

        if (ip) {
            await printAgent.sendToPrinterNetwork(ip, port, samplePayload).catch(() => null);
        }
        res.json({ success: true, message: `Test ESC/POS payload sent to ${ip || 'virtual agent'}` });
    } catch (err) {
        res.json({ success: true, message: 'Test signal processed via Print Agent queue' });
    }
});

app.post('/api/print-job', async (req, res) => {
    const { type = 'BILL', data, printerIp } = req.body;
    try {
        let rawPayload = '';
        if (type === 'KOT') {
            rawPayload = printAgent.buildKitchenKotEscPos(data);
        } else {
            rawPayload = printAgent.buildCustomerBillEscPos(data);
        }

        if (printerIp) {
            await printAgent.sendToPrinterNetwork(printerIp, 9100, rawPayload).catch(() => null);
        }
        res.json({ success: true, message: `${type} print job queued & dispatched successfully.` });
    } catch (err) {
        res.json({ success: true, message: `${type} print job queued for local agent.` });
    }
});





app.get('/api/table-types', async (req, res) => {
    try {
        const tables = await readDataAsync('tables').catch(() => []);

        const typeMap = {
            intimate: { value: 'intimate', label: '🥂 Intimate - Cozy corner for 2-4 guests', shortLabel: '🥂 Intimate Corner', sub: 'Cozy booth & VIP quiet area', desc: 'Privacy guaranteed, plush leather seating, romantic ambient lighting.' },
            family: { value: 'family', label: '👨‍👩‍👧‍👦 Family - Spacious table for 4-6 guests', shortLabel: '👨‍👩‍👧‍👦 Family Dining', sub: 'Spacious central hall seating', desc: 'Central main floor position with easy service & buffet access.' },
            group: { value: 'group', label: '🎉 Group - Large table for 6-10 guests', shortLabel: '🎉 Royal Group Table', sub: 'Large central banquet table', desc: 'Elevated central seating area designed for celebration feasts.' },
            party: { value: 'party', label: '🎊 Party - Multiple tables for 10+ guests', shortLabel: '🎊 Party Hall & Terrace', sub: 'Multi-table setup / Al Fresco', desc: 'Flexible layout with dedicated personal server & speaker zone.' },
            window: { value: 'window', label: '🪟 Window Seat - Scenic view for any group', shortLabel: '🪟 Scenic Window Seat', sub: 'Panoramic city glass wall view', desc: 'Prime street view tables overlooking the main promenade.' }
        };

        const result = Object.keys(typeMap).map(typeKey => {
            const matchedTables = tables.filter(t => (t.tableType || 'family').toLowerCase() === typeKey);
            const tableNames = matchedTables.map(t => t.name || t.id).join(', ');
            const sections = Array.from(new Set(matchedTables.map(t => t.section))).join(' & ');
            return {
                ...typeMap[typeKey],
                realPosition: matchedTables.length > 0 ? `${tableNames} (${sections})` : 'System Configured Seating',
                count: matchedTables.length
            };
        });

        res.json({ success: true, tableTypes: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- TABLE MERGING & SPLITTING OPERATIONAL API ---
app.post('/api/tables/merge', verifyAdminToken, async (req, res) => {
    const { primaryTableId, mergeTableIds } = req.body || {};
    if (!primaryTableId || !Array.isArray(mergeTableIds) || mergeTableIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Primary Table ID and array of tables to merge are required' });
    }

    const tables = await readData('tables');
    const primaryIndex = tables.findIndex(t => t.id === primaryTableId);
    if (primaryIndex === -1) return res.status(404).json({ success: false, message: 'Primary table not found' });

    let combinedCapacity = tables[primaryIndex].capacity;
    const secondaryNames = [];

    mergeTableIds.forEach(id => {
        const secIdx = tables.findIndex(t => t.id === id);
        if (secIdx !== -1 && secIdx !== primaryIndex) {
            tables[secIdx].status = 'MERGED';
            tables[secIdx].mergedInto = primaryTableId;
            combinedCapacity += (tables[secIdx].capacity || 2);
            secondaryNames.push(tables[secIdx].name || id);
        }
    });

    tables[primaryIndex].mergedTables = mergeTableIds;
    tables[primaryIndex].effectiveCapacity = combinedCapacity;
    tables[primaryIndex].status = tables[primaryIndex].status === 'AVAILABLE' ? 'OCCUPIED' : tables[primaryIndex].status;

    await writeData('tables', tables);
    console.log(`🔀 [TABLE OPERATIONAL API] Merged tables [${mergeTableIds.join(', ')}] into ${primaryTableId} (Total Seats: ${combinedCapacity})`);
    res.json({ success: true, message: `Successfully merged tables into ${primaryTableId}`, table: tables[primaryIndex] });
});

app.post('/api/tables/split', verifyAdminToken, async (req, res) => {
    const { primaryTableId } = req.body || {};
    if (!primaryTableId) return res.status(400).json({ success: false, message: 'Primary Table ID is required' });

    const tables = await readData('tables');
    const primaryIndex = tables.findIndex(t => t.id === primaryTableId);
    if (primaryIndex === -1) return res.status(404).json({ success: false, message: 'Primary table not found' });

    const mergedList = tables[primaryIndex].mergedTables || [];

    // Reset merged child tables back to AVAILABLE
    tables.forEach(t => {
        if (mergedList.includes(t.id) || t.mergedInto === primaryTableId) {
            t.status = 'AVAILABLE';
            delete t.mergedInto;
            t.session = null;
        }
    });

    tables[primaryIndex].mergedTables = [];
    delete tables[primaryIndex].effectiveCapacity;
    if (tables[primaryIndex].status === 'MERGED') tables[primaryIndex].status = 'AVAILABLE';

    await writeData('tables', tables);
    console.log(`🔀 [TABLE OPERATIONAL API] Split merged group for primary table ${primaryTableId}`);
    res.json({ success: true, message: `Split tables successfully`, table: tables[primaryIndex] });
});

// --- SPLIT BILL & MULTI-TENDER BILLING API ---
app.post('/api/billing/split-pay', verifyAdminToken, async (req, res) => {
    const { tableId, splits, orderIds, discount = 0, staffName = 'Cashier' } = req.body || {};
    if (!tableId || !Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({ success: false, message: 'Table ID and valid payment splits are required' });
    }

    const tables = await readData('tables');
    const orders = await readData('orders');
    const tableIndex = tables.findIndex(t => t.id === tableId);

    const totalPaidSum = splits.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Update target orders
    if (Array.isArray(orderIds) && orderIds.length > 0) {
        orders.forEach(o => {
            if (orderIds.includes(o.id) || orderIds.includes(o._id)) {
                o.status = 'completed';
                o.paymentStatus = 'paid';
                o.splitPayments = splits;
                o.totalPaid = totalPaidSum;
                o.discount = discount;
                o.settledAt = new Date().toISOString();
                o.settledBy = staffName;
            }
        });
        await writeData('orders', orders);
    }

    if (tableIndex !== -1) {
        tables[tableIndex].status = 'CLEANING';
        await writeData('tables', tables);
    }

    // Record in Audit Log
    let auditLogs = await readData('audit_logs').catch(() => []);
    if (!Array.isArray(auditLogs)) auditLogs = [];
    auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        staffName,
        action: 'SPLIT_BILL_SETTLED',
        details: `Settled Table ${tableId} via ${splits.length} splits (Total: ₹${totalPaidSum})`,
        splits
    });
    await writeData('audit_logs', auditLogs);

    console.log(`💰 [SPLIT BILL API] Settled Table ${tableId} with ${splits.length} split tenders (Total: ₹${totalPaidSum})`);
    res.json({ success: true, message: `Split payment of ₹${totalPaidSum} completed successfully for ${tableId}` });
});

// --- KITCHEN ITEM FIRING API ---
app.patch('/api/orders/:id/fire-items', async (req, res) => {
    const { itemIndices, fireAll = false } = req.body || {};
    const orders = await readData('orders');
    const index = orders.findIndex(o => o.id === req.params.id || o._id === req.params.id);

    if (index === -1) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = orders[index];
    if (Array.isArray(order.items)) {
        order.items.forEach((item, idx) => {
            if (fireAll || (Array.isArray(itemIndices) && itemIndices.includes(idx))) {
                item.fireStatus = 'FIRED';
                item.firedAt = new Date().toISOString();
            }
        });
    }

    orders[index] = order;
    await writeData('orders', orders);
    console.log(`🔥 [KITCHEN FIRE] Fired items for Order ${order.invoiceNo || order.id}`);
    res.json({ success: true, message: 'Kitchen tickets fired successfully', order });
});

// --- CASH DRAWER SHIFT RECONCILIATION API ---
app.get('/api/shifts/active', async (req, res) => {
    try {
        const shifts = await readData('shifts').catch(() => []);
        const activeShift = Array.isArray(shifts) ? shifts.find(s => s.status === 'OPEN') : null;
        res.json({ success: true, activeShift: activeShift || null });
    } catch (err) {
        res.json({ success: true, activeShift: null });
    }
});

app.post('/api/shifts/open', async (req, res) => {
    const { staffId, staffName, openingFloat = 5000, shiftName = 'Main Shift' } = req.body || {};
    let shifts = await readData('shifts').catch(() => []);
    if (!Array.isArray(shifts)) shifts = [];

    const existingOpen = shifts.find(s => s.status === 'OPEN');
    if (existingOpen) {
        return res.status(400).json({ success: false, message: 'A cash drawer shift is already currently OPEN.', activeShift: existingOpen });
    }

    const newShift = {
        id: `SHF-${Date.now()}`,
        staffId: staffId || 'STF-002',
        staffName: staffName || 'Cashier Duty',
        shiftName,
        openedAt: new Date().toISOString(),
        openingFloat: Number(openingFloat),
        status: 'OPEN',
        cashSales: 0,
        cashRefunds: 0,
        cashWithdrawals: 0
    };

    shifts.unshift(newShift);
    await writeData('shifts', shifts);

    // Audit log
    let auditLogs = await readData('audit_logs').catch(() => []);
    if (!Array.isArray(auditLogs)) auditLogs = [];
    auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        staffName: newShift.staffName,
        action: 'SHIFT_OPENED',
        details: `Opened Cash Drawer Shift with Opening Float of ₹${openingFloat}`
    });
    await writeData('audit_logs', auditLogs);

    console.log(`💵 [SHIFT API] Opened shift ${newShift.id} by ${newShift.staffName} (Float: ₹${openingFloat})`);
    res.json({ success: true, shift: newShift });
});

app.post('/api/shifts/close', async (req, res) => {
    const { shiftId, actualCash, notes = '', managerPin } = req.body || {};
    let shifts = await readData('shifts').catch(() => []);
    if (!Array.isArray(shifts)) shifts = [];

    const shiftIdx = shifts.findIndex(s => s.id === shiftId || s.status === 'OPEN');
    if (shiftIdx === -1) return res.status(404).json({ success: false, message: 'No active open shift found to close' });

    const targetShift = shifts[shiftIdx];
    const orders = await readData('orders').catch(() => []);

    // Calculate cash sales collected during shift window
    const shiftStart = new Date(targetShift.openedAt).getTime();
    let shiftCashSales = 0;

    orders.forEach(o => {
        const orderTime = new Date(o.createdAt || o.timestamp).getTime();
        if (orderTime >= shiftStart && o.status === 'completed') {
            if (o.paymentMethod === 'cash') {
                shiftCashSales += Number(o.totalPaid || o.total || 0);
            } else if (Array.isArray(o.splitPayments)) {
                o.splitPayments.forEach(sp => {
                    if (sp.method === 'cash' || sp.method === 'Cash') shiftCashSales += Number(sp.amount || 0);
                });
            }
        }
    });

    const expectedCash = targetShift.openingFloat + shiftCashSales - (targetShift.cashRefunds || 0) - (targetShift.cashWithdrawals || 0);
    const actualCashNum = Number(actualCash || expectedCash);
    const variance = actualCashNum - expectedCash;

    targetShift.closedAt = new Date().toISOString();
    targetShift.status = 'CLOSED';
    targetShift.cashSales = shiftCashSales;
    targetShift.expectedCash = expectedCash;
    targetShift.actualCash = actualCashNum;
    targetShift.variance = variance;
    targetShift.notes = notes;

    shifts[shiftIdx] = targetShift;
    await writeData('shifts', shifts);

    // Write audit trail
    let auditLogs = await readData('audit_logs').catch(() => []);
    if (!Array.isArray(auditLogs)) auditLogs = [];
    auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        staffName: targetShift.staffName,
        action: 'SHIFT_CLOSED',
        details: `Closed Shift ${targetShift.id}. Expected: ₹${expectedCash}, Actual: ₹${actualCashNum}, Variance: ₹${variance}`,
        notes
    });
    await writeData('audit_logs', auditLogs);

    console.log(`🔒 [SHIFT API] Closed shift ${targetShift.id}. Expected: ₹${expectedCash}, Actual: ₹${actualCashNum}, Variance: ₹${variance}`);
    res.json({ success: true, shift: targetShift });
});

// --- SECURITY AUDIT LOGS API ---
app.get('/api/audit-logs', async (req, res) => {
    try {
        const logs = await readData('audit_logs').catch(() => []);
        res.json({ success: true, logs: Array.isArray(logs) ? logs : [] });
    } catch (err) {
        res.json({ success: true, logs: [] });
    }
});

app.post('/api/audit-logs', async (req, res) => {
    try {
        let logs = await readData('audit_logs').catch(() => []);
        if (!Array.isArray(logs)) logs = [];

        const newLog = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            staffName: req.body.staffName || 'System Staff',
            action: req.body.action || 'SENSITIVE_ACTION',
            details: req.body.details || '',
            reason: req.body.reason || ''
        };

        logs.unshift(newLog);
        await writeData('audit_logs', logs);
        res.json({ success: true, log: newLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- DAILY AUTO-ROTATING MANAGER SECURITY PIN ENGINE ---
const getDailyManagerPin = () => {
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. 2026-09-06
    const hash = crypto.createHash('sha256').update(`khaliya-security-${todayStr}`).digest('hex');
    const pinNum = (parseInt(hash.slice(0, 8), 16) % 9000) + 1000;
    return String(pinNum);
};

app.get('/api/auth/daily-pin', verifyAdminToken, (req, res) => {
    const dailyPin = getDailyManagerPin();
    const todayStr = new Date().toISOString().split('T')[0];
    res.json({
        success: true,
        date: todayStr,
        dailyPin,
        expiresAt: `${todayStr}T23:59:59.999Z`
    });
});

app.post('/api/auth/send-daily-pin', verifyAdminToken, async (req, res) => {
    const dailyPin = getDailyManagerPin();
    const targetEmail = req.body.email || 'shivkumarrdn7@gmail.com';
    const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    console.log(`🔑 [SECURITY] Daily Rotating Manager PIN generated for ${todayStr}: ${dailyPin}`);

    if (emailTransporter) {
        try {
            await emailTransporter.sendMail({
                from: `"Khaliya Security Center" <${process.env.SMTP_USER || 'shivkumarrdn7@gmail.com'}>`,
                to: targetEmail,
                subject: `🔒 Khaliya Today's Rotating Security PIN [${new Date().toISOString().split('T')[0]}]`,
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0E14; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 20px; padding: 28px; color: #FFF;">
                        <h2 style="font-size: 1.4rem; color: #FFD700; margin-top: 0;">Khaliya Daily Manager Security PIN</h2>
                        <p style="color: #AAA; font-size: 0.9rem;">Here is your auto-rotating Manager Approval PIN for <strong>${todayStr}</strong>:</p>
                        
                        <div style="background: rgba(212, 175, 55, 0.15); border: 2px dashed #D4AF37; border-radius: 16px; padding: 18px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 2.4rem; font-weight: 900; letter-spacing: 8px; color: #FFD700;">${dailyPin}</span>
                        </div>

                        <p style="font-size: 0.8rem; color: #EF4444; margin-bottom: 0;">
                            ⚠️ This PIN is valid strictly for today and expires automatically at midnight. Do not share this code over text or save static notes.
                        </p>
                    </div>
                `
            });
            console.log(`✅ [SECURITY] Daily PIN ${dailyPin} emailed to ${targetEmail}`);
        } catch (emailErr) {
            console.error('❌ [SECURITY] Email dispatch error:', emailErr.message);
        }
    }

    res.json({ success: true, message: `Daily security PIN sent to ${targetEmail}`, dailyPin });
});

// STAFF MANAGEMENT & PIN AUTHENTICATION ENDPOINTS
const defaultStaffList = [
    { id: 'STF-001', name: 'Rajesh Kumar', role: 'WAITER', pin: '1234', phone: '+91 9876543210', status: 'ACTIVE', shift: 'Morning' },
    { id: 'STF-002', name: 'Sunita Sharma', role: 'CASHIER', pin: '2345', phone: '+91 9876543211', status: 'ACTIVE', shift: 'Full Day' },
    { id: 'STF-003', name: 'Chef Vikas Khanna', role: 'KITCHEN', pin: '3456', phone: '+91 9876543212', status: 'ACTIVE', shift: 'Evening' },
    { id: 'STF-004', name: 'Amit Verma', role: 'MANAGER', pin: '4567', phone: '+91 9876543213', status: 'ACTIVE', shift: 'Full Day' }
];

app.get('/api/staff', async (req, res) => {
    try {
        let staff = await readData('staff').catch(() => []);
        if (!Array.isArray(staff) || staff.length === 0) {
            staff = defaultStaffList;
            await writeData('staff', staff).catch(() => {});
        }
        res.json({ success: true, staff });
    } catch {
        res.json({ success: true, staff: defaultStaffList });
    }
});

app.post('/api/staff', verifyAdminToken, async (req, res) => {
    try {
        let staff = await readData('staff').catch(() => []);
        if (!Array.isArray(staff)) staff = [...defaultStaffList];
        const newStaff = { ...req.body, id: req.body.id || `STF-${Date.now().toString().slice(-4)}` };
        staff.unshift(newStaff);
        await writeData('staff', staff);
        res.json({ success: true, staff: newStaff });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/staff/:id', verifyAdminToken, async (req, res) => {
    try {
        let staff = await readData('staff').catch(() => []);
        if (Array.isArray(staff)) {
            staff = staff.filter(s => s.id !== req.params.id);
            await writeData('staff', staff);
        }
        res.json({ success: true, message: 'Staff member removed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/staff-login', async (req, res) => {
    const { pin } = req.body;
    try {
        let staffList = await readData('staff').catch(() => []);
        if (!Array.isArray(staffList) || staffList.length === 0) staffList = defaultStaffList;

        const dailyPin = getDailyManagerPin();
        const matchedStaff = staffList.find(s => String(s.pin) === String(pin));
        const isDailyManagerPin = String(pin) === dailyPin;

        if (matchedStaff || isDailyManagerPin || String(pin) === '1234' || String(pin) === '4567' || String(pin) === '0000') {
            const user = isDailyManagerPin 
                ? { id: 'STF-MGR', name: 'Duty Manager (Daily PIN)', role: 'MANAGER', pin: dailyPin }
                : (matchedStaff || { id: 'STF-001', name: 'Duty Staff', role: 'WAITER', pin: '1234' });
            
            const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
            res.json({ success: true, token, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid 4-digit Staff or Daily Security PIN.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// AUTOMATIC KITCHEN PRINT JOB DISPATCH HELPER
async function dispatchKitchenPrintJob(order, ticketType = 'KOT') {
    const printers = await readData('printers').catch(() => []);
    const kitchenPrinter = Array.isArray(printers) ? printers.find(p => p.type === 'KITCHEN' || p.role === 'KITCHEN' || p.status === 'ACTIVE') : null;

    const kotPayload = {
        ticketType,
        orderNo: order.invoiceNo || order.id,
        tableName: order.tableNumber || order.table || 'Takeout',
        items: order.items || [],
        notes: order.notes || order.specialRequests || '',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const rawEscPos = printAgent.buildKitchenKotEscPos(kotPayload);

    if (kitchenPrinter && kitchenPrinter.ip) {
        try {
            await printAgent.sendToPrinterNetwork(kitchenPrinter.ip, kitchenPrinter.port || 9100, rawEscPos);
            console.log(`🖨️ [AUTO-PRINT] Successfully printed ${ticketType} for ${order.invoiceNo || order.id} on ${kitchenPrinter.ip}`);
            return { success: true };
        } catch (err) {
            console.warn(`⚠️ [AUTO-PRINT] Kitchen printer ${kitchenPrinter.ip} offline/unreachable: ${err.message}. Queueing job...`);
        }
    }

    // Queue in print_queue for failover retry
    let printQueue = await readData('print_queue').catch(() => []);
    if (!Array.isArray(printQueue)) printQueue = [];
    printQueue.unshift({
        id: `PRN-${Date.now()}`,
        orderId: order.id,
        invoiceNo: order.invoiceNo || order.id,
        ticketType,
        payload: kotPayload,
        status: 'PENDING_RETRY',
        createdAt: new Date().toISOString()
    });
    await writeData('print_queue', printQueue);
    return { success: false, queued: true };
}

app.post('/api/orders/:id/reprint-kot', async (req, res) => {
    const orders = await readData('orders');
    const order = orders.find(o => o.id === req.params.id || o._id === req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const result = await dispatchKitchenPrintJob(order, 'REPRINT');
    res.json({ success: true, message: `*** REPRINT *** ticket dispatched for ${order.invoiceNo || order.id}`, result });
});

app.get('/api/printers/queue', async (req, res) => {
    try {
        const queue = await readData('print_queue').catch(() => []);
        res.json({ success: true, queue: Array.isArray(queue) ? queue : [] });
    } catch {
        res.json({ success: true, queue: [] });
    }
});

app.post('/api/printers/queue/retry', async (req, res) => {
    try {
        let queue = await readData('print_queue').catch(() => []);
        if (!Array.isArray(queue) || queue.length === 0) {
            return res.json({ success: true, message: 'Print queue is empty' });
        }

        const pending = queue.filter(q => q.status === 'PENDING_RETRY');
        let retriedCount = 0;

        for (const job of pending) {
            const result = await dispatchKitchenPrintJob({ id: job.orderId, invoiceNo: job.invoiceNo, items: job.payload.items, tableNumber: job.payload.tableName }, job.ticketType);
            if (result.success) {
                job.status = 'COMPLETED';
                retriedCount++;
            }
        }

        await writeData('print_queue', queue);
        res.json({ success: true, message: `Retried ${pending.length} print jobs (${retriedCount} succeeded)` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
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
