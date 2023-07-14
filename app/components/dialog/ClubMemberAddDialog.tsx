import { clubAbi } from "@/contracts/abi/club";
import FormikHelper from "@/helper/FormikHelper";
import useError from "@/hooks/useError";
import useToasts from "@/hooks/useToast";
import { palette } from "@/theme/palette";
import { Dialog, Typography } from "@mui/material";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { Web3Provider } from "zksync-web3";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

export default function ClubMemberAddDialog(props: {
  clubAddress: `0x${string}`;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();

  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    wallet: "",
  });
  const formValidationSchema = yup.object({
    wallet: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      // Define provider and signer
      const provider = new Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      // Define contract
      const clubContract = new ethers.Contract(
        props.clubAddress,
        clubAbi,
        signer
      );
      // Add member using club contract
      await (await clubContract.addMember(values.wallet)).wait();
      // Display success toast and close dialog
      showToastSuccess("Member is added");
      close();
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   * Function to close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🤘 Add member
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
              {/* Wallet */}
              <WidgetBox bgcolor={palette.blue} mt={2}>
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
      </DialogCenterContent>
    </Dialog>
  );
}
