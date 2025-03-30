import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';


let authOptions = { suppressAuth: true };

export async function RichContent_afterInsert_(item) {
  console.log("afterInsert_RichContent triggered", item);

  try {
    await afterInsertRichContent(item);
  } catch (err) {
    console.error("Error in afterInsertRichContent:", err);
  }
}

export async function RichContent_afterUpdate(item, context, authOptions) {
  console.log("afterUpdate_RichContent triggered", { data: item });
  await afterUpdateRichContent(fullItem, authOptions);
  
}
