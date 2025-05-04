import wixData from 'wix-data';
import { webMethod, Permissions } from 'wix-web-module';

export const getPartnerCategoryMap = webMethod(
  Permissions.Anyone, 
  async () => {
    try {
      const result = await wixData.query("PartnerCategories")
        .find();

      const map = result.items.reduce((acc, item) => {
        acc[item.title] = item._id;
        return acc;
      }, {});

      return map;
    } catch (error) {
      console.error("getPartnerCategoryMap error:", error);
      throw new Error("Failed to fetch category map.");
    }
  }
);
