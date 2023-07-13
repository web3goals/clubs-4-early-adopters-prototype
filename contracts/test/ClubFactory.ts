import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as hre from "hardhat";
import { ethers } from "hardhat";
import { Provider, Wallet } from "zksync-web3";
import { zkSyncRichWallets } from "./utils/zkSyncRichWallets";

describe("ClubFactory", function () {
  it("Should create club", async function () {
    // Define provider
    const provider = new Provider("http://localhost:3050");

    // Define deployer
    const deployerWallet = new Wallet(
      zkSyncRichWallets[0].privateKey,
      provider
    );
    const deployer = new Deployer(hre, deployerWallet);

    // Deploy club factory contract
    const clubFactoryArtifact = await deployer.loadArtifact("ClubFactory");
    const clubFactory = await deployer.deploy(clubFactoryArtifact, []);
    console.log(`Club factory address: ${clubFactory.address}`);

    // Create club
    const deployTransaction = await (
      await clubFactory.createClubAndSendEther(
        "ipfs://...",
        "0x0000000000000000000000000000000000000000",
        {
          value: ethers.utils.parseEther("0.04"),
        }
      )
    ).wait();
    console.log("Club is created");

    // Define club address using transaction events
    let clubAddress;
    const clubFactoryInterface = new ethers.utils.Interface(
      clubFactoryArtifact.abi
    );
    for (let log of deployTransaction.logs) {
      try {
        const logDescription = clubFactoryInterface.parseLog(log);
        if (logDescription.name === "ClubCreated") {
          clubAddress = logDescription.args[0];
        }
      } catch {}
    }

    // Check club owner and balance
    if (clubAddress) {
      const clubArtifact = hre.artifacts.readArtifactSync("Club");
      const club = new ethers.Contract(
        clubAddress,
        clubArtifact.abi,
        deployerWallet
      );
      const owner = await club.owner();
      console.log("Club owner:", owner);
      let balance = await provider.getBalance(club.address);
      console.log(`Club balance: ${balance.toString()}`);
    }
  });
});
