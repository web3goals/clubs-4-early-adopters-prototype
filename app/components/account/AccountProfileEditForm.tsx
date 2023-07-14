import { socialMonkeysAbi } from "@/contracts/abi/socialMonkeys";
import { chainToSupportedChainConfig } from "@/utils/chaints";
import {
  Avatar,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { ExtraLargeLoadingButton } from "components/styled";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import FormikHelper from "helper/FormikHelper";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import useToasts from "hooks/useToast";
import { useRouter } from "next/router";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { emojiAvatarForAddress } from "utils/avatars";
import { ipfsUriToHttpUri } from "utils/converters";
import { useNetwork } from "wagmi";
import * as yup from "yup";
import { utils, Web3Provider } from "zksync-web3";

/**
 * A component with form to edit account profile.
 */
export default function AccountProfileEditForm(props: {
  accountAddress: `0x${string}`;
  clubAddress: `0x${string}`;
  accountProfileData: any;
}) {
  const { handleError } = useError();
  const { uploadJsonToIpfs, uploadFileToIpfs } = useIpfs();
  const { showToastSuccess } = useToasts();
  const router = useRouter();
  const { chain } = useNetwork();

  // Form states
  const [formImageValue, setFormImageValue] = useState<{
    file: any;
    uri: any;
  }>();
  const [formValues, setFormValues] = useState({
    name: props.accountProfileData?.attributes?.[0]?.value || "",
    about: props.accountProfileData?.attributes?.[1]?.value || "",
    email: props.accountProfileData?.attributes?.[2]?.value || "",
    website: props.accountProfileData?.attributes?.[3]?.value || "",
    twitter: props.accountProfileData?.attributes?.[4]?.value || "",
    telegram: props.accountProfileData?.attributes?.[5]?.value || "",
    instagram: props.accountProfileData?.attributes?.[6]?.value || "",
  });

  const formValidationSchema = yup.object({
    name: yup.string(),
    about: yup.string(),
    email: yup.string().email(),
    website: yup.string().url(),
    twitter: yup
      .string()
      .matches(
        /^[a-zA-Z0-9_]*$/,
        "your twitter can only contain letters, numbers and '_'"
      ),
    telegram: yup
      .string()
      .matches(
        /^[a-zA-Z0-9_]*$/,
        "your telegram can only contain letters, numbers and '_'"
      ),
    instagram: yup
      .string()
      .matches(
        /^[a-zA-Z0-9_]*$/,
        "your instagram can only contain letters, numbers and '_'"
      ),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function onImageChange(files: any[]) {
    try {
      // Get file
      const file = files?.[0];
      if (!file) {
        return;
      }
      // Check file size
      const isLessThan2Mb = file.size / 1024 / 1024 < 2;
      if (!isLessThan2Mb) {
        throw new Error(
          "Only files with size smaller than 2MB are currently supported!"
        );
      }
      // Read and save file
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.readyState === 2) {
          setFormImageValue({
            file: file,
            uri: fileReader.result,
          });
        }
      };
      fileReader.readAsDataURL(file);
    } catch (error: any) {
      handleError(error, true);
    }
  }

  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      // Upload image to ipfs
      let imageIpfsUri;
      if (formImageValue?.file) {
        const { uri } = await uploadFileToIpfs(formImageValue.file);
        imageIpfsUri = uri;
      }
      // Define profile uri data
      const profileUriData = {
        name: "Social Monkey",
        image: imageIpfsUri || props.accountProfileData?.image || "",
        attributes: [
          { trait_type: "name", value: values.name },
          { trait_type: "about", value: values.about },
          { trait_type: "email", value: values.email },
          { trait_type: "website", value: values.website },
          { trait_type: "twitter", value: values.twitter },
          { trait_type: "telegram", value: values.telegram },
          { trait_type: "instagram", value: values.instagram },
        ],
      };
      // Upload profile uri data to ipfs
      const { uri } = await uploadJsonToIpfs(profileUriData);
      // Define provider and signer
      const provider = new Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      // Define gas price
      const gasPrice = await provider.getGasPrice();
      // Encode paymaster flow's input
      const paymasterParams = utils.getPaymasterParams(props.clubAddress, {
        type: "General",
        innerInput: new Uint8Array(),
      });
      // Define social monkey contract
      const socialMonkeys = new ethers.Contract(
        chainToSupportedChainConfig(chain).contracts.socialMonkeys,
        socialMonkeysAbi,
        signer
      );
      // Define if the account has created a monkey
      const isMonkeyCreated =
        (await socialMonkeys.balanceOf(props.accountAddress)).toNumber() > 0;
      // Send transaction to edit monkey if monkey already created
      if (isMonkeyCreated) {
        // Estimate gas fee for transaction
        const gasLimit = await socialMonkeys.estimateGas.edit(uri, {
          customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: paymasterParams,
          },
        });
        const fee = gasPrice.mul(gasLimit.toString());
        // Send transaction using paymaster
        await (
          await socialMonkeys.edit(uri, {
            customData: {
              paymasterParams: paymasterParams,
              gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
          })
        ).wait();
      }
      // Send transaction to create monkey if monkey not created
      else {
        // Estimate gas fee for transaction
        const gasLimit = await socialMonkeys.estimateGas.create(uri, {
          customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: paymasterParams,
          },
        });
        const fee = gasPrice.mul(gasLimit.toString());
        // Send transaction using paymaster
        await (
          await socialMonkeys.create(uri, {
            customData: {
              paymasterParams: paymasterParams,
              gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
          })
        ).wait();
      }
      showToastSuccess("Form is submitted");
      router.push(`/demo/socialMonkeys?club=${props.clubAddress}`);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Formik
      initialValues={formValues}
      validationSchema={formValidationSchema}
      onSubmit={submit}
    >
      {({ values, errors, touched, handleChange }) => (
        <Form
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FormikHelper onChange={(values: any) => setFormValues(values)} />
          {/* Image */}
          <Dropzone
            multiple={false}
            disabled={isFormSubmitting}
            onDrop={(files) => onImageChange(files)}
            accept={{ "image/*": [] }}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar
                    sx={{
                      cursor: !isFormSubmitting ? "pointer" : undefined,
                      width: 164,
                      height: 164,
                      borderRadius: 164,
                      background: emojiAvatarForAddress(props.accountAddress)
                        .color,
                    }}
                    src={
                      formImageValue?.uri ||
                      (props.accountProfileData?.image
                        ? ipfsUriToHttpUri(props.accountProfileData.image)
                        : undefined)
                    }
                  >
                    <Typography fontSize={64}>
                      {emojiAvatarForAddress(props.accountAddress).emoji}
                    </Typography>
                  </Avatar>
                </Box>
              </div>
            )}
          </Dropzone>
          {/* Name */}
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            placeholder="Alice"
            value={values.name}
            onChange={handleChange}
            error={touched.name && Boolean(errors.name)}
            helperText={<>{touched.name && errors.name}</>}
            disabled={isFormSubmitting}
            sx={{ mt: 4 }}
          />
          {/* About */}
          <TextField
            fullWidth
            id="about"
            name="about"
            label="About"
            placeholder="crypto enthusiast..."
            multiline={true}
            rows={3}
            value={values.about}
            onChange={handleChange}
            error={touched.about && Boolean(errors.about)}
            helperText={<>{touched.about && errors.about}</>}
            disabled={isFormSubmitting}
            sx={{ mt: 2 }}
          />
          {/* Email */}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            placeholder="alice@domain.io"
            value={values.email}
            onChange={handleChange}
            error={touched.email && Boolean(errors.email)}
            helperText={<>{touched.email && errors.email}</>}
            disabled={isFormSubmitting}
            sx={{ mt: 2 }}
          />
          {/* Website */}
          <TextField
            fullWidth
            id="website"
            name="website"
            label="Website"
            placeholder="https://domain.io"
            value={values.website}
            onChange={handleChange}
            error={touched.website && Boolean(errors.website)}
            helperText={<>{touched.website && errors.website}</>}
            disabled={isFormSubmitting}
            sx={{ mt: 2 }}
          />
          {/* Twitter */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="twitter">Twitter</InputLabel>
            <OutlinedInput
              fullWidth
              id="twitter"
              name="twitter"
              label="Twitter"
              placeholder="alice"
              startAdornment={
                <InputAdornment position="start">@</InputAdornment>
              }
              value={values.twitter}
              onChange={handleChange}
              error={touched.twitter && Boolean(errors.twitter)}
              disabled={isFormSubmitting}
            />
            <FormHelperText error={touched.twitter && Boolean(errors.twitter)}>
              <>{touched.twitter && errors.twitter}</>
            </FormHelperText>
          </FormControl>
          {/* Telegram */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="telegram">Telegram</InputLabel>
            <OutlinedInput
              fullWidth
              id="telegram"
              name="telegram"
              label="Telegram"
              placeholder="alice"
              startAdornment={
                <InputAdornment position="start">@</InputAdornment>
              }
              value={values.telegram}
              onChange={handleChange}
              error={touched.telegram && Boolean(errors.telegram)}
              disabled={isFormSubmitting}
            />
            <FormHelperText
              error={touched.telegram && Boolean(errors.telegram)}
            >
              <>{touched.telegram && errors.telegram}</>
            </FormHelperText>
          </FormControl>
          {/* Instagram */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel htmlFor="instagram">Instagram</InputLabel>
            <OutlinedInput
              fullWidth
              id="instagram"
              name="instagram"
              label="Instagram"
              placeholder="alice"
              startAdornment={
                <InputAdornment position="start">@</InputAdornment>
              }
              value={values.instagram}
              onChange={handleChange}
              error={touched.instagram && Boolean(errors.instagram)}
              disabled={isFormSubmitting}
            />
            <FormHelperText
              error={touched.instagram && Boolean(errors.instagram)}
            >
              <>{touched.instagram && errors.instagram}</>
            </FormHelperText>
          </FormControl>
          {/* Submit button */}
          <ExtraLargeLoadingButton
            loading={isFormSubmitting}
            variant="contained"
            type="submit"
            disabled={isFormSubmitting}
            sx={{ mt: 4 }}
          >
            Save
          </ExtraLargeLoadingButton>
        </Form>
      )}
    </Formik>
  );
}
