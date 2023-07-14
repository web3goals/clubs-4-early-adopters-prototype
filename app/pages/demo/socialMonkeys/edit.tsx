import { AccountProfileEdit } from "@/components/account/AccountProfileEdit";
import Layout from "@/components/demo/Layout";
import { FullWidthSkeleton } from "components/styled";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

export default function SocialMonkeysEdit() {
  const { address } = useAccount();
  const club = useRouter().query.club as `0x${string}`;

  return (
    <Layout maxWidth="xs">
      {address && club ? (
        <AccountProfileEdit accountAddress={address} clubAddress={club} />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
