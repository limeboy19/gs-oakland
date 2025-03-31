import wixData from 'wix-data';
const authOptions = { suppressAuth: true, suppressHooks: true };

export async function syncVideoCategories() {
  try {
    const results = await wixData.query("Video")
      .eq("needsCategorySync", true)
      .include("categories")
      .limit(100)
      .find(authOptions);

    for (const item of results.items) {
      try {
        const categoryIds = (item.categories || []).map(c => (typeof c === 'object' ? c._id : c));

        if (!categoryIds.length) {
          console.warn(`No categories to sync for video: ${item._id}`);
          continue;
        }

        const hubResult = await wixData.query("MasterHubAutomated")
          .eq("referenceId", item._id)
          .limit(1)
          .find(authOptions);

        if (hubResult.items.length === 0) {
          console.warn(`No MasterHubAutomated found for video: ${item._id}`);
          continue;
        }

        const masterItem = hubResult.items[0];

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
