import { fetchContentStrings } from "../service/content-strings";
import { useAtom, useAtomValue } from "jotai";
import { contentStringsAtom, appConfigAtom } from "mfeStore/store";
import {
  GET_API_ENDPOINT_BASE_URL_ONLY,
  GET_API_MODE,
} from "../../utils/urlResolvers";

export const useContentStrings = () => {
  const [contentStrings, setContentStrings] = useAtom<object | null>(
    contentStringsAtom
  );
  const config: any = useAtomValue(appConfigAtom);
  const apiUrl = GET_API_ENDPOINT_BASE_URL_ONLY(GET_API_MODE());

  const getString = (
    key: string,
    replacements: Array<string> = []
  ): string | null => {
    if (replacements.length > 0) {
      // @ts-ignore
      let messageToReplace: any = contentStrings[key];
      for (let i = 0; i < replacements.length; i++) {
        const placeholder = "\\{" + i + "\\}";
        const placeholderRegex = new RegExp(placeholder, "g");
        messageToReplace = messageToReplace.replace(
          placeholderRegex,
          replacements[i]
        );
      }
      return messageToReplace;
    }
    // @ts-ignore
    return contentStrings[key] || "";
  };

  const getContent = async (): Promise<any> => {
    // @ts-ignore
    await fetchContentStrings(
      { language: config.languageCode, country: config.countryCode },
      apiUrl
    ).then((res) => {
      setContentStrings(res);
    });
  };

  return {
    contentStrings,
    getContent,
    getString,
  };
};
