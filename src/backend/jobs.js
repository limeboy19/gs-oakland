//Import functions
import wixData from 'wix-data';
import { logJobRun, logError } from 'backend/logging/logFunctions.js';

//Global Variables
const authOptions = { suppressAuth: true, suppressHooks: true };

export async function syncVideoCategories() {
    let jobSuccessful = true;
  
    try {
      const results = await wixData.query("Video")
        .eq("needsCategorySync", true)
        .limit(100)
        .include("categories")
        .find(authOptions);
  
      console.log(`Found ${results.items.length} video(s) needing sync`);
  
      for (const item of results.items) {
        try {
          const categoryIds = Array.isArray(item.categories)
            ? item.categories.map(id => (typeof id === 'object' ? id._id : id))
            : [];
  
          console.log(`Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
  
          const hubResult = await wixData.query("MasterHubAutomated")
            .eq("referenceId", item._id)
            .limit(1)
            .find(authOptions);
  
          if (hubResult.items.length === 0) {
            console.warn(`No MasterHubAutomated found for video: ${item._id}`);
            continue;
          }
  
          const masterItem = hubResult.items[0];
          console.log(`Found MasterHubAutomated item: ${masterItem._id}`);
  
          // Clear old references first
          try {
            await wixData.replaceReferences(
              "MasterHubAutomated",
              "categories",
              masterItem._id,
              [],
              authOptions
            );
            console.log(`Cleared existing categories for MasterHubAutomated ${masterItem._id}`);
          } catch (clearErr) {
            console.error(`Failed to clear categories for ${masterItem._id}:`, clearErr);
          }
  
          // Then set new references
          try {
            await wixData.replaceReferences(
              "MasterHubAutomated",
              "categories",
              masterItem._id,
              categoryIds,
              authOptions
            );
            console.log(`Updated categories for MasterHubAutomated ${masterItem._id}`);
          } catch (replaceErr) {
            console.error(`Failed to set new categories for ${masterItem._id}:`, replaceErr);
          }
  
        // Mark video as synced
        const saveObject = { ...item, needsCategorySync: false };
        await wixData.save("Video", saveObject, authOptions);

          console.log(`Finished sync for video: ${item.title}`);
        } catch (innerError) {
          jobSuccessful = false;
          await logError(`syncVideoCategories - videoId: ${item._id}`, innerError);
        }
      }
    } catch (outerError) {
      jobSuccessful = false;
      await logError("syncVideoCategories - top level", outerError);
    } finally {
      await logJobRun({
        title: "syncVideoCategories",
        successful: jobSuccessful
      });
    }
  }

  export async function syncRichContentCategories() {
    let jobSuccessful = true;
  
    try {
      const results = await wixData.query("RichContent")
        .eq("needsCategorySync", true)
        .limit(100)
        .include("categories")
        .find(authOptions);
  
      console.log(`Found ${results.items.length} RichContent item(s) needing sync`);
  
      for (const item of results.items) {
        try {
          const categoryIds = Array.isArray(item.categories)
            ? item.categories.map(id => (typeof id === 'object' ? id._id : id))
            : [];
  
          console.log(`Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
  
          const hubResult = await wixData.query("MasterHubAutomated")
            .eq("referenceId", item._id)
            .limit(1)
            .find(authOptions);
  
          if (hubResult.items.length === 0) {
            console.warn(`No MasterHubAutomated found for RichContent: ${item._id}`);
            continue;
          }
  
          const masterItem = hubResult.items[0];
          console.log(`Found MasterHubAutomated item: ${masterItem._id}`);
  
          // Clear old references
          try {
            await wixData.replaceReferences(
              "MasterHubAutomated",
              "categories",
              masterItem._id,
              [],
              authOptions
            );
            console.log(`Cleared existing categories for MasterHubAutomated ${masterItem._id}`);
          } catch (clearErr) {
            console.error(`Failed to clear categories for ${masterItem._id}:`, clearErr);
          }
  
          // Set new references
          try {
            await wixData.replaceReferences(
              "MasterHubAutomated",
              "categories",
              masterItem._id,
              categoryIds,
              authOptions
            );
            console.log(`Updated categories for MasterHubAutomated ${masterItem._id}`);
          } catch (replaceErr) {
            console.error(`Failed to set new categories for ${masterItem._id}:`, replaceErr);
          }
  
          // ✅ Mark as synced using .save() to avoid field wiping
          const saveObject = { ...item, needsCategorySync: false };
          await wixData.save("RichContent", saveObject, authOptions);
          console.log(`Marked RichContent as synced: ${item._id}`);
  
        } catch (innerError) {
          jobSuccessful = false;
          await logError(`syncRichContentCategories - itemId: ${item._id}`, innerError);
        }
      }
    } catch (outerError) {
      jobSuccessful = false;
      await logError("syncRichContentCategories - top level", outerError);
    } finally {
      await logJobRun({
        title: "syncRichContentCategories",
        successful: jobSuccessful
      });
    }
  }
  
