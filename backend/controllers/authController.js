import express from "express"; 
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import   { resolve }  from 'path';
import fs from 'fs';
import path from 'path';



export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body; 

       // 1. Fetch user by email
        const [users] = await pool.query("SELECT * FROM tbl_users WHERE email = ?", [email]);

//  2. Check if user exists
        if (users.length === 0) {
            return res.status(400).json({ 
                status: 400, 
                message: "Invalid email or password" 
            });
        }

        let user = users[0];

//  3. Validate role after confirming user exists
if (role.toLowerCase() !== user.role.toLowerCase()) {
    return res.status(403).json({ message: "Select your correct role!" });
}

        
        // 2. Check if user exists
        if (users.length === 0) {
            return res.status(400).json({ 
                status: 400, 
                message: "Invalid email or password" 
            });
        }

         user = users[0];

        // 3. Check account status
        if (user.status === 'N') {
            return res.status(403).json({ 
                status: 403, 
                message: "Account deactivated. Contact support." 
            });
        }

        // 4. Password verification
        let storedPassword = user.password;
        const isHashed = storedPassword.startsWith("$2b$");

        // Auto-upgrade plain text passwords
        if (!isHashed) {
            console.log("Upgrading password security...");
            const hashedPassword = await bcrypt.hash(storedPassword, 10);
            await pool.query(
                "UPDATE tbl_users SET password = ? WHERE email = ?", 
                [hashedPassword, email]
            );
            storedPassword = hashedPassword;
        }

        // 5. Compare passwords
        const isMatch = await bcrypt.compare(password, storedPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                status: 400, 
                message: "Invalid email or password" 
            });
        }

        // 6. Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email, 
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 7. Send successful response
        res.json({
            status: 200,
            message: "Login successful", 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                contact: user.contact,
                cnic: user.cnic,
                address: user.address,
                postcode: user.postcode,
                image: user.image,
                role: user.role,
                date: user.date
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            status: 500, 
            message: "Internal server error" 
        });
    }
};

 



export const registerBusinessMember = async (req, res) => {
  try {
    const {
      name, contact, cnic, address,
      postcode, email, password, role
    } = req.body;

    if (!name || !contact || !cnic || !address || !postcode || !email || !password || !role) {
      return res.status(400).json({ status: 400, message: "All fields are required" });
    }

    const imagePath = req.file?.path.replace(/\\/g, "/") || null;

    const [existing] = await pool.query("SELECT * FROM tbl_users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ status: 400, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await pool.query(
      `INSERT INTO tbl_users (
        name, contact, cnic, address,
        postcode, email, password, image,
        date, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE(), ?)`,
      [name, contact, cnic, address, postcode, email, hashedPassword, imagePath, role]
    );

    const newUserId = insertResult.insertId;
    const [newUser] = await pool.query("SELECT * FROM tbl_users WHERE id = ?", [newUserId]);

    res.status(201).json({
      ...newUser[0]
    });

  } catch (error) {
    console.error(" Error registering business member:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};





export const getuploadfile = async (req, res) => {
    res.sendFile(resolve('./controllers/uploadfile.html')); 
};





export const getRegisteredMembers = async (req, res) => {
    try {
        // Default values
        const defaultLimit = 10;
        const defaultPage = 1;
        
        // Get from query params
        const entry = parseInt(req.query.entry) || defaultLimit;
        const page = parseInt(req.query.page) || defaultPage;

        const limit = Math.max(1, entry);
        const offset = (Math.max(1, page) - 1) * limit;

        // Include image column in SELECT
        const [rows] = await pool.query(
          `SELECT name, contact, cnic, address, postcode, 
           email, password, date, role, image
           FROM tbl_users 
           WHERE status = 'Y' 
           LIMIT ? OFFSET ?`,
          [limit, offset]
        );

        if (!rows?.length) {
          return res.status(404).json({ message: "No members found" });
        }

        // Process images with proper path resolution
        const users = await Promise.all(rows.map(async (user) => {
            try {
                if (!user.image) return { ...user, image: null };
                
                const fullPath = path.join(process.cwd(), user.image);
                if (!fs.existsSync(fullPath)) {
                    console.warn(`Image not found at path: ${fullPath}`);
                    return { ...user, image: null };
                }

                const buffer = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).toLowerCase().slice(1);
                return {
                    ...user,
                    image: `data:image/${ext};base64,${buffer.toString('base64')}`
                };
            } catch (error) {
                console.error(`Image processing failed for user ${user.id}`, error);
                return { ...user, image: null };
            }
        }));
        
        // Return users with base64 images or null
        return res.status(200).json(users);

    } catch (error) {
        console.error("Failed to fetch members:", error);
        return res.status(500).json({ 
            success: false,
            error: "Server error",
            message: error.message 
        });
    }
};




export const updateBusinessMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, cnic, address, postcode, email, password, role } = req.body;
    const imagePath = req.file?.path.replace(/\\/g, "/") || null;

    // Validate required fields
    if (!name || !contact || !cnic || !address || !postcode || !email || !role) {
      return res.status(400).json({ status: 400, message: "All fields are required" });
    }

    // Check if user exists
    const [user] = await pool.query("SELECT * FROM tbl_users WHERE id = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Hash password if it's updated
    let hashedPassword = user[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Single update statement (no role branching)
    await pool.query(
      `UPDATE tbl_users 
       SET name = ?, contact = ?, cnic = ?, address = ?, 
           postcode = ?, email = ?, password = ?, image = ?, role = ? 
       WHERE id = ?`,
      [
        name,
        contact,
        cnic,
        address,
        postcode,
        email,
        hashedPassword,
        imagePath,
        role,
        id
      ]
    );

    // Fetch and return updated user
    const [updatedUser] = await pool.query("SELECT * FROM tbl_users WHERE id = ?", [id]);
    res.status(200).json({ ...updatedUser[0] });

  } catch (error) {
    console.error(" Error updating user:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};
      




export const deleteBusinessMember = async (req, res) => {
    try {
        const { id } = req.params;
        const [user] = await pool.query("SELECT * FROM tbl_users WHERE id = ?", [id]);
        if (user.length === 0) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        await pool.query("UPDATE tbl_users SET status = 'N' WHERE id = ?", [id]);
        res.status(200).json({ status: 200, message: "User Deleted successfully" });
    } catch (error) {
        console.error(" Error deactivating user:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
}