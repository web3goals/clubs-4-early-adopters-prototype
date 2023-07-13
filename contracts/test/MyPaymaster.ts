import { Wallet, Provider, utils } from "zksync-web3";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { zkSyncRichWallets } from "./utils/zkSyncRichWallets";
import * as hre from "hardhat";
import { ethers } from "hardhat";

describe.skip("MyPaymaster", function () {
  it("Should provide gasless transaction for mint tokens", async function () {
    // Define provider
    const provider = new Provider("http://localhost:3050");

    // Define deployer
    const deployerWallet = new Wallet(
      zkSyncRichWallets[0].privateKey,
      provider
    );
    const deployer = new Deployer(hre, deployerWallet);

    // Define empty wallet
    const emptyWalletPrivateKey = Wallet.createRandom().privateKey;
    const emptyWallet = new Wallet(emptyWalletPrivateKey, provider);
    console.log(`Empty wallet's address: ${emptyWallet.address}`);
    console.log(`Empty wallet's private key: ${emptyWallet.privateKey}`);

    // Deploy ERC20 token
    const erc20Artifact = await deployer.loadArtifact("MyERC20");
    const erc20 = await deployer.deploy(erc20Artifact, [
      "MyToken",
      "MyToken",
      18,
    ]);
    console.log(`ERC20 address: ${erc20.address}`);

    // Deploy paymaster
    const paymasterArtifact = await deployer.loadArtifact("MyPaymaster");
    const paymaster = await deployer.deploy(paymasterArtifact, [erc20.address]);
    console.log(`Paymaster address: ${paymaster.address}`);

    // Send ETH to paymaster
    console.log("Fund paymaster with ETH");
    await (
      await deployer.zkWallet.sendTransaction({
        to: paymaster.address,
        value: ethers.utils.parseEther("0.06"),
      })
    ).wait();

    // Check paymaster balance
    let paymasterBalance = await provider.getBalance(paymaster.address);
    console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

    // Check empty wallet balance
    const emptyWalletBalance = await emptyWallet.getBalance();
    console.log(
      `Empty wallet ETH balance is now ${emptyWalletBalance.toString()}`
    );

    // Send ERC20 tokens to empty wallet
    await (await erc20.mint(emptyWallet.address, 3)).wait();
    console.log("Minted 3 tokens for the empty wallet");
    console.log(`Done!`);

    // Check empty wallet tokens
    console.log(
      `ERC20 token balance of the empty wallet before mint: ${await emptyWallet.getBalance(
        erc20.address
      )}`
    );

    // Define gas price
    const gasPrice = await provider.getGasPrice();

    // Encode the "ApprovalBased" paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(paymaster.address, {
      type: "ApprovalBased",
      token: erc20.address,
      minimalAllowance: ethers.BigNumber.from(1),
      innerInput: new Uint8Array(),
    });

    // Estimate gas fee for mint transaction
    const erc20ForEmptyWallet = new ethers.Contract(
      erc20.address,
      erc20Artifact.abi,
      emptyWallet
    );
    const gasLimit = await erc20ForEmptyWallet.estimateGas.mint(
      emptyWallet.address,
      5,
      {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paymasterParams,
        },
      }
    );
    const fee = gasPrice.mul(gasLimit.toString());
    console.log("Transaction fee estimation is :>> ", fee.toString());

    // Mint tokens for empty wallet using paymaster
    console.log(`Minting 5 tokens for empty wallet via paymaster...`);
    await (
      await erc20ForEmptyWallet.mint(emptyWallet.address, 5, {
        // paymaster info
        customData: {
          paymasterParams: paymasterParams,
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      })
    ).wait();

    // Check paymaster balance
    console.log(
      `Paymaster ERC20 token balance is now ${await erc20ForEmptyWallet.balanceOf(
        paymaster.address
      )}`
    );
    paymasterBalance = await provider.getBalance(paymaster.address);
    console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

    // Check empty wallet balance
    console.log(
      `ERC20 token balance of the empty wallet after mint: ${await emptyWallet.getBalance(
        erc20ForEmptyWallet.address
      )}`
    );
  });
});
