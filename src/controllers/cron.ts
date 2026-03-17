import { scrapeSources } from "../services/scrapeSources";
import { getCronSources } from "../services/getCronSources";
import { generateDraft } from "../services/generateDraft";
import { sendDraft } from "../services/sendDraft";

export const handleCron = async (): Promise<void> => {
  try {
    const cronSources = await getCronSources();
    const rawContent = await scrapeSources(cronSources);
    const { draftPost, items } = await generateDraft(rawContent);
    console.log(draftPost);
    const result = await sendDraft(items);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
