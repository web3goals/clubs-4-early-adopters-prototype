import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Provider, Wallet } from "zksync-web3";
import { zkSyncRichWallets } from "../test/utils/zkSyncRichWallets";

export default async function (hre: HardhatRuntimeEnvironment) {
  // Define provider
  const provider = new Provider("http://localhost:3050");

  // Define deployer
  const deployerWallet = new Wallet(zkSyncRichWallets[0].privateKey, provider);
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

  // Send eth to club
  await (
    await deployer.zkWallet.sendTransaction({
      to: club.address,
      value: ethers.utils.parseEther("0.06"),
    })
  ).wait();
  console.log("Eth sent to club contract");

  // Add member to club
  const memberAddress = "0x4306D7a79265D2cb85Db0c5a55ea5F4f6F73C4B1";
  await (await club.addMember(memberAddress)).wait();
  console.log("Member is added");
}
