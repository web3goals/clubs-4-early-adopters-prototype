import axios from "axios";
import qs from "qs";
import useErrors from "./useError";

/**
 * Hook for work with formsubmit.io.
 */
export default function useFormSubmit() {
  const { handleError } = useErrors();

  let submitForm = async function (destination: string, data: any) {
    try {
      const postUrl = `https://formsubmit.co/ajax/${destination}`;
      const postData = qs.stringify({
        ...data,
      });
      await axios.post(postUrl, postData);
    } catch (error: any) {
      handleError(error, false);
    }
  };

  return {
    submitForm,
  };
}
