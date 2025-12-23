import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedPrivateExpenseLog, EncryptedPrivateExpenseLog__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedPrivateExpenseLog")) as EncryptedPrivateExpenseLog__factory;
  const contract = (await factory.deploy()) as EncryptedPrivateExpenseLog;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("EncryptedPrivateExpenseLog", function () {
  let signers: Signers;
  let contract: EncryptedPrivateExpenseLog;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should return 0 entry count for new user", async function () {
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(0);
  });

  it("should reject invalid date in addEntry", async function () {
    const invalidDate = 0;
    const category = 3;
    const level = 7;
    const emotion = 4;

    const [categoryHandle, categoryProof] = await fhevm.createEncryptedInput(category, contractAddress);
    const [levelHandle, levelProof] = await fhevm.createEncryptedInput(level, contractAddress);
    const [emotionHandle, emotionProof] = await fhevm.createEncryptedInput(emotion, contractAddress);

    await expect(
      contract.connect(signers.alice).addEntry(
        invalidDate,
        categoryHandle,
        categoryProof,
        levelHandle,
        levelProof,
        emotionHandle,
        emotionProof
      )
    ).to.be.revertedWith("Invalid date: must be greater than zero");
  });

  it("should reject duplicate entries for same date", async function () {
    const date = Math.floor(Date.now() / 86400000);
    const category = 2;
    const level = 5;
    const emotion = 3;

    const [categoryHandle, categoryProof] = await fhevm.createEncryptedInput(category, contractAddress);
    const [levelHandle, levelProof] = await fhevm.createEncryptedInput(level, contractAddress);
    const [emotionHandle, emotionProof] = await fhevm.createEncryptedInput(emotion, contractAddress);

    // First entry should succeed
    await contract.connect(signers.alice).addEntry(
      date,
      categoryHandle,
      categoryProof,
      levelHandle,
      levelProof,
      emotionHandle,
      emotionProof
    );

    // Second entry for same date should fail
    await expect(
      contract.connect(signers.alice).addEntry(
        date,
        categoryHandle,
        categoryProof,
        levelHandle,
        levelProof,
        emotionHandle,
        emotionProof
      )
    ).to.be.revertedWith("Entry already exists for this date");
  });

  it("should add an expense entry and retrieve it", async function () {
    const date = Math.floor(Date.now() / 86400000); // Day number
    const category = 3; // Category 1-5
    const level = 7; // Level 1-10
    const emotion = 4; // Emotion 1-5

    // Encrypt the values
    const encryptedCategory = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(category)
      .encrypt();

    const encryptedLevel = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(level)
      .encrypt();

    const encryptedEmotion = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(emotion)
      .encrypt();

    // Add entry
    const tx = await contract
      .connect(signers.alice)
      .addEntry(
        date,
        encryptedCategory.handles[0],
        encryptedLevel.handles[0],
        encryptedEmotion.handles[0]
      );
    await tx.wait();

    // Verify entry count
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(1);
    expect(await contract.entryExists(signers.alice.address, date)).to.be.true;

    // Retrieve and decrypt entry
    const [categoryHandle, levelHandle, emotionHandle, timestamp] = await contract.getEntry(
      signers.alice.address,
      date
    );

    // Decrypt values (wait for permissions to be set)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const decryptedCategory = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      categoryHandle,
      contractAddress,
      signers.alice,
    );

    const decryptedLevel = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      levelHandle,
      contractAddress,
      signers.alice,
    );

    const decryptedEmotion = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      emotionHandle,
      contractAddress,
      signers.alice,
    );

    expect(decryptedCategory).to.eq(category);
    expect(decryptedLevel).to.eq(level);
    expect(decryptedEmotion).to.eq(emotion);
    expect(timestamp).to.be.gt(0);
  });

  it("should add multiple entries for the same user", async function () {
    const date1 = Math.floor(Date.now() / 86400000);
    const date2 = date1 + 1;

    // First entry
    const encryptedCategory1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(2)
      .encrypt();
    const encryptedLevel1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(5)
      .encrypt();
    const encryptedEmotion1 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(3)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addEntry(
        date1,
        encryptedCategory1.handles[0],
        encryptedLevel1.handles[0],
        encryptedEmotion1.handles[0]
      );
    await tx.wait();

    // Second entry
    const encryptedCategory2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(4)
      .encrypt();
    const encryptedLevel2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(8)
      .encrypt();
    const encryptedEmotion2 = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(5)
      .encrypt();

    tx = await contract
      .connect(signers.alice)
      .addEntry(
        date2,
        encryptedCategory2.handles[0],
        encryptedLevel2.handles[0],
        encryptedEmotion2.handles[0]
      );
    await tx.wait();

    // Verify entry count
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(2);
    expect(await contract.getLastEntryDate(signers.alice.address)).to.eq(date2);
  });

  it("should keep separate entries for different users", async function () {
    const date = Math.floor(Date.now() / 86400000);

    // Alice's entry
    const encryptedCategoryAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(1)
      .encrypt();
    const encryptedLevelAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(3)
      .encrypt();
    const encryptedEmotionAlice = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add8(2)
      .encrypt();

    let tx = await contract
      .connect(signers.alice)
      .addEntry(
        date,
        encryptedCategoryAlice.handles[0],
        encryptedLevelAlice.handles[0],
        encryptedEmotionAlice.handles[0]
      );
    await tx.wait();

    // Bob's entry
    const encryptedCategoryBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add8(5)
      .encrypt();
    const encryptedLevelBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add8(10)
      .encrypt();
    const encryptedEmotionBob = await fhevm
      .createEncryptedInput(contractAddress, signers.bob.address)
      .add8(5)
      .encrypt();

    tx = await contract
      .connect(signers.bob)
      .addEntry(
        date,
        encryptedCategoryBob.handles[0],
        encryptedLevelBob.handles[0],
        encryptedEmotionBob.handles[0]
      );
    await tx.wait();

    // Verify separate counts
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(1);
    expect(await contract.getEntryCount(signers.bob.address)).to.eq(1);
    expect(await contract.entryExists(signers.alice.address, date)).to.be.true;
    expect(await contract.entryExists(signers.bob.address, date)).to.be.true;
  });

  it("should provide encrypted analysis data for spending patterns", async function () {
    // Add multiple entries for analysis
    const entries = [
      { date: 20240101, category: 2, level: 5, emotion: 3 },
      { date: 20240102, category: 3, level: 7, emotion: 4 },
      { date: 20240103, category: 1, level: 3, emotion: 2 }
    ];

    for (const entry of entries) {
      const encryptedCategory = await fhevm.createEncryptedNumber(entry.category, contractAddress);
      const encryptedLevel = await fhevm.createEncryptedNumber(entry.level, contractAddress);
      const encryptedEmotion = await fhevm.createEncryptedNumber(entry.emotion, contractAddress);

      await contract.connect(signers.alice).addEntry(
        entry.date,
        encryptedCategory.handles[0],
        encryptedCategory.inputProof,
        encryptedLevel.handles[0],
        encryptedLevel.inputProof,
        encryptedEmotion.handles[0],
        encryptedEmotion.inputProof
      );
    }

    // Test analysis data retrieval
    const startDate = 20240101;
    const endDate = 20240103;

    await expect(contract.getEncryptedAnalysisData(signers.alice.address, startDate, endDate))
      .to.emit(contract, "EntryAdded")
      .withArgs(signers.alice.address, endDate, await ethers.provider.getBlock('latest').then(b => b.timestamp));
  });

  it("should calculate emotion-level correlation with sufficient data", async function () {
    // Add entries for correlation analysis
    const entries = [
      { date: 20240101, category: 2, level: 5, emotion: 3 },
      { date: 20240102, category: 3, level: 7, emotion: 4 },
      { date: 20240103, category: 1, level: 3, emotion: 2 },
      { date: 20240104, category: 4, level: 8, emotion: 5 }
    ];

    for (const entry of entries) {
      const encryptedCategory = await fhevm.createEncryptedNumber(entry.category, contractAddress);
      const encryptedLevel = await fhevm.createEncryptedNumber(entry.level, contractAddress);
      const encryptedEmotion = await fhevm.createEncryptedNumber(entry.emotion, contractAddress);

      await contract.connect(signers.alice).addEntry(
        entry.date,
        encryptedCategory.handles[0],
        encryptedCategory.inputProof,
        encryptedLevel.handles[0],
        encryptedLevel.inputProof,
        encryptedEmotion.handles[0],
        encryptedEmotion.inputProof
      );
    }

    // Test correlation analysis
    const startDate = 20240101;
    const endDate = 20240104;

    await expect(contract.getEmotionLevelCorrelation(signers.alice.address, startDate, endDate))
      .to.emit(contract, "EntryAdded")
      .withArgs(signers.alice.address, endDate, await ethers.provider.getBlock('latest').then(b => b.timestamp));
  });

  it("should reject correlation analysis with insufficient data", async function () {
    // Add only one entry
    const encryptedCategory = await fhevm.createEncryptedNumber(2, contractAddress);
    const encryptedLevel = await fhevm.createEncryptedNumber(5, contractAddress);
    const encryptedEmotion = await fhevm.createEncryptedNumber(3, contractAddress);

    await contract.connect(signers.alice).addEntry(
      20240101,
      encryptedCategory.handles[0],
      encryptedCategory.inputProof,
      encryptedLevel.handles[0],
      encryptedLevel.inputProof,
      encryptedEmotion.handles[0],
      encryptedEmotion.inputProof
    );

    // Should revert with insufficient data for correlation
    await expect(
      contract.getEmotionLevelCorrelation(signers.alice.address, 20240101, 20240101)
    ).to.be.revertedWith("Need at least 2 entries for correlation analysis");
  });

  it("should support batch entry addition for efficient data submission", async function () {
    const dates = [20240101, 20240102, 20240103];
    const categories = [2, 3, 1];
    const levels = [5, 7, 3];
    const emotions = [3, 4, 2];

    // Create encrypted inputs for batch
    const encryptedCategories = await Promise.all(
      categories.map(category => fhevm.createEncryptedNumber(category, contractAddress))
    );
    const encryptedLevels = await Promise.all(
      levels.map(level => fhevm.createEncryptedNumber(level, contractAddress))
    );
    const encryptedEmotions = await Promise.all(
      emotions.map(emotion => fhevm.createEncryptedNumber(emotion, contractAddress))
    );

    // Execute batch addition
    await contract.connect(signers.alice).batchAddEntries(
      dates,
      encryptedCategories.map(e => e.handles[0]),
      encryptedCategories.map(e => e.inputProof),
      encryptedLevels.map(e => e.handles[0]),
      encryptedLevels.map(e => e.inputProof),
      encryptedEmotions.map(e => e.handles[0]),
      encryptedEmotions.map(e => e.inputProof)
    );

    // Verify all entries were added
    expect(await contract.getEntryCount(signers.alice.address)).to.eq(3);
    expect(await contract.entryExists(signers.alice.address, 20240101)).to.be.true;
    expect(await contract.entryExists(signers.alice.address, 20240102)).to.be.true;
    expect(await contract.entryExists(signers.alice.address, 20240103)).to.be.true;
  });

  it("should reject batch addition with mismatched array lengths", async function () {
    const dates = [20240101, 20240102];
    const categories = [2, 3, 1]; // Different length

    const encryptedCategories = await Promise.all(
      categories.map(category => fhevm.createEncryptedNumber(category, contractAddress))
    );

    // Should revert due to array length mismatch
    await expect(
      contract.connect(signers.alice).batchAddEntries(
        dates,
        encryptedCategories.map(e => e.handles[0]),
        encryptedCategories.map(e => e.inputProof),
        [], // Empty levels array
        [],
        [],
        []
      )
    ).to.be.revertedWith("Array length mismatch");
  });

  it("should enforce batch size limits for gas efficiency", async function () {
    const largeBatchSize = 15;
    const dates = Array(largeBatchSize).fill(0).map((_, i) => 20240101 + i);
    const categories = Array(largeBatchSize).fill(2);
    const levels = Array(largeBatchSize).fill(5);
    const emotions = Array(largeBatchSize).fill(3);

    const encryptedCategories = await Promise.all(
      categories.map(category => fhevm.createEncryptedNumber(category, contractAddress))
    );
    const encryptedLevels = await Promise.all(
      levels.map(level => fhevm.createEncryptedNumber(level, contractAddress))
    );
    const encryptedEmotions = await Promise.all(
      emotions.map(emotion => fhevm.createEncryptedNumber(emotion, contractAddress))
    );

    // Should revert due to batch size limit
    await expect(
      contract.connect(signers.alice).batchAddEntries(
        dates,
        encryptedCategories.map(e => e.handles[0]),
        encryptedCategories.map(e => e.inputProof),
        encryptedLevels.map(e => e.handles[0]),
        encryptedLevels.map(e => e.inputProof),
        encryptedEmotions.map(e => e.handles[0]),
        encryptedEmotions.map(e => e.inputProof)
      )
    ).to.be.revertedWith("Batch size limited to 10 entries for gas efficiency");
  });
});

