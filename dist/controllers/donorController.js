"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDonor = addDonor;
exports.getDonors = getDonors;
exports.getDonorById = getDonorById;
exports.deleteDonor = deleteDonor;
const donor_1 = require("../models/donor");
// ...existing code...
async function addDonor(req, res) {
    const { name, amount, country, donationDate } = req.body;
    try {
        await donor_1.DonorModel.create({ name, amount, country, donationDate });
        res.status(201).send({ message: 'Donor added successfully' });
    }
    catch (error) {
        console.error('Error adding donor:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
async function getDonors(req, res) {
    try {
        const donors = await donor_1.DonorModel.find();
        res.status(200).json(donors);
    }
    catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
async function getDonorById(req, res) {
    const donorId = req.params.id;
    try {
        const donor = await donor_1.DonorModel.findById(donorId);
        if (donor) {
            res.status(200).json(donor);
        }
        else {
            res.status(404).send({ message: 'Donor not found' });
        }
    }
    catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
async function deleteDonor(req, res) {
    const donorId = req.params.id;
    try {
        await donor_1.DonorModel.findByIdAndDelete(donorId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting donor:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}
