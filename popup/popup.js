const homePage = document.getElementById("homePage");
const addWebPage = document.getElementById("addWebPage");
const viewEditListPage = document.getElementById("viewEditListPage");

const addWebButton = document.getElementById("addWebButton");
const viewEditListButton = document.getElementById("viewEditListButton");
const makeEntryButton = document.getElementById("makeEntryButton");

const urlInput = document.getElementById("urlInput");
const hrInput = document.getElementById("hrInput");
const minInput = document.getElementById("minInput");
const webList = document.getElementById("webList");
const successtxt = document.getElementById("successtxt");

homePage.style.display = "block";
addWebPage.style.display = "none";
viewEditListPage.style.display = "none";

addWebButton.addEventListener("click", () => {
  addWebPage.style.display = "block";
  homePage.style.display = "none";
  viewEditListPage.style.display = "none";
  successtxt.style.display = "none";
});

viewEditListButton.addEventListener("click", () => {
  webList.innerHTML = "";
  displayEntries();

  viewEditListPage.style.display = "block";
  homePage.style.display = "none";
  addWebPage.style.display = "none";
  successtxt.style.display = "none";
});

async function getIndex() {
  try {
    const allEntries = await chrome.storage.sync.get(null);
    const totalEntries = Object.keys(allEntries).length;

    return totalEntries + 1;
  } catch (error) {
    console.error("Error retrieving data from storage:", error.message);
    return 0;
  }
}

makeEntryButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  const hrs = parseInt(hrInput.value, 10) || 0;
  const mins = parseInt(minInput.value, 10) || 0;

  if (url) {
    const entry = {
      url,
      time: hrs * 60 + mins,
    };

    const id = await getIndex();

    console.log(id);

    chrome.storage.sync.set({ [id]: entry }, () => {
      console.log(`Entry id stored successfully!`);
      console.log(entry);
    });

    successtxt.style.display = "block";

    setTimeout(() => {
      successtxt.style.display = "none";
    }, 2000);

    urlInput.value = "";
    hrInput.value = "";
    minInput.value = "";
  } else {
    alert("Please enter all entries in proper format.");
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("backHomeButton")) {
    homePage.style.display = "block";
    addWebPage.style.display = "none";
    viewEditListPage.style.display = "none";
  }
});

async function displayEntries() {
  const list = await chrome.storage.sync.get();

  console.log("popup.js showing user list", list);

  webList.innerHTML = "";

  if (Object.keys(list).length > 0) {
    for (const key in list) {
      const entry = list[key];
      const listItem = document.createElement("li");
      listItem.textContent = `${entry.url} - ${Math.floor(
        entry.time / 60
      )} hrs ${entry.time % 60} mins`;
      webList.appendChild(listItem);
    }
  } else {
    webList.innerHTML = "<p>No entries found!</p>";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPopup") {
    console.log("Received message to open popup");
  }
});
