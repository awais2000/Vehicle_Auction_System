import express from  'express';
import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';



export const myBids = async (req, res) => {
    try {
        const userId = req.params.id;

        const {
            page = 1,
            limit = 10,
            search = '',
            sortField = 'v.id',
            sortOrder = 'DESC'
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit));
        const offset = (pageNumber - 1) * limitNumber;

        let baseQuery = `
            SELECT b.*, v.*
            FROM tbl_vehicles v
            JOIN tbl_bid b ON v.id = b.vehicleId
            WHERE b.userId = ? AND v.vehicleStatus = 'Y'
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM tbl_vehicles v
            JOIN tbl_bid b ON v.id = b.vehicleId
            WHERE b.userId = ? AND v.vehicleStatus = 'Y'
        `;

        const queryParams = [userId];
        const countParams = [userId];

        if (search) {
            const searchCondition = `
                AND (
                    v.make LIKE ? OR 
                    v.model LIKE ? OR 
                    v.vin LIKE ? OR 
                    v.color LIKE ? OR
                    b.estRetailValue LIKE ?
                )
            `;
            const searchTerm = `%${search}%`;

            baseQuery += searchCondition;
            countQuery += searchCondition;

            queryParams.push(...Array(5).fill(searchTerm));
            countParams.push(...Array(5).fill(searchTerm));
        }

        const validSortFields = ['v.id', 'v.make', 'v.model', 'v.year', 'b.maxBid', 'b.estRetailValue'];
        const safeSortField = validSortFields.includes(sortField) ? sortField : 'v.id';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        baseQuery += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
        baseQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(limitNumber, offset);

        const [bids] = await pool.query(baseQuery, queryParams);
        const [[totalCount]] = await pool.query(countQuery, countParams);
        const total = totalCount.total;

        if (bids.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bids found matching your criteria'
            });
        }

        //  Base64 encode vehicle images
        const processedBids = await Promise.all(
            bids.map(async (bid) => {
                if (bid.image) {
                    try {
                        const imagePath = path.join(process.cwd(), bid.image); // e.g., uploads/car1.jpg
                        if (fs.existsSync(imagePath)) {
                            const buffer = fs.readFileSync(imagePath);
                            const ext = path.extname(imagePath).slice(1).toLowerCase();
                            bid.image = `data:image/${ext};base64,${buffer.toString('base64')}`;
                        } else {
                            console.warn(`Image not found at ${imagePath}`);
                            bid.image = null;
                        }
                    } catch (err) {
                        console.error(`Failed to process image for vehicle ${bid.vehicleId}:`, err);
                        bid.image = null;
                    }
                }
                return bid;
            })
        );

        res.status(200).json(processedBids);

    } catch (error) {
        console.error("Error in myBids controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



export const sellerBids = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const {
            page = 1,
            limit = 10,
            search = '',
            sortField = 'v.id',
            sortOrder = 'DESC'
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit));
        const offset = (pageNumber - 1) * limitNumber;

        let baseQuery = `
            SELECT b.*, v.*
            FROM tbl_vehicles v
            JOIN tbl_bid b ON v.id = b.vehicleId
            WHERE b.userId = ? AND v.vehicleStatus = 'Y'
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM tbl_vehicles v
            JOIN tbl_bid b ON v.id = b.vehicleId
            WHERE b.userId = ? AND v.vehicleStatus = 'Y'
        `;

        const queryParams = [userId];
        const countParams = [userId];

        if (search) {
            const searchCondition = `
                AND (
                    v.make LIKE ? OR 
                    v.model LIKE ? OR 
                    v.vin LIKE ? OR 
                    v.color LIKE ? OR
                    b.estRetailValue LIKE ?
                )
            `;
            const searchTerm = `%${search}%`;

            baseQuery += searchCondition;
            countQuery += searchCondition;

            queryParams.push(...Array(5).fill(searchTerm));
            countParams.push(...Array(5).fill(searchTerm));
        }

        const validSortFields = ['v.id', 'v.make', 'v.model', 'v.year', 'b.maxBid', 'b.estRetailValue'];
        const safeSortField = validSortFields.includes(sortField) ? sortField : 'v.id';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        baseQuery += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
        baseQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(limitNumber, offset);

        const [bids] = await pool.query(baseQuery, queryParams);

        const [[totalCount]] = await pool.query(countQuery, countParams);
        const total = totalCount.total;

        var vehiclesIds = [];

        for (let i=0; i<bids.length; i++) {
            vehiclesIds.push(bids[i].vehicleId);
    }

    vehiclesIds.push(userId);
    
    console.log(`Vehicle IDs: ${vehiclesIds}`);
    const placeholders = vehiclesIds.map(() => '?').join(', ');
    const sql = `SELECT * FROM tbl_bid WHERE vehicleId IN (${placeholders}) AND userId = ?`;

    const queryParams2 = [...vehiclesIds, userId];

    const [query1] = await pool.query(sql, queryParams2);

        if (bids.lengt === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bids found matching your criteria'
            });
        }


        //  Base64 encode vehicle images
        const processedBids = await Promise.all(
            bids.map(async (bid) => {
                if (bid.image) {
                    try {
                        const imagePath = path.join(process.cwd(), bid.image); // e.g., uploads/car1.jpg
                        if (fs.existsSync(imagePath)) {
                            const buffer = fs.readFileSync(imagePath);
                            const ext = path.extname(imagePath).slice(1).toLowerCase();
                            bid.image = `data:image/${ext};base64,${buffer.toString('base64')}`;
                        } else {
                            console.warn(`Image not found at ${imagePath}`);
                            bid.image = null;
                        }
                    } catch (err) {
                        console.error(`Failed to process image for vehicle ${bid.vehicleId}:`, err);
                        bid.image = null;
                    }
                }
                return bid;
            })
        );

        // res.status(200).json( ...processedBids);
        res.status(200).json([
                processedBids[0], // only the first item
                ...query1
        ]);


    } catch (error) {
        console.error("Error in myBids controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



export const lotsWon = async (req, res) => {
    try {
        const  userId  = req.params.id;

        const {
            page = 1,
            limit = 10,
            search = '',
            sortField = 'v.id',
            sortOrder = 'DESC'
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit));
        const offset = (pageNumber - 1) * limitNumber;

        let baseQuery = `
            SELECT v.*, b.estRetailValue, b.yourOffer as MyLastBid
            FROM tbl_vehicles v
            LEFT JOIN tbl_bid b ON v.id = b.vehicleId AND b.userId = ?
            WHERE v.vehicleStatus = 'Y' AND winStatus = 'Won'
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM tbl_vehicles v
            LEFT JOIN tbl_bid b ON v.id = b.vehicleId AND b.userId = ?
            WHERE v.vehicleStatus = 'Y' AND winStatus = 'Won'
        `;

        const queryParams = [userId];
        const countParams = [userId];

        if (search) {
            const searchCondition = `
                AND (
                    v.make LIKE ? OR 
                    v.model LIKE ? OR 
                    v.vin LIKE ? OR 
                    v.color LIKE ? OR
                    b.estRetailValue LIKE ?
                )
            `;
            const searchTerm = `%${search}%`;
            
            baseQuery += searchCondition;
            countQuery += searchCondition;

            queryParams.push(...Array(5).fill(searchTerm));
            countParams.push(...Array(5).fill(searchTerm));
        }

        const validSortFields = ['v.id', 'v.make', 'v.model', 'v.year', 'b.maxBid', 'b.estRetailValue'];
        const safeSortField = validSortFields.includes(sortField) ? sortField : 'b.createdAt';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        baseQuery += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
        baseQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(limitNumber, offset);

        const [bids] = await pool.query(baseQuery, queryParams);
        const [[totalCount]] = await pool.query(countQuery, countParams);
        const total = totalCount.total;

        if (bids.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bids found matching your criteria'
            });
        }

        // 🖼 Convert vehicle images to Base64
        const withBase64Images = await Promise.all(
            bids.map(async (vehicle) => {
                if (vehicle.image) {
                    try {
                        const fullPath = path.join(process.cwd(), vehicle.image);
                        if (fs.existsSync(fullPath)) {
                            const buffer = fs.readFileSync(fullPath);
                            const ext = path.extname(fullPath).slice(1).toLowerCase();
                            vehicle.image = `data:image/${ext};base64,${buffer.toString('base64')}`;
                        } else {
                            console.warn(`Image not found at path: ${fullPath}`);
                            vehicle.image = null;
                        }
                    } catch (err) {
                        console.error(`Failed to process image for vehicle ${vehicle.id}:`, err);
                        vehicle.image = null;
                    }
                }
                return vehicle;
            })
        );

        res.status(200).json(withBase64Images);

    } catch (error) {
        console.error("Error in lotsWon controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
};




export const lotsLost = async (req, res) => {
    try {
        const  userId  = req.params.id;

        const {
            page = 1,
            limit = 10,
            search = '',
            sortField = 'v.id',
            sortOrder = 'DESC'
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const limitNumber = Math.max(1, parseInt(limit));
        const offset = (pageNumber - 1) * limitNumber;

        let baseQuery = `
            SELECT v.*, b.estRetailValue, b.yourOffer as MyLastBid
            FROM tbl_vehicles v
            LEFT JOIN tbl_bid b ON v.id = b.vehicleId AND b.userId = ?
            WHERE v.vehicleStatus = 'Y' AND winStatus = 'Lost'
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM tbl_vehicles v
            LEFT JOIN tbl_bid b ON v.id = b.vehicleId AND b.userId = ?
            WHERE v.vehicleStatus = 'Y' AND winStatus = 'Lost'
        `;

        const queryParams = [userId];
        const countParams = [userId];

        if (search) {
            const searchCondition = `
                AND (
                    v.make LIKE ? OR 
                    v.model LIKE ? OR 
                    v.vin LIKE ? OR 
                    v.color LIKE ? OR
                    b.estRetailValue LIKE ?
                )
            `;
            const searchTerm = `%${search}%`;

            baseQuery += searchCondition;
            countQuery += searchCondition;

            queryParams.push(...Array(5).fill(searchTerm));
            countParams.push(...Array(5).fill(searchTerm));
        }

        const validSortFields = ['v.id', 'v.make', 'v.model', 'v.year', 'b.maxBid', 'b.estRetailValue'];
        const safeSortField = validSortFields.includes(sortField) ? sortField : 'b.createdAt';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        baseQuery += ` ORDER BY ${safeSortField} ${safeSortOrder}`;
        baseQuery += ` LIMIT ? OFFSET ?`;
        queryParams.push(limitNumber, offset);

        const [bids] = await pool.query(baseQuery, queryParams);
        const [[totalCount]] = await pool.query(countQuery, countParams);
        const total = totalCount.total;

        if (bids.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No bids found matching your criteria'
            });
        }

        //  Convert image paths to base64
        const withBase64Images = await Promise.all(
            bids.map(async (vehicle) => {
                if (vehicle.image) {
                    try {
                        const fullPath = path.join(process.cwd(), vehicle.image);
                        if (fs.existsSync(fullPath)) {
                            const buffer = fs.readFileSync(fullPath);
                            const ext = path.extname(fullPath).slice(1).toLowerCase();
                            vehicle.image = `data:image/${ext};base64,${buffer.toString('base64')}`;
                        } else {
                            console.warn(`Image not found: ${fullPath}`);
                            vehicle.image = null;
                        }
                    } catch (err) {
                        console.error(`Error converting image for vehicle ${vehicle.id}:`, err);
                        vehicle.image = null;
                    }
                }
                return vehicle;
            })
        );

        res.status(200).json(withBase64Images);

    } catch (error) {
        console.error("Error in lotsLost controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};




export const liveAuctions = async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT b.*, v.*
            FROM tbl_vehicles v
            JOIN tbl_bid b ON v.id = b.vehicleId
            WHERE b.auctionStatus AND v.vehicleStatus = 'Y'`
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in live Auctions controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}