import Layout from "@/components/layout";
import {
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputSelect,
  WidgetInputTextField,
  WidgetTitle,
} from "@/components/styled";
import { clubFactoryAbi } from "@/contracts/abi/clubFactory";
import FormikHelper from "@/helper/FormikHelper";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import useToasts from "@/hooks/useToast";
import { palette } from "@/theme/palette";
import { chainToSupportedChainConfig } from "@/utils/chaints";
import { MenuItem, Typography } from "@mui/material";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import { useNetwork } from "wagmi";
import * as yup from "yup";
import { Web3Provider } from "zksync-web3";

/**
 * Page to create club.
 */
export default function CreateClub() {
  const router = useRouter();
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { uploadJsonToIpfs } = useIpfs();
  const { showToastSuccess } = useToasts();

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    title: "🐒 Social Monkeys Club",
    description:
      "Tell us why you are the best candidate to join the club and get early access to the application",
    formType: "Answer + Contact",
    contract: chainToSupportedChainConfig(chain).contracts.socialMonkeys,
    link: `${window.location.protocol}//${window.location.host}/demo/socialMonkeys`,
    email: "socialmonkeys@kiv1n.ru",
  });
  const formValidationSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().required(),
    formType: yup.string().required(),
    contract: yup.string().required(),
    link: yup.string().required(),
    email: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      // Upload form values to ipfs
      const { uri } = await uploadJsonToIpfs(values);
      // Define provider and signer
      const provider = new Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      // Define contract
      const clubFactoryContract = new ethers.Contract(
        chainToSupportedChainConfig(chain).contracts.clubFactory,
        clubFactoryAbi,
        signer
      );
      // Create club using club factory contract
      const transaction = await (
        await clubFactoryContract.createClubAndSendEther(uri, values.contract, {
          value: ethers.utils.parseEther("0.005"),
        })
      ).wait();
      // Parse event to define club address
      let clubAddress;
      const clubFactoryInterface = new ethers.utils.Interface(clubFactoryAbi);
      for (let log of transaction.logs) {
        try {
          const logDescription = clubFactoryInterface.parseLog(log);
          if (logDescription.name === "ClubCreated") {
            clubAddress = logDescription.args[0];
          }
        } catch {}
      }
      // Display success toast and redirect to club page
      showToastSuccess("Club is created");
      router.push(`/clubs/${clubAddress}`);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        🚀 Create club
      </Typography>
      <Typography textAlign="center" mt={1}>
        to gather the first adopters and provide them gasless transactions in
        your application
      </Typography>
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
            {/* Title */}
            <WidgetBox bgcolor={palette.blue} mt={2}>
              <WidgetTitle>Title</WidgetTitle>
              <WidgetInputTextField
                id="title"
                name="title"
                placeholder=""
                value={values.title}
                onChange={handleChange}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Description */}
            <WidgetBox bgcolor={palette.purpleDark} mt={2}>
              <WidgetTitle>Description</WidgetTitle>
              <WidgetInputTextField
                id="description"
                name="description"
                placeholder=""
                value={values.description}
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Form type */}
            <WidgetBox bgcolor={palette.purpleLight} mt={2}>
              <WidgetTitle>Form type</WidgetTitle>
              <WidgetInputSelect
                id="formType"
                name="formType"
                value={values.formType}
                onChange={handleChange}
                disabled={isFormSubmitting}
                sx={{ width: 1 }}
              >
                <MenuItem value="Answer + Contact">Answer + Contact</MenuItem>
              </WidgetInputSelect>
            </WidgetBox>
            {/* Contract */}
            <WidgetBox bgcolor={palette.greyLight} mt={2}>
              <WidgetTitle>Contract</WidgetTitle>
              <WidgetInputTextField
                id="contract"
                name="contract"
                placeholder=""
                value={values.contract}
                onChange={handleChange}
                error={touched.contract && Boolean(errors.contract)}
                helperText={touched.contract && errors.contract}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Link */}
            <WidgetBox bgcolor={palette.greyDark} mt={2}>
              <WidgetTitle>Link</WidgetTitle>
              <WidgetInputTextField
                id="link"
                name="link"
                placeholder=""
                value={values.link}
                onChange={handleChange}
                error={touched.link && Boolean(errors.link)}
                helperText={touched.link && errors.link}
                disabled={isFormSubmitting}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Email */}
            <WidgetBox bgcolor={palette.orange} mt={2}>
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
    </Layout>
  );
}
