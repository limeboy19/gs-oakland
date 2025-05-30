import {
  getProfessionalFAQs,
  getProfessionalMasterHubDetails,
  getProfessionalsGetStarted,
} from "backend/queries/helperQueries.web.js";

$w.onReady(async function () {
  const FAQ = await getProfessionalFAQs();
  $w("#repeaterAccordian").data = FAQ;
  const ProfessionalMasterHubDetails = await getProfessionalMasterHubDetails();

  let currentItem = await $w("#dsProfessionalsGetStarted").getCurrentItem();
  let currentData = await getProfessionalsGetStarted(currentItem?._id);
  console.log("Current Data", currentData);

  if (
    currentData?.[0]?.section3Accordion?.length === 0 ||
    !currentData?.[0]?.section3Accordion
  ) {
    $w("#repeaterAccordian").collapse();
  } else {

    $w("#repeaterAccordian").onItemReady(($item, itemData) => {
      //console.log("itemData", itemData);

      $item("#txtTitle").text = itemData.title;
      $item("#rptText").text = itemData.answer;

      $item("#accordianRptPlus2").onClick(() => {
        const textBox = $item("#rptText");
        const textTitleButton = $item("#txtTitle");

        if (textBox.collapsed) {
          textTitleButton.style.color = "#009cdd";
          textBox.expand();
          $item("#accordianRptPlus2").text = "-";
        } else {
          textTitleButton.style.color = "#4a4848";
          textBox.collapse();
          $item("#accordianRptPlus2").text = "+";
        }
      });

      $item("#btnClick").onClick(() => {
        const textBox = $item("#rptText");
        const textTitleButton = $item("#txtTitle");

        if (textBox.collapsed) {
          textTitleButton.style.color = "#009cdd";
          textBox.expand();
          $item("#accordianRptPlus2").text = "-";
        } else {
          textTitleButton.style.color = "#4a4848";
          textBox.collapse();
          $item("#accordianRptPlus2").text = "+";
        }
      });
    });
  }

  $w("#repeaterHub").onItemReady(($item, itemData) => {
    //console.log("Item Data Hub", itemData);
    let truncatedText = truncateToNearestWord(itemData.description, 105);
    $item("#txtHubDescription").text = truncatedText;

    let tagTitles = getCategoryTagOptionsById(
      ProfessionalMasterHubDetails,
      itemData._id
    );
    //console.log("Tag Titles", tagTitles);
    if (tagTitles.length > 0) {
      $item("#categoryTags").options = tagTitles;
      $item("#categoryTags").expand();
    }
  });
});

function truncateToNearestWord(text, maxLength) {
  if (text.length <= maxLength) return text;
  let cutoffIndex = text.lastIndexOf(" ", maxLength);
  let truncated = text
    .substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength)
    .trim();

  truncated = truncated.replace(/[.,;:]$/, "");
  return truncated + "...";
}

export function getCategoryTagOptionsById(dataArray, targetId) {
  const item = dataArray.find((obj) => obj._id === targetId);

  if (!item || !Array.isArray(item.categories)) {
    return [];
  }

  return item.categories.map((cat) => ({
    label: cat.title,
    value: cat._id,
  }));
}
