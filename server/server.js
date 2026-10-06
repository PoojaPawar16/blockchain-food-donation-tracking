// ==========================================
// FoodChain - Backend Server
// ==========================================

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// MYSQL CONNECTION
// ==========================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// ==========================================
// CONNECT TO MYSQL
// ==========================================

db.connect((err) => {

    if (err) {

        console.error(
            "❌ MySQL connection failed:",
            err.message
        );

        return;
    }

    console.log(
        "✅ Connected to MySQL database"
    );
});

// ==========================================
// TEST BACKEND
// ==========================================

app.get("/", (req, res) => {

    res.send(
        "Food Donation Backend is running!"
    );

});

// ==========================================
// GET ALL DONATIONS
// ==========================================

app.get("/api/donations", (req, res) => {

    const sql = `
        SELECT
            donation_id,
            donor_name,
            food_type,
            quantity,
            donation_date,
            receiver_name,
            status,
            transaction_hash,
            created_at
        FROM donations
        ORDER BY donation_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching donations:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to fetch donations"
            });
        }

        const donations =
            results.map((row) => ({

                id:
                    row.donation_id,

                donorName:
                    row.donor_name,

                foodType:
                    row.food_type,

                quantity:
                    Number(row.quantity),

                donationDate:
                    row.donation_date,

                receiver:
                    row.receiver_name,

                status:
                    row.status,

                transactionHash:
                    row.transaction_hash,

                createdAt:
                    row.created_at

            }));

        res.json(donations);

    });

});

// ==========================================
// ADD NEW DONATION
// ==========================================

app.post("/api/donations", (req, res) => {

    const {
        donorName,
        foodType,
        quantity,
        donationDate,
        receiver,
        transactionHash
    } = req.body;

    // ==========================================
    // VALIDATE FIELDS
    // ==========================================

    if (
        !donorName ||
        !foodType ||
        !quantity ||
        !donationDate ||
        !receiver ||
        !transactionHash
    ) {

        return res.status(400).json({

            message:
                "All fields are required"

        });

    }

    // ==========================================
    // INSERT DONATION
    // ==========================================

    const sql = `
        INSERT INTO donations
        (
            donor_name,
            food_type,
            quantity,
            donation_date,
            receiver_name,
            status,
            transaction_hash
        )
        VALUES (?, ?, ?, ?, ?, 'Donated', ?)
    `;

    db.query(
        sql,

        [
            donorName,
            foodType,
            quantity,
            donationDate,
            receiver,
            transactionHash
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "Error adding donation:",
                    err
                );

                return res.status(500).json({

                    message:
                        "Failed to add donation"

                });

            }

            res.status(201).json({

                message:
                    "Donation saved successfully",

                donationId:
                    result.insertId,

                transactionHash:
                    transactionHash

            });

        }
    );

});

// ==========================================
// UPDATE DONATION STATUS
// ==========================================

app.put(
    "/api/donations/:id/status",
    (req, res) => {

        const donationId =
            req.params.id;

        const { status } =
            req.body;

        // ==========================================
        // ALLOWED STATUSES
        // ==========================================

        const allowedStatuses = [
            "Donated",
            "Received",
            "Distributed"
        ];

        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid donation status"

            });

        }

        // ==========================================
        // UPDATE STATUS
        // ==========================================

        const sql = `
            UPDATE donations
            SET status = ?
            WHERE donation_id = ?
        `;

        db.query(
            sql,

            [
                status,
                donationId
            ],

            (err, result) => {

                if (err) {

                    console.error(
                        "Error updating donation status:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to update donation status"

                    });

                }

                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Donation not found"

                    });

                }

                res.json({

                    message:
                        "Donation status updated successfully"

                });

            }
        );

    }
);

// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Backend running at http://localhost:${PORT}`
        );

    }
);