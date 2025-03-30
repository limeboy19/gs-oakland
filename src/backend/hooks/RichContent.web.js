//WIX LIBRARY
import wixData from 'wix-data';
import wixDataHooks from 'wix-data';

//VARIABLES
let baseURL = 'https://actonemedia.wixstudio.com/gs-oakland'

//RICH CONTENT AFTER UPDATE
wixDataHooks.afterUpdate("RichContent", async (item, context) => {
  console.log("afterUpdate triggered for RichContent:", item);

  try {
    // 1. Search for item with the same title in MasterHubAutomated
    const result = await wixData.query("MasterHubAutomated")
      .eq("title", item.title)
      .find();

    if (result.items.length === 0) {
      console.log(`No matching item found in MasterHubAutomated for title: ${item.title}`);
      return item;
    }

    const masterItem = result.items[0];

    let textURL = baseURL + item["link-rich-content-title"];

    // 2. Prepare updated data
    const updatedFields = {
      _id: masterItem._id,
      categories: item.categories,
      resourceType: item.resourceType,
      description: item.description,
      link: textURL,
      referenceId: item._id
    };

    // 3. Update MasterHubAutomated item
    await wixData.update("MasterHubAutomated", updatedFields);
    console.log(`Updated MasterHubAutomated item with ID: ${masterItem._id}`);

  } catch (error) {
    console.error("Error in afterUpdate hook:", error);

    // 4. Log error to "logs" collection
    const now = new Date();

    const logEntry = {
      title: error.message || String(error),
      errorOgLocation: "afterUpdate - RichContent",
      dateOfError: new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })),
      timeOfError: now.toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
      errorObject: error
    };

    try {
      await wixData.insert("logs", logEntry);
    } catch (logError) {
      console.error("Failed to log error to logs collection:", logError);
    }
  }

  return item;
});

//RICH CONTENT AFTER INSERT
wixDataHooks.afterInsert("RichContent", async (item, context) => {
  console.log("afterInsert triggered for RichContent:", item);

  try {
    // 1. Search for existing item in MasterHubAutomated
    const result = await wixData.query("MasterHubAutomated")
      .eq("title", item.title)
      .find();

    let textURL = `${baseURL}/${item["link-rich-content-title"]}`;

    const syncedFields = {
      title: item.title,
      categories: item.categories,
      resourceType: item.resourceType,
      description: item.description,
      link: textURL,
      referenceId: item._id
    };

    if (result.items.length > 0) {
      const masterItem = result.items[0];
      syncedFields._id = masterItem._id;

      await wixData.update("MasterHubAutomated", syncedFields);
      console.log(`Updated MasterHubAutomated item with ID: ${masterItem._id}`);
    } else {
      // 2b. Insert new item
      await wixData.insert("MasterHubAutomated", syncedFields);
      console.log(`Inserted new item into MasterHubAutomated for title: ${item.title}`);
    }

  } catch (error) {
    console.error("Error in afterInsert hook:", error);

    // 3. Log error to logs collection
    const now = new Date();
    const logEntry = {
      title: error.message || String(error),
      errorOgLocation: "afterInsert - RichContent",
      dateOfError: new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" })),
      timeOfError: now.toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
      errorObject: error
    };

    try {
      await wixData.insert("logs", logEntry);
    } catch (logError) {
      console.error("Failed to log error to logs collection:", logError);
    }
  }

  return item;
});




