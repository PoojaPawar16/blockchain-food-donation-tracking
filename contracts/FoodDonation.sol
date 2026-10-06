// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FoodDonation {

    // Donation structure
    struct Donation {
        uint256 donationId;
        string donorName;
        string foodType;
        uint256 quantity;
        string donationDate;
        string receiverName;
        string status;
        address donorWallet;
        uint256 timestamp;
    }

    // Donation ID counter
    uint256 private donationCounter;

    // Store donations
    mapping(uint256 => Donation) private donations;

    // Event emitted whenever a donation is created
    event DonationRecorded(
        uint256 indexed donationId,
        string donorName,
        string foodType,
        uint256 quantity,
        string receiverName,
        string status,
        address indexed donorWallet
    );

    // Event emitted whenever status changes
    event DonationStatusUpdated(
        uint256 indexed donationId,
        string oldStatus,
        string newStatus
    );

    // Create a new donation
    function recordDonation(
        string memory _donorName,
        string memory _foodType,
        uint256 _quantity,
        string memory _donationDate,
        string memory _receiverName
    ) public {

        donationCounter++;

        donations[donationCounter] = Donation({
            donationId: donationCounter,
            donorName: _donorName,
            foodType: _foodType,
            quantity: _quantity,
            donationDate: _donationDate,
            receiverName: _receiverName,
            status: "Donated",
            donorWallet: msg.sender,
            timestamp: block.timestamp
        });

        emit DonationRecorded(
            donationCounter,
            _donorName,
            _foodType,
            _quantity,
            _receiverName,
            "Donated",
            msg.sender
        );
    }

    // Update donation status
    function updateStatus(
        uint256 _donationId,
        string memory _newStatus
    ) public {

        require(
            _donationId > 0 &&
            _donationId <= donationCounter,
            "Donation does not exist"
        );

        require(
            keccak256(bytes(_newStatus)) ==
                keccak256(bytes("Donated")) ||
            keccak256(bytes(_newStatus)) ==
                keccak256(bytes("Received")) ||
            keccak256(bytes(_newStatus)) ==
                keccak256(bytes("Distributed")),
            "Invalid status"
        );

        string memory oldStatus =
            donations[_donationId].status;

        donations[_donationId].status =
            _newStatus;

        emit DonationStatusUpdated(
            _donationId,
            oldStatus,
            _newStatus
        );
    }

    // Get a donation by ID
    function getDonation(
        uint256 _donationId
    )
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            string memory,
            string memory,
            string memory,
            address,
            uint256
        )
    {
        require(
            _donationId > 0 &&
            _donationId <= donationCounter,
            "Donation does not exist"
        );

        Donation memory donation =
            donations[_donationId];

        return (
            donation.donationId,
            donation.donorName,
            donation.foodType,
            donation.quantity,
            donation.donationDate,
            donation.receiverName,
            donation.status,
            donation.donorWallet,
            donation.timestamp
        );
    }

    // Get total number of donations
    function getDonationCount()
        public
        view
        returns (uint256)
    {
        return donationCounter;
    }
}