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
      .include("ageGroups") 
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

    const ageGroupIds = Array.isArray(item.ageGroups)
      ? item.ageGroups.map(id => (typeof id === 'object' ? id._id : id))
      : [];

    console.log(`Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
    console.log(`Syncing "${item.title}" (${item._id}) with ageGroups:`, ageGroupIds);

    const hubResult = await wixData.query("MasterHubAutomated")
      .eq("referenceId", item._id)
      .limit(1)
      .find(authOptions);

    if (hubResult.items.length === 0) {
      console.warn(`No MasterHubAutomated found for Video: ${item._id}`);
      await logJobRun({
        title: "syncVideoCategories",
        successful: false
      });
      return;
    }

    const masterItem = hubResult.items[0];
    console.log(`Found MasterHubAutomated item: ${masterItem._id}`);

    // Replace categories
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
      await logError("replaceReferences - categories - syncVideoCategories", replaceErr);
    }

    // Replace ageGroups
    try {
      await wixData.replaceReferences(
        "MasterHubAutomated",
        "ageGroups",
        masterItem._id,
        ageGroupIds,
        authOptions
      );
      console.log(`Replaced ageGroups for MasterHubAutomated ${masterItem._id}`);
    } catch (replaceErr) {
      jobSuccessful = false;
      console.error(`Failed to set ageGroups for ${masterItem._id}:`, replaceErr);
      await logError("replaceReferences - ageGroups - syncVideoCategories", replaceErr);
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
      .include("ageGroup")
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

    const ageGroupIds = Array.isArray(item.ageGroup)
      ? item.ageGroup.map(id => (typeof id === 'object' ? id._id : id))
      : [];

    console.log(`Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
    console.log(`Syncing "${item.title}" (${item._id}) with ageGroups:`, ageGroupIds);

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

    // Replace categories
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
      await logError("replaceReferences - categories - syncRichContentCategories", refErr);
    }

    // Replace ageGroups
    try {
      await wixData.replaceReferences(
        "MasterHubAutomated",
        "ageGroups",
        masterItem._id,
        ageGroupIds,
        authOptions
      );
      console.log(`Replaced ageGroups for MasterHubAutomated ${masterItem._id}`);
    } catch (refErr) {
      jobSuccessful = false;
      console.error(`Failed to set new ageGroups for ${masterItem._id}:`, refErr);
      await logError("replaceReferences - ageGroups - syncRichContentCategories", refErr);
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

export async function syncProfessionalProgramCategories() {
  let jobSuccessful = true;

  try {
    const results = await wixData.query("ProfessionalPrograms")
      .eq("needsSync", true)
      .limit(1)
      .include("categories")
      .include("ageGroups") 
      .find(authOptions);

    const item = results.items[0];

    if (!item) {
      console.log("No ProfessionalPrograms items to sync. Exiting job early.");
      await logJobRun({
        title: "syncProfessionalProgramCategories",
        successful: true
      });
      return;
    }

    const categoryIds = Array.isArray(item.categories)
      ? item.categories.map(id => (typeof id === 'object' ? id._id : id))
      : [];

    const ageGroupIds = Array.isArray(item.ageGroups)
      ? item.ageGroups.map(id => (typeof id === 'object' ? id._id : id))
      : [];

    console.log(`Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
    console.log(`Syncing "${item.title}" (${item._id}) with ageGroups:`, ageGroupIds);

    const hubResult = await wixData.query("ProfProgramMasterHubAutomated")
      .eq("referenceId", item._id)
      .limit(1)
      .find(authOptions);

    if (hubResult.items.length === 0) {
      console.warn(`No ProfProgramMasterHubAutomated found for ProfessionalPrograms: ${item._id}`);
      await logJobRun({
        title: "syncProfessionalProgramCategories",
        successful: false
      });
      return;
    }

    const masterItem = hubResult.items[0];
    console.log(`Found MasterHubAutomated item: ${masterItem._id}`);

    // Replace categories
    try {
      await wixData.replaceReferences(
        "ProfProgramMasterHubAutomated",
        "categories",
        masterItem._id,
        categoryIds,
        authOptions
      );
      console.log(`Replaced categories for ProfProgramMasterHubAutomated ${masterItem._id}`);
    } catch (replaceErr) {
      jobSuccessful = false;
      console.error(`Failed to set categories for ${masterItem._id}:`, replaceErr);
      await logError("replaceReferences - categories - syncProfessionalProgramCategories", replaceErr);
    }

    // Replace ageGroups
    try {
      await wixData.replaceReferences(
        "ProfProgramMasterHubAutomated",
        "ageGroups",
        masterItem._id,
        ageGroupIds,
        authOptions
      );
      console.log(`Replaced ageGroups for ProfProgramMasterHubAutomated ${masterItem._id}`);
    } catch (replaceErr) {
      jobSuccessful = false;
      console.error(`Failed to set ageGroups for ${masterItem._id}:`, replaceErr);
      await logError("replaceReferences - ageGroups - syncProfessionalProgramCategories", replaceErr);
    }

    const saveObject = { ...item, needsSync: false };
    console.log("Job saveObject for ProfessionalPrograms", saveObject);
    await wixData.save("ProfessionalPrograms", saveObject, authOptions);
    console.log(`Marked ProfessionalPrograms as synced: ${item._id}`);

    return !!item;

  } catch (error) {
    jobSuccessful = false;
    console.error("Error in syncProfessionalProgramCategories:", error);
    await logError("syncProfessionalProgramCategories - top level", error);
  } finally {
    await logJobRun({
      title: "syncProfessionalProgramCategories",
      successful: jobSuccessful
    });
  }
}

export async function syncProfessionalsGetStartedCategories() {
  let jobSuccessful = true;

  try {
    const results = await wixData.query("ProfessionalsGetStarted")
      .eq("needsSync", true)
      .limit(1)
      .include("categories")
      .include("ageGroups")
      .find(authOptions);

    const item = results.items[0];

    if (!item) {
      console.log("No ProfessionalsGetStarted items to sync. Exiting job early.");
      await logJobRun({
        title: "syncProfessionalsGetStartedCategories",
        successful: true
      });
      return;
    }

    const categoryIds = Array.isArray(item.categories)
      ? item.categories.map(id => (typeof id === 'object' ? id._id : id))
      : [];

    const ageGroupIds = Array.isArray(item.ageGroups)
      ? item.ageGroups.map(id => (typeof id === 'object' ? id._id : id))
      : [];

    console.log(`Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
    console.log(`Syncing "${item.title}" (${item._id}) with ageGroups:`, ageGroupIds);

    const hubResult = await wixData.query("ProfProgramMasterHubAutomated")
      .eq("referenceId", item._id)
      .limit(1)
      .find(authOptions);

    if (hubResult.items.length === 0) {
      console.warn(`No MasterHubAutomated found for ProfessionalsGetStarted: ${item._id}`);
      await logJobRun({
        title: "syncProfessionalsGetStartedCategories",
        successful: false
      });
      return;
    }

    const masterItem = hubResult.items[0];
    console.log(`Found ProfProgramMasterHubAutomated item: ${masterItem._id}`);

    // Replace categories
    try {
      await wixData.replaceReferences(
        "ProfProgramMasterHubAutomated",
        "categories",
        masterItem._id,
        categoryIds,
        authOptions
      );
      console.log(`Replaced categories for ProfProgramMasterHubAutomated ${masterItem._id}`);
    } catch (refErr) {
      jobSuccessful = false;
      console.error(`Failed to set new categories for ${masterItem._id}:`, refErr);
      await logError("replaceReferences - categories - syncProfessionalsGetStartedCategories", refErr);
    }

    // Replace ageGroups
    try {
      await wixData.replaceReferences(
        "ProfProgramMasterHubAutomated",
        "ageGroups",
        masterItem._id,
        ageGroupIds,
        authOptions
      );
      console.log(`Replaced ageGroups for ProfProgramMasterHubAutomated ${masterItem._id}`);
    } catch (refErr) {
      jobSuccessful = false;
      console.error(`Failed to set new ageGroups for ${masterItem._id}:`, refErr);
      await logError("replaceReferences - ageGroups - syncProfessionalsGetStartedCategories", refErr);
    }

    // Mark item as synced
    const saveObject = { ...item, needsSync: false };
    console.log("Job saveObject for ProfessionalsGetStarted", saveObject);
    await wixData.save("ProfessionalsGetStarted", saveObject, authOptions);
    console.log(`Marked ProfessionalsGetStarted as synced: ${item._id}`);

    return !!item;

  } catch (error) {
    jobSuccessful = false;
    console.error("Error in syncProfessionalsGetStartedCategories:", error);
    await logError("syncProfessionalsGetStartedCategories - top level", error);
    return false;

  } finally {
    await logJobRun({
      title: "syncProfessionalsGetStartedCategories",
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
      console.log(`Sync loop iteration ${loopCount}...`);

      const videoSynced = await syncVideoCategories();
      const richContentSynced = await syncRichContentCategories();
      const professionalProgramsSynced = await syncProfessionalProgramCategories();
      const professionalsGetStartedSynced = await syncProfessionalsGetStartedCategories();

      if (
        !videoSynced &&
        !richContentSynced &&
        !professionalProgramsSynced &&
        !professionalsGetStartedSynced
      ) {
        console.log("All items synced. Exiting.");
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


export async function deleteOldJobRuns() {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const batchSize = 100;
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const results = await wixData.query("jobs")
      .lt("jobCompletionDate", cutoffDate)
      .limit(batchSize)
      .find(authOptions);

    const itemsToDelete = results.items;

    for (const item of itemsToDelete) {
      await wixData.remove("jobs", item._id, authOptions);
      await sleep(100); // to avoid quota error
    }

    console.log(`Deleted ${itemsToDelete.length} old job run(s) in this pass.`);
    return itemsToDelete.length;
  } catch (error) {
    console.error("Error deleting old job runs:", error);
    await logError("deleteOldJobRuns", error);
    return 0;
  }
}