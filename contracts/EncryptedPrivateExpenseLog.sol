// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title EncryptedPrivateExpenseLog - Private Expense Log with Encrypted Analysis
/// @notice Allows users to record encrypted expense data privately for anonymous analysis
/// @dev Uses FHE to store encrypted expense data on-chain. Analysis is performed off-chain after decryption.
contract EncryptedPrivateExpenseLog is SepoliaConfig {
    // Structure to store daily encrypted expense data
    struct ExpenseEntry {
        euint8 category;             // Encrypted expense category (1-5)
        euint8 level;                // Encrypted expense level (1-10)
        euint8 emotion;              // Encrypted emotion correlation (1-5)
        uint256 timestamp;           // Block timestamp for the entry
        bool exists;                 // Whether this entry exists
    }

    // Event to emit when entry is added
    event EntryAdded(address indexed user, uint256 date, uint256 timestamp);

    // Mapping from user address to date (day number) to expense entry
    mapping(address => mapping(uint256 => ExpenseEntry)) private _userEntries;
    
    // Mapping to track the last entry date for each user
    mapping(address => uint256) private _lastEntryDate;
    
    // Mapping to track total entries count per user
    mapping(address => uint256) private _entryCount;

    /// @notice Add a daily expense entry
    /// @param date The date identifier (day number since epoch or custom date)
    /// @param encryptedCategory The encrypted expense category (1-5)
    /// @param categoryProof The FHE input proof for category
    /// @param encryptedLevel The encrypted expense level (1-10)
    /// @param levelProof The FHE input proof for level
    /// @param encryptedEmotion The encrypted emotion correlation (1-5)
    /// @param emotionProof The FHE input proof for emotion
    function addEntry(
        uint256 date,
        externalEuint8 encryptedCategory,
        bytes calldata categoryProof,
        externalEuint8 encryptedLevel,
        bytes calldata levelProof,
        externalEuint8 encryptedEmotion,
        bytes calldata emotionProof
    ) external {
        // Convert external inputs to internal FHE types
        euint8 category = FHE.fromExternal(encryptedCategory, categoryProof);
        euint8 level = FHE.fromExternal(encryptedLevel, levelProof);
        euint8 emotion = FHE.fromExternal(encryptedEmotion, emotionProof);

        // Store the encrypted data
        _userEntries[msg.sender][date] = ExpenseEntry({
            category: category,
            level: level,
            emotion: emotion,
            timestamp: block.timestamp,
            exists: true
        });

        // Grant decryption permissions to the user
        FHE.allowThis(category);
        FHE.allow(category, msg.sender);
        FHE.allowThis(level);
        FHE.allow(level, msg.sender);
        FHE.allowThis(emotion);
        FHE.allow(emotion, msg.sender);

        // Update tracking
        if (date > _lastEntryDate[msg.sender]) {
            _lastEntryDate[msg.sender] = date;
        }
        _entryCount[msg.sender]++;

        emit EntryAdded(msg.sender, date, block.timestamp);
    }

    /// @notice Get encrypted category for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return encryptedCategory The encrypted expense category
    function getCategory(address user, uint256 date)
        external
        view
        returns (euint8 encryptedCategory)
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        return _userEntries[user][date].category;
    }

    /// @notice Get encrypted level for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return encryptedLevel The encrypted expense level
    function getLevel(address user, uint256 date)
        external
        view
        returns (euint8 encryptedLevel)
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        return _userEntries[user][date].level;
    }

    /// @notice Get encrypted emotion for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return encryptedEmotion The encrypted emotion correlation
    function getEmotion(address user, uint256 date)
        external
        view
        returns (euint8 encryptedEmotion)
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        return _userEntries[user][date].emotion;
    }

    /// @notice Get all encrypted data for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return category The encrypted expense category
    /// @return level The encrypted expense level
    /// @return emotion The encrypted emotion correlation
    /// @return timestamp The block timestamp
    function getEntry(address user, uint256 date)
        external
        view
        returns (
            euint8 category,
            euint8 level,
            euint8 emotion,
            uint256 timestamp
        )
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        ExpenseEntry memory entry = _userEntries[user][date];
        return (entry.category, entry.level, entry.emotion, entry.timestamp);
    }

    /// @notice Get the last entry date for a user
    /// @param user The user address
    /// @return The last entry date
    function getLastEntryDate(address user) external view returns (uint256) {
        return _lastEntryDate[user];
    }

    /// @notice Get the total entry count for a user
    /// @param user The user address
    /// @return The total number of entries
    function getEntryCount(address user) external view returns (uint256) {
        return _entryCount[user];
    }

    /// @notice Check if an entry exists for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return Whether the entry exists
    function entryExists(address user, uint256 date) external view returns (bool) {
        return _userEntries[user][date].exists;
    }

    /// @notice Get all entry dates for a user (for analysis purposes)
    /// @param user The user address
    /// @param startDate The start date to search from
    /// @param endDate The end date to search to
    /// @return dates Array of dates that have entries
    /// @dev This function helps frontend to know which dates to query for analysis
    function getEntryDatesInRange(address user, uint256 startDate, uint256 endDate)
        external
        view
        returns (uint256[] memory dates)
    {
        require(endDate >= startDate, "Invalid date range");
        
        uint256 count = 0;
        // First pass: count entries
        for (uint256 date = startDate; date <= endDate; date++) {
            if (_userEntries[user][date].exists) {
                count++;
            }
        }
        
        // Second pass: collect dates
        dates = new uint256[](count);
        uint256 index = 0;
        for (uint256 date = startDate; date <= endDate; date++) {
            if (_userEntries[user][date].exists) {
                dates[index] = date;
                index++;
            }
        }
        
        return dates;
    }

    /// @notice Get encrypted analysis data for spending patterns
    /// @param user The user address
    /// @param startDate The start date for analysis
    /// @param endDate The end date for analysis
    /// @return totalEncryptedCategory Sum of all encrypted categories
    /// @return totalEncryptedLevel Sum of all encrypted levels
    /// @return totalEncryptedEmotion Sum of all encrypted emotions
    /// @return entryCount Number of entries in the date range
    /// @dev Client-side can decrypt and analyze spending patterns
    function getEncryptedAnalysisData(address user, uint256 startDate, uint256 endDate)
        external
        returns (
            euint8 totalEncryptedCategory,
            euint8 totalEncryptedLevel,
            euint8 totalEncryptedEmotion,
            uint256 entryCount
        )
    {
        require(endDate >= startDate, "Invalid date range");

        euint8 categorySum = FHE.asEuint8(0);
        euint8 levelSum = FHE.asEuint8(0);
        euint8 emotionSum = FHE.asEuint8(0);
        uint256 count = 0;

        for (uint256 date = startDate; date <= endDate; date++) {
            if (_userEntries[user][date].exists) {
                ExpenseEntry memory entry = _userEntries[user][date];
                categorySum = FHE.add(categorySum, entry.category);
                levelSum = FHE.add(levelSum, entry.level);
                emotionSum = FHE.add(emotionSum, entry.emotion);
                count++;
            }
        }

        require(count > 0, "No entries found in date range");

        // Grant decryption permissions
        FHE.allowThis(categorySum);
        FHE.allow(categorySum, user);
        FHE.allowThis(levelSum);
        FHE.allow(levelSum, user);
        FHE.allowThis(emotionSum);
        FHE.allow(emotionSum, user);

        return (categorySum, levelSum, emotionSum, count);
    }

    /// @notice Calculate emotion-level correlation for spending behavior analysis
    /// @param user The user address
    /// @param startDate The start date for correlation analysis
    /// @param endDate The end date for correlation analysis
    /// @return emotionLevelProduct Sum of (emotion * level) for correlation
    /// @return emotionSquared Sum of (emotion^2) for correlation calculation
    /// @return levelSquared Sum of (level^2) for correlation calculation
    /// @dev Client can decrypt and compute Pearson correlation coefficient
    function getEmotionLevelCorrelation(address user, uint256 startDate, uint256 endDate)
        external
        returns (
            euint8 emotionLevelProduct,
            euint8 emotionSquared,
            euint8 levelSquared
        )
    {
        require(endDate >= startDate, "Invalid date range");

        euint8 productSum = FHE.asEuint8(0);
        euint8 emotionSqSum = FHE.asEuint8(0);
        euint8 levelSqSum = FHE.asEuint8(0);
        uint256 validEntries = 0;

        for (uint256 date = startDate; date <= endDate; date++) {
            if (_userEntries[user][date].exists) {
                ExpenseEntry memory entry = _userEntries[user][date];

                // emotion * level
                euint8 product = FHE.mul(entry.emotion, entry.level);
                productSum = FHE.add(productSum, product);

                // emotion^2
                euint8 emotionSq = FHE.mul(entry.emotion, entry.emotion);
                emotionSqSum = FHE.add(emotionSqSum, emotionSq);

                // level^2
                euint8 levelSq = FHE.mul(entry.level, entry.level);
                levelSqSum = FHE.add(levelSqSum, levelSq);

                validEntries++;
            }
        }

        require(validEntries >= 2, "Need at least 2 entries for correlation analysis");

        // Grant decryption permissions
        FHE.allowThis(productSum);
        FHE.allow(productSum, user);
        FHE.allowThis(emotionSqSum);
        FHE.allow(emotionSqSum, user);
        FHE.allowThis(levelSqSum);
        FHE.allow(levelSqSum, user);

        return (productSum, emotionSqSum, levelSqSum);
    }

    /// @notice Batch add multiple expense entries in a single transaction
    /// @param dates Array of date identifiers
    /// @param encryptedCategories Array of encrypted expense categories
    /// @param categoryProofs Array of FHE proofs for categories
    /// @param encryptedLevels Array of encrypted expense levels
    /// @param levelProofs Array of FHE proofs for levels
    /// @param encryptedEmotions Array of encrypted emotions
    /// @param emotionProofs Array of FHE proofs for emotions
    function batchAddEntries(
        uint256[] calldata dates,
        externalEuint8[] calldata encryptedCategories,
        bytes[] calldata categoryProofs,
        externalEuint8[] calldata encryptedLevels,
        bytes[] calldata levelProofs,
        externalEuint8[] calldata encryptedEmotions,
        bytes[] calldata emotionProofs
    ) external {
        require(dates.length == encryptedCategories.length, "Array length mismatch");
        require(dates.length == encryptedLevels.length, "Array length mismatch");
        require(dates.length == encryptedEmotions.length, "Array length mismatch");
        require(dates.length == categoryProofs.length, "Array length mismatch");
        require(dates.length == levelProofs.length, "Array length mismatch");
        require(dates.length == emotionProofs.length, "Array length mismatch");
        require(dates.length > 0, "Cannot add empty batch");
        require(dates.length <= 10, "Batch size limited to 10 entries for gas efficiency");

        for (uint256 i = 0; i < dates.length; i++) {
            // Convert external inputs to internal FHE types
            euint8 category = FHE.fromExternal(encryptedCategories[i], categoryProofs[i]);
            euint8 level = FHE.fromExternal(encryptedLevels[i], levelProofs[i]);
            euint8 emotion = FHE.fromExternal(encryptedEmotions[i], emotionProofs[i]);

            // Store the encrypted data
            _userEntries[msg.sender][dates[i]] = ExpenseEntry({
                category: category,
                level: level,
                emotion: emotion,
                timestamp: block.timestamp,
                exists: true
            });

            // Grant decryption permissions
            FHE.allowThis(category);
            FHE.allow(category, msg.sender);
            FHE.allowThis(level);
            FHE.allow(level, msg.sender);
            FHE.allowThis(emotion);
            FHE.allow(emotion, msg.sender);

            // Update tracking
            if (dates[i] > _lastEntryDate[msg.sender]) {
                _lastEntryDate[msg.sender] = dates[i];
            }
            _entryCount[msg.sender]++;

            emit EntryAdded(msg.sender, dates[i], block.timestamp);
        }
    }
}
