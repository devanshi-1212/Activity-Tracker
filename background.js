let currentTabId = null;
let startTime = Date.now();

chrome.alarms.create("trackTime", { periodInMinutes: 1 / 20 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "trackTime") {
    updateCurrentTabTime();
  }
});

function updateCurrentTabTime() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0) return;

    let tab = tabs[0];
    if (!tab.url) return;

    let url = new URL(tab.url).hostname;
    let currentTime = Date.now();

    if (currentTabId === tab.id) {
      let timeSpent = (currentTime - startTime) / 1000;
      updateSiteTime(url, timeSpent);
    }

    currentTabId = tab.id;
    startTime = currentTime;
  });
}

var myNotificationID = null;
var currentWindowId = null;

async function updateSiteTime(url, timeSpent) {
  const list = await chrome.storage.sync.get();
  console.log("bg.js showing user list", list);

  chrome.storage.local.get({ siteTime: {} }, function (data) {
    console.log("Site time data", data);

    let siteTime = data.siteTime;

    if (siteTime[url]) siteTime[url] += timeSpent;
    else siteTime[url] = timeSpent;

    for (const key in list) {
      const entry = list[key];

      if (entry.url === url && entry.time * 60 <= siteTime[url]) {
        console.log("url matching", url);

        console.log(
          `${entry.time * 60} seconds allowed, but you spent ${
            siteTime[url] | 0
          } seconds`
        );

        // chrome.notifications.create(
        //   null,
        //   {
        //     type: "basic",
        //     iconUrl: "/clock.png",
        //     title: "Time Limit Exceeded!!",
        //     message: `${entry.time * 60} seconds allowed, but you spent ${
        //       siteTime[url]
        //     } seconds`,
        //     buttons: [{ title: "Close tab" }, { title: "Extend timer" }],
        //   },
        //   function (id) {
        //     myNotificationID = id;
        //   }
        // );

        // chrome.notifications.onButtonClicked.addListener(function (
        //   notifId,
        //   btnIdx
        // ) {
        //   if (notifId === myNotificationID) {
        //     if (btnIdx === 0) closeWindow();
        //   }
        // });
      }
    }

    chrome.storage.local.set({ siteTime }, () => {
      console.log("Site time updated", siteTime);
    });
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  startTime = Date.now();
  currentTabId = activeInfo.tabId;
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.active && changeInfo.url) {
    let url = new URL(changeInfo.url).hostname;
    let currentTime = Date.now();
    let timeSpent = (currentTime - startTime) / 1000;

    updateSiteTime(url, timeSpent);
    startTime = currentTime;
    currentTabId = tabId;
  }
});

chrome.tabs.onRemoved.addListener((tab) => {
  console.log("tab closed");
  console.log(tab);
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    currentTabId = null;
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, function (tabs) {
      if (tabs.length > 0) {
        currentTabId = tabs[0].id;
      }
    });
  }
  startTime = Date.now();
});
