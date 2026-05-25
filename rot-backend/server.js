require('dotenv').config();
// At the very top of your server.js with other requires
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // ADD THIS LINE - IMPORTANT!

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// =====================================================
// MYSQL CONNECTION
// =====================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {

    if (err) {
        console.log('Database Error:', err);
    } else {
        console.log('MySQL Connected Successfully');
    }
});

// =====================================================
// CREATE UPLOADS FOLDER
// =====================================================

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// =====================================================
// HELPERS
// =====================================================

const allowRoles = (...roles) => {

    return (req, res, next) => {

        if (!req.user || !roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }

        next();
    };
};

const sendSMS = (phoneNumber, message) => {

    console.log(`
        SMS TO: ${phoneNumber}
        MESSAGE: ${message}
    `);
};

// =====================================================
// JWT VERIFY
// =====================================================

const verifyToken = (req, res, next) => {

    const bearerHeader = req.headers.authorization;

    if (!bearerHeader) {

        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const token = bearerHeader.split(' ')[1];

    if (!token) {

        return res.status(401).json({
            success: false,
            message: 'Invalid token format'
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, decoded) => {

            if (err) {

                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            req.user = decoded;

            next();
        }
    );
};

// =====================================================
// ROOT ROUTE
// =====================================================

app.get('/', (req, res) => {

    res.json({
        success: true,
        message: 'ROT Backend Running Successfully'
    });
});

// =====================================================
// LOGIN SYSTEM
// =====================================================

app.post('/login', async (req, res) => {

    try {

        const { identifier, password } = req.body;

        // ============================================
        // ADMIN + COMPANY MANAGER LOGIN
        // ============================================

        db.query(
            'SELECT * FROM users WHERE email = ?',
            [identifier],
            async (err, userResult) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    });
                }

                if (userResult.length > 0) {

                    const user = userResult[0];

                    let match = false;

                    // HASHED PASSWORD
                    if (
                        user.password.startsWith('$2a$') ||
                        user.password.startsWith('$2b$')
                    ) {

                        match = await bcrypt.compare(
                            password,
                            user.password
                        );

                    } else {

                        // NORMAL PASSWORD
                        match = password === user.password;
                    }

                    if (!match) {

                        return res.status(401).json({
                            success: false,
                            message: 'Wrong password'
                        });
                    }

                    // COMPANY STATUS CHECK
                    if (user.company_id) {

                        db.query(
                            'SELECT * FROM company WHERE id = ?',
                            [user.company_id],
                            (companyErr, companyResult) => {

                                if (companyErr) {

                                    return res.status(500).json({
                                        success: false,
                                        message: 'Company check failed'
                                    });
                                }

                                if (
                                    companyResult.length > 0 &&
                                    companyResult[0].status === 'blocked'
                                ) {

                                    return res.status(403).json({
                                        success: false,
                                        message: 'Company blocked by admin'
                                    });
                                }

                                const token = jwt.sign(
                                    {
                                        id: user.id,
                                        role: user.roles,
                                        company_id: user.company_id
                                    },
                                    process.env.JWT_SECRET,
                                    {
                                        expiresIn: '7d'
                                    }
                                );

                                return res.json({
                                    success: true,
                                    role: user.roles,
                                    token,
                                    user
                                });
                            }
                        );

                    } else {

                        const token = jwt.sign(
                            {
                                id: user.id,
                                role: user.roles,
                                company_id: user.company_id
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: '7d'
                            }
                        );

                        return res.json({
                            success: true,
                            role: user.roles,
                            token,
                            user
                        });
                    }

                    return;
                }

                // ============================================
                // DRIVER LOGIN
                // ============================================

                db.query(
                    `SELECT * FROM company_driver
                     WHERE phone_number = ?
                     AND password_code = ?`,
                    [identifier, password],
                    (driverErr, driverResult) => {

                        if (driverErr) {

                            return res.status(500).json({
                                success: false,
                                message: 'Driver login failed'
                            });
                        }

                        if (driverResult.length > 0) {

                            const driver = driverResult[0];

                            const token = jwt.sign(
                                {
                                    id: driver.id,
                                    role: 'driver',
                                    user_id: driver.user_id
                                },
                                process.env.JWT_SECRET,
                                {
                                    expiresIn: '7d'
                                }
                            );

                            return res.json({
                                success: true,
                                role: 'driver',
                                token,
                                driver
                            });
                        }

                        // ============================================
                        // STATION LOGIN
                        // ============================================

                        db.query(
                            `SELECT * FROM company_station
                             WHERE station_name = ?
                             AND password_code = ?`,
                            [identifier, password],
                            (stationErr, stationResult) => {

                                if (stationErr) {

                                    return res.status(500).json({
                                        success: false,
                                        message: 'Station login failed'
                                    });
                                }

                                if (stationResult.length > 0) {

                                    const station = stationResult[0];

                                    const token = jwt.sign(
                                        {
                                            id: station.id,
                                            role: 'station',
                                            user_id: station.user_id
                                        },
                                        process.env.JWT_SECRET,
                                        {
                                            expiresIn: '7d'
                                        }
                                    );

                                    return res.json({
                                        success: true,
                                        role: 'station',
                                        token,
                                        station
                                    });
                                }

                                // ============================================
                                // INVALID LOGIN
                                // ============================================

                                return res.status(401).json({
                                    success: false,
                                    message: 'Invalid credentials'
                                });
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Server error',
            error
        });
    }
});
// =====================================================
// GET COMPANIES
// =====================================================

app.get('/company', (req, res) => {

    db.query(
        'SELECT * FROM company WHERE status = "active"',
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );
});

// =====================================================
// CREATE COMPANY
// =====================================================

app.post(
    '/company',
    verifyToken,
    allowRoles('admin'),
    (req, res) => {

        const { name, status } = req.body;

        db.query(
            `INSERT INTO company(name, status)
             VALUES (?, ?)`,
            [name, status || 'active'],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    company_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// CREATE MANAGER
// =====================================================

app.post(
    '/manager',
    upload.single('avatar_image'),
    async (req, res) => {

        const {
            email,
            password,
            company_id,
            phone_number,
            link_of_company_web
        } = req.body;

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const avatar =
            req.file
                ? req.file.filename
                : null;

        db.query(
            `INSERT INTO users(
                email,
                password,
                roles,
                avatar_image,
                company_id,
                phone_number,
                link_of_company_web
            )

            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                email,
                hashedPassword,
                'company-manager',
                avatar,
                company_id,
                phone_number,
                link_of_company_web
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    manager_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// CREATE CAR
// =====================================================

app.post(
    '/cars',
    verifyToken,
    allowRoles('company-manager'),
    (req, res) => {

        const {
            car_plate,
            car_name,
            total_sits
        } = req.body;

        db.query(
            `INSERT INTO company_cars(
                car_plate,
                car_name,
                total_sits,
                user_id
            )

            VALUES (?, ?, ?, ?)`,
            [
                car_plate,
                car_name,
                total_sits,
                req.user.id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    car_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// GET CARS
// =====================================================

app.get('/cars', verifyToken, (req, res) => {

    if (req.user.role === 'admin') {

        db.query(
            'SELECT * FROM company_cars',
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(result);
            }
        );

    } else {

        const sql = `
            SELECT company_cars.*

            FROM company_cars

            JOIN users
            ON company_cars.user_id = users.id

            WHERE users.company_id = ?
        `;

        db.query(
            sql,
            [req.user.company_id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(result);
            }
        );
    }
});

// =====================================================
// CREATE DRIVER
// =====================================================

app.post(
    '/drivers',
    verifyToken,
    allowRoles('company-manager'),
    (req, res) => {

        const {
            driver_name,
            phone_number,
            password_code
        } = req.body;

        db.query(
            `INSERT INTO company_driver(
                driver_name,
                phone_number,
                password_code,
                user_id
            )

            VALUES (?, ?, ?, ?)`,
            [
                driver_name,
                phone_number,
                password_code,
                req.user.id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    driver_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// CREATE STATION
// =====================================================

app.post(
    '/stations',
    verifyToken,
    allowRoles('company-manager'),
    (req, res) => {

        const {
            station_name,
            address,
            password_code
        } = req.body;

        db.query(
            `INSERT INTO company_station(
                station_name,
                address,
                password_code,
                user_id
            )

            VALUES (?, ?, ?, ?)`,
            [
                station_name,
                address,
                password_code,
                req.user.id
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    station_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// CREATE LOCATION
// =====================================================

app.post(
    '/locations',
    verifyToken,
    allowRoles('company-manager'),
    (req, res) => {

        const {
            travel_from,
            travel_to,
            price_amount
        } = req.body;

        db.query(
            `INSERT INTO locations(
                travel_from,
                travel_to,
                price_amount
            )

            VALUES (?, ?, ?)`,
            [
                travel_from,
                travel_to,
                price_amount
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    location_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// SEARCH LOCATION
// =====================================================

app.get('/search-location', (req, res) => {

    const { from, to } = req.query;

    db.query(
        `SELECT * FROM locations
         WHERE travel_from = ?
         AND travel_to = ?`,
        [from, to],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );
});

// =====================================================
// CREATE LAUNCH CAR
// =====================================================

app.post(
    '/launch-cars',
    verifyToken,
    allowRoles('company-manager'),
    (req, res) => {

        const {
            car_plate,
            location_id,
            travel_time,
            available_sits,
            status
        } = req.body;

        db.query(
            `INSERT INTO launch_cars(
                car_plate,
                location_id,
                travel_time,
                available_sits,
                status
            )

            VALUES (?, ?, ?, ?, ?)`,
            [
                car_plate,
                location_id,
                travel_time,
                available_sits,
                status || 'active'
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    launch_car_id: result.insertId
                });
            }
        );
    }
);

// =====================================================
// AVAILABLE CARS
// =====================================================

app.get('/available-cars/:location_id', (req, res) => {

    const { location_id } = req.params;

    db.query(
        `SELECT
            lc.id,
            lc.car_plate,
            lc.travel_time,
            lc.available_sits,
            cc.car_name,
            l.travel_from,
            l.travel_to,
            l.price_amount

         FROM launch_cars lc

         JOIN company_cars cc
         ON lc.car_plate = cc.car_plate

         JOIN locations l
         ON lc.location_id = l.id

         WHERE lc.location_id = ?
         AND lc.status = 'active'`,
        [location_id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );
});

// =====================================================
// FAKE PAYMENT
// =====================================================

app.post('/fake-payment', (req, res) => {

    const {
        phone_number,
        amount,
        payment_method
    } = req.body;

    const transactionId =
        'TX-' + Math.floor(Math.random() * 99999999);

    setTimeout(() => {

        res.json({
            success: true,
            transactionId,
            amount,
            payment_method,
            phone_number,
            message: 'Payment successful'
        });

    }, 3000);
});

// =====================================================
// BOOK TICKET
// =====================================================

app.post('/book-ticket', async (req, res) => {

    const {
        passenger_name,
        phone_number,
        launch_car_id,
        price,
        location_id,
        car_plate,
        travel_time,
        payment_method,
        payment_status
    } = req.body;

    db.query(
        `SELECT available_sits
         FROM launch_cars
         WHERE id = ?`,
        [launch_car_id],
        async (seatErr, seatResult) => {

            if (seatErr) {
                return res.status(500).json(seatErr);
            }

            if (
                seatResult.length === 0 ||
                seatResult[0].available_sits <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: 'No available seats'
                });
            }

            const qrData = `
                Passenger:${passenger_name}
                Car:${car_plate}
                Time:${travel_time}
            `;

            const qrImage =
                await QRCode.toDataURL(qrData);

            db.query(
                `INSERT INTO passenger_ticket(
                    passenger_name,
                    phone_number,
                    launch_car_id,
                    ticket_life_cycle,
                    price,
                    location_id,
                    car_plate,
                    travel_time,
                    payment_method,
                    payment_status,
                    qr_code
                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    passenger_name,
                    phone_number,
                    launch_car_id,
                    'active',
                    price,
                    location_id,
                    car_plate,
                    travel_time,
                    payment_method,
                    payment_status,
                    qrImage
                ],
                (ticketErr, ticketResult) => {

                    if (ticketErr) {
                        return res.status(500).json(ticketErr);
                    }

                    const ticketId =
                        ticketResult.insertId;

                    const token = uuidv4();

                    const verificationCode =
                        'ROT-' +
                        Math.floor(
                            100000 +
                            Math.random() * 900000
                        );

                    db.query(
                        `INSERT INTO verification_tokens(
                            passenger_ticket_id,
                            token,
                            verification_code,
                            qr_code,
                            status,
                            expires_at
                        )

                        VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))`,
                        [
                            ticketId,
                            token,
                            verificationCode,
                            qrImage,
                            'pending'
                        ]
                    );

                    db.query(
                        `UPDATE launch_cars
                         SET available_sits = available_sits - 1
                         WHERE id = ?`,
                        [launch_car_id]
                    );

                    db.query(
                        `SELECT * FROM payments
                         WHERE launch_car_id = ?
                         AND payment_date = CURDATE()`,
                        [launch_car_id],
                        (paymentErr, paymentResult) => {

                            if (
                                paymentResult &&
                                paymentResult.length > 0
                            ) {

                                db.query(
                                    `UPDATE payments
                                     SET total_amount = total_amount + ?,
                                     total_tickets = total_tickets + 1
                                     WHERE launch_car_id = ?
                                     AND payment_date = CURDATE()`,
                                    [
                                        price,
                                        launch_car_id
                                    ]
                                );

                            } else {

                                db.query(
                                    `INSERT INTO payments(
                                        launch_car_id,
                                        total_amount,
                                        total_tickets,
                                        payment_date
                                    )

                                    VALUES (?, ?, ?, CURDATE())`,
                                    [
                                        launch_car_id,
                                        price,
                                        1
                                    ]
                                );
                            }

                            sendSMS(
                                phone_number,
                                `ROT Ticket Verified Code: ${verificationCode}`
                            );

                            res.json({
                                success: true,
                                ticket_id: ticketId,
                                verificationCode,
                                qrImage
                            });
                        }
                    );
                }
            );
        }
    );
});

// =====================================================
// VERIFY TICKET
// =====================================================

app.post(
    '/verify-ticket',
    verifyToken,
    allowRoles('station'),
    (req, res) => {

        const { verification_code } = req.body;

        db.query(
            `SELECT * FROM verification_tokens
             WHERE verification_code = ?
             AND status = 'pending'`,
            [verification_code],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (
                    !result ||
                    result.length === 0
                ) {

                    return res.status(404).json({
                        success: false,
                        message: 'Invalid Ticket'
                    });
                }

                db.query(
                    `UPDATE verification_tokens
                     SET status = 'used'
                     WHERE verification_code = ?`,
                    [verification_code],
                    (updateErr) => {

                        if (updateErr) {
                            return res.status(500).json(updateErr);
                        }

                        res.json({
                            success: true,
                            message: 'Passenger Allowed'
                        });
                    }
                );
            }
        );
    }
);

// =====================================================
// GET TICKETS
// =====================================================

app.get('/tickets', verifyToken, (req, res) => {

    if (req.user.role === 'admin') {

        db.query(
            'SELECT * FROM passenger_ticket',
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(result);
            }
        );

    } else {

        const sql = `
            SELECT pt.*

            FROM passenger_ticket pt

            JOIN launch_cars lc
            ON pt.launch_car_id = lc.id

            JOIN company_cars cc
            ON lc.car_plate = cc.car_plate

            JOIN users u
            ON cc.user_id = u.id

            WHERE u.company_id = ?
        `;

        db.query(
            sql,
            [req.user.company_id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(result);
            }
        );
    }
});

// =====================================================
// DASHBOARD
// =====================================================

app.get('/dashboard', verifyToken, (req, res) => {

    const stats = {};

    db.query(
        'SELECT COUNT(*) AS total_cars FROM company_cars',
        (carsErr, carsResult) => {

            stats.total_cars =
                carsResult[0].total_cars;

            db.query(
                'SELECT COUNT(*) AS total_tickets FROM passenger_ticket',
                (ticketErr, ticketResult) => {

                    stats.total_tickets =
                        ticketResult[0].total_tickets;

                    db.query(
                        'SELECT SUM(price) AS total_income FROM passenger_ticket',
                        (incomeErr, incomeResult) => {

                            stats.total_income =
                                incomeResult[0].total_income || 0;

                            res.json(stats);
                        }
                    );
                }
            );
        }
    );
});
// UPDATE COMPANY

app.put(
  "/company/:id",
  verifyToken,
  allowRoles("admin"),
  (req, res) => {

    const { id } = req.params;

    const { name, status } = req.body;

    db.query(
      `UPDATE company
       SET name = ?, status = ?
       WHERE id = ?`,
      [name, status, id],
      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Company updated",
        });
      }
    );
  }
);

// DELETE COMPANY

app.delete(
  "/company/:id",
  verifyToken,
  allowRoles("admin"),
  (req, res) => {

    const { id } = req.params;

    db.query(
      "DELETE FROM company WHERE id = ?",
      [id],
      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Company deleted",
        });
      }
    );
  }
);
// GET MANAGERS

app.get(
  "/managers",
  verifyToken,
  allowRoles("admin"),
  (req, res) => {

    db.query(
      `SELECT
        users.*,
        company.name AS company_name

       FROM users

       LEFT JOIN company
       ON users.company_id = company.id

       WHERE users.roles = 'company-manager'`,
      (err, result) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(result);
      }
    );
  }
);

// UPDATE MANAGER

app.put(
  "/manager/:id",
  upload.single("avatar_image"),
  (req, res) => {

    const { id } = req.params;

    const {
      email,
      password,
      company_id,
      phone_number,
      link_of_company_web,
    } = req.body;

    const avatar =
      req.file
        ? req.file.filename
        : null;

    db.query(
      `UPDATE users
       SET email = ?,
       company_id = ?,
       phone_number = ?,
       link_of_company_web = ?,
       avatar_image = ?
       WHERE id = ?`,
      [
        email,
        company_id,
        phone_number,
        link_of_company_web,
        avatar,
        id,
      ],
      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Manager updated",
        });
      }
    );
  }
);

// DELETE MANAGER

app.delete(
  "/manager/:id",
  verifyToken,
  allowRoles("admin"),
  (req, res) => {

    const { id } = req.params;

    db.query(
      "DELETE FROM users WHERE id = ?",
      [id],
      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Manager deleted",
        });
      }
    );
  }
);
// BACKEND ROUTES

// UPDATE CAR

app.put(
  "/cars/:id",
  verifyToken,
  allowRoles("company-manager"),
  (req, res) => {

    const { id } = req.params;

    const {
      car_plate,
      car_name,
      total_sits,
    } = req.body;

    db.query(
      `UPDATE company_cars
       SET car_plate = ?,
       car_name = ?,
       total_sits = ?
       WHERE id = ?`,
      [
        car_plate,
        car_name,
        total_sits,
        id,
      ],
      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Car updated",
        });
      }
    );
  }
);

// DELETE CAR

app.delete(
  "/cars/:id",
  verifyToken,
  allowRoles("company-manager"),
  (req, res) => {

    const { id } = req.params;

    db.query(
      "DELETE FROM company_cars WHERE id = ?",
      [id],
      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Car deleted",
        });
      }
    );
  }
);
// Add to your backend server.js

// =====================================================
// GET DRIVERS (for manager)
// =====================================================
app.get('/drivers', verifyToken, allowRoles('company-manager'), (req, res) => {
    const sql = `
        SELECT * FROM company_driver 
        WHERE user_id = ?
    `;
    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// =====================================================
// GET STATIONS (for manager)
// =====================================================
app.get('/stations', verifyToken, allowRoles('company-manager'), (req, res) => {
    const sql = `
        SELECT * FROM company_station 
        WHERE user_id = ?
    `;
    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// =====================================================
// GET LOCATIONS (for manager)
// =====================================================
app.get('/locations', verifyToken, allowRoles('company-manager'), (req, res) => {
    db.query('SELECT * FROM locations', (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// =====================================================
// GET LAUNCH CARS (for manager)
// =====================================================
app.get('/launch-cars', verifyToken, allowRoles('company-manager'), (req, res) => {
    const sql = `
        SELECT lc.*, l.travel_from, l.travel_to, l.price_amount
        FROM launch_cars lc
        JOIN locations l ON lc.location_id = l.id
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
        JOIN users u ON cc.user_id = u.id
        WHERE u.company_id = ?
    `;
    db.query(sql, [req.user.company_id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// =====================================================
// UPDATE DRIVER
// =====================================================
app.put('/drivers/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    const { driver_name, phone_number, password_code } = req.body;
    
    db.query(
        `UPDATE company_driver 
         SET driver_name = ?, phone_number = ?, password_code = ? 
         WHERE id = ? AND user_id = ?`,
        [driver_name, phone_number, password_code, id, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Driver updated" });
        }
    );
});

// =====================================================
// DELETE DRIVER
// =====================================================
app.delete('/drivers/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    
    db.query(
        'DELETE FROM company_driver WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Driver deleted" });
        }
    );
});

// =====================================================
// UPDATE STATION
// =====================================================
app.put('/stations/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    const { station_name, address, password_code } = req.body;
    
    db.query(
        `UPDATE company_station 
         SET station_name = ?, address = ?, password_code = ? 
         WHERE id = ? AND user_id = ?`,
        [station_name, address, password_code, id, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Station updated" });
        }
    );
});

// =====================================================
// DELETE STATION
// =====================================================
app.delete('/stations/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    
    db.query(
        'DELETE FROM company_station WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Station deleted" });
        }
    );
});

// =====================================================
// UPDATE LOCATION
// =====================================================
app.put('/locations/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    const { travel_from, travel_to, price_amount } = req.body;
    
    db.query(
        `UPDATE locations 
         SET travel_from = ?, travel_to = ?, price_amount = ? 
         WHERE id = ?`,
        [travel_from, travel_to, price_amount, id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Location updated" });
        }
    );
});

// =====================================================
// DELETE LOCATION
// =====================================================
app.delete('/locations/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    
    db.query(
        'DELETE FROM locations WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Location deleted" });
        }
    );
});

// =====================================================
// UPDATE LAUNCH CAR
// =====================================================
app.put('/launch-cars/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    const { car_plate, location_id, travel_time, available_sits, status } = req.body;
    
    db.query(
        `UPDATE launch_cars 
         SET car_plate = ?, location_id = ?, travel_time = ?, available_sits = ?, status = ? 
         WHERE id = ?`,
        [car_plate, location_id, travel_time, available_sits, status, id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Launch car updated" });
        }
    );
});

// =====================================================
// DELETE LAUNCH CAR
// =====================================================
app.delete('/launch-cars/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    
    db.query(
        'DELETE FROM launch_cars WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Launch car deleted" });
        }
    );
});
// Update existing GET /locations or add this
app.get('/locations', verifyToken, (req, res) => {
    // Allow both company-manager and station roles
    if (req.user.role === 'company-manager' || req.user.role === 'station') {
        db.query('SELECT * FROM locations', (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        });
    } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
    }
});
// =====================================================
// GET TICKETS (Fixed for all roles - Admin, Manager, Station)
// =====================================================

app.get('/tickets', verifyToken, (req, res) => {
    
    // ADMIN - can see all tickets
    if (req.user.role === 'admin') {
        const sql = `
            SELECT pt.*, l.travel_from, l.travel_to, vt.verification_code
            FROM passenger_ticket pt
            LEFT JOIN locations l ON pt.location_id = l.id
            LEFT JOIN verification_tokens vt ON vt.passenger_ticket_id = pt.id
            ORDER BY pt.id DESC
        `;
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Admin tickets error:", err);
                return res.status(500).json(err);
            }
            res.json(result);
        });
    }
    
    // COMPANY MANAGER - can see tickets for their company
    else if (req.user.role === 'company-manager') {
        const sql = `
            SELECT pt.*, l.travel_from, l.travel_to, vt.verification_code
            FROM passenger_ticket pt
            LEFT JOIN locations l ON pt.location_id = l.id
            LEFT JOIN verification_tokens vt ON vt.passenger_ticket_id = pt.id
            JOIN launch_cars lc ON pt.launch_car_id = lc.id
            JOIN company_cars cc ON lc.car_plate = cc.car_plate
            JOIN users u ON cc.user_id = u.id
            WHERE u.company_id = ?
            ORDER BY pt.id DESC
        `;
        db.query(sql, [req.user.company_id], (err, result) => {
            if (err) {
                console.error("Manager tickets error:", err);
                return res.status(500).json(err);
            }
            res.json(result);
        });
    }
    
    // STATION - can see tickets for their company's station
    else if (req.user.role === 'station') {
        const sql = `
            SELECT pt.*, l.travel_from, l.travel_to, vt.verification_code
            FROM passenger_ticket pt
            LEFT JOIN locations l ON pt.location_id = l.id
            LEFT JOIN verification_tokens vt ON vt.passenger_ticket_id = pt.id
            JOIN launch_cars lc ON pt.launch_car_id = lc.id
            JOIN company_cars cc ON lc.car_plate = cc.car_plate
            JOIN users u ON cc.user_id = u.id
            JOIN company_station cs ON cs.user_id = u.id
            WHERE cs.id = ?
            ORDER BY pt.id DESC
        `;
        db.query(sql, [req.user.id], (err, result) => {
            if (err) {
                console.error("Station tickets error:", err);
                return res.status(500).json(err);
            }
            res.json(result);
        });
    }
    
    else {
        res.status(403).json({ success: false, message: 'Forbidden - Access denied' });
    }
});

// =====================================================
// DELETE TICKET (Fixed for station role)
// =====================================================

app.delete('/tickets/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    
    // Admin can delete any ticket
    if (req.user.role === 'admin') {
        db.query('DELETE FROM passenger_ticket WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Ticket deleted successfully" });
        });
    }
    // Station can delete tickets for their station
    else if (req.user.role === 'station') {
        const sql = `
            DELETE pt FROM passenger_ticket pt
            JOIN launch_cars lc ON pt.launch_car_id = lc.id
            JOIN company_cars cc ON lc.car_plate = cc.car_plate
            JOIN users u ON cc.user_id = u.id
            JOIN company_station cs ON cs.user_id = u.id
            WHERE pt.id = ? AND cs.id = ?
        `;
        db.query(sql, [id, req.user.id], (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Ticket deleted successfully" });
        });
    }
    // Company Manager can delete tickets for their company
    else if (req.user.role === 'company-manager') {
        const sql = `
            DELETE pt FROM passenger_ticket pt
            JOIN launch_cars lc ON pt.launch_car_id = lc.id
            JOIN company_cars cc ON lc.car_plate = cc.car_plate
            JOIN users u ON cc.user_id = u.id
            WHERE pt.id = ? AND u.company_id = ?
        `;
        db.query(sql, [id, req.user.company_id], (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Ticket deleted successfully" });
        });
    }
    else {
        res.status(403).json({ success: false, message: 'Forbidden' });
    }
});

// =====================================================
// VERIFY TICKET (Fix - also update ticket_life_cycle)
// =====================================================

app.post('/verify-ticket', verifyToken, allowRoles('station'), (req, res) => {
    const { verification_code } = req.body;

    db.query(
        `SELECT * FROM verification_tokens WHERE verification_code = ? AND status = 'pending'`,
        [verification_code],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (!result || result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid Ticket'
                });
            }

            const tokenData = result[0];
            const ticketId = tokenData.passenger_ticket_id;

            // Update verification token status
            db.query(
                `UPDATE verification_tokens SET status = 'used' WHERE verification_code = ?`,
                [verification_code],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json(updateErr);
                    }
                    
                    // Also update the passenger_ticket status to 'used'
                    db.query(
                        `UPDATE passenger_ticket SET ticket_life_cycle = 'used' WHERE id = ?`,
                        [ticketId],
                        (ticketUpdateErr) => {
                            if (ticketUpdateErr) {
                                console.error("Error updating ticket status:", ticketUpdateErr);
                            }
                            
                            res.json({
                                success: true,
                                message: 'Passenger Allowed - Ticket Verified'
                            });
                        }
                    );
                }
            );
        }
    );
});

// =====================================================
// GET LOCATIONS (Allow station role)
// =====================================================

app.get('/locations', verifyToken, (req, res) => {
    // Allow admin, company-manager, and station roles
    if (req.user.role === 'admin' || req.user.role === 'company-manager' || req.user.role === 'station') {
        db.query('SELECT * FROM locations ORDER BY id ASC', (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        });
    } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
    }
});

// =====================================================
// GET AVAILABLE CARS (Public - no auth needed for station)
// =====================================================

app.get('/available-cars/:location_id', (req, res) => {
    const { location_id } = req.params;

    db.query(
        `SELECT
            lc.id,
            lc.car_plate,
            lc.travel_time,
            lc.available_sits,
            cc.car_name,
            l.travel_from,
            l.travel_to,
            l.price_amount
         FROM launch_cars lc
         JOIN company_cars cc ON lc.car_plate = cc.car_plate
         JOIN locations l ON lc.location_id = l.id
         WHERE lc.location_id = ? AND lc.status = 'active'`,
        [location_id],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json(result);
        }
    );
});
// =====================================================
// PUBLIC ENDPOINTS (No authentication required)
// =====================================================

// Public - Get all locations
app.get('/public/locations', (req, res) => {
    db.query('SELECT * FROM locations ORDER BY travel_from ASC', (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// Public - Get all available launch cars
// Public - Get all available launch cars (FIXED - includes location_id)
// Public - Get all available launch cars (with company name)
app.get('/public/launch-cars', (req, res) => {
    const sql = `
        SELECT 
            lc.id,
            lc.car_plate,
            lc.travel_time,
            lc.available_sits,
            lc.status,
            cc.car_name,
            cc.total_sits,
            l.id as location_id,
            l.travel_from,
            l.travel_to,
            l.price_amount,
            c.name as company_name
        FROM launch_cars lc
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
        JOIN locations l ON lc.location_id = l.id
        JOIN users u ON cc.user_id = u.id
        JOIN company c ON u.company_id = c.id
        WHERE lc.status = 'active' AND lc.available_sits > 0 AND lc.travel_time > NOW()
        ORDER BY lc.travel_time ASC
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching launch cars:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});
// Public - Get available cars by route
app.get('/public/available-cars', (req, res) => {
    const { from, to } = req.query;
    
    let sql = `
        SELECT 
            lc.id,
            lc.car_plate,
            lc.travel_time,
            lc.available_sits,
            cc.car_name,
            l.travel_from,
            l.travel_to,
            l.price_amount,
            c.name as company_name
        FROM launch_cars lc
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
        JOIN locations l ON lc.location_id = l.id
        JOIN users u ON cc.user_id = u.id
        JOIN company c ON u.company_id = c.id
        WHERE lc.status = 'active' AND lc.available_sits > 0
    `;
    
    const params = [];
    
    if (from && to) {
        sql += ` AND l.travel_from = ? AND l.travel_to = ?`;
        params.push(from, to);
    }
    
    sql += ` ORDER BY lc.travel_time ASC`;
    
    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// Public - Get all companies
app.get('/public/companies', (req, res) => {
    db.query('SELECT id, name FROM company WHERE status = "active"', (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// // Public - Book ticket (with payments table handling)
// Public - Book ticket (FIXED VERSION)
app.post('/public/book-ticket', async (req, res) => {
    console.log("=== BOOKING REQUEST RECEIVED ===");
    console.log("Request body:", req.body);
    
    const {
        passenger_name,
        phone_number,
        launch_car_id,
        car_plate,
        travel_time,
        payment_method
    } = req.body;

    if (!passenger_name || !phone_number || !launch_car_id || !car_plate) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required fields" 
        });
    }

    // Get car details
    db.query(
        `SELECT lc.*, l.id as location_id, l.price_amount as location_price,
         l.travel_from, l.travel_to
         FROM launch_cars lc
         JOIN locations l ON lc.location_id = l.id
         WHERE lc.id = ?`,
        [launch_car_id],
        async (err, carResult) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            
            if (carResult.length === 0) {
                return res.status(400).json({ success: false, message: 'Bus not found' });
            }

            const carData = carResult[0];
            
            if (carData.available_sits <= 0) {
                return res.status(400).json({ success: false, message: 'No seats available' });
            }

            // Generate QR code
            let qrImage = null;
            try {
                const QRCode = require('qrcode');
                qrImage = await QRCode.toDataURL(`Ticket:${passenger_name}|${car_plate}|${travel_time}`);
            } catch (qrErr) {
                console.error("QR error:", qrErr);
            }
            
            const verificationCode = 'ROT-' + Math.floor(100000 + Math.random() * 900000);
            const token = require('uuid').v4();

            // Insert into passenger_ticket
            const insertSql = `
                INSERT INTO passenger_ticket(
                    passenger_name, phone_number, launch_car_id, ticket_life_cycle,
                    price, location_id, car_plate, travel_time, payment_method, 
                    payment_status, qr_code
                ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, 'paid', ?)
            `;
            
            db.query(insertSql, [
                passenger_name, phone_number, launch_car_id,
                carData.location_price, carData.location_id, car_plate, travel_time, 
                payment_method || 'cash', qrImage
            ], (ticketErr, ticketResult) => {
                if (ticketErr) {
                    console.error("Insert error:", ticketErr);
                    return res.status(500).json({ success: false, message: ticketErr.message });
                }

                const ticketId = ticketResult.insertId;
                console.log("✅ Ticket created:", ticketId);

                // Insert verification token
                db.query(
                    `INSERT INTO verification_tokens(
                        passenger_ticket_id, token, verification_code, qr_code, 
                        status, expires_at
                    ) VALUES (?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 1 DAY))`,
                    [ticketId, token, verificationCode, qrImage],
                    (tokenErr) => {
                        if (tokenErr) console.error("Token error:", tokenErr);
                    }
                );

                // Update available seats
                db.query(
                    `UPDATE launch_cars SET available_sits = available_sits - 1 WHERE id = ?`,
                    [launch_car_id],
                    (updateErr) => {
                        if (updateErr) console.error("Seat update error:", updateErr);
                    }
                );

                // Insert or update payments table (handles duplicate key)
                const paymentSql = `
                    INSERT INTO payments (launch_car_id, total_amount, total_tickets, payment_date) 
                    VALUES (?, ?, ?, CURDATE())
                    ON DUPLICATE KEY UPDATE 
                        total_amount = total_amount + VALUES(total_amount),
                        total_tickets = total_tickets + VALUES(total_tickets)
                `;
                
                db.query(paymentSql, [launch_car_id, carData.location_price, 1], (payErr) => {
                    if (payErr) {
                        console.error("Payment record error (non-critical):", payErr.message);
                        // Don't fail the booking for payment record error
                    }
                    
                    res.json({
                        success: true,
                        ticket_id: ticketId,
                        verificationCode: verificationCode,
                        qrImage: qrImage,
                        message: 'Ticket booked successfully!'
                    });
                });
            });
        }
    );
});
// Public - Check ticket status
app.get('/public/ticket/:id', (req, res) => {
    const { id } = req.params;
    
    db.query(
        `SELECT pt.*, vt.verification_code, l.travel_from, l.travel_to, c.name as company_name
         FROM passenger_ticket pt
         LEFT JOIN verification_tokens vt ON vt.passenger_ticket_id = pt.id
         LEFT JOIN locations l ON pt.location_id = l.id
         LEFT JOIN launch_cars lc ON pt.launch_car_id = lc.id
         LEFT JOIN company_cars cc ON lc.car_plate = cc.car_plate
         LEFT JOIN users u ON cc.user_id = u.id
         LEFT JOIN company c ON u.company_id = c.id
         WHERE pt.id = ?`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (result.length === 0) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }
            res.json(result[0]);
        }
    );
});
// =====================================================
// DRIVER LOCATION TRACKING
// =====================================================

// Update driver's current location
app.post('/driver/location', verifyToken, allowRoles('driver'), (req, res) => {
    const { latitude, longitude, location_name, status, current_route } = req.body;
    const driverId = req.user.id;
    
    const sql = `
        INSERT INTO driver_locations (driver_id, latitude, longitude, location_name, status, current_route, last_update)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            location_name = VALUES(location_name),
            status = VALUES(status),
            current_route = VALUES(current_route),
            last_update = NOW()
    `;
    
    db.query(sql, [driverId, latitude, longitude, location_name, status, current_route], (err) => {
        if (err) {
            console.error("Location update error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Location updated" });
    });
});

// Get driver's current location
app.get('/driver/location/:driverId', (req, res) => {
    const { driverId } = req.params;
    
    db.query(
        `SELECT dl.*, cd.driver_name, cd.phone_number, cc.car_plate, cc.car_name
         FROM driver_locations dl
         JOIN company_driver cd ON dl.driver_id = cd.id
         LEFT JOIN company_cars cc ON cc.user_id = cd.user_id
         WHERE dl.driver_id = ?`,
        [driverId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json(result[0] || null);
        }
    );
});

// Get all active drivers locations
app.get('/driver/locations/all', (req, res) => {
    db.query(
        `SELECT dl.*, cd.driver_name, cd.phone_number, cc.car_plate, cc.car_name
         FROM driver_locations dl
         JOIN company_driver cd ON dl.driver_id = cd.id
         LEFT JOIN company_cars cc ON cc.user_id = cd.user_id
         WHERE dl.status = 'active'
         ORDER BY dl.last_update DESC`,
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json(result);
        }
    );
});

// Get drivers by route
app.get('/driver/locations/route/:route', (req, res) => {
    const { route } = req.params;
    
    db.query(
        `SELECT dl.*, cd.driver_name, cd.phone_number, cc.car_plate, cc.car_name
         FROM driver_locations dl
         JOIN company_driver cd ON dl.driver_id = cd.id
         LEFT JOIN company_cars cc ON cc.user_id = cd.user_id
         WHERE dl.current_route LIKE ? AND dl.status = 'active'`,
        [`%${route}%`],
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json(result);
        }
    );
});

// Mark passengers as arrived at location (expire their tickets)
app.post('/driver/mark-arrived', verifyToken, allowRoles('driver'), (req, res) => {
    const { location_id, launch_car_id, passenger_ids } = req.body;
    const driverId = req.user.id;
    
    // Get the launch car and location info
    db.query(
        `SELECT lc.*, l.travel_to 
         FROM launch_cars lc
         JOIN locations l ON lc.location_id = l.id
         WHERE lc.id = ?`,
        [launch_car_id],
        (err, carResult) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (carResult.length === 0) {
                return res.status(404).json({ success: false, message: "Car not found" });
            }
            
            const carData = carResult[0];
            
            // Update tickets for passengers getting off at this location
            let sql = `
                UPDATE passenger_ticket pt
                JOIN passenger_trip ptrip ON pt.id = ptrip.ticket_id
                SET pt.ticket_life_cycle = 'expired',
                    pt.actual_dropoff_time = NOW(),
                    pt.dropoff_location_id = ?
                WHERE pt.launch_car_id = ? AND pt.ticket_life_cycle = 'active'
            `;
            
            const params = [location_id, launch_car_id];
            
            if (passenger_ids && passenger_ids.length > 0) {
                sql += ` AND pt.id IN (?)`;
                params.push(passenger_ids);
            }
            
            db.query(sql, params, (updateErr) => {
                if (updateErr) {
                    console.error("Update error:", updateErr);
                    return res.status(500).json({ success: false, error: updateErr.message });
                }
                
                res.json({ 
                    success: true, 
                    message: "Passengers marked as arrived",
                    location: carData.travel_to
                });
            });
        }
    );
});
// =====================================================
// DRIVER TRIPS ENDPOINTS
// =====================================================

// Get driver's assigned trips
app.get('/driver/trips', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT 
            lc.id as launch_car_id,
            lc.car_plate,
            lc.travel_time,
            lc.available_sits,
            l.travel_from,
            l.travel_to,
            l.price_amount,
            cc.car_name,
            (
                SELECT COUNT(*) 
                FROM passenger_ticket pt 
                WHERE pt.launch_car_id = lc.id 
                AND pt.ticket_life_cycle = 'active'
            ) as passenger_count
        FROM launch_cars lc
        JOIN locations l ON lc.location_id = l.id
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
        JOIN users u ON cc.user_id = u.id
        JOIN company_driver cd ON cd.user_id = u.id
        WHERE cd.id = ?
        ORDER BY lc.travel_time ASC
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            console.error("Error fetching driver trips:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// Get driver's tickets (passengers on their bus)
app.get('/driver/tickets', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT 
            pt.*,
            l.travel_from,
            l.travel_to,
            lc.travel_time as scheduled_time
        FROM passenger_ticket pt
        JOIN launch_cars lc ON pt.launch_car_id = lc.id
        JOIN locations l ON pt.location_id = l.id
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
        JOIN users u ON cc.user_id = u.id
        JOIN company_driver cd ON cd.user_id = u.id
        WHERE cd.id = ?
        ORDER BY pt.created_at DESC
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            console.error("Error fetching driver tickets:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// Update driver location
app.post('/driver/location', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { latitude, longitude, location_name, status, current_route } = req.body;
    
    const sql = `
        INSERT INTO driver_locations (driver_id, latitude, longitude, location_name, status, current_route, last_update)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            location_name = VALUES(location_name),
            status = VALUES(status),
            current_route = VALUES(current_route),
            last_update = NOW()
    `;
    
    db.query(sql, [driverId, latitude, longitude, location_name, status, current_route], (err) => {
        if (err) {
            console.error("Location update error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Location updated" });
    });
});

// Get driver's current location
app.get('/driver/location', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT dl.*, cd.driver_name, cd.phone_number
        FROM driver_locations dl
        JOIN company_driver cd ON dl.driver_id = cd.id
        WHERE dl.driver_id = ?
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result[0] || null);
    });
});

// Mark passengers as arrived (expire their tickets)
app.post('/driver/mark-arrived', verifyToken, allowRoles('driver'), (req, res) => {
    const { location_id, launch_car_id, passenger_ids } = req.body;
    
    let sql = `
        UPDATE passenger_ticket 
        SET ticket_life_cycle = 'expired',
            actual_dropoff_time = NOW(),
            dropoff_location_id = ?
        WHERE launch_car_id = ? 
        AND ticket_life_cycle = 'active'
    `;
    
    const params = [location_id, launch_car_id];
    
    if (passenger_ids && passenger_ids.length > 0) {
        sql += ` AND id IN (?)`;
        params.push(passenger_ids);
    }
    
    db.query(sql, params, (err) => {
        if (err) {
            console.error("Error marking arrived:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Passengers marked as arrived" });
    });
});
// =====================================================
// DRIVER CAR ASSIGNMENT ENDPOINTS
// =====================================================

// Get driver's assigned car
app.get('/driver/assigned-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT da.*, cc.car_name, cc.total_sits, cc.car_plate
        FROM driver_assignments da
        JOIN company_cars cc ON da.car_plate = cc.car_plate
        WHERE da.driver_id = ? AND da.status = 'active'
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result[0] || null);
    });
});

// Get available cars for driver
app.get('/driver/available-cars', verifyToken, allowRoles('driver'), (req, res) => {
    const sql = `
        SELECT cc.*, u.company_id
        FROM company_cars cc
        JOIN users u ON cc.user_id = u.id
        WHERE cc.status = 'available' 
        AND cc.id NOT IN (
            SELECT car_id FROM driver_assignments WHERE status = 'active'
        )
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// Assign car to driver
app.post('/driver/assign-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { car_plate } = req.body;
    
    if (!car_plate) {
        return res.status(400).json({ success: false, message: "Car plate required" });
    }
    
    // Check if car exists
    db.query('SELECT * FROM company_cars WHERE car_plate = ?', [car_plate], (err, carResult) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (carResult.length === 0) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }
        
        // Check if driver already has an assigned car
        db.query(
            'SELECT * FROM driver_assignments WHERE driver_id = ? AND status = "active"',
            [driverId],
            (assignErr, assignResult) => {
                if (assignErr) {
                    return res.status(500).json({ success: false, error: assignErr.message });
                }
                
                if (assignResult.length > 0) {
                    // Update existing assignment
                    db.query(
                        'UPDATE driver_assignments SET car_plate = ?, assigned_at = NOW() WHERE driver_id = ? AND status = "active"',
                        [car_plate, driverId],
                        (updateErr) => {
                            if (updateErr) {
                                return res.status(500).json({ success: false, error: updateErr.message });
                            }
                            res.json({ success: true, message: "Car updated successfully", car_plate });
                        }
                    );
                } else {
                    // Create new assignment
                    db.query(
                        'INSERT INTO driver_assignments (driver_id, car_plate, assigned_at, status) VALUES (?, ?, NOW(), "active")',
                        [driverId, car_plate],
                        (insertErr) => {
                            if (insertErr) {
                                return res.status(500).json({ success: false, error: insertErr.message });
                            }
                            res.json({ success: true, message: "Car assigned successfully", car_plate });
                        }
                    );
                }
            }
        );
    });
});

// Get trips for driver with car assignment check
app.get('/driver/trips', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    // First get driver's assigned car
    db.query(
        'SELECT car_plate FROM driver_assignments WHERE driver_id = ? AND status = "active"',
        [driverId],
        (err, carResult) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            const carPlate = carResult[0]?.car_plate;
            
            // Get trips for the assigned car
            const sql = `
                SELECT 
                    lc.id as launch_car_id,
                    lc.car_plate,
                    lc.travel_time,
                    lc.available_sits,
                    l.travel_from,
                    l.travel_to,
                    l.price_amount,
                    cc.car_name,
                    cc.total_sits,
                    (
                        SELECT COUNT(*) 
                        FROM passenger_ticket pt 
                        WHERE pt.launch_car_id = lc.id 
                        AND pt.ticket_life_cycle = 'active'
                    ) as passenger_count
                FROM launch_cars lc
                JOIN locations l ON lc.location_id = l.id
                JOIN company_cars cc ON lc.car_plate = cc.car_plate
                WHERE lc.car_plate = ? OR ? IS NULL
                ORDER BY lc.travel_time ASC
            `;
            
            db.query(sql, [carPlate, carPlate], (tripErr, trips) => {
                if (tripErr) {
                    return res.status(500).json({ success: false, error: tripErr.message });
                }
                res.json(trips);
            });
        }
    );
});
// =====================================================
// DRIVER CAR ASSIGNMENT ENDPOINTS
// =====================================================

// Get driver's assigned car
app.get('/driver/assigned-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT da.*, cc.car_name, cc.total_sits, cc.car_plate
        FROM driver_assignments da
        JOIN company_cars cc ON da.car_plate = cc.car_plate
        WHERE da.driver_id = ? AND da.status = 'active'
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            console.error("Error fetching assigned car:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result[0] || null);
    });
});

// Get available cars for driver
app.get('/driver/available-cars', verifyToken, allowRoles('driver'), (req, res) => {
    const sql = `
        SELECT cc.*, u.company_id
        FROM company_cars cc
        JOIN users u ON cc.user_id = u.id
        WHERE cc.status = 'available' OR cc.status IS NULL
        AND cc.id NOT IN (
            SELECT car_id FROM driver_assignments WHERE status = 'active'
        )
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching available cars:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result || []);
    });
});

// Assign car to driver
app.post('/driver/assign-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { car_plate } = req.body;
    
    if (!car_plate) {
        return res.status(400).json({ success: false, message: "Car plate required" });
    }
    
    // Check if car exists
    db.query('SELECT * FROM company_cars WHERE car_plate = ?', [car_plate], (err, carResult) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (carResult.length === 0) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }
        
        // Check if driver already has an assigned car
        db.query(
            'SELECT * FROM driver_assignments WHERE driver_id = ? AND status = "active"',
            [driverId],
            (assignErr, assignResult) => {
                if (assignErr) {
                    return res.status(500).json({ success: false, error: assignErr.message });
                }
                
                if (assignResult.length > 0) {
                    // Update existing assignment
                    db.query(
                        'UPDATE driver_assignments SET car_plate = ?, assigned_at = NOW() WHERE driver_id = ? AND status = "active"',
                        [car_plate, driverId],
                        (updateErr) => {
                            if (updateErr) {
                                return res.status(500).json({ success: false, error: updateErr.message });
                            }
                            res.json({ success: true, message: "Car updated successfully", car_plate });
                        }
                    );
                } else {
                    // Create new assignment
                    db.query(
                        'INSERT INTO driver_assignments (driver_id, car_plate, assigned_at, status) VALUES (?, ?, NOW(), "active")',
                        [driverId, car_plate],
                        (insertErr) => {
                            if (insertErr) {
                                return res.status(500).json({ success: false, error: insertErr.message });
                            }
                            res.json({ success: true, message: "Car assigned successfully", car_plate });
                        }
                    );
                }
            }
        );
    });
});

// Get trips for driver with car assignment check
app.get('/driver/trips', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    // First get driver's assigned car
    db.query(
        'SELECT car_plate FROM driver_assignments WHERE driver_id = ? AND status = "active"',
        [driverId],
        (err, carResult) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            const carPlate = carResult[0]?.car_plate;
            
            // If no car assigned, return empty array
            if (!carPlate) {
                return res.json([]);
            }
            
            // Get trips for the assigned car
            const sql = `
                SELECT 
                    lc.id as launch_car_id,
                    lc.car_plate,
                    lc.travel_time,
                    lc.available_sits,
                    l.travel_from,
                    l.travel_to,
                    l.price_amount,
                    cc.car_name,
                    cc.total_sits,
                    COALESCE(
                        (SELECT COUNT(*) 
                         FROM passenger_ticket pt 
                         WHERE pt.launch_car_id = lc.id 
                         AND pt.ticket_life_cycle = 'active'), 0
                    ) as passenger_count
                FROM launch_cars lc
                JOIN locations l ON lc.location_id = l.id
                JOIN company_cars cc ON lc.car_plate = cc.car_plate
                WHERE lc.car_plate = ?
                ORDER BY lc.travel_time ASC
            `;
            
            db.query(sql, [carPlate], (tripErr, trips) => {
                if (tripErr) {
                    return res.status(500).json({ success: false, error: tripErr.message });
                }
                res.json(trips || []);
            });
        }
    );
});

// Get tickets for driver's bus
app.get('/driver/tickets', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    db.query(
        'SELECT car_plate FROM driver_assignments WHERE driver_id = ? AND status = "active"',
        [driverId],
        (err, carResult) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            const carPlate = carResult[0]?.car_plate;
            
            if (!carPlate) {
                return res.json([]);
            }
            
            const sql = `
                SELECT 
                    pt.*,
                    l.travel_from,
                    l.travel_to,
                    lc.travel_time as scheduled_time
                FROM passenger_ticket pt
                JOIN launch_cars lc ON pt.launch_car_id = lc.id
                JOIN locations l ON pt.location_id = l.id
                WHERE lc.car_plate = ?
                ORDER BY pt.created_at DESC
            `;
            
            db.query(sql, [carPlate], (ticketErr, tickets) => {
                if (ticketErr) {
                    return res.status(500).json({ success: false, error: ticketErr.message });
                }
                res.json(tickets || []);
            });
        }
    );
});

// Update driver location
app.post('/driver/location', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { latitude, longitude, location_name, status, current_route } = req.body;
    
    const sql = `
        INSERT INTO driver_locations (driver_id, latitude, longitude, location_name, status, current_route, last_update)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            location_name = VALUES(location_name),
            status = VALUES(status),
            current_route = VALUES(current_route),
            last_update = NOW()
    `;
    
    db.query(sql, [driverId, latitude, longitude, location_name, status, current_route], (err) => {
        if (err) {
            console.error("Location update error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Location updated" });
    });
});

// Mark passengers as arrived (expire tickets)
app.post('/driver/mark-arrived', verifyToken, allowRoles('driver'), (req, res) => {
    const { launch_car_id, passenger_ids, location_name } = req.body;
    
    if (!passenger_ids || passenger_ids.length === 0) {
        return res.status(400).json({ success: false, message: "No passengers selected" });
    }
    
    const placeholders = passenger_ids.map(() => '?').join(',');
    const sql = `
        UPDATE passenger_ticket 
        SET ticket_life_cycle = 'expired',
            actual_dropoff_time = NOW()
        WHERE id IN (${placeholders})
    `;
    
    db.query(sql, passenger_ids, (err) => {
        if (err) {
            console.error("Error marking arrived:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: `${passenger_ids.length} passengers marked as arrived` });
    });
});
// =====================================================
// LAUNCH CARS (Updated with driver assignment trigger)
// =====================================================

// Create Launch Car (Manager)
app.post('/launch-cars', verifyToken, allowRoles('company-manager'), (req, res) => {
    const {
        car_plate,
        location_id,
        travel_time,
        available_sits,
        status
    } = req.body;

    db.query(
        `INSERT INTO launch_cars(
            car_plate,
            location_id,
            travel_time,
            available_sits,
            status
        ) VALUES (?, ?, ?, ?, ?)`,
        [car_plate, location_id, travel_time, available_sits, status || 'active'],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            // When a car is launched, make it available for driver assignment
            db.query(
                `UPDATE company_cars SET status = 'available' WHERE car_plate = ?`,
                [car_plate],
                (updateErr) => {
                    if (updateErr) {
                        console.error("Error updating car status:", updateErr);
                    }
                }
            );

            res.json({
                success: true,
                launch_car_id: result.insertId,
                message: "Car launched and available for driver assignment"
            });
        }
    );
});

// Get Launch Cars (with enhanced info)
app.get('/launch-cars', verifyToken, (req, res) => {
    let sql = `
        SELECT 
            lc.*,
            l.travel_from,
            l.travel_to,
            l.price_amount,
            cc.car_name,
            cc.total_sits,
            cc.status as car_status
        FROM launch_cars lc
        JOIN locations l ON lc.location_id = l.id
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
    `;
    
    const params = [];
    
    if (req.user.role === 'company-manager') {
        sql += ` WHERE cc.user_id = ?`;
        params.push(req.user.id);
    }
    
    sql += ` ORDER BY lc.travel_time ASC`;
    
    db.query(sql, params, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// Update Launch Car
app.put('/launch-cars/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    const { car_plate, location_id, travel_time, available_sits, status } = req.body;
    
    db.query(
        `UPDATE launch_cars 
         SET car_plate = ?, location_id = ?, travel_time = ?, available_sits = ?, status = ? 
         WHERE id = ?`,
        [car_plate, location_id, travel_time, available_sits, status, id],
        (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({ success: true, message: "Launch car updated" });
        }
    );
});

// Delete Launch Car
app.delete('/launch-cars/:id', verifyToken, allowRoles('company-manager'), (req, res) => {
    const { id } = req.params;
    
    // First get the car_plate before deleting
    db.query('SELECT car_plate FROM launch_cars WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        
        const carPlate = result[0]?.car_plate;
        
        db.query('DELETE FROM launch_cars WHERE id = ?', [id], (deleteErr) => {
            if (deleteErr) {
                return res.status(500).json(deleteErr);
            }
            
            // Check if there are any other launch cars for this car
            db.query(
                'SELECT COUNT(*) as count FROM launch_cars WHERE car_plate = ? AND status = "active"',
                [carPlate],
                (countErr, countResult) => {
                    if (!countErr && countResult[0].count === 0) {
                        // No active launches for this car, set status to inactive
                        db.query(
                            'UPDATE company_cars SET status = "inactive" WHERE car_plate = ?',
                            [carPlate]
                        );
                    }
                }
            );
            
            res.json({ success: true, message: "Launch car deleted" });
        });
    });
});

// Get available cars for driver (only cars with active launches)
app.get('/driver/available-cars', verifyToken, allowRoles('driver'), (req, res) => {
    const sql = `
        SELECT DISTINCT 
            cc.*,
            lc.id as launch_car_id,
            lc.travel_time,
            lc.available_sits as launch_available_sits,
            l.travel_from,
            l.travel_to,
            l.price_amount
        FROM company_cars cc
        JOIN launch_cars lc ON cc.car_plate = lc.car_plate
        JOIN locations l ON lc.location_id = l.id
        WHERE lc.status = 'active' 
        AND lc.travel_time > NOW()
        AND cc.status = 'available'
        AND cc.car_plate NOT IN (
            SELECT car_plate FROM driver_assignments WHERE status = 'active'
        )
        ORDER BY lc.travel_time ASC
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching available cars:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result || []);
    });
});

// Assign car to driver (only if car is launched)
app.post('/driver/assign-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { car_plate } = req.body;
    
    if (!car_plate) {
        return res.status(400).json({ success: false, message: "Car plate required" });
    }
    
    // Check if car has active launch
    db.query(
        `SELECT lc.*, cc.car_name, cc.total_sits 
         FROM launch_cars lc
         JOIN company_cars cc ON lc.car_plate = cc.car_plate
         WHERE lc.car_plate = ? AND lc.status = 'active' AND lc.travel_time > NOW()`,
        [car_plate],
        (err, launchResult) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (launchResult.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "This car has no active launch schedule. Please contact your manager." 
                });
            }
            
            // Check if driver already has an assigned car
            db.query(
                'SELECT * FROM driver_assignments WHERE driver_id = ? AND status = "active"',
                [driverId],
                (assignErr, assignResult) => {
                    if (assignErr) {
                        return res.status(500).json({ success: false, error: assignErr.message });
                    }
                    
                    const launchData = launchResult[0];
                    
                    if (assignResult.length > 0) {
                        // Update existing assignment
                        db.query(
                            `UPDATE driver_assignments 
                             SET car_plate = ?, assigned_at = NOW(), launch_car_id = ? 
                             WHERE driver_id = ? AND status = "active"`,
                            [car_plate, launchData.id, driverId],
                            (updateErr) => {
                                if (updateErr) {
                                    return res.status(500).json({ success: false, error: updateErr.message });
                                }
                                
                                // Update driver_locations with car info
                                updateDriverLocationWithCar(driverId, car_plate, launchData);
                                
                                res.json({ 
                                    success: true, 
                                    message: "Car updated successfully", 
                                    car_plate,
                                    launch_info: {
                                        travel_time: launchData.travel_time,
                                        travel_from: launchData.travel_from,
                                        travel_to: launchData.travel_to
                                    }
                                });
                            }
                        );
                    } else {
                        // Create new assignment
                        db.query(
                            `INSERT INTO driver_assignments (driver_id, car_plate, launch_car_id, assigned_at, status) 
                             VALUES (?, ?, ?, NOW(), "active")`,
                            [driverId, car_plate, launchData.id],
                            (insertErr) => {
                                if (insertErr) {
                                    return res.status(500).json({ success: false, error: insertErr.message });
                                }
                                
                                // Update driver_locations with car info
                                updateDriverLocationWithCar(driverId, car_plate, launchData);
                                
                                res.json({ 
                                    success: true, 
                                    message: "Car assigned successfully", 
                                    car_plate,
                                    launch_info: {
                                        travel_time: launchData.travel_time,
                                        travel_from: launchData.travel_from,
                                        travel_to: launchData.travel_to
                                    }
                                });
                            }
                        );
                    }
                }
            );
        }
    );
});

// Helper function to update driver_locations with assigned car
const updateDriverLocationWithCar = (driverId, car_plate, launchData) => {
    db.query(
        `INSERT INTO driver_locations (driver_id, car_plate, current_route, status, last_update)
         VALUES (?, ?, ?, 'offline', NOW())
         ON DUPLICATE KEY UPDATE
            car_plate = VALUES(car_plate),
            current_route = VALUES(current_route),
            last_update = NOW()`,
        [driverId, car_plate, `${launchData.travel_from}→${launchData.travel_to}`],
        (err) => {
            if (err) console.error("Error updating driver location:", err);
        }
    );
};

// Get driver's assigned car with launch info
app.get('/driver/assigned-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT 
            da.*,
            cc.car_name,
            cc.total_sits,
            cc.car_plate,
            lc.travel_time as scheduled_departure,
            lc.location_id,
            l.travel_from,
            l.travel_to,
            l.price_amount
        FROM driver_assignments da
        JOIN company_cars cc ON da.car_plate = cc.car_plate
        LEFT JOIN launch_cars lc ON da.launch_car_id = lc.id
        LEFT JOIN locations l ON lc.location_id = l.id
        WHERE da.driver_id = ? AND da.status = 'active'
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result[0] || null);
    });
});
// =====================================================
// DRIVER MANAGEMENT ENDPOINTS
// =====================================================

// Get driver's company cars that are launched
app.get('/driver/company-launched-cars', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    // First get driver's company_id
    const getCompanySql = `
        SELECT u.company_id 
        FROM company_driver cd
        JOIN users u ON cd.user_id = u.id
        WHERE cd.id = ?
    `;
    
    db.query(getCompanySql, [driverId], (err, companyResult) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        
        if (companyResult.length === 0) {
            return res.json([]);
        }
        
        const companyId = companyResult[0].company_id;
        
        // Get launched cars from driver's company only
        const sql = `
            SELECT 
                lc.id as launch_car_id,
                lc.car_plate,
                lc.travel_time,
                lc.available_sits,
                lc.status as launch_status,
                cc.car_name,
                cc.total_sits,
                l.id as location_id,
                l.travel_from,
                l.travel_to,
                l.price_amount,
                c.name as company_name
            FROM launch_cars lc
            JOIN company_cars cc ON lc.car_plate = cc.car_plate
            JOIN users u ON cc.user_id = u.id
            JOIN locations l ON lc.location_id = l.id
            JOIN company c ON u.company_id = c.id
            WHERE u.company_id = ? 
            AND lc.status = 'active'
            AND lc.travel_time > NOW()
            AND lc.car_plate NOT IN (
                SELECT car_plate FROM driver_assignments WHERE status = 'active'
            )
            ORDER BY lc.travel_time ASC
        `;
        
        db.query(sql, [companyId], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json(result);
        });
    });
});

// Assign car to driver
app.post('/driver/assign-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { launch_car_id, car_plate } = req.body;
    
    if (!launch_car_id || !car_plate) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    // Check if launch car exists and is active
    db.query(
        'SELECT * FROM launch_cars WHERE id = ? AND status = "active" AND travel_time > NOW()',
        [launch_car_id],
        (err, launchResult) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (launchResult.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "This car is not available for assignment" 
                });
            }
            
            // Check if driver already has assignment
            db.query(
                'SELECT * FROM driver_assignments WHERE driver_id = ? AND status = "active"',
                [driverId],
                (assignErr, assignResult) => {
                    if (assignErr) {
                        return res.status(500).json({ success: false, error: assignErr.message });
                    }
                    
                    if (assignResult.length > 0) {
                        // Update existing
                        db.query(
                            `UPDATE driver_assignments 
                             SET car_plate = ?, launch_car_id = ?, assigned_at = NOW() 
                             WHERE driver_id = ? AND status = "active"`,
                            [car_plate, launch_car_id, driverId],
                            (updateErr) => {
                                if (updateErr) {
                                    return res.status(500).json({ success: false, error: updateErr.message });
                                }
                                res.json({ success: true, message: "Car updated successfully" });
                            }
                        );
                    } else {
                        // Create new
                        db.query(
                            `INSERT INTO driver_assignments (driver_id, car_plate, launch_car_id, assigned_at, status) 
                             VALUES (?, ?, ?, NOW(), "active")`,
                            [driverId, car_plate, launch_car_id],
                            (insertErr) => {
                                if (insertErr) {
                                    return res.status(500).json({ success: false, error: insertErr.message });
                                }
                                res.json({ success: true, message: "Car assigned successfully" });
                            }
                        );
                    }
                }
            );
        }
    );
});

// Get driver's assigned car with launch info
app.get('/driver/my-assigned-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT 
            da.*,
            cc.car_name,
            cc.total_sits,
            lc.travel_time as departure_time,
            lc.available_sits,
            l.id as location_id,
            l.travel_from,
            l.travel_to,
            l.price_amount
        FROM driver_assignments da
        JOIN company_cars cc ON da.car_plate = cc.car_plate
        JOIN launch_cars lc ON da.launch_car_id = lc.id
        JOIN locations l ON lc.location_id = l.id
        WHERE da.driver_id = ? AND da.status = 'active'
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result[0] || null);
    });
});

// Get tickets for driver's assigned car
app.get('/driver/my-tickets', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT 
            pt.*,
            l.travel_from,
            l.travel_to,
            vt.verification_code
        FROM passenger_ticket pt
        JOIN launch_cars lc ON pt.launch_car_id = lc.id
        JOIN locations l ON pt.location_id = l.id
        JOIN driver_assignments da ON da.launch_car_id = lc.id
        LEFT JOIN verification_tokens vt ON vt.passenger_ticket_id = pt.id
        WHERE da.driver_id = ? AND da.status = 'active'
        ORDER BY pt.created_at DESC
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});

// Update driver location and auto-detect stop
app.post('/driver/update-location', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { latitude, longitude, location_name } = req.body;
    
    const sql = `
        INSERT INTO driver_locations (driver_id, latitude, longitude, location_name, last_update)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            location_name = VALUES(location_name),
            last_update = NOW()
    `;
    
    db.query(sql, [driverId, latitude, longitude, location_name], (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Location updated" });
    });
});

// Mark passengers as arrived at stop (expire tickets)
app.post('/driver/mark-arrived', verifyToken, allowRoles('driver'), (req, res) => {
    const { passenger_ids, stop_name } = req.body;
    
    if (!passenger_ids || passenger_ids.length === 0) {
        return res.status(400).json({ success: false, message: "No passengers selected" });
    }
    
    const placeholders = passenger_ids.map(() => '?').join(',');
    const sql = `
        UPDATE passenger_ticket 
        SET ticket_life_cycle = 'expired',
            actual_dropoff_time = NOW()
        WHERE id IN (${placeholders})
    `;
    
    db.query(sql, passenger_ids, (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: `Passengers marked as arrived at ${stop_name}` });
    });
});

// Get trip stops for a route
app.get('/trip-stops/:from/:to', (req, res) => {
    const { from, to } = req.params;
    
    const stops = {
        "Kigali-Huye": ["Kigali", "Muhanga", "Gitarama", "Kabuye", "Huye"],
        "Kigali-Musanze": ["Kigali", "Gakenke", "Bugarura", "Musanze"],
        "Kigali-Rubavu": ["Kigali", "Rubavu", "Gisenyi"],
    };
    
    const routeKey = `${from}-${to}`;
    const stopsList = stops[routeKey] || [from, to];
    
    res.json(stopsList);
});
// ================= DRIVER ENDPOINTS =================

// Get driver's assigned car// Get driver's assigned car
app.get('/driver/assigned-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    console.log("Getting assigned car for driver:", driverId);
    
    const sql = `
        SELECT 
            da.car_plate,
            da.launch_car_id,
            da.status,
            cc.car_name,
            cc.total_sits,
            lc.travel_time as travel_time,
            lc.available_sits,
            l.id as location_id,
            l.travel_from,
            l.travel_to,
            l.price_amount
        FROM driver_assignments da
        LEFT JOIN company_cars cc ON da.car_plate = cc.car_plate
        LEFT JOIN launch_cars lc ON da.launch_car_id = lc.id
        LEFT JOIN locations l ON lc.location_id = l.id
        WHERE da.driver_id = ? AND da.status = 'active'
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) {
            console.error("Error getting assigned car:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log("Assigned car result:", result);
        res.json(result[0] || null);
    });
});

// Get available launched cars for driver (from their company only)
// Get available launched cars for driver (from their company only)
app.get('/driver/available-cars', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    console.log("Driver ID:", driverId);
    
    // First get driver's company_id
    const getCompanySql = `
        SELECT u.company_id 
        FROM company_driver cd 
        JOIN users u ON cd.user_id = u.id 
        WHERE cd.id = ?
    `;
    
    db.query(getCompanySql, [driverId], (err, companyResult) => {
        if (err) {
            console.error("Error getting company:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        console.log("Company result:", companyResult);
        
        if (companyResult.length === 0) {
            return res.json([]);
        }
        
        const companyId = companyResult[0].company_id;
        console.log("Company ID:", companyId);
        
        // Get launched cars from driver's company only that are NOT already assigned
        const sql = `
            SELECT 
                lc.id as launch_car_id,
                lc.car_plate,
                lc.travel_time,
                lc.available_sits,
                lc.status as launch_status,
                cc.id as car_id,
                cc.car_name,
                cc.total_sits,
                l.id as location_id,
                l.travel_from,
                l.travel_to,
                l.price_amount,
                c.name as company_name
            FROM launch_cars lc
            INNER JOIN company_cars cc ON lc.car_plate = cc.car_plate
            INNER JOIN users u ON cc.user_id = u.id
            INNER JOIN locations l ON lc.location_id = l.id
            INNER JOIN company c ON u.company_id = c.id
            WHERE u.company_id = ? 
                AND lc.status = 'active'
                AND lc.travel_time > NOW()
                AND lc.car_plate NOT IN (
                    SELECT car_plate FROM driver_assignments WHERE status = 'active'
                )
            ORDER BY lc.travel_time ASC
        `;
        
        db.query(sql, [companyId], (err2, result) => {
            if (err2) {
                console.error("Error fetching available cars:", err2);
                return res.status(500).json({ success: false, error: err2.message });
            }
            
            console.log("Available cars found:", result.length);
            res.json(result);
        });
    });
});
// =====================================================
// MTN Mobile Money API Integration
// =====================================================

// MTN API Configuration
const MTN_CONFIG = {
    baseUrl: process.env.MTN_API_URL || "https://sandbox.mtn.com",
    clientId: process.env.MTN_CLIENT_ID,
    clientSecret: process.env.MTN_CLIENT_SECRET,
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
    callbackUrl: process.env.CALLBACK_URL || "http://localhost:5000/api/momo/callback"
};

// Generate OAuth token for MTN API
const getMtnToken = async () => {
    try {
        const response = await axios.post(
            `${MTN_CONFIG.baseUrl}/collection/token/`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
                    'Authorization': `Basic ${Buffer.from(`${MTN_CONFIG.clientId}:${MTN_CONFIG.clientSecret}`).toString('base64')}`
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("MTN Token error:", error);
        return null;
    }
};

// Request Payment (Send payment request to MTN API)
app.post('/api/momo/request-payment', async (req, res) => {
    const { amount, phoneNumber, transactionId, passengerName, route } = req.body;
    
    if (!amount || !phoneNumber || !transactionId) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    // Format phone number (remove leading 0, add 250)
    let formattedPhone = phoneNumber.toString();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '250' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('250')) {
        formattedPhone = '250' + formattedPhone;
    }
    
    try {
        const token = await getMtnToken();
        
        const paymentData = {
            amount: amount.toString(),
            currency: "EUR",
            externalId: transactionId,
            payer: {
                partyIdType: "MSISDN",
                partyId: formattedPhone
            },
            payerMessage: `Payment for ${route}`,
            payeeNote: `ROT Ticket - ${passengerName}`
        };
        
        const response = await axios.post(
            `${MTN_CONFIG.baseUrl}/collection/v1_0/requesttopay`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': transactionId,
                    'X-Target-Environment': 'sandbox',
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Store transaction in database
        const sql = `
            INSERT INTO momo_transactions (transaction_id, phone_number, amount, status, created_at)
            VALUES (?, ?, ?, 'pending', NOW())
        `;
        db.query(sql, [transactionId, phoneNumber, amount]);
        
        res.json({ 
            success: true, 
            message: "Payment request sent. Please check your phone for the prompt.",
            transactionId
        });
        
    } catch (error) {
        console.error("MTN Payment error:", error);
        
        // For demo/sandbox - simulate payment request
        const demoCode = Math.floor(100000 + Math.random() * 900000);
        
        res.json({ 
            success: true, 
            message: "Payment request sent (DEMO). Check your phone.",
            demoMode: true,
            demoCode: demoCode
        });
    }
});

// Check payment status
app.get('/api/momo/payment-status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        const token = await getMtnToken();
        
        const response = await axios.get(
            `${MTN_CONFIG.baseUrl}/collection/v1_0/requesttopay/${transactionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': 'sandbox',
                    'Ocp-Apim-Subscription-Key': MTN_CONFIG.subscriptionKey
                }
            }
        );
        
        // Update transaction status
        const status = response.data.status;
        db.query(
            'UPDATE momo_transactions SET status = ? WHERE transaction_id = ?',
            [status, transactionId]
        );
        
        res.json({ 
            success: true, 
            status: status,
            message: status === 'SUCCESSFUL' ? "Payment successful!" : "Payment pending..."
        });
        
    } catch (error) {
        console.error("Status check error:", error);
        
        // For demo - simulate successful payment after 5 seconds
        setTimeout(() => {
            db.query(
                'UPDATE momo_transactions SET status = "SUCCESSFUL" WHERE transaction_id = ?',
                [transactionId]
            );
        }, 5000);
        
        res.json({ 
            success: true, 
            status: 'PENDING',
            message: "Waiting for payment confirmation..."
        });
    }
});

// =====================================================
// SMS Service for Verification Codes (RENAMED to avoid duplicate)
// =====================================================

// Send SMS function - renamed to sendSmsVerification
const sendSmsVerification = async (phoneNumber, message) => {
    try {
        // For demo - log to console
        console.log(`SMS to ${phoneNumber}: ${message}`);
        
        // Real API - Africa's Talking
        /*
        const africastalking = require('africastalking')({
            apiKey: process.env.AFRICASTALKING_API_KEY,
            username: process.env.AFRICASTALKING_USERNAME
        });
        
        await africastalking.SMS.send({
            to: phoneNumber,
            message: message,
            from: "ROT"
        });
        */
        
        return { success: true };
    } catch (error) {
        console.error("SMS error:", error);
        return { success: false };
    }
};

// Generate and send verification code
app.post('/api/send-verification', async (req, res) => {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: "Phone number required" });
    }
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes expiry
    
    // Store verification code
    db.query(
        'INSERT INTO verification_codes (phone_number, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?',
        [phoneNumber, verificationCode, expiresAt, verificationCode, expiresAt],
        async (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database error" });
            }
            
            // Send SMS using renamed function
            const message = `ROT Transport: Your verification code is ${verificationCode}. Valid for 10 minutes.`;
            const smsResult = await sendSmsVerification(phoneNumber, message);
            
            res.json({ 
                success: true, 
                message: "Verification code sent to your phone",
                demoMode: process.env.NODE_ENV !== 'production',
                demoCode: process.env.NODE_ENV !== 'production' ? verificationCode : undefined
            });
        }
    );
});

// Verify code
app.post('/api/verify-code', (req, res) => {
    const { phoneNumber, code } = req.body;
    
    db.query(
        'SELECT * FROM verification_codes WHERE phone_number = ? AND code = ? AND expires_at > NOW()',
        [phoneNumber, code],
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Database error" });
            }
            
            if (result.length === 0) {
                return res.status(400).json({ success: false, message: "Invalid or expired code" });
            }
            
            // Delete used code
            db.query('DELETE FROM verification_codes WHERE phone_number = ?', [phoneNumber]);
            
            res.json({ success: true, message: "Code verified successfully" });
        }
    );
});

// =====================================================
// DRIVER ENDPOINTS (Your existing code continues below)
// =====================================================

// Assign car to driver
app.post('/driver/assign-car', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { launch_car_id, car_plate } = req.body;
    
    console.log("Assign car request:", { driverId, launch_car_id, car_plate });
    
    if (!launch_car_id || !car_plate) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    
    // Check if launch car exists and is active
    db.query(
        `SELECT lc.*, l.travel_from, l.travel_to, l.price_amount 
         FROM launch_cars lc 
         JOIN locations l ON lc.location_id = l.id 
         WHERE lc.id = ? AND lc.status = 'active' AND lc.travel_time > NOW()`,
        [launch_car_id],
        (err, launchResult) => {
            if (err) {
                console.error("Error checking launch car:", err);
                return res.status(500).json({ success: false, error: err.message });
            }
            
            if (launchResult.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "This bus is not available for assignment" 
                });
            }
            
            const launchData = launchResult[0];
            console.log("Launch car found:", launchData);
            
            // Check if driver already has an active assignment
            db.query(
                `SELECT * FROM driver_assignments WHERE driver_id = ? AND status = 'active'`,
                [driverId],
                (assignErr, assignResult) => {
                    if (assignErr) {
                        console.error("Error checking existing assignment:", assignErr);
                        return res.status(500).json({ success: false, error: assignErr.message });
                    }
                    
                    if (assignResult.length > 0) {
                        // Update existing assignment
                        db.query(
                            `UPDATE driver_assignments 
                             SET car_plate = ?, launch_car_id = ?, assigned_at = NOW() 
                             WHERE driver_id = ? AND status = 'active'`,
                            [car_plate, launch_car_id, driverId],
                            (updateErr) => {
                                if (updateErr) {
                                    console.error("Error updating assignment:", updateErr);
                                    return res.status(500).json({ success: false, error: updateErr.message });
                                }
                                
                                res.json({ 
                                    success: true, 
                                    message: "Car updated successfully",
                                    launch_info: {
                                        travel_from: launchData.travel_from,
                                        travel_to: launchData.travel_to,
                                        travel_time: launchData.travel_time,
                                        price_amount: launchData.price_amount
                                    }
                                });
                            }
                        );
                    } else {
                        // Create new assignment
                        db.query(
                            `INSERT INTO driver_assignments (driver_id, car_plate, launch_car_id, assigned_at, status) 
                             VALUES (?, ?, ?, NOW(), 'active')`,
                            [driverId, car_plate, launch_car_id],
                            (insertErr) => {
                                if (insertErr) {
                                    console.error("Error inserting assignment:", insertErr);
                                    return res.status(500).json({ success: false, error: insertErr.message });
                                }
                                
                                res.json({ 
                                    success: true, 
                                    message: "Car assigned successfully",
                                    launch_info: {
                                        travel_from: launchData.travel_from,
                                        travel_to: launchData.travel_to,
                                        travel_time: launchData.travel_time,
                                        price_amount: launchData.price_amount
                                    }
                                });
                            }
                        );
                    }
                }
            );
        }
    );
});

// Get driver's trips
app.get('/driver/trips', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT 
            lc.id as launch_car_id,
            lc.car_plate,
            lc.travel_time,
            lc.available_sits,
            l.travel_from,
            l.travel_to,
            l.price_amount,
            cc.car_name,
            cc.total_sits,
            COALESCE((SELECT COUNT(*) FROM passenger_ticket pt WHERE pt.launch_car_id = lc.id AND pt.ticket_life_cycle = 'active'), 0) as passenger_count
        FROM driver_assignments da
        JOIN launch_cars lc ON da.launch_car_id = lc.id
        JOIN locations l ON lc.location_id = l.id
        JOIN company_cars cc ON lc.car_plate = cc.car_plate
        WHERE da.driver_id = ? AND da.status = 'active'
        ORDER BY lc.travel_time ASC
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(result);
    });
});

// Get driver's tickets
app.get('/driver/tickets', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    
    const sql = `
        SELECT pt.*, l.travel_from, l.travel_to, vt.verification_code
        FROM driver_assignments da
        JOIN launch_cars lc ON da.launch_car_id = lc.id
        JOIN passenger_ticket pt ON pt.launch_car_id = lc.id
        JOIN locations l ON pt.location_id = l.id
        LEFT JOIN verification_tokens vt ON vt.passenger_ticket_id = pt.id
        WHERE da.driver_id = ? AND da.status = 'active'
        ORDER BY pt.created_at DESC
    `;
    
    db.query(sql, [driverId], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json(result);
    });
});

// Update driver location
app.post('/driver/location', verifyToken, allowRoles('driver'), (req, res) => {
    const driverId = req.user.id;
    const { latitude, longitude, location_name, status } = req.body;
    
    const sql = `
        INSERT INTO driver_locations (driver_id, latitude, longitude, location_name, status, last_update)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            location_name = VALUES(location_name),
            status = VALUES(status),
            last_update = NOW()
    `;
    
    db.query(sql, [driverId, latitude, longitude, location_name, status || 'active'], (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: "Location updated" });
    });
});

// Mark passengers as arrived (expire tickets)
app.post('/driver/mark-arrived', verifyToken, allowRoles('driver'), (req, res) => {
    const { passenger_ids, location_name } = req.body;
    
    if (!passenger_ids || passenger_ids.length === 0) {
        return res.status(400).json({ success: false, message: "No passengers selected" });
    }
    
    const placeholders = passenger_ids.map(() => '?').join(',');
    const sql = `UPDATE passenger_ticket SET ticket_life_cycle = 'expired', actual_dropoff_time = NOW() WHERE id IN (${placeholders})`;
    
    db.query(sql, passenger_ids, (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: `${passenger_ids.length} passengers marked as arrived at ${location_name}` });
    });
});
// =====================================================
// GET ALL ACTIVE DRIVER LOCATIONS (for manager)
// =====================================================
app.get('/manager/driver-locations', verifyToken, allowRoles('company-manager'), (req, res) => {
    const companyId = req.user.company_id;
    
    const sql = `
        SELECT 
            dl.id,
            dl.driver_id,
            dl.latitude,
            dl.longitude,
            dl.location_name,
            dl.status,
            dl.current_route,
            dl.last_update,
            cd.driver_name,
            cd.phone_number,
            cc.car_plate,
            cc.car_name
        FROM driver_locations dl
        JOIN company_driver cd ON dl.driver_id = cd.id
        JOIN users u ON cd.user_id = u.id
        LEFT JOIN company_cars cc ON cc.user_id = u.id
        WHERE u.company_id = ? AND dl.status = 'active'
        ORDER BY dl.last_update DESC
    `;
    
    db.query(sql, [companyId], (err, result) => {
        if (err) {
            console.error("Driver locations error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(result);
    });
});
// Get available launched cars for station (only from station's company)
app.get('/station/available-cars', verifyToken, allowRoles('station'), (req, res) => {
    const stationId = req.user.id;
    // Get station's company_id
    db.query(
        `SELECT u.company_id FROM company_station cs JOIN users u ON cs.user_id = u.id WHERE cs.id = ?`,
        [stationId],
        (err, result) => {
            if (err || result.length === 0) {
                return res.status(500).json({ error: "Station not found" });
            }
            const companyId = result[0].company_id;
            const sql = `
                SELECT 
                    lc.id,
                    lc.car_plate,
                    lc.travel_time,
                    lc.available_sits,
                    cc.car_name,
                    l.id as location_id,
                    l.travel_from,
                    l.travel_to,
                    l.price_amount,
                    c.name as company_name
                FROM launch_cars lc
                JOIN company_cars cc ON lc.car_plate = cc.car_plate
                JOIN users u ON cc.user_id = u.id
                JOIN locations l ON lc.location_id = l.id
                JOIN company c ON u.company_id = c.id
                WHERE u.company_id = ? 
                  AND lc.status = 'active' 
                  AND lc.available_sits > 0 
                  AND lc.travel_time > NOW()
                ORDER BY lc.travel_time ASC
            `;
            db.query(sql, [companyId], (err2, cars) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json(cars);
            });
        }
    );
});


// Get driver's company info
app.get('/driver/company-info', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const sql = `
    SELECT c.id, c.name, c.status 
    FROM company_driver cd
    JOIN users u ON cd.user_id = u.id
    JOIN company c ON u.company_id = c.id
    WHERE cd.id = ?
  `;
  db.query(sql, [driverId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0] || null);
  });
});

// Get driver's selected car (not assigned)
app.get('/driver/selected-car', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const sql = `
    SELECT ds.*, lc.travel_time, lc.available_sits, lc.car_plate,
           l.travel_from, l.travel_to, l.price_amount, cc.car_name
    FROM driver_selections ds
    JOIN launch_cars lc ON ds.launch_car_id = lc.id
    JOIN locations l ON lc.location_id = l.id
    JOIN company_cars cc ON lc.car_plate = cc.car_plate
    WHERE ds.driver_id = ? AND ds.status = 'active'
  `;
  db.query(sql, [driverId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0] || null);
  });
});

// Driver selects a car to drive
app.post('/driver/select-car', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const { launch_car_id, car_plate } = req.body;
  
  // Check if car belongs to driver's company
  db.query(`
    SELECT lc.* FROM launch_cars lc
    JOIN company_cars cc ON lc.car_plate = cc.car_plate
    JOIN users u ON cc.user_id = u.id
    JOIN company_driver cd ON cd.user_id = u.id
    WHERE cd.id = ? AND lc.id = ?
  `, [driverId, launch_car_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(403).json({ success: false, message: "Not authorized to select this bus" });
    }
    
    // Insert or update driver selection
    const sql = `
      INSERT INTO driver_selections (driver_id, launch_car_id, car_plate, selected_at, status)
      VALUES (?, ?, ?, NOW(), 'active')
      ON DUPLICATE KEY UPDATE
        launch_car_id = VALUES(launch_car_id),
        car_plate = VALUES(car_plate),
        selected_at = NOW(),
        status = 'active'
    `;
    db.query(sql, [driverId, launch_car_id, car_plate], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ success: true, message: "Car selected successfully" });
    });
  });
});



// Get driver's assigned launch
app.get('/driver/assigned-launch', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const sql = `
    SELECT lc.*, l.travel_from, l.travel_to, l.price_amount, cc.car_name
    FROM launch_cars lc
    JOIN locations l ON lc.location_id = l.id
    JOIN company_cars cc ON lc.car_plate = cc.car_plate
    WHERE lc.assigned_driver_id = ? AND lc.trip_status IN ('scheduled', 'active')
    ORDER BY lc.travel_time ASC
    LIMIT 1
  `;
  db.query(sql, [driverId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0] || null);
  });
});

// Get available launches (not assigned to any driver)
app.get('/driver/available-launches', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const sql = `
    SELECT lc.*, l.travel_from, l.travel_to, l.price_amount, cc.car_name, cc.total_sits
    FROM launch_cars lc
    JOIN locations l ON lc.location_id = l.id
    JOIN company_cars cc ON lc.car_plate = cc.car_plate
    WHERE lc.status = 'active' 
      AND lc.travel_time > NOW()
      AND lc.available_sits > 0
      AND (lc.assigned_driver_id IS NULL OR lc.trip_status = 'scheduled')
    ORDER BY lc.travel_time ASC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Assign launch to driver
app.post('/driver/assign-launch', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const { launch_id } = req.body;
  
  db.query(
    `UPDATE launch_cars 
     SET assigned_driver_id = ?, trip_status = 'scheduled'
     WHERE id = ? AND (assigned_driver_id IS NULL OR trip_status = 'scheduled')`,
    [driverId, launch_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, message: "Launch not available" });
      }
      res.json({ success: true, message: "Launch assigned successfully" });
    }
  );
});

// Start trip
app.post('/driver/start-trip', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const { launch_id, started_at } = req.body;
  
  db.query(
    `UPDATE launch_cars 
     SET trip_status = 'active', actual_departure_time = ?, started_by_driver_id = ?
     WHERE id = ? AND assigned_driver_id = ? AND trip_status = 'scheduled'`,
    [started_at, driverId, launch_id, driverId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "Trip started" });
    }
  );
});

// End trip
app.post('/driver/end-trip', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const { launch_id, arrived_at } = req.body;
  
  db.query(
    `UPDATE launch_cars 
     SET trip_status = 'completed', actual_arrival_time = ?, completed_by_driver_id = ?
     WHERE id = ? AND assigned_driver_id = ? AND trip_status = 'active'`,
    [arrived_at, driverId, launch_id, driverId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: "Trip completed" });
    }
  );
});

// Get driver's trip history
app.get('/driver/my-trips', verifyToken, allowRoles('driver'), (req, res) => {
  const driverId = req.user.id;
  const sql = `
    SELECT lc.*, l.travel_from, l.travel_to, l.price_amount, cc.car_name,
           (SELECT COUNT(*) FROM passenger_ticket pt WHERE pt.launch_car_id = lc.id) as passenger_count
    FROM launch_cars lc
    JOIN locations l ON lc.location_id = l.id
    JOIN company_cars cc ON lc.car_plate = cc.car_plate
    WHERE lc.assigned_driver_id = ?
    ORDER BY lc.travel_time DESC
  `;
  db.query(sql, [driverId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =====================================================
// SERVER
// =====================================================

app.listen(process.env.PORT, () => {

    console.log(`
        =====================================
        ROT BACKEND RUNNING
        PORT: ${process.env.PORT}
        =====================================
    `);
});