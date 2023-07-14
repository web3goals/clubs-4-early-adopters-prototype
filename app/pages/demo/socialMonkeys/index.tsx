import AccountProfile from "@/components/account/AccountProfile";
import Layout from "@/components/demo/Layout";
import { FullWidthSkeleton } from "@/components/styled";
import { clubAbi } from "@/contracts/abi/club";
import { Typography } from "@mui/material";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useAccount, useContractRead } from "wagmi";

export default function SocialMonkeysHome() {
  const { address } = useAccount();
  const club = useRouter().query.club as `0x${string}`;

  /**
   * Define is club member
   */
  const { data: isMember } = useContractRead({
    address: club,
    abi: clubAbi,
    functionName: "isMember",
    args: [address || ethers.constants.AddressZero],
    enabled: club !== undefined,
  });

  console.log("isMember", isMember);

  return (
    <Layout>
      {address && club && isMember !== undefined ? (
        isMember ? (
          <AccountProfile accountAddress={address} clubAddress={club} />
        ) : (
          <>
            <Typography variant="h4" textAlign="center" fontWeight={700}>
              😔 Sorry,
            </Typography>
            <Typography textAlign="center" mt={1}>
              but you&apos;re not a member of the club
            </Typography>
          </>
        )
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
