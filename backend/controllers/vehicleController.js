import express from "express"; 
import pool from "../config/db.js";
import   { resolve }  from 'path';
import fs from 'fs';
import path from 'path';



// export const addVehicle = async (req, res) => {
//   try {
//     const {
//       userId,
//       vin,
//       year,
//       make,
//       model,
//       series,
//       bodyStyle,
//       engine,
//       transmission,
//       driveType,
//       fuelType,
//       color,
//       mileage,
//       vehicleCondition,
//       keysAvailable,
//       locationId,
//       saleStatus = 'upcoming',
//       auctionDate,
//       currentBid = 0.0,
//       buyNowPrice,
//       estimatedRepairCost,
//       certifyStatus,
//     } = req.body;

//     const images = [];

//     for (let i = 1; i <= 25; i++) {
//       const file = req.files?.[`image${i}`]?.[0];
//       if (file) {
//         images.push(file.path.replace(/\\/g, "/"));
//       }
//     }

//     // Required fields check
//     const requiredFields = [
//       'vin', 'year', 'make', 'model', 'vehicleCondition',
//       'locationId', 'userId', 'certifyStatus'
//     ];

//     const missingFields = requiredFields.filter(field => !req.body[field]);
//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(', ')}`
//       });
//     }

//     // VIN format check
//     if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid VIN format (must be 17 alphanumeric characters)'
//       });
//     }

//     // VIN uniqueness check
//     const [existingVehicle] = await pool.query(
//       'SELECT id FROM tbl_vehicles WHERE vin = ?',
//       [vin]
//     );

//     if (existingVehicle.length > 0) {
//       return res.status(409).json({
//         success: false,
//         message: 'Vehicle with this VIN already exists'
//       });
//     }

//     // Vehicle insertion
//     const [result] = await pool.query(
//       `INSERT INTO tbl_vehicles (
//         userId, vin, year, make, model, series, bodyStyle, engine,
//         transmission, driveType, fuelType, color, mileage,
//         vehicleCondition, keysAvailable, locationId,
//         saleStatus, auctionDate, currentBid, buyNowPrice,
//         estimatedRepairCost, certifyStatus
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         userId, vin, year, make, model, series, bodyStyle, engine,
//         transmission, driveType, fuelType, color, mileage,
//         vehicleCondition, keysAvailable || false, locationId,
//         saleStatus, auctionDate || null, currentBid, buyNowPrice,
//         estimatedRepairCost, certifyStatus
//       ]
//     );

//     const vehicleId = result.insertId;

//     // Image inserts
//     for (const imgPath of images) {
//       await pool.query(
//         'INSERT INTO tbl_images (vehicleId, imagePath) VALUES (?, ?)',
//         [vehicleId, imgPath]
//       );
//     }
  
//     const [newVehicle] = await pool.query(
//       'SELECT * FROM tbl_vehicles WHERE id = ?',
//       [vehicleId]
//     );

//     res.status(201).json({
//       message: 'Vehicle added with images.',
//       vehicle: newVehicle[0]
//     });

//   } catch (error) {
//     console.error(' Error adding vehicle:', error);

//     // Rollback image upload (clean up)
//     if (req.files) {
//       Object.values(req.files).flat().forEach(file => {
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };
 
export const addVehicle = async (req, res) => {
  try {
    const {
      userId,
      vin,
      year,
      make,
      model,
      series,
      bodyStyle,
      engine,
      transmission,
      driveType,
      fuelType,
      color,
      mileage,
      vehicleCondition,
      keysAvailable,
      locationId,
      saleStatus = 'upcoming',
      auctionDate,
      currentBid = 0.0,
      buyNowPrice,
      certifyStatus,
    } = req.body;

    // Main image (optional)
    const imagePath1 = req.files?.image?.[0]?.path.replace(/\\/g, "/") || null;

    //  Handle array of images (vehicleImages[])
    const imagePath2 = (req.files?.vehicleImages || [])
      .slice(0, 25)
      .map(file => file.path.replace(/\\/g, "/")); // normalize path for UNIX/Windows

    // Validate required fields
    const requiredFields = [
      'vin', 'year', 'make', 'model', 'vehicleCondition',
      'locationId', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate VIN
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid VIN format (must be 17 alphanumeric characters)'
      });
    }

    // Check for existing vehicle
    const [existingVehicle] = await pool.query(
      'SELECT id FROM tbl_vehicles WHERE vin = ?',
      [vin]
    );
    if (existingVehicle.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle with this VIN already exists'
      });
    }

    //  Insert vehicle
    const [result] = await pool.query(
      `INSERT INTO tbl_vehicles (
        userId, vin, year, make, model, series, bodyStyle, engine,
        transmission, driveType, fuelType, color, mileage,
        vehicleCondition, 
        keysAvailable, locationId,
        saleStatus, auctionDate, currentBid, buyNowPrice,
        image, vehicleImages, certifyStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, vin, year, make, model, series, bodyStyle, engine,
        transmission, driveType, fuelType, color, mileage,
        vehicleCondition, keysAvailable || false, locationId,
        saleStatus, auctionDate || null, currentBid, buyNowPrice,
        imagePath1, JSON.stringify(imagePath2), certifyStatus
      ]
    );

    // Fetch and return
    const [newVehicle] = await pool.query(
      'SELECT * FROM tbl_vehicles WHERE vin = ?',
      [vin]
    );

    return res.status(201).json(newVehicle);

  } catch (error) {
    console.error('Error adding vehicle:', error);

    // Remove uploaded files
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (req.files?.vehicleImages) {
      req.files.vehicleImages.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





export const getVehicles = async (req, res) => {
    try {
        const {
            year, 
            auctionDate, 
            auctionDateStart, 
            auctionDateEnd,
            mileage,
            mileageMin,
            mileageMax,
            yearMin,
            yearMax,
            make, 
            model, 
            series, 
            bodyStyle, 
            engine, 
            transmission, 
            driveType, 
            fuelType, 
            color,
            search // General search term
        } = req.query;

        // Default values
        const defaultLimit = 10;
        const defaultPage = 1;
        
        // Get from query params
        const entry = parseInt(req.query.entry) || defaultLimit;
        const page = parseInt(req.query.page) || defaultPage;

        const limit = Math.max(1, entry);
        const offset = (Math.max(1, page) - 1) * limit;

        // Base query
        let query = `SELECT * FROM tbl_vehicles WHERE 1=1 and vehicleStatus = 'Y'`;
        let countQuery = `SELECT COUNT(*) as total FROM tbl_vehicles WHERE 1=1`;
        const params = [];
        const countParams = [];

        // Date range filter for auctionDate
        if (auctionDateStart && auctionDateEnd) {
            query += ` AND auctionDate BETWEEN ? AND ?`;
            countQuery += ` AND auctionDate BETWEEN ? AND ?`;
            params.push(auctionDateStart, auctionDateEnd);
            countParams.push(auctionDateStart, auctionDateEnd);
        } else if (auctionDate) {
            query += ` AND auctionDate = ?`;
            countQuery += ` AND auctionDate = ?`;
            params.push(auctionDate);
            countParams.push(auctionDate);
        }

        // Mileage range filter
        if (mileageMin && mileageMax) {
            query += ` AND mileage BETWEEN ? AND ?`;
            countQuery += ` AND mileage BETWEEN ? AND ?`;
            params.push(mileageMin, mileageMax);
            countParams.push(mileageMin, mileageMax);
        } else if (mileage) {
            query += ` AND mileage = ?`;
            countQuery += ` AND mileage = ?`;
            params.push(mileage);
            countParams.push(mileage);
        }

        // Year range filter
        if (yearMin && yearMax) {
            query += ` AND year BETWEEN ? AND ?`;
            countQuery += ` AND year BETWEEN ? AND ?`;
            params.push(yearMin, yearMax);
            countParams.push(yearMin, yearMax);
        } else if (year) {
            query += ` AND year = ?`;
            countQuery += ` AND year = ?`;
            params.push(year);
            countParams.push(year);
        }

        // Search functionality (searches across multiple fields)
        if (search) {
            query += ` AND (
                make LIKE ? OR 
                model LIKE ? OR 
                series LIKE ? OR 
                bodyStyle LIKE ? OR 
                color LIKE ?
            )`;
            countQuery += ` AND (
                make LIKE ? OR 
                model LIKE ? OR 
                series LIKE ? OR 
                bodyStyle LIKE ? OR 
                color LIKE ?
            )`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Exact match filters for other fields
        const filters = {
            make, model, series, bodyStyle, 
            engine, transmission, driveType, 
            fuelType, color
        };

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                query += ` AND ${key} = ?`;
                countQuery += ` AND ${key} = ?`;
                params.push(value);
                countParams.push(value);
            }
        });

        // Add sorting and pagination
        query += `ORDER BY auctionDate DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute queries
        const [vehicles] = await pool.query(query, params);
        
        if (!vehicles?.length) {
            return res.status(404).json({ message: "No vehicles found" });
        }

        const [totalVehicles] = await pool.query(countQuery, countParams);
        const total = totalVehicles[0].total;   

        // Process vehicles with images
        const vehiclesWithImages = await Promise.all(
  vehicles.map(async (vehicle) => {
    let imageBase64 = null;
    let galleryImages = [];

    // 🔁 1. Convert main image (if exists)
    if (vehicle.image) {
      try {
        const fullPath = path.join(process.cwd(), vehicle.image);
        if (fs.existsSync(fullPath)) {
          const buffer = fs.readFileSync(fullPath);
          const ext = path.extname(fullPath).toLowerCase().slice(1);
          imageBase64 = `data:image/${ext};base64,${buffer.toString('base64')}`;
        }
      } catch (err) {
        console.warn(`Main image failed for vehicle ${vehicle.id}`, err);
      }
    }

    // 🔁 2. Convert vehicleImages array (if exists)
    if (vehicle.vehicleImages) {
      try {
        const pathsArray = JSON.parse(vehicle.vehicleImages);

        galleryImages = await Promise.all(pathsArray.map(async (imgPath) => {
          try {
            const fullPath = path.join(process.cwd(), imgPath);
            if (fs.existsSync(fullPath)) {
              const buffer = fs.readFileSync(fullPath);
              const ext = path.extname(fullPath).toLowerCase().slice(1);
              return `data:image/${ext};base64,${buffer.toString('base64')}`;
            } else {
              return null;
            }
          } catch (err) {
            console.warn(`Failed to process one gallery image: ${imgPath}`, err);
            return null;
          }
        }));

        // Remove any failed/null entries
        galleryImages = galleryImages.filter(Boolean);
      } catch (err) {
        console.warn(`vehicleImages parsing failed for vehicle ${vehicle.id}`, err);
        galleryImages = [];
      }
    }

    // ✅ Return formatted vehicle
    return {
      ...vehicle,
      image: imageBase64,
      vehicleImages: galleryImages
    };
  })
);
        
        
        res.status(200).json(vehiclesWithImages);
    } catch (error) {
        console.error("Failed to fetch Vehicles:", error);
        return res.status(500).json({ 
            success: false,
            error: "Internal server error",
            message: error.message 
        });
    }
};




export const updateVehicle = async (req, res) => {
    let imagePath = null;

    try {
        const vehicleId = req.params.id;
        const {
            userId,
            vin,
            year,
            make,
            model,
            series,
            bodyStyle,
            engine,
            transmission,
            driveType,
            fuelType,
            color,
            mileage,
            vehicleCondition,
            keysAvailable,
            locationId,
            saleStatus = 'upcoming', // Default value
            auctionDate,
            currentBid = 0.00, // Default value
            buyNowPrice,
            estimatedRepairCost // Required field
        } = req.body;

        // Handle file upload if present
        if (req.file) {
            imagePath = req.file.path;
        }

        // Required fields validation
        const requiredFields = [
            'vin', 'year', 'make', 'model', 'vehicleCondition', 
            'locationId', 'userId'
        ];
        
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            // Clean up uploaded file if validation fails
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate VIN format (17 alphanumeric characters)
        if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid VIN format (must be 17 alphanumeric characters)'
            });
        }

        // Check if vehicle exists
        const [vehicle] = await pool.query(
            'SELECT * FROM tbl_vehicles WHERE id = ?', 
            [vehicleId]
        );
        
        if (vehicle.length === 0) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Check for VIN conflict with other vehicles
        const [vinCheck] = await pool.query(
            'SELECT id FROM tbl_vehicles WHERE vin = ? AND id != ?', 
            [vin, vehicleId]
        );
        
        if (vinCheck.length > 0) {
            if (imagePath && fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            return res.status(400).json({
                success: false,
                message: 'VIN already exists for another vehicle'
            });
        }

        // Prepare update fields
        const updateFields = {
            userId,
            vin,
            year,
            make,
            model,
            series: series || null,
            bodyStyle: bodyStyle || null,
            engine: engine || null,
            transmission: transmission || null,
            driveType: driveType || null,
            fuelType: fuelType || null,
            color: color || null,
            mileage: mileage || null,
            vehicleCondition,
            keysAvailable: keysAvailable !== undefined ? keysAvailable : false,
            locationId,
            saleStatus,
            auctionDate: auctionDate || null,
            currentBid,
            buyNowPrice: buyNowPrice || null,
        };

        // Add image path if new image was uploaded
        if (imagePath) {
            updateFields.image = imagePath;
            // Optionally delete old image if exists
            if (vehicle[0].image && fs.existsSync(vehicle[0].image)) {
                fs.unlinkSync(vehicle[0].image);
            }
        }

        // Execute update
        const [updateResult] = await pool.query(
            'UPDATE tbl_vehicles SET ? WHERE id = ?',
            [updateFields, vehicleId]
        );

        // Get updated vehicle data
        const [updatedVehicle] = await pool.query(
            'SELECT * FROM tbl_vehicles WHERE id = ?',
            [vehicleId]
        );

        return res.status(200).json({
            ...updatedVehicle[0]
        });

    } catch (error) {
        console.error('Error updating vehicle:', error);
        
        // Delete uploaded file if error occurred
        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update vehicle',
            error: error.message
        });
    }
};




export const deleteVehicle = async (req, res) => {
    try {
        const vehicleId = req.params.id;

        // Check if vehicle exists
        const [vehicle] = await pool.query(
            'SELECT * FROM tbl_vehicles WHERE id = ?', 
            [vehicleId]
        );

        if (vehicle.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Delete the vehicle
        await pool.query(
            `update tbl_vehicles set vehicleStatus = 'N' WHERE id = ?`, 
            [vehicleId]
        );

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });

      
    } catch (error) {
        console.error(" Error deleting Vehicle:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};




export const getVehicleByMake = async (req, res) => {
    try {
        const { make } = req.body;

        const [query] = await pool.query(`SELECT * FROM tbl_vehicles WHERE make = ? AND vehicleStatus = 'Y'`,
        [make]);

        if (query.length === 0) {
            return res.status(404).json({ status: 404, message: "Vehicle not found" });
        }

        res.status(200).json({...query[0]});
    } catch (error) {
        console.error(" Error fetching Vehicle by ID:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

//asda