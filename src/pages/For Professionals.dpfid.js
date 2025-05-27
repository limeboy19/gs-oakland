import wixData from "wix-data";

const authOptions = { suppressAuth: true, suppressHooks: true };

// Global Variables //
let categoryMap = {};
let selectedCategoryIds = [];
let selectedAgeGroupIds = [];
let searchText;

$w.onReady(async function () {
  const result = await ProfessionalMasterHubCategories();
  categoryMap = buildCategoryMap(result.items);

  setupCategoryRepeater();
  setupAgeCategoryRepeater();
  setUpProfessionalMasterHubRepeater();

  $w("#ddlSort").value = "asc";
  sortMasterHub("asc");

  $w("#btnFilter").onClick(handleFilterClick);
  $w("#btnClear").onClick(handleClearClick);
  $w("#btnResetFilters").onClick(handleClearClick);
  $w("#inputSearchBar").onInput(handleSearchInput);
  $w("#btnClearSearch").onClick(handleClearSearch);

  $w("#ddlSort").onChange((event) => {
    const selectedSort = event.target.value;
    sortMasterHub(selectedSort);
  });
});

function setUpProfessionalMasterHubRepeater() {
  $w("#dsProfessionalMasterHub").onReady(() => {
    $w("#repeaterProfesionalMasterHub").onItemReady(
      ($item, itemData, index) => {
        //console.log("Item Data Professional Master Hub", itemData);
        const originalText = itemData?.description || "";
        const truncatedText = truncateToNearestWord(originalText, 105);
        $item("#txtDescription").text = truncatedText;

        const tags = categoryMap[itemData._id] || [];
        //if (itemData.title === "Trying New Foods") console.log("Tags for item:", itemData._id, tags);

        if (tags.length) {
          $item("#CategoryTags").options = tags.map((tag) => ({
            label: tag,
            value: tag,
          }));
          $item("#CategoryTags").expand();
        } else {
          //console.log("No tags found for item:", itemData._id);
          $item("#CategoryTags").collapse();
        }
      }
    );
  });
}

// Repeater Set Up Section //
function setupCategoryRepeater() {
  $w("#dsProfessionalCategories").onReady(() => {
    $w("#repeaterCategories").onItemReady(($item, itemData, index) => {
      $item("#checkboxCategorySelection").label = itemData.title;
      $item("#checkboxCategorySelection").value = itemData._id;
      $item("#checkboxCategorySelection").enable();
    });
  });
}

function setupAgeCategoryRepeater() {
  $w("#dsProfessionalAgeGroups").onReady(() => {
    $w("#repeaterAges").onItemReady(($item, itemData, index) => {
      $item("#checkBoxAgeGroup").label = itemData.title;
      $item("#checkBoxAgeGroup").value = itemData._id;
      $item("#checkBoxAgeGroup").enable();
    });
  });
}

function handleFilterClick() {
  selectedCategoryIds = getCheckedValues("#repeaterCategories","#checkboxCategorySelection");
  selectedAgeGroupIds = getCheckedValues("#repeaterAges", "#checkBoxAgeGroup");

  let filter = wixData.filter();

  if (selectedCategoryIds.length > 0) {
    filter = filter.hasSome("categories", selectedCategoryIds);
  }

  if (selectedAgeGroupIds.length > 0) {
    filter = filter.hasSome("ageGroups", selectedAgeGroupIds);
  }

  $w("#dsProfessionalMasterHub")
    .setFilter(filter)
    .then(() => {
      const count = $w("#dsProfessionalMasterHub").getTotalCount();
      //console.log("🔎 Filtered result count:", count);

      if (count === 0) {
        $w("#multiStateBoxMasterHub").changeState("noResults");
      } else {
        $w("#multiStateBoxMasterHub").changeState("content");
        setUpProfessionalMasterHubRepeater();
      }
    })
    .catch((err) => {
      console.error("❌ Error applying filter:", err);
    });
}

// Helper Functions Section //
function truncateToNearestWord(text, maxLength) {
  if (text.length <= maxLength) return text;
  let cutoffIndex = text.lastIndexOf(" ", maxLength);
  let truncated = text
    .substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength)
    .trim();

  truncated = truncated.replace(/[.,;:]$/, "");
  return truncated + "...";
}

function getCheckedValues(repeaterId, checkboxId) {
  const values = [];
  $w(repeaterId).forEachItem(($item, itemData) => {
    if ($item(checkboxId).checked) {
      values.push($item(checkboxId).value);
    }
  });
  return values;
}

function buildCategoryMap(items) {
  const map = {};
  for (let item of items) {
    const categories = (item.categories || []).map(
      (category) => category.title
    );
    map[item._id] = categories;
  }
  return map;
}

function applyFilters() {
  let filter = wixData.filter();

  //console.log("Selected subcategories:", selectedSubCategoryIds);

  if (selectedCategoryIds.length > 0) {
    filter = filter.hasSome("categories", selectedCategoryIds);
  }

  if (selectedAgeGroupIds.length > 0) {
    filter = filter.hasSome("ageGroups", selectedAgeGroupIds);
  }

  if (searchText.length > 0) {
    const searchFilter = wixData
      .filter()
      .contains("title", searchText)
      .or(wixData.filter().contains("description", searchText))
      .or(wixData.filter().contains("categories.title", searchText));

    filter = filter.and(searchFilter);
  }

  $w("#dsProfessionalMasterHub")
    .setFilter(filter)
    .then(() => {
      const count = $w("#dsProfessionalMasterHub").getTotalCount();
      if (count === 0) {
        $w("#multiStateBoxMasterHub").changeState("noResults");
      } else {
        $w("#multiStateBoxMasterHub").changeState("content");
        setUpProfessionalMasterHubRepeater();
      }
    })
    .catch((err) => {
      console.error("❌ Error applying filters:", err);
    });
}

function sortMasterHub(order) {
  let sort;

  console.log("Sort Order:", order);

  if (order === "desc") {
    sort = wixData.sort().descending("title");
  } else {
    sort = wixData.sort().ascending("title");
  }

  $w("#dsProfessionalMasterHub").setSort(sort);
}

function handleClearClick() {
  clearRepeaterCheckboxes("#repeaterCategories", "#checkboxCategorySelection");
  clearRepeaterCheckboxes("#repeaterAges", "#checkBoxAgeGroup");

  $w("#dsProfessionalMasterHub")
    .setFilter(wixData.filter())
    .then(() => {
      const count = $w("#dsProfessionalMasterHub").getTotalCount();
      //console.log("🔄 After clear, result count:", count);

      if (count === 0) {
        $w("#multiStateBoxMasterHub").changeState("noResults");
      } else {
        $w("#multiStateBoxMasterHub").changeState("content");
        setUpProfessionalMasterHubRepeater();
      }
    })
    .catch((err) => {
      console.error("❌ Error clearing filters:", err);
    });
}

function handleSearchInput(event) {
  searchText = event.target.value.trim();
  applyFilters();
}

function handleClearSearch() {
  $w("#inputSearchBar").value = "";
  searchText = "";
  applyFilters();
}

function clearRepeaterCheckboxes(repeaterId, checkboxId) {
  $w(repeaterId).forEachItem(($item) => {
    $item(checkboxId).checked = false;
  });
}

// Backend Function Section //
//TO BE REMOVED//
export async function ProfessionalMasterHubCategories() {
  try {
    const result = await wixData
      .query("ProfProgramMasterHubAutomated")
      .include("categories")
      .limit(1000)
      .find(authOptions);

    //console.log("Backend: Query success", result.items.length);
    return result;
  } catch (err) {
    console.error("Backend error:", err);
    throw err;
  }
}
