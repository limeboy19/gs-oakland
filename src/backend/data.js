import { afterInsertRichContent, afterUpdateRichContent } from 'backend/hooks/RichContent.js';
import wixDataHooks from 'wix-data';

wixDataHooks.afterInsert("RichContent", afterInsertRichContent);
wixDataHooks.afterUpdate("RichContent", afterUpdateRichContent);
