import wixData from 'wix-data';

//Global Variables
const authOptions = { suppressAuth: true, suppressHooks: true }

//For logging job runs
export async function logJobRun({ title, successful }) {
  const now = new Date();

  const jobLog = {
    title,
    jobCompletionDate: now,
    jobCompletionTime: now.toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    jobSuccessful: successful
  };

  try {
    await wixData.insert("jobs", jobLog);
    console.log(`Job "${title}" logged successfully`);
  } catch (err) {
    console.error(`Failed to log job "${title}":`, err);
  }
}

//For Logging Errors
export async function logError(location, error) {
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
