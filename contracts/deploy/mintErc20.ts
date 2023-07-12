import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Provider, Wallet } from "zksync-web3";

const ERC20_ADDRESS = "0x38263A5D074D63FBa655CC7cD1F633596cdE6165";
const DEPLOYER_PRIVATE_KEY = process.env.PRIVATE_KEY_1 || "";
const EMPTY_WALLET_ADDRESS = process.env.ADDRESS_2 || "";

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider("https://testnet.era.zksync.dev");

  const wallet = new Wallet(DEPLOYER_PRIVATE_KEY, provider);

  const artifact = hre.artifacts.readArtifactSync("MyERC20");
  const erc20 = new ethers.Contract(ERC20_ADDRESS, artifact.abi, wallet);

  await (await erc20.mint(EMPTY_WALLET_ADDRESS, 3)).wait();

  console.log(`Done!`);
}
