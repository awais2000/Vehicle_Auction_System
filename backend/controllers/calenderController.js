import express from "express"; 
import pool from "../config/db.js";




export const addCalenderEvent = async (req, res) => {
    try {
        const {
            userId,
            vehicleId,
            auctionTime,
            auctionStartDate,
            auctionEndDate,
            } = req.body;

        // Validate required fields
        const requiredFields = [
            'userId', 'vehicleId', 'auctionTime', 
            'auctionStartDate', 'auctionEndDate'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const [insertCalendarEvent] = await pool.query(`insert into tbl_calender (userId, vehicleId, auctionTime, auctionStartDate, auctionEndDate) values (?, ?, ?, ?, ?)`,
            [
                userId,
                vehicleId,
                auctionTime,
                auctionStartDate,
                auctionEndDate
            ]
        );

        res.status(200).json({
            userId,
            vehicleId,
            auctionTime,
            auctionStartDate,
            auctionEndDate,
            message: "Calendar event added successfully"
        });

    } catch (error) {
        console.error(" Error adding calendar event:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}




export const getCalenderEvents = async (req, res) => {
    try {
        const [getCalender] = await pool.query(`select * from tbl_calender where status = 'Y'`);
        if (!getCalender?.length) {
            return res.status(404).json({ message: "No calendar events found" });
        }
        
        res.status(200).json(getCalender);
    } catch (error) {   
        console.error(" Error fetching calendar events:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}





export const updateCalenderEvent = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            userId,
            vehicleId,
            auctionTime,
            auctionStartDate,
            auctionEndDate,
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'userId', 'vehicleId', 'auctionTime', 
            'auctionStartDate', 'auctionEndDate'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const [query] = await pool.query(`update tbl_calender set userId = ?, vehicleId = ?, auctionTime = ?, auctionStartDate = ?, auctionEndDate = ? where id = ?`,
            [
                userId,
                vehicleId,
                auctionTime,
                auctionStartDate,
                auctionEndDate,
                id
            ]
        );

        const [result] = await pool.query(`select * from tbl_calender where id = ?`, [id]);

        res.status(200).json({
            ...result[0]
        })
    } catch (error) {
        console.error(" Error updating calendar event:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });        
    }
}





export const deleteCalenderEvent = async (req, res) => {
try {
    const id = req.params.id;
    // Check if calendar event exists
    const [event] = await pool.query(
        'SELECT * FROM tbl_calender WHERE id = ?', 
        [id]
    );

    if (event.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Calendar event not found'
        });
    }


     await pool.query(`update tbl_calender set status = 'N' where id = ?`, [id]);

    const [getDeleted] = await pool.query (`select * from tbl_calender where id = ?`, [id]);

    res.status(200).json({...getDeleted[0],
        message: "Calendar event deleted successfully"
    });
    
} catch (error) {
    console.error(" Error deleting calendar event:", error);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
}
}