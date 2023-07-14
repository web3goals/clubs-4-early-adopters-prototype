import Layout from "@/components/layout";
import { LargeLoadingButton } from "@/components/styled";
import { socialMonkeysAbi } from "@/contracts/abi/socialMonkeys";
import { ethers } from "ethers";
import { utils, Web3Provider } from "zksync-web3";

export default function SocialMonkeysHome() {
  async function createMonkey() {
    // Define contracts
    const socialMonkeysAddress = "0xb1Ca5B44ef3627A3E5Ed7a6EE877D9D997A7c7ED"; // TODO: Use env variable
    const clubAddress = "0x7AddC93ED39C4c64dffB478999B45f5a40619C23"; // TODO: Define in request params

    // Define provider and signer
    const provider = new Web3Provider((window as any).ethereum);
    const signer = provider.getSigner();

    // Define gas price
    const gasPrice = await provider.getGasPrice();

    // Encode paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(clubAddress, {
      type: "General",
      innerInput: new Uint8Array(),
    });

    // Define social monkey contract
    const socialMonkeys = new ethers.Contract(
      socialMonkeysAddress,
      socialMonkeysAbi,
      signer
    );

    // Estimate gas fee for transaction
    const gasLimit = await socialMonkeys.estimateGas.create("ipfs://abc123", {
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams: paymasterParams,
      },
    });
    const fee = gasPrice.mul(gasLimit.toString());
    console.log("Transaction fee estimation is :>> ", fee.toString());

    // Check member balance
    console.log(
      `Member balance in social monkeys contract: ${await socialMonkeys.balanceOf(
        await signer.getAddress()
      )}`
    );

    // Send transaction using paymaster
    await (
      await socialMonkeys.create("ipfs://abc123", {
        customData: {
          paymasterParams: paymasterParams,
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      })
    ).wait();
    console.log("Social monkey is created for the member with paymaster");

    // Check member balance
    console.log(
      `Member balance in social monkeys contract: ${await socialMonkeys.balanceOf(
        await signer.getAddress()
      )}`
    );
  }

  return (
    <Layout maxWidth="sm">
      <LargeLoadingButton variant="outlined" onClick={() => createMonkey()}>
        Create Monkey
      </LargeLoadingButton>
    </Layout>
  );
}
