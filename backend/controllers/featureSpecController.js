import pool from "../config/db.js";



export const  addVehiclePrices = async(req, res) => {
    try {
        const {
            vehicleId,
            exFactoryPrice,
            withholdingTaxFiler,
            withholdingTaxNonFiler,
            payorderPriceFiler,
            payorderPriceNonFiler,
            tokenTax,
            incomeTaxFiler,
            registrationFee,
            registrationBook,
            scanningArchivingFee,
            stickerFee,
            numberPlateCharges,
            totalPriceFiler,
            totalPriceNonFiler
        } = req.body;

        // Validate required fields
        if (!vehicleId || !exFactoryPrice || !withholdingTaxFiler || !withholdingTaxNonFiler ||
            !payorderPriceFiler || !payorderPriceNonFiler || !tokenTax || !incomeTaxFiler ||
            !registrationFee || !registrationBook || !scanningArchivingFee || !stickerFee ||
            !numberPlateCharges || !totalPriceFiler || !totalPriceNonFiler) {
            return res.status(400).json({ message: "All fields are required" });
        }

const [query] = await pool.query(`
  INSERT INTO tbl_vehicle_prices (
    vehicleId,
    exFactoryPrice,
    withholdingTaxFiler,
    withholdingTaxNonFiler,
    payorderPriceFiler,
    payorderPriceNonFiler,
    tokenTax,
    incomeTaxFiler,
    registrationFee,
    registrationBook,
    scanningArchivingFee,
    stickerFee,
    numberPlateCharges,
    totalPriceFiler,
    totalPriceNonFiler
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  vehicleId,
  exFactoryPrice,
  withholdingTaxFiler,
  withholdingTaxNonFiler,
  payorderPriceFiler,
  payorderPriceNonFiler,
  tokenTax,
  incomeTaxFiler,
  registrationFee,
  registrationBook,
  scanningArchivingFee,
  stickerFee,
  numberPlateCharges,
  totalPriceFiler,
  totalPriceNonFiler
]);

    const id = query.insertId;
    const [result] = await pool.query(`select * from tbl_vehicle_prices where id = ?`, [id]);
    res.status(201).json({...result[0]});

    } catch (error) {
        console.error("Error in getFeatureSpec:", error);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
}





export const getVehiclePrices = async(req, res) => {
    try {
        const [result] = await pool.query(`select * from tbl_vehicle_prices where status  = 'Y'`);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getVehiclePrices:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}





export const updateVehiclePrices = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleId,
      exFactoryPrice,
      withholdingTaxFiler,
      withholdingTaxNonFiler,
      payorderPriceFiler,
      payorderPriceNonFiler,
      tokenTax,
      incomeTaxFiler,
      registrationFee,
      registrationBook,
      scanningArchivingFee,
      stickerFee,
      numberPlateCharges,
      totalPriceFiler,
      totalPriceNonFiler
    } = req.body;

    // Validate required fields
    if (
      !vehicleId || !exFactoryPrice || !withholdingTaxFiler || !withholdingTaxNonFiler ||
      !payorderPriceFiler || !payorderPriceNonFiler || !tokenTax || !incomeTaxFiler ||
      !registrationFee || !registrationBook || !scanningArchivingFee || !stickerFee ||
      !numberPlateCharges || !totalPriceFiler || !totalPriceNonFiler
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [query] = await pool.query(`
      UPDATE tbl_vehicle_prices SET
        vehicleId = ?,
        exFactoryPrice = ?,
        withholdingTaxFiler = ?,
        withholdingTaxNonFiler = ?,
        payorderPriceFiler = ?,
        payorderPriceNonFiler = ?,
        tokenTax = ?,
        incomeTaxFiler = ?,
        registrationFee = ?,
        registrationBook = ?,
        scanningArchivingFee = ?,
        stickerFee = ?,
        numberPlateCharges = ?,
        totalPriceFiler = ?,
        totalPriceNonFiler = ?
      WHERE id = ?
    `, [
      vehicleId,
      exFactoryPrice,
      withholdingTaxFiler,
      withholdingTaxNonFiler,
      payorderPriceFiler,
      payorderPriceNonFiler,
      tokenTax,
      incomeTaxFiler,
      registrationFee,
      registrationBook,
      scanningArchivingFee,
      stickerFee,
      numberPlateCharges,
      totalPriceFiler,
      totalPriceNonFiler,
      id
    ]);

    const [updatedResult] = await pool.query(`SELECT * FROM tbl_vehicle_prices WHERE id = ?`, [id]);

    if (updatedResult.length === 0) {
      return res.status(404).json({ message: "Vehicle price not found" });
    }

    res.status(200).json({ ...updatedResult[0] });

  } catch (error) {
    console.error("Error in updateVehiclePrices:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





export const deleteVehiclePrices = async(req, res) => {
    try {
        const { id } = req.params;

        const [query] = await pool.query(`UPDATE tbl_vehicle_prices SET status = 'N' WHERE id = ?`, [id]);

        if (query.affectedRows === 0) {
            return res.status(404).json({ message: "Vehicle price not found" });
        }

        res.status(200).json({ message: "Vehicle price deleted successfully" });
    } catch (error) {
        console.error("Error in deleteVehiclePrices:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}






// Vehicle Specs Controller
export const addVehicleSpecs = async (req, res) => { 
    try {
        const {
            vehicleId,
            engineType,
            turboCharger,
            displacement,
            numberOfCylinders,
            driveTrain,
            cylinderConfiguration,
            horsePower,
            compressionRatio,
            torque,
            valvesPerCylinder,
            fuelSystem,
            valveMechanism,
            maxSpeed,
            transmissionType,
            gearbox,
            steeringType,
            minTurningRadius,
            powerAssisted,
            frontSuspension,
            rearSuspension,
            frontBrakes,
            rearBrakes,
            wheelType,
            tyreSize,
            wheelSize,
            spareTyre,
            pcd,
            spareTyreSize,
            mileageCity,
            mileageHighway,
            fuelTankCapacity
        } = req.body;
        // Validate required fields
        if (!vehicleId || !engineType || !turboCharger || !displacement || !numberOfCylinders ||
            !driveTrain || !cylinderConfiguration || !horsePower || !compressionRatio ||
            !torque || !valvesPerCylinder || !fuelSystem || !valveMechanism || !maxSpeed ||
            !transmissionType || !gearbox || !steeringType || !minTurningRadius ||
            !powerAssisted || !frontSuspension || !rearSuspension || !frontBrakes ||
            !rearBrakes || !wheelType || !tyreSize || !wheelSize || !spareTyre ||
            !pcd || !spareTyreSize || !mileageCity || !mileageHighway ||
            !fuelTankCapacity) {
            return res.status(400).json({ message: "All fields are required" });
        };

       const [query] = await pool.query(`
  INSERT INTO tbl_vehicle_specifications (
    vehicleId,
    engineType,
    turboCharger,
    displacement,
    numberOfCylinders,
    driveTrain,
    cylinderConfiguration,
    horsePower,
    compressionRatio,
    torque,
    valvesPerCylinder,
    fuelSystem,
    valveMechanism,
    maxSpeed,
    transmissionType,
    gearbox,
    steeringType,
    minTurningRadius,
    powerAssisted,
    frontSuspension,
    rearSuspension,
    frontBrakes,
    rearBrakes,
    wheelType,
    tyreSize,
    wheelSize,
    spareTyre,
    pcd,
    spareTyreSize,
    mileageCity,
    mileageHighway,
    fuelTankCapacity
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  vehicleId,
  engineType,
  turboCharger,
  displacement,
  numberOfCylinders,
  driveTrain,
  cylinderConfiguration,
  horsePower,
  compressionRatio,
  torque,
  valvesPerCylinder,
  fuelSystem,
  valveMechanism,
  maxSpeed,
  transmissionType,
  gearbox,
  steeringType,
  minTurningRadius,
  powerAssisted,
  frontSuspension,
  rearSuspension,
  frontBrakes,
  rearBrakes,
  wheelType,
  tyreSize,
  wheelSize,
  spareTyre,
  pcd,
  spareTyreSize,
  mileageCity,
  mileageHighway,
  fuelTankCapacity
]);
        const id = query.insertId;
        const [result] = await pool.query(`SELECT * FROM tbl_vehicle_specifications WHERE id = ?`, [id]);
        res.status(201).json({ ...result[0] });
    } catch (error) {
        console.error("Error in Adding Vehicle Specs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}





export const getVehicleSpecs = async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT * FROM tbl_vehicle_specs WHERE status = 'Y'`);

        if (result.length === 0) {
            return res.status(404).json({ message: "No vehicle specs found" });
        }   
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getting vehicle Specs:", error);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
}





export const updateVehicleSpecs = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleId,
      engineType,
      turboCharger,
      displacement,
      numberOfCylinders,
      driveTrain,
      cylinderConfiguration,
      horsePower,
      compressionRatio,
      torque,
      valvesPerCylinder,
      fuelSystem,
      valveMechanism,
      maxSpeed,
      transmissionType,
      gearbox,
      steeringType,
      minTurningRadius,
      powerAssisted,
      frontSuspension,
      rearSuspension,
      frontBrakes,
      rearBrakes,
      wheelType,
      tyreSize,
      wheelSize,
      spareTyre,
      pcd,
      spareTyreSize,
      mileageCity,
      mileageHighway,
      fuelTankCapacity
    } = req.body;

    // Validate required fields
    const requiredFields = [
      vehicleId, engineType, turboCharger, displacement, numberOfCylinders,
      driveTrain, cylinderConfiguration, horsePower, compressionRatio, torque,
      valvesPerCylinder, fuelSystem, valveMechanism, maxSpeed, transmissionType,
      gearbox, steeringType, minTurningRadius, powerAssisted, frontSuspension,
      rearSuspension, frontBrakes, rearBrakes, wheelType, tyreSize, wheelSize,
      spareTyre, pcd, spareTyreSize, mileageCity, mileageHighway, fuelTankCapacity
    ];

    if (requiredFields.includes(undefined) || requiredFields.includes(null)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await pool.query(`
      UPDATE tbl_vehicle_specifications SET
        vehicleId = ?,
        engineType = ?,
        turboCharger = ?,
        displacement = ?,
        numberOfCylinders = ?,
        driveTrain = ?,
        cylinderConfiguration = ?,
        horsePower = ?,
        compressionRatio = ?,
        torque = ?,
        valvesPerCylinder = ?,
        fuelSystem = ?,
        valveMechanism = ?,
        maxSpeed = ?,
        transmissionType = ?,
        gearbox = ?,
        steeringType = ?,
        minTurningRadius = ?,
        powerAssisted = ?,
        frontSuspension = ?,
        rearSuspension = ?,
        frontBrakes = ?,
        rearBrakes = ?,
        wheelType = ?,
        tyreSize = ?,
        wheelSize = ?,
        spareTyre = ?,
        pcd = ?,
        spareTyreSize = ?,
        mileageCity = ?,
        mileageHighway = ?,
        fuelTankCapacity = ?
      WHERE id = ?
    `, [
      vehicleId, engineType, turboCharger, displacement, numberOfCylinders,
      driveTrain, cylinderConfiguration, horsePower, compressionRatio, torque,
      valvesPerCylinder, fuelSystem, valveMechanism, maxSpeed, transmissionType,
      gearbox, steeringType, minTurningRadius, powerAssisted, frontSuspension,
      rearSuspension, frontBrakes, rearBrakes, wheelType, tyreSize, wheelSize,
      spareTyre, pcd, spareTyreSize, mileageCity, mileageHighway, fuelTankCapacity,
      id
    ]);

    const [updated] = await pool.query(`SELECT * FROM tbl_vehicle_specifications WHERE id = ?`, [id]);

    if (updated.length === 0) {
      return res.status(404).json({ message: "Vehicle specification not found" });
    }

    res.status(200).json(updated[0]);

  } catch (error) {
    console.error("Error updating vehicle specifications:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};





export const deleteVehicleSpecs = async (req, res) => {
    try {
        const { id } = req.params;
        const [query] = await pool.query(`UPDATE tbl_vehicle_specifications SET status = 'N' WHERE id = ?`, [id]);
        if (query.affectedRows === 0) {
            return res.status(404).json({ message: "Vehicle specification not found" });
        }
        res.status(200).json({ message: "Vehicle specification deleted successfully" });
    } catch (error) {
        console.error("Error in deleteVehicleSpecs:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
        
    }
}    






export const addVehicleFeatures = async (req, res) => {
    try {
        //the first part:
        const { 
                vehicleId,
                safAirbags,
                safAutoDoorLock,
                safSeatbelts,
                safAntiTheft,
                safDriverBeltWarn,
                safDownhillAssist,
                safPassengerBeltWarn,
                safHillStartAssist,
                safImmobilizer,
                safTractionControl,
                safDoorOpenWarn,
                safVehicleStability,
                safChildLock,
                safRearFogLamp,
                safIsofix,
                safAeb,
                safHighMountStop,
                safBlindSpotDetect, 
                safAbs,
                safLdws,
                safEbd,
                safLkas,
                safBrakeAssist} = req.body;
                
        // Validate required fields
        const requiredFields = [
            safAirbags, safAutoDoorLock, safSeatbelts, safAntiTheft, safDriverBeltWarn,
            safDownhillAssist, safPassengerBeltWarn, safHillStartAssist, safImmobilizer,
            safTractionControl, safDoorOpenWarn, safVehicleStability, safChildLock,
            safRearFogLamp, safIsofix, safAeb, safHighMountStop, safBlindSpotDetect,
            safAbs, safLdws, safEbd, safLkas, safBrakeAssist
        ];

        if (requiredFields.includes(undefined) || requiredFields.includes(null)) {
            return res.status(400).json({ message: "All fields are required" });    
        }

        const [insert] = await pool.query(`
        INSERT INTO tbl_vehicle_safety_features (
    safAirbags,
    safAutoDoorLock,
    safSeatbelts,
    safAntiTheft,
    safDriverBeltWarn,
    safDownhillAssist,
    safPassengerBeltWarn,
    safHillStartAssist,
    safImmobilizer,
    safTractionControl,
    safDoorOpenWarn,
    safVehicleStability,
    safChildLock,
    safRearFogLamp,
    safIsofix,
    safAeb,
    safHighMountStop,
    safBlindSpotDetect,
    safAbs,
    safLdws,
    safEbd,
    safLkas,
    safBrakeAssist
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  safAirbags,
  safAutoDoorLock,
  safSeatbelts,
  safAntiTheft,
  safDriverBeltWarn,
  safDownhillAssist,
  safPassengerBeltWarn,
  safHillStartAssist,
  safImmobilizer,
  safTractionControl,
  safDoorOpenWarn,
  safVehicleStability,
  safChildLock,
  safRearFogLamp,
  safIsofix,
  safAeb,
  safHighMountStop,
  safBlindSpotDetect,
  safAbs,
  safLdws,
  safEbd,
  safLkas,
  safBrakeAssist
        ]);

        const id = insert.insertId;
        const [result1] = await pool.query(`SELECT * FROM tbl_vehicle_safety_features WHERE id = ?`, [id]);

        //the second part:
        const { 
            extBrakeAssist,
            extAdjHeadlights,
            extColoredDoorHandles,
            extRearSpoiler,
            extSideMirrorsInd,
            extSunRoof,
            extMoonRoof,
            extFogLights,
            extDrl,
            extRoofRails,
            extSideSteps,
            extDualExhaust
        } = req.body;                        

        // Validate required fields
        const requiredFields2 = [
            extBrakeAssist, extAdjHeadlights, extColoredDoorHandles, extRearSpoiler,
            extSideMirrorsInd, extSunRoof, extMoonRoof, extFogLights, extDrl,
            extRoofRails, extSideSteps, extDualExhaust
        ];

        if (requiredFields2.includes(undefined) || requiredFields2.includes(null)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [insert2] = await pool.query(`
  INSERT INTO tbl_vehicle_exterior_features (
    extBrakeAssist,
    extAdjHeadlights,
    extColoredDoorHandles,
    extRearSpoiler,
    extSideMirrorsInd,
    extSunRoof,
    extMoonRoof,
    extFogLights,
    extDrl,
    extRoofRails,
    extSideSteps,
    extDualExhaust
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  extBrakeAssist,
  extAdjHeadlights,
  extColoredDoorHandles,
  extRearSpoiler,
  extSideMirrorsInd,
  extSunRoof,
  extMoonRoof,
  extFogLights,
  extDrl,
  extRoofRails,
  extSideSteps,
  extDualExhaust
]);
        const id2 = insert2.insertId;
        const [result2] = await pool.query(`SELECT * FROM tbl_vehicle_exterior_features WHERE id = ?`, [id2]); 
        
        //the third part:
        const { 
            infoCdPlayer,
            infoDvdPlayer,
            infoSpeakers,
            infoUsbAux,
            infoFrontSpeakers,
            infoBluetooth,
            infoRearSpeakers,
            infoDisplay,
            infoRearSeatEntertainment,
            infoVoiceControl,
            infoAndroidAuto,
            infoAppleCarPlay
        } = req.body;

        // Validate required fields
        const requiredFields3 = [
            infoCdPlayer, infoDvdPlayer, infoSpeakers, infoUsbAux, infoFrontSpeakers,
            infoBluetooth, infoRearSpeakers, infoDisplay, infoRearSeatEntertainment,
            infoVoiceControl, infoAndroidAuto, infoAppleCarPlay
        ];

        if (requiredFields3.includes(undefined) || requiredFields3.includes(null)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const [insert3] = await pool.query(`
            INSERT INTO tbl_vehicle_infotainment_features (
                    infoCdPlayer,
                    infoDvdPlayer,
                    infoSpeakers,
                    infoUsbAux,
                    infoFrontSpeakers,
                    infoBluetooth,
                    infoRearSpeakers,
                    infoDisplay,
                    infoRearSeatEntertainment,
                    infoVoiceControl,
                    infoAndroidAuto,
                    infoAppleCarPlay
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    infoCdPlayer,
                    infoDvdPlayer,
                    infoSpeakers,
                    infoUsbAux,
                    infoFrontSpeakers,
                    infoBluetooth,
                    infoRearSpeakers,
                    infoDisplay,
                    infoRearSeatEntertainment,
                    infoVoiceControl,
                    infoAndroidAuto,
                    infoAppleCarPlay
                ]
                );

        const id3 = insert3.insertId;
        const [result3] = await pool.query(`SELECT * FROM tbl_vehicle_infotainment_features WHERE id = ?`, [id3]);


        //the fourth part:
        const {
            instTachometer,
            instMultiInfo,
            instInfoCluster
            } = req.body;


        // Validate required fields
        const requiredFields4 = [
            instTachometer, instMultiInfo, instInfoCluster
        ];

        if (requiredFields4.includes(undefined) || requiredFields4.includes(null)) {
            return res.status(400).json({ message: "All fields are required" });
          }

        const [query4] = await pool.query(`
            INSERT INTO tbl_vehicle_instrumentation_features (instTachometer, instMultiInfo, instInfoCluster) values (?, ?, ?)`,
            [instTachometer, instMultiInfo, instInfoCluster]);


            const id4 = query4.insertId;

        const [result4] = await pool.query(`SELECT * FROM tbl_vehicle_instrumentation_features WHERE id = ?`, [id4]);

        //the fifth part:
        const {
            comfAirConditioner,
comfClimateControl,
comfAirPurifier,
comfRearAC,
comfThirdRowAC,
comfHeater,
comfHeatedSeats,
comfDefogger,
comfCoolBox,
comfNavigation,
comfOptNavigation,
comfFrontCamera,
comfPowerSteering,
comfCamera360,
comfFrontSensors,
comfAutoDimMirror,
comfRearCentralControl,
comfRearFoldingSeat,
comfRearHeadrest,
comfRearWiper,
comfSeatMaterial,
comfDriverElecAdjust,
comfDriverLumbar,
comfDriverMemory,
comfPassengerElecAdjust,
comfSteeringAdjust,
comfSteeringSwitches,
comfHeadlightReminder,
comfAutoHeadlamps,
comfRainWipers,
comfHud,
comfCruiseControl,
comfDriveModes,
comfPaddleShifter,
comfKeyType,
comfPushStart,
comfRemoteStart,
comfCentralLock,
comfPowerDoorLocks,
comfRearCamera,
comfPowerWindows,
comfPowerMirrors,
comfMirrorsAutoFold,
comfPowerBoot,
comfCupHolders,
comfArmRest,
comfHandbrake,
comfBrakeHold,
comfAutoPark,
comfIntLighting,
comfGloveLamp,
comfCargoLamp,
comfFrontOutlet,
comfRearOutlet,
comfTpms,
comfWirelessCharger,
comfBossSeatSwitch
        } = req.body;
        // Validate required fields
        
        const requiredFields5 = [ comfAirConditioner,
comfClimateControl,
comfAirPurifier,
comfRearAC,
comfThirdRowAC,
comfHeater,
comfHeatedSeats,
comfDefogger,
comfCoolBox,
comfNavigation,
comfOptNavigation,
comfFrontCamera,
comfPowerSteering,
comfCamera360,
comfFrontSensors,
comfAutoDimMirror,
comfRearCentralControl,
comfRearFoldingSeat,
comfRearHeadrest,
comfRearWiper,
comfSeatMaterial,
comfDriverElecAdjust,
comfDriverLumbar,
comfDriverMemory,
comfPassengerElecAdjust,
comfSteeringAdjust,
comfSteeringSwitches,
comfHeadlightReminder,
comfAutoHeadlamps,
comfRainWipers,
comfHud,
comfCruiseControl,
comfDriveModes,
comfPaddleShifter,
comfKeyType,
comfPushStart,
comfRemoteStart,
comfCentralLock,
comfPowerDoorLocks,
comfRearCamera,
comfPowerWindows,
comfPowerMirrors,
comfMirrorsAutoFold,
comfPowerBoot,
comfCupHolders,
comfArmRest,
comfHandbrake,
comfBrakeHold,
comfAutoPark,
comfIntLighting,
comfGloveLamp,
comfCargoLamp,
comfFrontOutlet,
comfRearOutlet,
comfTpms,
comfWirelessCharger,
comfBossSeatSwitch];

        if (requiredFields5.includes(undefined) || requiredFields5.includes(null))
        {
            return res.status(400).json({ message: "All fields are required" });
        }

const [insert5] = await pool.query(`
  INSERT INTO tbl_vehicle_comfort_features (
    comfAirConditioner,
    comfClimateControl,
    comfAirPurifier,
    comfRearAC,
    comfThirdRowAC,
    comfHeater,
    comfHeatedSeats,
    comfDefogger,
    comfCoolBox,
    comfNavigation,
    comfOptNavigation,
    comfFrontCamera,
    comfPowerSteering,
    comfCamera360,
    comfFrontSensors,
    comfAutoDimMirror,
    comfRearCentralControl,
    comfRearFoldingSeat,
    comfRearHeadrest,
    comfRearWiper,
    comfSeatMaterial,
    comfDriverElecAdjust,
    comfDriverLumbar,
    comfDriverMemory,
    comfPassengerElecAdjust,
    comfSteeringAdjust,
    comfSteeringSwitches,
    comfHeadlightReminder,
    comfAutoHeadlamps,
    comfRainWipers,
    comfHud,
    comfCruiseControl,
    comfDriveModes,
    comfPaddleShifter,
    comfKeyType,
    comfPushStart,
    comfRemoteStart,
    comfCentralLock,
    comfPowerDoorLocks,
    comfRearCamera,
    comfPowerWindows,
    comfPowerMirrors,
    comfMirrorsAutoFold,
    comfPowerBoot,
    comfCupHolders,
    comfArmRest,
    comfHandbrake,
    comfBrakeHold,
    comfAutoPark,
    comfIntLighting,
    comfGloveLamp,
    comfCargoLamp,
    comfFrontOutlet,
    comfRearOutlet,
    comfTpms,
    comfWirelessCharger,
    comfBossSeatSwitch
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  comfAirConditioner,
  comfClimateControl,
  comfAirPurifier,
  comfRearAC,
  comfThirdRowAC,
  comfHeater,
  comfHeatedSeats,
  comfDefogger,
  comfCoolBox,
  comfNavigation,
  comfOptNavigation,
  comfFrontCamera,
  comfPowerSteering,
  comfCamera360,
  comfFrontSensors,
  comfAutoDimMirror,
  comfRearCentralControl,
  comfRearFoldingSeat,
  comfRearHeadrest,
  comfRearWiper,
  comfSeatMaterial,
  comfDriverElecAdjust,
  comfDriverLumbar,
  comfDriverMemory,
  comfPassengerElecAdjust,
  comfSteeringAdjust,
  comfSteeringSwitches,
  comfHeadlightReminder,
  comfAutoHeadlamps,
  comfRainWipers,
  comfHud,
  comfCruiseControl,
  comfDriveModes,
  comfPaddleShifter,
  comfKeyType,
  comfPushStart,
  comfRemoteStart,
  comfCentralLock,
  comfPowerDoorLocks,
  comfRearCamera,
  comfPowerWindows,
  comfPowerMirrors,
  comfMirrorsAutoFold,
  comfPowerBoot,
  comfCupHolders,
  comfArmRest,
  comfHandbrake,
  comfBrakeHold,
  comfAutoPark,
  comfIntLighting,
  comfGloveLamp,
  comfCargoLamp,
  comfFrontOutlet,
  comfRearOutlet,
  comfTpms,
  comfWirelessCharger,
  comfBossSeatSwitch
]);
        const id5 = insert5.insertId;
        const [result5] = await pool.query(`SELECT * FROM tbl_vehicle_comfort_features WHERE id = ?`, [id5]);       

        await pool.query(
            `INSERT INTO tbl_vehicle_features 
            (safetyFeaturesId, exteriorFeaturesId, instrumentationFeaturesId, infotainmentFeaturesId, comfortFeaturesId, vehicleId) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [id, id2, id4, id3, id5, vehicleId] 
      );

        res.status(201).json({...result1[0], ...result2[0], ...result3[0], ...result4[0], ...result5[0]});  
        } catch (error) {
        console.error("Error in addVehicleFeatures:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}





export const getVehicleFeatures = async (req, res) => {
  try {
    const [result] = await pool.query(`SELECT 
          vf.*,
          vsf.*,
          vef.*,
          vif.*,
          viif.*,
          vcf.*,
          v.*
        FROM tbl_vehicle_features vf
        JOIN tbl_vehicle_safety_features vsf ON vf.safetyFeaturesId = vsf.id
        JOIN tbl_vehicle_exterior_features vef ON vf.exteriorFeaturesId = vef.id
        JOIN tbl_vehicle_instrumentation_features viif ON vf.instrumentationFeaturesId = viif.id
        JOIN tbl_vehicle_infotainment_features vif ON vf.infotainmentFeaturesId = vif.id
        JOIN tbl_vehicle_comfort_features vcf ON vf.comfortFeaturesId = vcf.id
        JOIN tbl_vehicles v ON vf.vehicleId = v.id
        WHERE vf.status = 'Y'`);

    if (result.length === 0) {
      return res.status(404).json({ message: "No vehicle features found" });
    }

    res.status(200).send(result)
  } catch (error) {
    console.error("Error in getting vehicle features:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    
  }
}





export const updateVehicleFeature = async (req, res) =>{
  try {
    
  } catch (error) {
    console.error("Error in updating vehicle Features:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    
  }
}






export const updateVehicleFeatures = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleId,

      // Safety
      safAirbags, safAutoDoorLock, safSeatbelts, safAntiTheft, safDriverBeltWarn,
      safDownhillAssist, safPassengerBeltWarn, safHillStartAssist, safImmobilizer,
      safTractionControl, safDoorOpenWarn, safVehicleStability, safChildLock,
      safRearFogLamp, safIsofix, safAeb, safHighMountStop, safBlindSpotDetect,
      safAbs, safLdws, safEbd, safLkas, safBrakeAssist,

      // Exterior
      extBrakeAssist, extAdjHeadlights, extColoredDoorHandles, extRearSpoiler,
      extSideMirrorsInd, extSunRoof, extMoonRoof, extFogLights, extDrl,
      extRoofRails, extSideSteps, extDualExhaust,

      // Instrumentation
      instTachometer, instMultiInfo, instInfoCluster,

      // Infotainment
      infoCdPlayer, infoDvdPlayer, infoSpeakers, infoUsbAux, infoFrontSpeakers,
      infoBluetooth, infoRearSpeakers, infoDisplay, infoRearSeatEntertainment,
      infoVoiceControl, infoAndroidAuto, infoAppleCarPlay,

      // Comfort
      comfAirConditioner, comfClimateControl, comfAirPurifier, comfRearAC, comfThirdRowAC,
      comfHeater, comfHeatedSeats, comfDefogger, comfCoolBox, comfNavigation,
      comfOptNavigation, comfFrontCamera, comfPowerSteering, comfCamera360, comfFrontSensors,
      comfAutoDimMirror, comfRearCentralControl, comfRearFoldingSeat, comfRearHeadrest,
      comfRearWiper, comfSeatMaterial, comfDriverElecAdjust, comfDriverLumbar, comfDriverMemory,
      comfPassengerElecAdjust, comfSteeringAdjust, comfSteeringSwitches, comfHeadlightReminder,
      comfAutoHeadlamps, comfRainWipers, comfHud, comfCruiseControl, comfDriveModes,
      comfPaddleShifter, comfKeyType, comfPushStart, comfRemoteStart, comfCentralLock,
      comfPowerDoorLocks, comfRearCamera, comfPowerWindows, comfPowerMirrors, comfMirrorsAutoFold,
      comfPowerBoot, comfCupHolders, comfArmRest, comfHandbrake, comfBrakeHold,
      comfAutoPark, comfIntLighting, comfGloveLamp, comfCargoLamp, comfFrontOutlet,
      comfRearOutlet, comfTpms, comfWirelessCharger, comfBossSeatSwitch
    } = req.body;

    // Step 1: Get existing feature linkage
    const [featureRow] = await pool.query(
      `SELECT * FROM tbl_vehicle_features WHERE id = ?`,
      [id]
    );
    if (featureRow.length === 0) {
      return res.status(404).json({ message: "Vehicle features not found" });
    }

    const {
      safetyFeaturesId,
      exteriorFeaturesId,
      instrumentationFeaturesId,
      infotainmentFeaturesId,
      comfortFeaturesId
    } = featureRow[0];

    // Step 2: Update each feature table
    await pool.query(`UPDATE tbl_vehicle_safety_features SET
      safAirbags = ?, safAutoDoorLock = ?, safSeatbelts = ?, safAntiTheft = ?,
      safDriverBeltWarn = ?, safDownhillAssist = ?, safPassengerBeltWarn = ?, safHillStartAssist = ?,
      safImmobilizer = ?, safTractionControl = ?, safDoorOpenWarn = ?, safVehicleStability = ?,
      safChildLock = ?, safRearFogLamp = ?, safIsofix = ?, safAeb = ?, safHighMountStop = ?,
      safBlindSpotDetect = ?, safAbs = ?, safLdws = ?, safEbd = ?, safLkas = ?, safBrakeAssist = ?
      WHERE id = ?`,
      [
        safAirbags, safAutoDoorLock, safSeatbelts, safAntiTheft,
        safDriverBeltWarn, safDownhillAssist, safPassengerBeltWarn, safHillStartAssist,
        safImmobilizer, safTractionControl, safDoorOpenWarn, safVehicleStability,
        safChildLock, safRearFogLamp, safIsofix, safAeb, safHighMountStop,
        safBlindSpotDetect, safAbs, safLdws, safEbd, safLkas, safBrakeAssist,
        safetyFeaturesId
      ]
    );

    await pool.query(`UPDATE tbl_vehicle_exterior_features SET
      extBrakeAssist = ?, extAdjHeadlights = ?, extColoredDoorHandles = ?, extRearSpoiler = ?,
      extSideMirrorsInd = ?, extSunRoof = ?, extMoonRoof = ?, extFogLights = ?,
      extDrl = ?, extRoofRails = ?, extSideSteps = ?, extDualExhaust = ?
      WHERE id = ?`,
      [
        extBrakeAssist, extAdjHeadlights, extColoredDoorHandles, extRearSpoiler,
        extSideMirrorsInd, extSunRoof, extMoonRoof, extFogLights,
        extDrl, extRoofRails, extSideSteps, extDualExhaust,
        exteriorFeaturesId
      ]
    );

    await pool.query(`UPDATE tbl_vehicle_instrumentation_features SET
      instTachometer = ?, instMultiInfo = ?, instInfoCluster = ?
      WHERE id = ?`,
      [instTachometer, instMultiInfo, instInfoCluster, instrumentationFeaturesId]
    );

    await pool.query(`UPDATE tbl_vehicle_infotainment_features SET
      infoCdPlayer = ?, infoDvdPlayer = ?, infoSpeakers = ?, infoUsbAux = ?,
      infoFrontSpeakers = ?, infoBluetooth = ?, infoRearSpeakers = ?, infoDisplay = ?,
      infoRearSeatEntertainment = ?, infoVoiceControl = ?, infoAndroidAuto = ?, infoAppleCarPlay = ?
      WHERE id = ?`,
      [
        infoCdPlayer, infoDvdPlayer, infoSpeakers, infoUsbAux,
        infoFrontSpeakers, infoBluetooth, infoRearSpeakers, infoDisplay,
        infoRearSeatEntertainment, infoVoiceControl, infoAndroidAuto, infoAppleCarPlay,
        infotainmentFeaturesId
      ]
    );

    await pool.query(`UPDATE tbl_vehicle_comfort_features SET
      comfAirConditioner = ?, comfClimateControl = ?, comfAirPurifier = ?, comfRearAC = ?, comfThirdRowAC = ?,
      comfHeater = ?, comfHeatedSeats = ?, comfDefogger = ?, comfCoolBox = ?, comfNavigation = ?,
      comfOptNavigation = ?, comfFrontCamera = ?, comfPowerSteering = ?, comfCamera360 = ?, comfFrontSensors = ?,
      comfAutoDimMirror = ?, comfRearCentralControl = ?, comfRearFoldingSeat = ?, comfRearHeadrest = ?, comfRearWiper = ?,
      comfSeatMaterial = ?, comfDriverElecAdjust = ?, comfDriverLumbar = ?, comfDriverMemory = ?, comfPassengerElecAdjust = ?,
      comfSteeringAdjust = ?, comfSteeringSwitches = ?, comfHeadlightReminder = ?, comfAutoHeadlamps = ?, comfRainWipers = ?,
      comfHud = ?, comfCruiseControl = ?, comfDriveModes = ?, comfPaddleShifter = ?, comfKeyType = ?, comfPushStart = ?,
      comfRemoteStart = ?, comfCentralLock = ?, comfPowerDoorLocks = ?, comfRearCamera = ?, comfPowerWindows = ?,
      comfPowerMirrors = ?, comfMirrorsAutoFold = ?, comfPowerBoot = ?, comfCupHolders = ?, comfArmRest = ?, comfHandbrake = ?,
      comfBrakeHold = ?, comfAutoPark = ?, comfIntLighting = ?, comfGloveLamp = ?, comfCargoLamp = ?, comfFrontOutlet = ?,
      comfRearOutlet = ?, comfTpms = ?, comfWirelessCharger = ?, comfBossSeatSwitch = ?
      WHERE id = ?`,
      [
        comfAirConditioner, comfClimateControl, comfAirPurifier, comfRearAC, comfThirdRowAC,
        comfHeater, comfHeatedSeats, comfDefogger, comfCoolBox, comfNavigation,
        comfOptNavigation, comfFrontCamera, comfPowerSteering, comfCamera360, comfFrontSensors,
        comfAutoDimMirror, comfRearCentralControl, comfRearFoldingSeat, comfRearHeadrest, comfRearWiper,
        comfSeatMaterial, comfDriverElecAdjust, comfDriverLumbar, comfDriverMemory, comfPassengerElecAdjust,
        comfSteeringAdjust, comfSteeringSwitches, comfHeadlightReminder, comfAutoHeadlamps, comfRainWipers,
        comfHud, comfCruiseControl, comfDriveModes, comfPaddleShifter, comfKeyType, comfPushStart,
        comfRemoteStart, comfCentralLock, comfPowerDoorLocks, comfRearCamera, comfPowerWindows,
        comfPowerMirrors, comfMirrorsAutoFold, comfPowerBoot, comfCupHolders, comfArmRest, comfHandbrake,
        comfBrakeHold, comfAutoPark, comfIntLighting, comfGloveLamp, comfCargoLamp, comfFrontOutlet,
        comfRearOutlet, comfTpms, comfWirelessCharger, comfBossSeatSwitch,
        comfortFeaturesId
      ]
    );

    // Step 3: Update parent record (vehicleId could change)
    await pool.query(
      `UPDATE tbl_vehicle_features SET vehicleId = ? WHERE id = ?`,
      [vehicleId, id]
    );

    res.status(200).json({ message: "Vehicle features updated successfully" });

  } catch (error) {
    console.error("❌ Error in updateVehicleFeatures:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};





export const deleteVehicleFeature = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error in deleting vehicle feature:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    
  }
}