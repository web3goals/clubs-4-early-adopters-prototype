import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Provider, Wallet } from "zksync-web3";

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log('Start deploy contract "SocialMonkeys"');

  // Define provider
  const providerUrl = (hre.network.config as any).url;
  const provider = new Provider(providerUrl);
  console.log("Provider URL:", providerUrl);

  // Define deployer
  const deployerWallet = new Wallet(process.env.PRIVATE_KEY_1 || "", provider);
  const deployer = new Deployer(hre, deployerWallet);
  console.log("Deployer:", deployerWallet.address);

  // Deploy contract
  const contractArtifact = await deployer.loadArtifact("SocialMonkeys");
  const contract = await deployer.deploy(contractArtifact, []);
  console.log("Contract deployed to:", contract.address);
}
