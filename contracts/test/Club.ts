import { Wallet, Provider, utils } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { zkSyncRichWallets } from "./utils/zkSyncRichWallets";
import * as hre from "hardhat";
import { ethers } from "hardhat";

describe("Club", function () {
  it("Should provide gasless transaction for create social monkey", async function () {
    // Define provider
    const provider = new Provider("http://localhost:3050");

    // Define deployer
    const deployerWallet = new Wallet(
      zkSyncRichWallets[0].privateKey,
      provider
    );
    const deployer = new Deployer(hre, deployerWallet);

    // Deploy social monkeys contract
    const socialMonkeysArtifact = await deployer.loadArtifact("SocialMonkeys");
    const socialMonkeys = await deployer.deploy(socialMonkeysArtifact, []);
    console.log(`SocialMonkeys address: ${socialMonkeys.address}`);

    // Deploy club contract
    const clubArtifact = await deployer.loadArtifact("Club");
    const club = await deployer.deploy(clubArtifact, [
      "ipfs://abc123",
      socialMonkeys.address,
    ]);
    console.log(`Club address: ${club.address}`);

    // Send ETH to club
    await (
      await deployer.zkWallet.sendTransaction({
        to: club.address,
        value: ethers.utils.parseEther("0.06"),
      })
    ).wait();
    console.log("Eth sent to club contract");

    // Check club balance
    let clubBalance = await provider.getBalance(club.address);
    console.log(`Club ETH balance: ${clubBalance.toString()}`);

    // Define member
    const memberPrivateKey = Wallet.createRandom().privateKey;
    const memberWallet = new Wallet(memberPrivateKey, provider);
    console.log(`Member wallet's address: ${memberWallet.address}`);
    console.log(`Member wallet's private key: ${memberWallet.privateKey}`);

    // Add member to club
    await (await club.addMember(memberWallet.address)).wait();
    console.log("Member is added");

    // Define gas price
    const gasPrice = await provider.getGasPrice();

    // Encode paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(club.address, {
      type: "General",
      innerInput: new Uint8Array(),
    });

    // Define social monkey contract for member
    const socialMonkeysForMember = new ethers.Contract(
      socialMonkeys.address,
      socialMonkeysArtifact.abi,
      memberWallet
    );

    // Estimate gas fee for transaction
    const gasLimit = await socialMonkeysForMember.estimateGas.create(
      "ipfs://abc123",
      {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      }
    );
    const fee = gasPrice.mul(gasLimit.toString());
    console.log("Transaction fee estimation is :>> ", fee.toString());

    // Check member balance
    console.log(
      `Member balance in social monkeys contract: ${await socialMonkeysForMember.balanceOf(
        memberWallet.address
      )}`
    );

    // Send transaction using paymaster
    await (
      await socialMonkeysForMember.create("ipfs://abc123", {
        customData: {
          paymasterParams: paymasterParams,
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      })
    ).wait();
    console.log("Social monkey is created for the member with paymaster");

    // Check member balance
    console.log(
      `Member balance in social monkeys contract: ${await socialMonkeysForMember.balanceOf(
        memberWallet.address
      )}`
    );
  });
});
