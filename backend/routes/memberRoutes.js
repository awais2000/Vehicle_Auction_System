import express from  'express';
import { uploadVehicleImages } from "../middlewares/uploadMiddleware.js"; 
import { authenticateToken, isAdmin, isSeller, isMember } from "../middlewares/authMiddleware.js";
import {getVehicleByMake, getVehicles} from '../controllers/vehicleController.js';
import { myBids, lotsWon, lotsLost } from '../controllers/bidReportingController.js';
import {getSalesInfo} from '../controllers/salesController.js';
import { startBidding } from '../controllers/biddingController.js';
import { createAlert } from '../controllers/alertController.js';
import { sellIndividual, updateIndividual } from '../controllers/sellVehicle.js';
import { contactFrom, deleteContactUs, updateContactUs } from '../controllers/contactUsController.js';
import { getVehiclePrices } from '../controllers/featureSpecController.js';



const app = express();

export default app => {
    app.get('/member/getVehicles', getVehicles); 

    app.get('/member/getSalesInfo', getSalesInfo); 

    app.get('/member/myBids/:id', myBids);

    app.get('/member/lotsWon/:id', lotsWon);//this is pending

    app.get('/member/lotsLost/:id', lotsLost);


    //start bidding
    app.post('/member/startBidding',  startBidding); 

    // app.get('/member/getBids', getBids);

    //here alert module starts:
    app.post('/member/createAlert',  createAlert);

    app.post('/member/sellIndividual', sellIndividual);

    app.post('/member/contactFrom', contactFrom);

    app.put('/member/updateContactUs/:id', updateContactUs);

    app.patch('/member/deleteContactUs/:id', deleteContactUs);

    app.get('/member/getVehicleByMake', getVehicleByMake);

    app.get('/memeber/getVehiclePrices', getVehiclePrices);

    app.get('/memeber/getVehicleSpecs', getVehiclePrices); 
}