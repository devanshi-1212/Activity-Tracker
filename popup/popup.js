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

const getIndex = async () => {
  const list = await chrome.storage.sync.get(null);
  const entries = Object.entries(list);
  let index = 0;

  if (entries.length > 0) {
    for (const [key, value] of entries) index = key;
  }

  return index + 1;
};

makeEntryButton.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  const hrs = parseInt(hrInput.value, 10) || 0;
  const mins = parseInt(minInput.value, 10) || 0;

  if (url) {
    const time = hrs * 60 + mins;
    const data = await chrome.storage.sync.get(null);
    const index = await getIndex();

    data[index] = { time: time, url: url };

    chrome.storage.sync.clear();
    await chrome.storage.sync.set(data);

    console.log("ok new list", data, index);

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
  const list = await chrome.storage.sync.get(null);
  const entries = Object.entries(list);

  console.log("popup.js showing user list", list, entries.length);

  webList.innerHTML = "";

  if (entries.length > 0) {
    for (const [key, value] of entries) {
      const url = value.url;
      const time = value.time;

      const listItem = document.createElement("li");
      listItem.textContent = `${url} - ${Math.floor(time / 60)} hrs ${
        time % 60
      } mins`;
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
