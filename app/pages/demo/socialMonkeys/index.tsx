import AccountProfile from "@/components/account/AccountProfile";
import Layout from "@/components/demo/Layout";
import { FullWidthSkeleton } from "@/components/styled";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

export default function SocialMonkeysHome() {
  const { address } = useAccount();
  const club = useRouter().query.club;

  return (
    <Layout>
      {address && club ? (
        <AccountProfile
          accountAddress={address}
          clubAddress={club as `0x${string}`}
        />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
