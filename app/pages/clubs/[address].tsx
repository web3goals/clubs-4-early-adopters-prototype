import Layout from "@/components/layout";
import { FullWidthSkeleton, ThickDivider } from "@/components/styled";
import { useRouter } from "next/router";

/**
 * Page with a club.
 */
export default function Club() {
  const router = useRouter();
  const { address } = router.query;

  return (
    <Layout maxWidth="sm">
      {address ? (
        <>
          <ClubJoinForm address={address.toString()} />
          <ClubAdminForm address={address.toString()} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

// TODO: Implement
function ClubJoinForm(props: { address: string }) {
  return <></>;
}

// TODO: Implement
function ClubAdminForm(props: { address: string }) {
  const isAdmin = false;

  if (!isAdmin) {
    return <></>;
  }

  return (
    <>
      <ThickDivider sx={{ my: 8 }} />
    </>
  );
}
