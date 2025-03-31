import wixData from 'wix-data';
import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import { afterInsertVideo, afterUpdateVideo } from 'backend/hooks/RichContent.js';


let authOptions = { suppressAuth: true };

export function RichContent_afterInsert(item, context) {
  console.log("afterInsert_RichContent triggered", item);
  afterInsertRichContent(item,authOptions);
  
}

export async function RichContent_afterUpdate(item, context) {
  console.log("afterUpdate_RichContent triggered", item);
  afterUpdateRichContent(item, authOptions);
  
}

export function Video_afterInsert(item, context) {
  console.log("afterInsert_Video triggered", item);
  afterInsertVideo(item, authOptions);
}

export async function Video_afterUpdate(item, context) {
  console.log("afterUpdate_Video triggered", item);
  await afterUpdateVideo(item, authOptions);
}

