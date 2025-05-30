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

export const getProfessionalFAQs = webMethod(
  Permissions.Anyone, 
  async () => {
    try {
      const result = await wixData.query("ProfessionalFAQ")
      .ascending("title")
      .find();
      return result.items; // Return the array directly
    } catch (error) {
      console.error("getProfessionalFAQs error:", error);
      throw new Error("Failed to fetch professional FAQs.");
    }
  }
);

export const getProfessionalMasterHubDetails = webMethod(
  Permissions.Anyone, 
  async () => {
    try {
      const result = await wixData.query("ProfProgramMasterHubAutomated")
      .include("categories")
      .include("ages")
      .find();
      return result.items; // Return the array directly
    } catch (error) {
      console.error("getProfessionalMasterHubDetails error:", error);
      throw new Error("Failed to fetch professional FAQs.");
    }
  }
);

export const getProfessionalsGetStarted = webMethod(
  Permissions.Anyone,
  async (inputId) => {
    try {
      const result = await wixData.query("ProfessionalsGetStarted")
        .include("categories")
        .include("ageGroups")
        .include("section3Accordion")
        .eq("_id", inputId)
        .find();
      return result.items;
    } catch (error) {
      console.error("getProfessionalsGetStarted error:", error);
      throw new Error("Failed to fetch professional FAQs.");
    }
  }
);

export const getProfessionalPrograms = webMethod(
  Permissions.Anyone,
  async (inputId) => {
    try {
      const result = await wixData.query("ProfessionalPrograms")
        .include("categories")
        .include("ageGroups")
        .include("section2Accordion")
        .eq("_id", inputId)
        .find();
      return result.items;
    } catch (error) {
      console.error("getProfessionalsGetStarted error:", error);
      throw new Error("Failed to fetch professional FAQs.");
    }
  }
);

