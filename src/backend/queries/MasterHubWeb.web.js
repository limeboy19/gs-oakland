import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

let authOptions = { suppressAuth: true, suppressHooks: true };

export const MasterHubCategories = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      const result = await wixData.query("MasterHubAutomated")
        .include("categories")
        .limit(1000)
        .find();

      //console.log("✅ Backend: Query success", result.items.length);
      return result.items;
    } catch (error) {
      console.error("❌ Backend error:", error);
      throw new Error("Failed to fetch MasterHub categories.");
    }
  }
);