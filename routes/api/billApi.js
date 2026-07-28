const express = require("express");
const router = express.Router();

const PDFDocument = require("pdfkit");

const { User } = require("../../models/userModel");
const { Society } = require("../../models/societyModel");

const date = require("../../date/date");

const {
    createNotification
} = require("../../services/notificationService");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
GET CURRENT USER BILL
=================================================
*/

router.get(
    "/bills",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const resident =
                await User.findById(req.user._id);

            if (!resident) {

                return res.status(404).json({

                    success: false,

                    message: "Resident not found."

                });

            }

            const society =
                await Society.findOne({

                    societyName: resident.societyName

                });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            const today = new Date();

            let totalMonth = 0;

            let dateFrom = resident.createdAt;

            if (resident.lastPayment?.date) {

                dateFrom = resident.lastPayment.date;

                totalMonth = date.monthDiff(
                    dateFrom,
                    today
                );

            } else {

                totalMonth =
                    date.monthDiff(
                        dateFrom,
                        today
                    ) + 1;

            }

            const monthlyTotal = Object.values(

                society.maintenanceBill

            )
            .filter(value => typeof value === "number")
            .reduce((sum, value) => sum + value, 0);

            let credit = 0;

            let due = 0;

            if (totalMonth === 0) {

                credit = monthlyTotal;

            } else if (totalMonth > 1) {

                due =
                    (totalMonth - 1) *
                    monthlyTotal;

            }

            const totalAmount =
                monthlyTotal +
                due -
                credit;

            resident.makePayment =
                totalAmount;

            await resident.save();

            return res.json({

                success: true,

                bill: {

                    resident: {

                        id: resident._id,

                        firstName:
                            resident.firstName,

                        lastName:
                            resident.lastName,

                        flatNumber:
                            resident.flatNumber

                    },

                    society: {

                        societyName:
                            society.societyName

                    },

                    maintenanceBill:
                        society.maintenanceBill,

                    monthlyTotal,

                    pendingDue: due,

                    creditBalance: credit,

                    totalAmount,

                    receipt:
                        resident.lastPayment,

                    month: date.month,

                    year: date.year,

                    today: date.today

                }

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch bill."

            });

        }

    }
);

/*
=================================================
DOWNLOAD BILL PDF
=================================================
*/

router.get(
    "/bills/pdf",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const resident = await User.findById(req.user._id);

            if (!resident) {

                return res.status(404).json({

                    success: false,

                    message: "Resident not found."

                });

            }

            const society = await Society.findOne({

                societyName: resident.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

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

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

            res.setHeader(

                "Content-Disposition",

                `attachment; filename=Maintenance_Bill_${resident.flatNumber}.pdf`

            );

            doc.pipe(res);

            /*
            ----------------------------------
            HEADER
            ----------------------------------
            */

            doc
                .fontSize(24)
                .fillColor("#d62839")
                .text(
                    "Maintenance Bill",
                    {
                        align: "center"
                    }
                );

            doc.moveDown();

            doc
                .fillColor("black")
                .fontSize(14);

            doc.text(
                `Society : ${society.societyName}`
            );

            doc.text(
                `Resident : ${resident.firstName} ${resident.lastName}`
            );

            doc.text(
                `Flat : ${resident.flatNumber}`
            );

            doc.text(
                `Date : ${new Date().toLocaleDateString()}`
            );

            doc.moveDown();

            /*
            ----------------------------------
            TABLE
            ----------------------------------
            */

            const startY = doc.y;

            doc.rect(
                50,
                startY,
                500,
                25
            ).fill("#d62839");

            doc.fillColor("white");

            doc.text("Sr",65,startY+7);

            doc.text(
                "Particular",
                120,
                startY+7
            );

            doc.text(
                "Amount",
                450,
                startY+7
            );

            doc.fillColor("black");

            const rows = [

                ["1","Society Charges",bill.societyCharges],

                ["2","Repairs & Maintenance",bill.repairsAndMaintenance],

                ["3","Sinking Fund",bill.sinkingFund],

                ["4","Water Charges",bill.waterCharges],

                ["5","Insurance Charges",bill.insuranceCharges],

                ["6","Parking Charges",bill.parkingCharges]

            ];

            let y = startY + 30;

            rows.forEach(row => {

                doc.rect(
                    50,
                    y,
                    500,
                    25
                ).stroke();

                doc.text(row[0],65,y+7);

                doc.text(row[1],120,y+7);

                doc.text(
                    "₹ " + row[2],
                    450,
                    y+7
                );

                y += 25;

            });

            doc.rect(
                50,
                y,
                500,
                30
            ).fill("#d62839");

            doc.fillColor("white");

            doc.text(
                "Total Amount",
                300,
                y+8
            );

            doc.text(
                "₹ " + total,
                450,
                y+8
            );

            doc.end();

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to generate bill."

            });

        }

    }
);

/*
=================================================
UPDATE MAINTENANCE BILL
=================================================
*/

router.put(
    "/bills/settings",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const {

                societyCharges,
                repairsAndMaintenance,
                sinkingFund,
                waterCharges,
                insuranceCharges,
                parkingCharges

            } = req.body;

            const society = await Society.findOne({

                societyName: req.user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            society.maintenanceBill = {

                societyCharges: Number(societyCharges),

                repairsAndMaintenance: Number(repairsAndMaintenance),

                sinkingFund: Number(sinkingFund),

                waterCharges: Number(waterCharges),

                insuranceCharges: Number(insuranceCharges),

                parkingCharges: Number(parkingCharges)

            };

            await society.save();

            /*
            -----------------------------------------
            Notify all approved residents
            -----------------------------------------
            */

            const residents = await User.find({

                societyName: req.user.societyName,

                validation: "approved"

            });

            await Promise.all(

                residents.map(resident =>

                    createNotification({

                        user: resident._id,

                        title: "Maintenance Charges Updated",

                        message: "The maintenance charges have been updated.",

                        type: "success",

                        icon: "fa-file-invoice-dollar",

                        link: "/bill"

                    })

                )

            );

            return res.json({

                success: true,

                message: "Maintenance charges updated successfully.",

                maintenanceBill: society.maintenanceBill

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to update maintenance charges."

            });

        }

    }
);

/*
=================================================
PAYMENT HISTORY
=================================================
*/

router.get(
    "/bills/history",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const resident = await User.findById(req.user._id)
                .select("paymentHistory lastPayment");

            if (!resident) {

                return res.status(404).json({

                    success: false,

                    message: "Resident not found."

                });

            }

            return res.json({

                success: true,

                paymentHistory: resident.paymentHistory || [],

                lastPayment: resident.lastPayment || null

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch payment history."

            });

        }

    }
);

module.exports = router;