// ==========================================
// FoodChain - Frontend JavaScript
// ==========================================

// ==========================================
// API URL
// ==========================================

const API_URL = "http://localhost:5000/api/donations";


// ==========================================
// BLOCKCHAIN CONFIGURATION
// ==========================================

const CONTRACT_ADDRESS =
    "0x1a3e494006e27988cd917c3f386b12944a3e1322";

const CONTRACT_ABI = [

    // Record donation
    "function recordDonation(string,string,uint256,string,string)",

    // Get donation
    "function getDonation(uint256) view returns (uint256,string,string,uint256,string,string,string,address,uint256)",

    // Get total blockchain donation count
    "function getDonationCount() view returns (uint256)",

    // Update blockchain status
    "function updateStatus(uint256,string)",

    // Donation recorded event
    "event DonationRecorded(uint256 indexed donationId,string donorName,string foodType,uint256 quantity,string receiverName,string status,address indexed donorWallet)",

    // Status updated event
    "event DonationStatusUpdated(uint256 indexed donationId,string oldStatus,string newStatus)"
];


// ==========================================
// BLOCKCHAIN VARIABLES
// ==========================================

let provider = null;
let signer = null;
let donationContract = null;


// ==========================================
// DOM ELEMENTS
// ==========================================

const donationModal =
    document.getElementById("donationModal");

const donationForm =
    document.getElementById("donationForm");

const navDonateBtn =
    document.getElementById("navDonateBtn");

const heroDonateBtn =
    document.getElementById("heroDonateBtn");

const newDonationBtn =
    document.getElementById("newDonationBtn");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelDonationBtn =
    document.getElementById("cancelDonationBtn");

const connectWalletBtn =
    document.getElementById("connectWalletBtn");

const donationDate =
    document.getElementById("donationDate");

const trackDonationBtn =
    document.getElementById("trackDonationBtn");


// ==========================================
// OPEN DONATION MODAL
// ==========================================

function openDonationModal() {

    if (donationModal) {
        donationModal.classList.add("active");
    }

}


// ==========================================
// CLOSE DONATION MODAL
// ==========================================

function closeDonationModal() {

    if (donationModal) {
        donationModal.classList.remove("active");
    }

}


// ==========================================
// DONATE BUTTONS
// ==========================================

if (navDonateBtn) {

    navDonateBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openDonationModal();

        }
    );

}


if (heroDonateBtn) {

    heroDonateBtn.addEventListener(
        "click",
        openDonationModal
    );

}


if (newDonationBtn) {

    newDonationBtn.addEventListener(
        "click",
        openDonationModal
    );

}


// ==========================================
// CLOSE BUTTONS
// ==========================================

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeDonationModal
    );

}


if (cancelDonationBtn) {

    cancelDonationBtn.addEventListener(
        "click",
        closeDonationModal
    );

}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

if (donationModal) {

    donationModal.addEventListener(
        "click",
        function (event) {

            if (event.target === donationModal) {

                closeDonationModal();

            }

        }
    );

}


// ==========================================
// CLOSE MODAL WITH ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeDonationModal();

        }

    }
);


// ==========================================
// SET TODAY'S DATE
// ==========================================

function setTodayDate() {

    if (!donationDate) {
        return;
    }

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    donationDate.value =
        `${year}-${month}-${day}`;
}

setTodayDate();


// ==========================================
// CHECK ETHERS.JS
// ==========================================

if (typeof ethers === "undefined") {

    console.error(
        "Ethers.js is not loaded."
    );

    alert(
        "Ethers.js could not be loaded. Please check index.html."
    );

}


// ==========================================
// CONNECT METAMASK
// ==========================================

if (connectWalletBtn) {

    connectWalletBtn.addEventListener(
        "click",
        connectMetaMask
    );

}


async function connectMetaMask() {

    // ------------------------------------------
    // Check MetaMask
    // ------------------------------------------

    if (!window.ethereum) {

        alert(
            "MetaMask is not installed. Please install MetaMask first."
        );

        return;
    }


    try {

        // ------------------------------------------
        // Request MetaMask account
        // ------------------------------------------

        await window.ethereum.request({
            method: "eth_requestAccounts"
        });


        // ------------------------------------------
        // Create provider
        // ------------------------------------------

        provider =
            new ethers.BrowserProvider(
                window.ethereum
            );


        // ------------------------------------------
        // Check network
        // ------------------------------------------

        const network =
            await provider.getNetwork();


        // Ethereum Sepolia Chain ID
        if (network.chainId !== 11155111n) {

            alert(
                "Please switch MetaMask to Ethereum Sepolia."
            );

            return;
        }


        // ------------------------------------------
        // Get signer
        // ------------------------------------------

        signer =
            await provider.getSigner();


        // ------------------------------------------
        // Create contract
        // ------------------------------------------

        donationContract =
            new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );


        // ------------------------------------------
        // Get wallet address
        // ------------------------------------------

        const address =
            await signer.getAddress();


        const shortAccount =
            address.substring(0, 6) +
            "..." +
            address.substring(
                address.length - 4
            );


        // ------------------------------------------
        // Update button
        // ------------------------------------------

        connectWalletBtn.innerHTML =
            "🦊 " + shortAccount;


        connectWalletBtn.classList.add(
            "connected"
        );


        console.log(
            "MetaMask connected:",
            address
        );


        console.log(
            "Connected network: Ethereum Sepolia"
        );


        console.log(
            "Smart contract:",
            CONTRACT_ADDRESS
        );


        alert(
            "MetaMask connected successfully!"
        );


    } catch (error) {

    console.error(
        "MetaMask connection error:",
        error
    );

    alert(
        "MetaMask Error: " +
        (error.message || error)
    );

}

}


// ==========================================
// SUBMIT DONATION
// ==========================================

if (donationForm) {

    donationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // GET FORM VALUES
            // ==========================================

            const donorName =
                document
                    .getElementById("donorName")
                    .value
                    .trim();


            const foodType =
                document
                    .getElementById("foodType")
                    .value;


            const quantity =
                document
                    .getElementById("quantity")
                    .value;


            const donationDateValue =
                document
                    .getElementById("donationDate")
                    .value;


            const receiver =
                document
                    .getElementById("receiver")
                    .value
                    .trim();


            // ==========================================
            // VALIDATE FORM
            // ==========================================

            if (
                !donorName ||
                !foodType ||
                !quantity ||
                !donationDateValue ||
                !receiver
            ) {

                alert(
                    "Please fill in all fields."
                );

                return;
            }


            if (Number(quantity) <= 0) {

                alert(
                    "Quantity must be greater than 0."
                );

                return;
            }


            // ==========================================
            // CHECK METAMASK
            // ==========================================

            if (!donationContract) {

                alert(
                    "Please connect MetaMask before submitting a donation."
                );

                return;
            }


            try {

                // ==========================================
                // DISABLE SUBMIT BUTTON
                // ==========================================

                const submitButton =
                    donationForm.querySelector(
                        ".submit-btn"
                    );


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "Processing...";

                }


                // ==========================================
                // STEP 1
                // RECORD DONATION ON BLOCKCHAIN
                // ==========================================

                alert(
                    "Your donation will now be recorded on the Sepolia blockchain. Please confirm the transaction in MetaMask."
                );


                console.log(
                    "Recording donation on blockchain..."
                );


                const blockchainTransaction =
                    await donationContract.recordDonation(

                        donorName,

                        foodType,

                        Number(quantity),

                        donationDateValue,

                        receiver

                    );


                console.log(
                    "Blockchain transaction submitted:",
                    blockchainTransaction.hash
                );


                // ==========================================
                // STEP 2
                // WAIT FOR CONFIRMATION
                // ==========================================

                const receipt =
                    await blockchainTransaction.wait();


                const transactionHash =
                    blockchainTransaction.hash;


                console.log(
                    "Blockchain transaction confirmed:",
                    transactionHash
                );


                console.log(
                    "Transaction receipt:",
                    receipt
                );


                // ==========================================
                // STEP 3
                // SAVE TO MYSQL
                // ==========================================

                console.log(
                    "Saving donation to MySQL..."
                );


                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                donorName:
                                    donorName,

                                foodType:
                                    foodType,

                                quantity:
                                    Number(quantity),

                                donationDate:
                                    donationDateValue,

                                receiver:
                                    receiver,

                                transactionHash:
                                    transactionHash

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to save donation in database."
                    );

                }


                // ==========================================
                // SUCCESS
                // ==========================================

                console.log(
                    "Donation saved successfully:",
                    data
                );


                alert(
                    "Donation successfully recorded on blockchain and saved to database!"
                );


                // ==========================================
                // RESET FORM
                // ==========================================

                donationForm.reset();

                setTodayDate();


                // ==========================================
                // CLOSE MODAL
                // ==========================================

                closeDonationModal();


                // ==========================================
                // RELOAD DONATIONS
                // ==========================================

                await loadDonations();


            } catch (error) {

                console.error(
                    "Donation error:",
                    error
                );


                // ------------------------------------------
                // User rejected MetaMask transaction
                // ------------------------------------------

                if (
                    error.code === 4001 ||
                    error.code === "ACTION_REJECTED"
                ) {

                    alert(
                        "Transaction was rejected in MetaMask."
                    );

                }

                // ------------------------------------------
                // Other error
                // ------------------------------------------

                else {

                    alert(
                        "Donation could not be completed.\n\n" +
                        (error.message ||
                            "Please check MetaMask, Sepolia and the backend.")
                    );

                }


            } finally {

                // ==========================================
                // ENABLE SUBMIT BUTTON AGAIN
                // ==========================================

                const submitButton =
                    donationForm.querySelector(
                        ".submit-btn"
                    );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Submit Donation";

                }

            }

        }
    );

}


// ==========================================
// LOAD DONATIONS FROM MYSQL
// ==========================================

async function loadDonations() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Failed to load donations"
            );

        }


        const donations =
            await response.json();


        console.log(
            "Donations loaded:",
            donations
        );


        renderDonations(donations);

        updateStatistics(donations);


    } catch (error) {

        console.error(
            "Error loading donations:",
            error
        );

    }

}


// ==========================================
// GET BLOCKCHAIN DONATION ID
// USING TRANSACTION HASH
// ==========================================

async function getBlockchainDonationId(
    transactionHash
) {

    try {

        if (!provider) {

            provider =
                new ethers.BrowserProvider(
                    window.ethereum
                );

        }


        const transactionReceipt =
            await provider.getTransactionReceipt(
                transactionHash
            );


        if (!transactionReceipt) {

            throw new Error(
                "Blockchain transaction receipt not found."
            );

        }


        // ------------------------------------------
        // Read blockchain logs
        // ------------------------------------------

        for (
            const log of transactionReceipt.logs
        ) {

            try {

                const parsedLog =
                    donationContract.interface.parseLog(
                        {
                            topics: log.topics,
                            data: log.data
                        }
                    );


                if (
                    parsedLog &&
                    parsedLog.name ===
                        "DonationRecorded"
                ) {

                    const blockchainDonationId =
                        parsedLog.args.donationId;


                    return Number(
                        blockchainDonationId
                    );

                }

            } catch (error) {

                // Ignore logs that are not
                // from DonationRecorded event

            }

        }


        throw new Error(
            "Could not find the blockchain donation ID."
        );


    } catch (error) {

        console.error(
            "Error finding blockchain donation ID:",
            error
        );

        throw error;

    }

}


// ==========================================
// RENDER DONATIONS IN TABLE
// ==========================================

function renderDonations(donations) {

    const tableBody =
        document.querySelector(
            ".donation-table"
        );


    if (!tableBody) {
        return;
    }


    // ------------------------------------------
    // Remove old rows
    // ------------------------------------------

    const oldRows =
        tableBody.querySelectorAll(
            ".table-row"
        );


    oldRows.forEach(
        row => row.remove()
    );


    // ------------------------------------------
    // Empty state
    // ------------------------------------------

    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (donations.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // ==========================================
    // CREATE DONATION ROWS
    // ==========================================

    donations.forEach(
        donation => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "table-row";


            // ==========================================
            // ID
            // ==========================================

            const idCell =
                document.createElement(
                    "div"
                );


            idCell.textContent =
                `#${donation.id}`;


            // ==========================================
            // DONOR
            // ==========================================

            const donorCell =
                document.createElement(
                    "div"
                );


            donorCell.textContent =
                donation.donorName;


            // ==========================================
            // FOOD
            // ==========================================

            const foodCell =
                document.createElement(
                    "div"
                );


            foodCell.textContent =
                donation.foodType;


            // ==========================================
            // QUANTITY
            // ==========================================

            const quantityCell =
                document.createElement(
                    "div"
                );


            quantityCell.textContent =
                `${donation.quantity} kg`;


            // ==========================================
            // DATE
            // ==========================================

            const dateCell =
                document.createElement(
                    "div"
                );


            dateCell.textContent =
                formatDate(
                    donation.donationDate
                );


            // ==========================================
            // RECEIVER
            // ==========================================

            const receiverCell =
                document.createElement(
                    "div"
                );


            receiverCell.textContent =
                donation.receiver;


            // ==========================================
            // STATUS
            // ==========================================

            const statusCell =
                document.createElement(
                    "div"
                );


            const statusSelect =
                document.createElement(
                    "select"
                );


            statusSelect.className =
                `status-select ${donation.status.toLowerCase()}`;


            const statuses = [
                "Donated",
                "Received",
                "Distributed"
            ];


            statuses.forEach(
                status => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        status;


                    option.textContent =
                        status;


                    if (
                        status ===
                        donation.status
                    ) {

                        option.selected =
                            true;

                    }


                    statusSelect.appendChild(
                        option
                    );

                }
            );


            // ==========================================
            // UPDATE STATUS
            // ==========================================

            statusSelect.addEventListener(
                "change",
                async function () {

                    const newStatus =
                        this.value;


                    const previousStatus =
                        donation.status;


                    // ----------------------------------
                    // Check MetaMask
                    // ----------------------------------

                    if (!donationContract) {

                        alert(
                            "Please connect MetaMask before updating the donation status."
                        );

                        this.value =
                            previousStatus;

                        return;
                    }


                    try {

                        // ----------------------------------
                        // Disable dropdown
                        // ----------------------------------

                        statusSelect.disabled =
                            true;


                        console.log(
                            "Finding blockchain donation ID..."
                        );


                        // ----------------------------------
                        // Find blockchain ID from
                        // original transaction
                        // ----------------------------------

                        const blockchainDonationId =
                            await getBlockchainDonationId(
                                donation.transactionHash
                            );


                        console.log(
                            "Blockchain donation ID:",
                            blockchainDonationId
                        );


                        // ----------------------------------
                        // Update status on blockchain
                        // ----------------------------------

                        console.log(
                            "Updating blockchain status..."
                        );


                        const blockchainTransaction =
                            await donationContract.updateStatus(
                                blockchainDonationId,
                                newStatus
                            );


                        console.log(
                            "Status transaction:",
                            blockchainTransaction.hash
                        );


                        // ----------------------------------
                        // Wait for confirmation
                        // ----------------------------------

                        await blockchainTransaction.wait();


                        console.log(
                            "Blockchain status updated."
                        );


                        // ----------------------------------
                        // Update MySQL
                        // ----------------------------------

                        const response =
                            await fetch(
                                `${API_URL}/${donation.id}/status`,
                                {

                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({

                                        status:
                                            newStatus

                                    })

                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            throw new Error(
                                data.message ||
                                "Failed to update status in database."
                            );

                        }


                        // ----------------------------------
                        // Success
                        // ----------------------------------

                        alert(
                            `Donation #${donation.id} status updated to ${newStatus}`
                        );


                        await loadDonations();


                    } catch (error) {

                        console.error(
                            "Status update error:",
                            error
                        );


                        this.value =
                            previousStatus;


                        alert(
                            "Could not update donation status.\n\n" +
                            (
                                error.message ||
                                "Please check MetaMask and try again."
                            )
                        );

                    } finally {

                        statusSelect.disabled =
                            false;

                    }

                }
            );


            statusCell.appendChild(
                statusSelect
            );


            // ==========================================
            // ADD CELLS TO ROW
            // ==========================================

            row.appendChild(
                idCell
            );

            row.appendChild(
                donorCell
            );

            row.appendChild(
                foodCell
            );

            row.appendChild(
                quantityCell
            );

            row.appendChild(
                dateCell
            );

            row.appendChild(
                receiverCell
            );

            row.appendChild(
                statusCell
            );


            tableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    if (isNaN(date)) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(donations) {

    const recordCount =
        document.getElementById(
            "recordCount"
        );


    const totalDonations =
        document.getElementById(
            "totalDonations"
        );


    const totalFood =
        document.getElementById(
            "totalFood"
        );


    const receivedDonations =
        document.getElementById(
            "receivedDonations"
        );


    const distributedDonations =
        document.getElementById(
            "distributedDonations"
        );


    // ------------------------------------------
    // Total blockchain/database records
    // ------------------------------------------

    if (recordCount) {

        recordCount.textContent =
            donations.length;

    }


    // ------------------------------------------
    // Total donations
    // ------------------------------------------

    if (totalDonations) {

        totalDonations.textContent =
            donations.length;

    }


    // ------------------------------------------
    // Total food
    // ------------------------------------------

    const totalQuantity =
        donations.reduce(
            (sum, donation) =>
                sum +
                Number(
                    donation.quantity
                ),
            0
        );


    if (totalFood) {

        totalFood.textContent =
            `${totalQuantity} kg`;

    }


    // ------------------------------------------
    // Received
    // ------------------------------------------

    const received =
        donations.filter(
            donation =>
                donation.status ===
                "Received"
        ).length;


    if (receivedDonations) {

        receivedDonations.textContent =
            received;

    }


    // ------------------------------------------
    // Distributed
    // ------------------------------------------

    const distributed =
        donations.filter(
            donation =>
                donation.status ===
                "Distributed"
        ).length;


    if (distributedDonations) {

        distributedDonations.textContent =
            distributed;

    }

}


// ==========================================
// TRACK DONATION BUTTON
// ==========================================

if (trackDonationBtn) {

    trackDonationBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const donationsSection =
                document.querySelector(
                    ".donations-section"
                );


            if (donationsSection) {

                donationsSection.scrollIntoView({

                    behavior: "smooth"

                });

            }


            loadDonations();

        }
    );

}


// ==========================================
// LOAD DATA WHEN PAGE OPENS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDonations();

    }
);


// ==========================================
// METAMASK ACCOUNT CHANGES
// ==========================================

if (window.ethereum) {

    window.ethereum.on(
        "accountsChanged",
        function (accounts) {

            console.log(
                "MetaMask account changed:",
                accounts
            );


            donationContract = null;
            provider = null;
            signer = null;


            if (connectWalletBtn) {

                connectWalletBtn.innerHTML =
                    "🦊 Connect MetaMask";

                connectWalletBtn.classList.remove(
                    "connected"
                );

            }


            if (accounts.length > 0) {

                console.log(
                    "Please reconnect MetaMask."
                );

            }

        }
    );


    // ==========================================
    // METAMASK NETWORK CHANGES
    // ==========================================

    window.ethereum.on(
        "chainChanged",
        function () {

            console.log(
                "MetaMask network changed."
            );


            donationContract = null;
            provider = null;
            signer = null;


            if (connectWalletBtn) {

                connectWalletBtn.innerHTML =
                    "🦊 Connect MetaMask";

                connectWalletBtn.classList.remove(
                    "connected"
                );

            }


            alert(
                "Network changed. Please connect MetaMask again and make sure you are using Ethereum Sepolia."
            );

        }
    );

}