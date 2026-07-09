const express = require("express");
const router = express.Router();

const PDFDocument = require("pdfkit");

const user_collection = require("../models/userModel");
const society_collection = require("../models/societyModel");

const date = require("../date/date");

const {
    isLoggedIn,
    isAdmin,
    isVerified,
    isApproved
} = require("../middleware/auth");

router.get(
    "/bill",
    isLoggedIn,
    isApproved,
    async (req, res) => {
        try {
            const foundUser = await user_collection.User.findById(req.user.id);
            const foundSociety = await society_collection.Society.findOne({societyName: foundUser.societyName});
            if (!foundSociety) {
            return res.status(404).send("Society not found");
            }
            
            const dateToday = new Date();
            // Payment required for total number of months
            let totalMonth = 0;
            // If lastPayment doesn't exist
            let dateFrom = foundUser.createdAt;
            // If lastPayment exists
            if(foundUser.lastPayment.date){
                dateFrom = foundUser.lastPayment.date;
                totalMonth = date.monthDiff(dateFrom,dateToday);
            }
            else {
                // Add an extra month, as users joining date month payment's also pending
                totalMonth = date.monthDiff(dateFrom,dateToday) + 1;
            }
            
            // Calculate monthly bill of society maintenance
            const monthlyTotal = Object.values(foundSociety.maintenanceBill)
                .filter(ele => typeof(ele)=='number')
                .reduce((sum,ele) => sum+ele, 0);
                
            let credit = 0;
            let due = 0;
            if(totalMonth==0){
                // Calculate credit balance
                credit = monthlyTotal;
            }
            else if(totalMonth>1){
                // Calculate pending due
                due = (totalMonth-1)*monthlyTotal;
            }
            const totalAmount = monthlyTotal + due - credit;
            
            // Fetch validated society residents for admin features
            const foundUsers = await user_collection.User.find({
                $and: [
                    {"societyName": req.user.societyName},
                    {"validation": "approved"}
                ]
            });
            
            // Update amount to be paid on respective user collection
            foundUser.makePayment = totalAmount;
            await foundUser.save();
            
           res.render("bill", {
               resident: foundUser,
               society: foundSociety,
               totalAmount: totalAmount,
               pendingDue: due,
               creditBalance: credit,
               monthName: date.month,
               date: date.today,
               year: date.year,
               receipt: foundUser.lastPayment,
               societyResidents: foundUsers,
               monthlyTotal: monthlyTotal,
               razorpayKey: process.env.RAZORPAY_KEY_ID
            });
        } catch(err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    
});

router.get(
    "/editBill",
    isLoggedIn,
    isAdmin,
    async (req, res) => {
try {

    const foundSociety =
        await society_collection.Society.findOne(
            {
                societyName: req.user.societyName
            },
            {
                maintenanceBill: 1
            }
        );

    if (!foundSociety) {
        return res.status(404).send("Society not found");
    }

    res.render("editBill", {
        maintenanceBill: foundSociety.maintenanceBill
    });

}
catch (err) {

    console.error(err);

    res.status(500).send("Server error");

}
    
});

router.get(
    "/download-bill",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const resident = await user_collection.User.findById(req.user.id);

            if (!resident) {
                return res.status(404).send("Resident not found");
            }

            const society = await society_collection.Society.findOne({
                societyName: resident.societyName
            });

            if (!society) {
                return res.status(404).send("Society not found");
            }

            // ↓↓↓ KEEP YOUR EXISTING PDF CODE BELOW ↓↓↓

            const bill = society.maintenanceBill;

            const total =
                Number(bill.societyCharges) +
                Number(bill.repairsAndMaintenance) +
                Number(bill.sinkingFund) +
                Number(bill.waterCharges) +
                Number(bill.insuranceCharges) +
                Number(bill.parkingCharges);

            const doc = new PDFDocument({
                size: "A4",
                margin: 50
            });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Maintenance_Bill.pdf"
            );

            doc.pipe(res);

            doc
                .fontSize(24)
                .fillColor("#d62839")
                .text("Maintenance Bill", {
                    align: "center"
                });

            doc.moveDown();

            doc
                .fillColor("black")
                .fontSize(15);

            doc.text(`Society : ${society.societyName}`);
            doc.text(`Resident : ${resident.firstName} ${resident.lastName}`);
            doc.text(`Flat No : ${resident.flatNumber}`);
            doc.text(`Date : ${new Date().toLocaleDateString()}`);

            doc.moveDown();

            const startY = doc.y;

            doc.rect(50, startY, 500, 25).fill("#d62839");

            doc.fillColor("white");

            doc.text("Sr", 65, startY + 7);
            doc.text("Particular", 120, startY + 7);
            doc.text("Amount", 450, startY + 7);

            doc.fillColor("black");

            const rows = [
                ["1", "Society Charges", bill.societyCharges],
                ["2", "Repairs & Maintenance", bill.repairsAndMaintenance],
                ["3", "Sinking Fund", bill.sinkingFund],
                ["4", "Water Charges", bill.waterCharges],
                ["5", "Insurance Charges", bill.insuranceCharges],
                ["6", "Parking Charges", bill.parkingCharges]
            ];

            let y = startY + 30;

            rows.forEach(r => {

                doc.rect(50, y, 500, 25).stroke();

                doc.text(r[0], 65, y + 7);
                doc.text(r[1], 120, y + 7);
                doc.text("₹ " + r[2], 450, y + 7);

                y += 25;

            });

            doc.rect(50, y, 500, 30).fill("#d62839");

            doc.fillColor("white");

            doc.text("Total Amount", 300, y + 8);
            doc.text("₹ " + total, 450, y + 8);

            doc.end();

        } catch (err) {

            console.error(err);

            res.status(500).send("Unable to generate PDF");

        }

    }
);

router.post(
    "/editBill",
    isLoggedIn,
    isAdmin,
    async (req, res) => {
try {

    await society_collection.Society.updateOne(

        {
            societyName: req.user.societyName
        },

        {

            $set: {

                maintenanceBill: {

                    societyCharges: req.body.societyCharges,

                    repairsAndMaintenance:
                        req.body.repairsAndMaintenance,

                    sinkingFund:
                        req.body.sinkingFund,

                    waterCharges:
                        req.body.waterCharges,

                    insuranceCharges:
                        req.body.insuranceCharges,

                    parkingCharges:
                        req.body.parkingCharges

                }

            }

        }

    );

    res.redirect("/bill");

}

catch (err) {

    console.error(err);

    res.status(500).send("Server error");

}
});

module.exports = router;