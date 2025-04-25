import wixData from 'wix-data';

export async function MasterHubCategories() {
  try {
    const result = await wixData.query("MasterHubAutomated")
      .include("categories")
      .find();
    console.log("✅ Backend: Query success", result.items.length);
    return result;
  } catch (err) {
    console.error("❌ Backend error:", err);
    throw err;
  }
}
