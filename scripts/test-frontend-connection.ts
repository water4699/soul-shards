import { ethers } from "hardhat";

async function main() {
  console.log("Testing frontend contract connection...");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const EncryptedPrivateExpenseLog = await ethers.getContractFactory("EncryptedPrivateExpenseLog");
  const contract = EncryptedPrivateExpenseLog.attach(contractAddress);

  const signers = await ethers.getSigners();
  const alice = signers[1];

  console.log("Contract address:", contractAddress);
  console.log("Alice address:", alice.address);

  // Test basic contract functions
  try {
    const count = await contract.getEntryCount(alice.address);
    console.log("✓ getEntryCount works:", count.toString());

    const lastDate = await contract.getLastEntryDate(alice.address);
    console.log("✓ getLastEntryDate works:", lastDate.toString());

    // Test with today's date
    const date = Math.floor(Date.now() / 86400000);
    const exists = await contract.entryExists(alice.address, date);
    console.log("✓ entryExists works for date", date, ":", exists);

    if (exists) {
      console.log("Entry exists, testing getEntry...");
      const [categoryHandle, levelHandle, emotionHandle, timestamp] = await contract.getEntry(alice.address, date);
      console.log("✓ getEntry works:");
      console.log("  - Category handle:", categoryHandle);
      console.log("  - Level handle:", levelHandle);
      console.log("  - Emotion handle:", emotionHandle);
      console.log("  - Timestamp:", timestamp.toString());
    }

    // Test date range query
    const startDate = date - 7; // Last 7 days
    const endDate = date + 1;   // Tomorrow
    const dates = await contract.getEntryDatesInRange(alice.address, startDate, endDate);
    console.log("✓ getEntryDatesInRange works:", dates.map(d => d.toString()));

  } catch (error: any) {
    console.error("❌ Contract function failed:", error.message);
    process.exitCode = 1;
  }

  console.log("\nContract connection test completed successfully!");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exitCode = 1;
});
