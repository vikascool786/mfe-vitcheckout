import { fetchContentStrings } from "../api/service/content-strings";
import { useAtom, useAtomValue } from "jotai";
import { contentStringsAtom } from "../store";
import {
  GET_API_ENDPOINT_BASE_URL_FOR_TRANSLATIONS,
  GET_API_MODE,
} from "../utils/urlResolver";
import { useMemo } from "react";
import { siteApiData } from "../checkout/siteAtom";
import { Site } from "../interfaces/Site";
import { APIMODE } from "../utils/types/types";

export const useContentStrings = () => {
  const [contentStrings, setContentStrings] = useAtom<object | null>(
    contentStringsAtom
  );
  const apiMode = useMemo(() => GET_API_MODE(), []);
  const apiBaseUrl = useMemo(() => {
    return GET_API_ENDPOINT_BASE_URL_FOR_TRANSLATIONS(apiMode as APIMODE);
  }, []);

  const getString = (
    key: string,
    replacements: Array<string> = []
  ): string | undefined => {
    if (
      replacements.length > 0 &&
      contentStrings &&
      contentStrings[key as keyof typeof contentStrings]
    ) {
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
      return messageToReplace || key;
    }
    // @ts-ignore
    return contentStrings[key] || key;
  };

  const getContent = async (siteData: Site): Promise<any> => {
    const { maLanguageCode, countryCode } = siteData?.locale;
    await fetchContentStrings(
      { language: maLanguageCode, country: countryCode },
      apiBaseUrl
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
