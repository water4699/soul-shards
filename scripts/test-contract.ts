import { ethers } from "hardhat";
import { FhevmInstance } from "@fhevm/hardhat-plugin";

async function main() {
  console.log("Testing contract functionality...");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedPrivateExpenseLog = await ethers.getContractFactory("EncryptedPrivateExpenseLog");
  const contract = EncryptedPrivateExpenseLog.attach(contractAddress);

  const signers = await ethers.getSigners();
  const alice = signers[1];

  console.log("Contract address:", contractAddress);
  console.log("Alice address:", alice.address);

  // Add a test entry
  const date = Math.floor(Date.now() / 86400000);
  const category = 3;
  const level = 7;
  const emotion = 4;

  console.log(`\nAdding entry for date ${date}: category=${category}, level=${level}, emotion=${emotion}`);

  // For local testing, we'll use dummy encrypted values
  const dummyHandle = ethers.zeroPadValue(ethers.toBeHex(123), 32);
  console.log("Using dummy handle:", dummyHandle);

  try {
    const tx = await contract.connect(alice).addEntry(
      date,
      dummyHandle,
      dummyHandle,
      dummyHandle,
      { gasLimit: 500000 }
    );
    await tx.wait();
    console.log("Entry added successfully!");
  } catch (error) {
    console.error("Error adding entry:", error);
    return;
  }

  // Check entry count
  const count = await contract.getEntryCount(alice.address);
  console.log("Entry count for Alice:", count.toString());

  // Check if entry exists
  const exists = await contract.entryExists(alice.address, date);
  console.log("Entry exists:", exists);

  if (exists) {
    try {
      // Try to get entry
      const [categoryHandle, levelHandle, emotionHandle, timestamp] = await contract.getEntry(alice.address, date);
      console.log("\nEntry data retrieved:");
      console.log("- Category handle:", categoryHandle);
      console.log("- Level handle:", levelHandle);
      console.log("- Emotion handle:", emotionHandle);
      console.log("- Timestamp:", timestamp.toString());

      // Check data format
      console.log("\nData validation:");
      console.log("- Category handle length:", categoryHandle.length, "(should be 66 chars with 0x)");
      console.log("- Level handle length:", levelHandle.length, "(should be 66 chars with 0x)");
      console.log("- Emotion handle length:", emotionHandle.length, "(should be 66 chars with 0x)");
      console.log("- Timestamp type:", typeof timestamp, "(should be BigInt or number)");
    } catch (error) {
      console.error("Error getting entry:", error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
