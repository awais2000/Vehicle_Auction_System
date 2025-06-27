import express from "express"; 
import pool from "../config/db.js";
import fs from 'fs/promises';
import path from 'path';



export const createBid = async (req, res) => {
    try {
        const {userId, vehicleId, sellerOffer, startTime, endTime, saleStatus} = req.body;

        if(!userId || !vehicleId || !sellerOffer || !saleStatus || !startTime || !endTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [getBid] = await pool.query(`SELECT * FROM tbl_bid WHERE userId = ? AND vehicleId = ?`, [userId, vehicleId]);
        if (getBid.length > 0) {
            return res.status(400).json({ message: "Bid already exists for this vehicle" });
        }

        const [query] =await pool.query(`INSERT INTO tbl_bid (userId, vehicleId, sellerOffer, startTime, endTime, saleStatus) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [userId, vehicleId, sellerOffer, startTime, endTime, saleStatus]
        );

        const id = query.insertId;

        const [bid] = await pool.query(`SELECT v.*, b.* FROM tbl_bid b
            join tbl_vehicles v on v.id = b.vehicleId 
            WHERE b.id = ?`, [id]);

            await pool.query(`UPDATE tbl_bid SET auctionStatus = 'live' WHERE id = ?`, [vehicleId]);

        res.status(201).json({message: "Bid created successfully",
            ...bid[0]
         });

    } catch (error) {
        console.error("Error creating bid:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}




export const startBidding = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { userId, vehicleId, maxBid, monsterBid } = req.body;
        console.log('Bid request:', req.body);

        // Validate input
        if (!userId || !vehicleId || (!maxBid && !monsterBid)) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false,
                message: "userId, vehicleId, and either maxBid or monsterBid are required." 
            });
        }

        // Validate bid types are mutually exclusive
        if (maxBid && monsterBid) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Cannot submit both maxBid and monsterBid"
            });
        }

        const yourOffer = maxBid || monsterBid;
        const bidType = maxBid ? 'Max Bid' : 'Monster Bid';


        const [vehicle] = await connection.query(
            'SELECT * FROM tbl_vehicles WHERE id = ? AND vehicleStatus = "Y"',
            [vehicleId]
        );

        if (vehicle.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Vehicle not found or not available for bidding" 
            });
        }

        const [getSale] = await connection.query(
            `SELECT * FROM tbl_bid WHERE vehicleId = ?`,
            [vehicleId]
        );

        let saleStatus = 'pending'; // Fallback
        if (getSale.length > 0) {
            saleStatus = getSale[0].saleStatus;
        } else {
            console.warn(`No existing bid found for vehicleId ${vehicleId}, defaulting saleStatus to "pending"`);
        }

        const [existingUserBid] = await connection.query(`
            SELECT * FROM tbl_bid 
            WHERE userId = ? AND vehicleId = ?
        `, [userId, vehicleId]);

        console.log('Sale status:', saleStatus);

        let resultQuery;

        if (existingUserBid.length > 0) {
            await connection.query(`
                UPDATE tbl_bid 
                SET yourOffer = ?, 
                    maxBid = ?, 
                    monsterBid = ?,
                    saleStatus = ?,
                    updatedAt = NOW()
                WHERE userId = ? AND vehicleId = ? AND bidApprStatus = ?
            `, [yourOffer, maxBid, monsterBid, saleStatus, userId, vehicleId, 'ongoing']);

            [resultQuery] = await connection.query(`
                SELECT v.*, b.* 
                FROM tbl_bid b
                JOIN tbl_vehicles v ON v.id = b.vehicleId 
                WHERE b.userId = ? AND b.vehicleId = ?
            `, [userId, vehicleId]);

        } else {
            const [insertBid] = await connection.query(`
                INSERT INTO tbl_bid 
                (userId, vehicleId, yourOffer, maxBid, monsterBid, saleStatus, bidApprStatus, createdAt, updatedAt, startTime)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
            `, [userId, vehicleId, yourOffer, maxBid, monsterBid, saleStatus, 'ongoing']);

            [resultQuery] = await connection.query(`
                SELECT v.*, b.* 
                FROM tbl_bid b
                JOIN tbl_vehicles v ON v.id = b.vehicleId 
                WHERE b.id = ?
            `, [insertBid.insertId]);
        }

        const [checkstatusRows] = await connection.query(
            `SELECT * FROM tbl_bid WHERE vehicleId = ?`,
            [vehicleId]
        );

        let checkStat = 'pending'; // Default fallback
        if (checkstatusRows.length > 0) {
            checkStat = checkstatusRows[0].bidApprStatus;
        } else {
            console.warn(`No bid found for vehicleId ${vehicleId}, defaulting bidApprStatus to "pending"`);
        }

        if (checkStat === 'completed') {
            await connection.rollback();
            return res.send({ message: "Bidding is already completed" });
        }

        await connection.commit();

        res.status(200).json({
            ...resultQuery[0] 
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error in startBidding:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to process bid",
            error: error.message 
        });
    } finally {
        connection.release();
    }
};





export const endBidding = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const id = req.params.id;
        const { bidApprStatus } = req.body;

        if (!bidApprStatus) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false,
                message: "bidApprStatus is required" 
            });
        }

        const [bid] = await connection.query(
            `SELECT * FROM tbl_bid WHERE id = ?`, 
            [id]
        );

        if (bid.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Bid not found" 
            });
        }

        const vehicleID = bid[0].vehicleId;

        const [update] = await connection.query(
            `UPDATE tbl_bid SET bidApprStatus = ? WHERE vehicleId = ?`,
            [bidApprStatus, vehicleID]
        );

        if (update.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Failed to update bids" 
            });
        }

        // Find the winning bid (highest yourOffer)
        const [result] = await connection.query(`
            SELECT * FROM tbl_bid 
            WHERE vehicleId = ? 
            ORDER BY yourOffer DESC 
            LIMIT 1
        `, [vehicleID]);

        if (result.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false,
                message: "No bids found for this vehicle" 
            });
        }

        const winnerId = result[0].userId;
        const winPrice = result[0].yourOffer;

        // Update winner status
        await connection.query(`
            UPDATE tbl_bid 
            SET winStatus = 'Won' 
            WHERE userId = ? AND vehicleId = ?
        `, [winnerId, vehicleID]);

        // Update loser statuses
        await connection.query(`
            UPDATE tbl_bid 
            SET winStatus = 'Lost' 
            WHERE userId != ? AND vehicleId = ?
        `, [winnerId, vehicleID]);

        // Get updated bid information
        const [updatedBids] = await connection.query(`
            SELECT * FROM tbl_bid 
            WHERE vehicleId = ?
        `, [vehicleID]);

        const [final] = await pool.query(`select * from tbl_bid where vehicleId = ? and  winStatus = 'Won'`, [vehicleID]);

        await pool.query(`UPDATE tbl_bid SET auctionStatus = 'end' WHERE id = ?`, [vehicleID]);


        await connection.commit();

        res.status(200).json({
            ...final[0]
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error ending bidding:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    } finally {
        connection.release();
    }
};




// export const getBids = async (req, res) => {
//     try {
//         const getBids = await pool.query(`SELECT * FROM tbl_bid where status = 'Y'`);
//         if (getBids.length === 0) {
//             return res.status(404).json({ message: "No bids found" });
//         }

//     } catch (error) {
//         console.error("Error fetching bids:", error);
//         res.status(500).json({ message: "Internal server error" });
        
//     }
// }
export const addToAuction = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        console.log(vehicleId);
        const [inserted] = await pool.query(`insert into tbl_bid (vehicleId, bidApprStatus) values (?, 'initialized')`, [vehicleId]);

        const insertedId = inserted.insertId;
        if (!insertedId) {
            return res.status(400).json({ message: "Failed to add vehicle to auction" });
        }
        
        const [vehicle] = await pool.query(`SELECT * FROM tbl_bid WHERE vehicleId = ?`, [vehicleId]);
        res.status(200).json({...vehicle[0]});
    } catch (error) {
        console.error("Error adding to auction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}





export const getAuctionVehicle = async (req, res) => {
    try {
        const [vehicles] = await pool.query(`
            SELECT b.*, v.* 
            FROM tbl_bid b 
            JOIN tbl_vehicles v ON b.vehicleId = v.id 
            WHERE bidApprStatus = 'initialized'
        `);

        if (vehicles.length === 0) {
            return res.status(404).json({ message: "No vehicles found for auction" });
        }

        const vehiclesWithImages = await Promise.all(vehicles.map(async (vehicle) => {
            try {
                if (!vehicle.image) return { ...vehicle, image: null };

                const fullPath = path.join(process.cwd(), vehicle.image);
                if (!fs.existsSync(fullPath)) {
                    console.warn(`Image not found at path: ${fullPath}`);
                    return { ...vehicle, image: null };
                }

                const buffer = fs.readFileSync(fullPath);
                const ext = path.extname(fullPath).toLowerCase().slice(1);
                return {
                    ...vehicle,
                    image: `data:image/${ext};base64,${buffer.toString('base64')}`
                };
            } catch (error) {
                console.error(`Image processing failed for vehicle ${vehicle.id}`, error);
                return { ...vehicle, image: null };
            }
        }));

        res.status(200).json(vehiclesWithImages);
    } catch (error) {
        console.error("Error fetching auction vehicles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};