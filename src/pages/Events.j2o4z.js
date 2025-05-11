import wixData from 'wix-data';

//global variables
let mappedAges = [];
let mappedAudienceTypes = [];

$w.onReady(async function () {

  //Initialize dropdowns
  mapMonths();

  //Button setup
  $w("#btnClear").onClick(() => {
    clearFilters();
  });

  $w("#btnResetFilters").onClick(() => {
    clearFilters();
  });

  //FILTERS
  $w("#inputSearch").onInput((event) => {
    const searchTerm = event.target.value.trim();
    if (searchTerm.length > 0) {
      $w("#dsEvents").setFilter(
        wixData.filter().contains("title", searchTerm)
      ).then(() => {
        checkEventResults();
      });
    } else {
      $w("#dsEvents").setFilter(wixData.filter()).then(() => {
        checkEventResults();
      });
    }
  });

  $w("#ddlMonths").onChange((event) => {
    const monthId = event.target.value;
    if (monthId) {
      $w("#dsEvents").setFilter(wixData.filter().contains("monthOfEvent", monthId)).then(() => {
        checkEventResults();
      });
    } else {
      $w("#dsEvents").setFilter(wixData.filter()).then(() => {
        checkEventResults();
      });
    }
  });

  $w("#ddlAudience").onChange((event) => {
    const audienceText = event.target.value;
    const matched = mappedAudienceTypes.find(item => item.title === audienceText);
    const audienceID = matched?.id;

    if (audienceID) {
      $w("#dsEvents").setFilter(wixData.filter().contains("eventType", audienceID)).then(() => {
        checkEventResults();
      });
    } else {
      $w("#dsEvents").setFilter(wixData.filter()).then(() => {
        checkEventResults();
      });
    }
  });

  $w("#ddlAgeGroup").onChange((event) => {
    const selectedText = $w("#ddlAgeGroup").value;
    const matched = mappedAges.find(item => item.title === selectedText);
    const selectedId = matched?.id;

    //console.log("Selected age group text:", selectedText);
    //console.log("Mapped age group ID:", selectedId);

    if (!selectedId) {
      //console.log("No matching ID found, showing all events.");
      $w("#dsEvents").setFilter(wixData.filter()).then(() => {
        checkEventResults();
      });
    } else {
      //console.log("Filtering events by age group ID:", selectedId);
      $w("#dsEvents").setFilter(wixData.filter().hasSome("ageGroups", selectedId)).then(() => {
        checkEventResults();
      });
    }
  });

  //Dataset
  $w("#dsAgeGroups").onReady(async () => {
    try {
      const numberOfItems = await $w("#dsAgeGroups").getTotalCount();
      const result = await $w("#dsAgeGroups").getItems(0, numberOfItems);
      const allItems = result.items;

      mappedAges = allItems.map(item => ({
        id: item._id,
        title: item.title
      }));
    } catch (err) {
      console.warn("Error reading dsAgeGroups:", err);
    }
  });

  $w("#dsEventTypeAudience").onReady(async () => {
    try {
      const numberOfItems = await $w("#dsEventTypeAudience").getTotalCount();
      const result = await $w("#dsEventTypeAudience").getItems(0, numberOfItems);
      const allItems = result.items;

      mappedAudienceTypes = allItems.map(item => ({
        id: item._id,
        title: item.title
      }));
    } catch (err) {
      console.warn("⚠️ Error reading dsEventTypeAudience:", err);
    }
  });

});

//Helper functions
function clearFilters() {
  $w("#ddlMonths").value = "";
  $w("#ddlAudience").value = "";
  $w("#ddlAgeGroup").value = "";
  $w("#inputSearch").value = "";
  $w("#dsEvents").setFilter(wixData.filter()).then(() => {
    checkEventResults();
  });
}

function mapMonths() {
  const monthIdMap = {
    "January": "714b30a0-665e-4c7a-b9bf-dad6edf9e103",
    "February": "134cb853-6dd1-4bda-b114-fe0f43bedcee",
    "March": "0f882ddd-2e84-49e6-92bc-16e8b3ff5953",
    "April": "ab380083-4083-4a40-85ae-d3ab1f292212",
    "May": "67330efa-40f3-49b3-8dc4-46544692fe14",
    "June": "13381080-aba3-4600-8d27-208775a0bcca",
    "July": "e30a2c43-1aad-4ebe-8676-584a38d9d5ad",
    "August": "c0f5ced8-325a-49db-8237-cbddb05f0e34",
    "September": "8a9935f7-9d4f-43ba-866b-58c6924d5c39",
    "October": "af4e65d0-d1d5-443b-a573-4a9a7a8468c6",
    "November": "a14cdba2-63f1-48db-aaa6-76d44ac83434",
    "December": "9c365d3d-f36d-41b5-bcef-6800168e841b"
  };

  const monthOptions = Object.entries(monthIdMap).map(([label, value]) => ({ label, value }));
  $w("#ddlMonths").options = monthOptions;
}

function checkEventResults() {
  let totalCount = 0;
  try {
    totalCount = $w("#dsEvents")?.getTotalCount();
  } catch (err) {
    console.log("Dataset length == 0", err.message);
  }

  if (totalCount < 1) {
    $w("#multiStateBoxEvents").changeState("noResults");
  } else {
    $w("#multiStateBoxEvents").changeState("content");
  }
}