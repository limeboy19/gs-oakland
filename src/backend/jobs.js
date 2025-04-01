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
      .limit(1)
      .include("categories")
      .find(authOptions);

    const item = results.items[0];

    if (!item) {
      console.log("No Video items to sync. Exiting job early.");
      await logJobRun({
        title: "syncVideoCategories",
        successful: true
      });
      return;
    }

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
      await logJobRun({
        title: "syncVideoCategories",
        successful: false
      });
      return;
    }

    const masterItem = hubResult.items[0];
    console.log(`Found MasterHubAutomated item: ${masterItem._id}`);

    try {
      await wixData.replaceReferences(
        "MasterHubAutomated",
        "categories",
        masterItem._id,
        categoryIds,
        authOptions
      );
      console.log(`Replaced categories for MasterHubAutomated ${masterItem._id}`);
    } catch (replaceErr) {
      jobSuccessful = false;
      console.error(`Failed to set categories for ${masterItem._id}:`, replaceErr);
      await logError("replaceReferences - syncVideoCategories", replaceErr);
    }

    
    const saveObject = { ...item, needsCategorySync: false };
    console.log("Job saveObject for Video", saveObject);
    await wixData.save("Video", saveObject, authOptions);
    console.log(`Marked video as synced: ${item._id}`);

    return !!item;


  } catch (error) {
    jobSuccessful = false;
    console.error("Error in syncVideoCategories:", error);
    await logError("syncVideoCategories - top level", error);
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
      .limit(1)
      .include("categories")
      .find(authOptions);

    const item = results.items[0];

    if (!item) {
      console.log("No RichContent items to sync. Exiting job early.");
      await logJobRun({
        title: "syncRichContentCategories",
        successful: true
      });
      return;
    }

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
      await logJobRun({
        title: "syncRichContentCategories",
        successful: false
      });
      return;
    }

    const masterItem = hubResult.items[0];
    console.log(`Found MasterHubAutomated item: ${masterItem._id}`);

    // Replace categories in one go
    try {
      await wixData.replaceReferences(
        "MasterHubAutomated",
        "categories",
        masterItem._id,
        categoryIds,
        authOptions
      );
      console.log(`Replaced categories for MasterHubAutomated ${masterItem._id}`);
    } catch (refErr) {
      jobSuccessful = false;
      console.error(`Failed to set new categories for ${masterItem._id}:`, refErr);
      await logError("replaceReferences - syncRichContentCategories", refErr);
    }

    // Mark item as synced
    const saveObject = { ...item, needsCategorySync: false };
    console.log("Job saveObject for Rich Content", saveObject);
    await wixData.save("RichContent", saveObject, authOptions);
    console.log(`Marked RichContent as synced: ${item._id}`);

    return !!item;

  } catch (error) {

    jobSuccessful = false;
    console.error("Error in syncRichContentCategories:", error);
    await logError("syncRichContentCategories - top level", error);
    return false;

  } finally {
    await logJobRun({
      title: "syncRichContentCategories",
      successful: jobSuccessful
    });
  }
}

export async function syncAllCategoryMappings() {
  let jobSuccessful = true;
  let loopCount = 0;

  try {
    while (true) {
      loopCount++;
      console.log(`🔁 Sync loop iteration ${loopCount}...`);

      const videoSynced = await syncVideoCategories();
      const richContentSynced = await syncRichContentCategories();

      if (!videoSynced && !richContentSynced) {
        console.log("✅ All items synced. Exiting.");
        break;
      }
    }
  } catch (error) {
    
    jobSuccessful = false;
    console.error("Error in syncAllCategoryMappings:", error);
    await logError("syncAllCategoryMappings - top level", error);
    return false;

  } finally {
    await logJobRun({
      title: "syncAllCategoryMappings",
      successful: jobSuccessful
    });
  }
}

