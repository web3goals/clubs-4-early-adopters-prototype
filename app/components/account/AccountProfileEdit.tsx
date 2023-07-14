import { socialMonkeysAbi } from "@/contracts/abi/socialMonkeys";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import { chainToSupportedChainConfig } from "@/utils/chaints";
import { useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";
import { FullWidthSkeleton } from "../styled";
import AccountProfileEditForm from "./AccountProfileEditForm";

export function AccountProfileEdit(props: {
  accountAddress: `0x${string}`;
  clubAddress: `0x${string}`;
}) {
  const { handleError } = useError();
  const { chain } = useNetwork();
  const { loadJsonFromIpfs } = useIpfs();
  const [profileData, setProfileData] = useState<any>();

  /**
   * Define account profile uri
   */
  const {
    data: profileUri,
    status: profileUriReadStatus,
    error: profileUriReadError,
  } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.socialMonkeys,
    abi: socialMonkeysAbi,
    functionName: "getURI",
    args: [props.accountAddress],
  });

  useEffect(() => {
    if (props.accountAddress && profileUriReadStatus === "success") {
      if (profileUri) {
        loadJsonFromIpfs(profileUri as any)
          .then((result) => setProfileData(result))
          .catch((error) => handleError(error, true));
      } else {
        setProfileData(null);
      }
    }
    if (
      props.accountAddress &&
      profileUriReadStatus === "error" &&
      profileUriReadError
    ) {
      setProfileData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.accountAddress,
    profileUriReadStatus,
    profileUriReadError,
    profileUri,
  ]);

  if (profileData !== undefined) {
    return (
      <AccountProfileEditForm
        accountAddress={props.accountAddress}
        clubAddress={props.clubAddress}
        accountProfileData={profileData}
      />
    );
  }

  return <FullWidthSkeleton />;
}
