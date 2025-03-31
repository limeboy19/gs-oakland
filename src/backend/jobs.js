import wixData from 'wix-data';
const authOptions = { suppressAuth: true, suppressHooks: true };

export async function syncVideoCategories() {
    try {
      const results = await wixData.query("Video")
        .eq("needsCategorySync", true)
        .limit(100)
        .find(authOptions);
  
      for (const item of results.items) {
        try {
          // Ensure categoryIds is a fresh array of IDs
          const categoryIds = Array.isArray(item.categories)
            ? item.categories.map(id => (typeof id === 'object' ? id._id : id))
            : [];
  
          const hubResult = await wixData.query("MasterHubAutomated")
            .eq("referenceId", item._id)
            .limit(1)
            .find(authOptions);
  
          if (hubResult.items.length === 0) {
            console.warn(`No MasterHubAutomated found for video: ${item._id}`);
            continue;
          }
  
          const masterItem = hubResult.items[0];
  
          // This call replaces ALL category references — so it will drop the removed one
          await wixData.replaceReferences(
            "MasterHubAutomated",
            "categories",
            masterItem._id,
            categoryIds,
            authOptions
          );
  
          await wixData.update("Video", {
            _id: item._id,
            needsCategorySync: false
          }, authOptions);
  
          console.log(`Synced categories for: ${item.title}`);
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
