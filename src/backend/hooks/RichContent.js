import wixData from 'wix-data'

let baseURL = 'https://actonemedia.wixstudio.com/gs-oakland';

export async function afterUpdateRichContent(item, context) {
  console.log("afterUpdate triggered for RichContent:", item);

  try {
    const result = await wixData.query("MasterHubAutomated")
      .eq("title", item.title)
      .find();

    if (result.items.length === 0) {
      console.log(`No matching item found in MasterHubAutomated for title: ${item.title}`);
      return item;
    }

    const masterItem = result.items[0];
    let textURL = baseURL + item["link-rich-content-title"];

    const updatedFields = {
      _id: masterItem._id,
      categories: item.categories,
      resourceType: item.resourceType,
      description: item.description,
      link: textURL,
      referenceId: item._id
    };

    await wixData.update("MasterHubAutomated", updatedFields);
    console.log(`Updated MasterHubAutomated item with ID: ${masterItem._id}`);

  } catch (error) {
    console.error("Error in afterUpdate hook:", error);
    await logError("afterUpdate - RichContent", error);
  }

  return item;
}

export async function afterInsertRichContent(item, context) {
  console.log("afterInsert triggered for RichContent:", item);

  try {
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
      await wixData.insert("MasterHubAutomated", syncedFields);
      console.log(`Inserted new item into MasterHubAutomated for title: ${item.title}`);
    }

  } catch (error) {
    console.error("Error in afterInsert hook:", error);
    await logError("afterInsert - RichContent", error);
  }

  return item;
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
    await wixData.insert("logs", logEntry);
  } catch (logError) {
    console.error("Failed to log error to logs collection:", logError);
  }
}