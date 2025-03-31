import wixData from 'wix-data';
const authOptions = { suppressAuth: true, suppressHooks: true };

export async function syncVideoCategories() {
    try {
      const results = await wixData.query("Video")
        .eq("needsCategorySync", true)
        .limit(100)
        .include("categories")
        .find(authOptions);
  
      console.log(`🔍 Found ${results.items.length} video(s) needing sync`);
  
      for (const item of results.items) {
        try {
          const categoryIds = Array.isArray(item.categories)
            ? item.categories.map(id => (typeof id === 'object' ? id._id : id))
            : [];
  
          console.log(`📼 Syncing "${item.title}" (${item._id}) with categories:`, categoryIds);
  
          const hubResult = await wixData.query("MasterHubAutomated")
            .eq("referenceId", item._id)
            .limit(1)
            .find(authOptions);
  
          if (hubResult.items.length === 0) {
            console.warn(`⚠️ No MasterHubAutomated found for video: ${item._id}`);
            continue;
          }
  
          const masterItem = hubResult.items[0];
          console.log(`✅ Found MasterHubAutomated item: ${masterItem._id}`);
  
          // Clear old references first
          try {
            await wixData.replaceReferences(
              "MasterHubAutomated",
              "categories",
              masterItem._id,
              [],
              authOptions
            );
            console.log(`🧹 Cleared existing categories for MasterHubAutomated ${masterItem._id}`);
          } catch (clearErr) {
            console.error(`❌ Failed to clear categories for ${masterItem._id}:`, clearErr);
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
            console.log(`🔁 Updated categories for MasterHubAutomated ${masterItem._id}`);
          } catch (replaceErr) {
            console.error(`❌ Failed to set new categories for ${masterItem._id}:`, replaceErr);
          }
  
          // Mark video as synced
          await wixData.update("Video", {
            _id: item._id,
            needsCategorySync: false
          }, authOptions);
  
          console.log(`✅ Finished sync for video: ${item.title}`);
        } catch (innerError) {
          await logError(`syncVideoCategories - videoId: ${item._id}`, innerError);
        }
      }
    } catch (outerError) {
      await logError("syncVideoCategories - top level", outerError);
    }
  }
  
    

async function logError(location, error) {
  const now = new Date();
  const logEntry = {
    title: error.message || String(error),
    errorOgLocation: location,
    dateOfError: new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })),
    timeOfError: now.toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
    errorObject: error
  };

  try {
    await wixData.insert("logs", logEntry, authOptions);
  } catch (logError) {
    console.error("Failed to log error to logs collection:", logError);
  }
}
