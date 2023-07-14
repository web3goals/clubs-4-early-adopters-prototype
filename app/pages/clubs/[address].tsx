import ClubMemberAddDialog from "@/components/dialog/ClubMemberAddDialog";
import ClubMemberRemoveDialog from "@/components/dialog/ClubMemberRemoveDialog";
import Layout from "@/components/layout";
import {
  ExtraLargeLoadingButton,
  FullWidthSkeleton,
  LargeLoadingButton,
  ThickDivider,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "@/components/styled";
import { DialogContext } from "@/context/dialog";
import { clubAbi } from "@/contracts/abi/club";
import FormikHelper from "@/helper/FormikHelper";
import useError from "@/hooks/useError";
import useFormSubmit from "@/hooks/useFormSubmit";
import useToasts from "@/hooks/useToast";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { palette } from "@/theme/palette";
import { isAddressesEqual } from "@/utils/addresses";
import { Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import * as yup from "yup";

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
          <ClubDetails address={address as `0x${string}`} />
          <ClubAdminPanel address={address as `0x${string}`} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

function ClubDetails(props: { address: `0x${string}` }) {
  const { address } = useAccount();

  /**
   * Define club uri data
   */
  const { data: uri } = useContractRead({
    address: props.address as `0x${string}`,
    abi: clubAbi,
    functionName: "uri",
  });
  const { data: uriData } = useUriDataLoader(uri as any);

  /**
   * Define is club member
   */
  const { data: isMember } = useContractRead({
    address: props.address,
    abi: clubAbi,
    functionName: "isMember",
    args: [address || ethers.constants.AddressZero],
  });

  if (uriData === undefined || isMember === undefined) {
    return <FullWidthSkeleton />;
  }

  return (
    <Box>
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        {uriData.title}
      </Typography>
      {isMember && (
        <Typography textAlign="center" mt={1}>
          Congrats, you are in the club!
        </Typography>
      )}
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <LargeLoadingButton
          href={`${uriData.link}?club=${props.address}`}
          target="_blank"
          variant="contained"
        >
          Open App
        </LargeLoadingButton>
      </Box>
      {!isMember && (
        <>
          <ThickDivider sx={{ my: 4 }} />
          <Typography textAlign="center" mt={1}>
            {uriData.description}
          </Typography>
          <ClubJoinForm clubEmail={uriData.email} />
        </>
      )}
    </Box>
  );
}

function ClubJoinForm(props: { clubEmail: string }) {
  const { address } = useAccount();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();
  const { submitForm } = useFormSubmit();

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    answer:
      "I already have a lot of followers on other social media platforms!",
    name: "Alice",
    email: "",
    wallet: address,
  });
  const formValidationSchema = yup.object({
    answer: yup.string().required(),
    name: yup.string().required(),
    email: yup.string().required(),
    wallet: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function submit(values: any, actions: any) {
    try {
      setIsFormSubmitting(true);
      await submitForm(props.clubEmail, values);
      showToastSuccess("Form is submitted");
      actions?.resetForm();
    } catch (error: any) {
      handleError(error, true);
    } finally {
      setIsFormSubmitting(false);
    }
  }

  return (
    <>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={submit}
      >
        {({ values, errors, touched, handleChange, setValues }) => (
          <Form
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Answer */}
            <WidgetBox bgcolor={palette.blue} mt={2}>
              <WidgetTitle>Answer</WidgetTitle>
              <WidgetInputTextField
                id="answer"
                name="answer"
                placeholder=""
                value={values.answer}
                onChange={handleChange}
                error={touched.answer && Boolean(errors.answer)}
                helperText={touched.answer && errors.answer}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Name */}
            <WidgetBox bgcolor={palette.purpleDark} mt={2}>
              <WidgetTitle>Name</WidgetTitle>
              <WidgetInputTextField
                id="name"
                name="name"
                placeholder=""
                value={values.name}
                onChange={handleChange}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Email */}
            <WidgetBox bgcolor={palette.greyLight} mt={2}>
              <WidgetTitle>Email</WidgetTitle>
              <WidgetInputTextField
                id="email"
                name="email"
                placeholder=""
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Wallet */}
            <WidgetBox bgcolor={palette.orange} mt={2}>
              <WidgetTitle>Wallet</WidgetTitle>
              <WidgetInputTextField
                id="wallet"
                name="wallet"
                placeholder=""
                value={values.wallet}
                onChange={handleChange}
                error={touched.wallet && Boolean(errors.wallet)}
                helperText={touched.wallet && errors.wallet}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Submit button */}
            <ExtraLargeLoadingButton
              loading={isFormSubmitting}
              variant="outlined"
              type="submit"
              disabled={isFormSubmitting}
              sx={{ mt: 2 }}
            >
              Submit
            </ExtraLargeLoadingButton>
          </Form>
        )}
      </Formik>
    </>
  );
}

function ClubAdminPanel(props: { address: `0x${string}` }) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { address } = useAccount();

  /**
   * Define is club admin
   */
  const { data: owner } = useContractRead({
    address: props.address,
    abi: clubAbi,
    functionName: "owner",
  });

  if (address && isAddressesEqual(address, owner as any)) {
    return (
      <>
        <ThickDivider sx={{ my: 8 }} />
        <Typography variant="h4" textAlign="center" fontWeight={700}>
          👑 Admin Panel
        </Typography>
        <Typography textAlign="center" mt={1}>
          to rule the club
        </Typography>
        <Stack direction="column" spacing={2} mt={2} alignItems="center">
          <LargeLoadingButton
            variant="contained"
            onClick={() =>
              showDialog?.(
                <ClubMemberAddDialog
                  clubAddress={props.address}
                  onClose={closeDialog}
                />
              )
            }
            sx={{ minWidth: 280 }}
          >
            Add Member
          </LargeLoadingButton>
          <LargeLoadingButton
            variant="outlined"
            onClick={() =>
              showDialog?.(
                <ClubMemberRemoveDialog
                  clubAddress={props.address}
                  onClose={closeDialog}
                />
              )
            }
            sx={{ minWidth: 280 }}
          >
            Remove Member
          </LargeLoadingButton>
        </Stack>
      </>
    );
  }

  return <></>;
}
