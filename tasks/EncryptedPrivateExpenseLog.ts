import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

task("encrypted-private-expense-log:info", "Get information about EncryptedPrivateExpenseLog contract")
  .addParam("address", "Contract address")
  .addOptionalParam("user", "User address to query")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contract = await ethers.getContractAt("EncryptedPrivateExpenseLog", taskArgs.address);

    if (taskArgs.user) {
      const entryCount = await contract.getEntryCount(taskArgs.user);
      const lastEntryDate = await contract.getLastEntryDate(taskArgs.user);
      console.log(`User: ${taskArgs.user}`);
      console.log(`Entry Count: ${entryCount}`);
      console.log(`Last Entry Date: ${lastEntryDate}`);

      if (entryCount > 0 && lastEntryDate > 0) {
        const startDate = lastEntryDate - 30; // Last 30 days
        const endDate = lastEntryDate;
        try {
          const dates = await contract.getEntryDatesInRange(taskArgs.user, startDate, endDate);
          console.log(`Recent entries (last 30 days): ${dates.length}`);
        } catch (error) {
          console.log("Could not fetch recent entries");
        }
      }
    } else {
      console.log(`Contract Address: ${taskArgs.address}`);
      console.log("Use --user parameter to query specific user data");
    }
  });

task("encrypted-private-expense-log:analyze", "Analyze encrypted expense patterns for a user")
  .addParam("address", "Contract address")
  .addParam("user", "User address to analyze")
  .addOptionalParam("days", "Number of days to analyze", "30")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contract = await ethers.getContractAt("EncryptedPrivateExpenseLog", taskArgs.address);

    const days = parseInt(taskArgs.days);
    const endDate = Math.floor(Date.now() / 86400000);
    const startDate = endDate - days;

    console.log(`Analyzing user ${taskArgs.user} for last ${days} days...`);

    try {
      const analysis = await contract.getExpenseAnalysis(taskArgs.user, startDate, endDate);
      console.log(`Total entries: ${analysis[0]}`);
      console.log(`Average category: [ENCRYPTED]`);
      console.log(`Average level: [ENCRYPTED]`);
      console.log(`Average emotion: [ENCRYPTED]`);
      console.log("Note: Values are encrypted and can only be decrypted by the user");
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  });

