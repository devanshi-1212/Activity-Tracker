chrome.runtime.onInstalled.addListener((e) => {
  chrome.tabs.create({
    url: "./dashboard/dashboard.html",
  });
});

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

let flag = 0;

async function updateSiteTime(url, timeSpent) {
  const list = await chrome.storage.sync.get();
  var msg;

  flag = 0;

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

        msg = `${entry.time * 60} seconds allowed, but you spent ${
          siteTime[url] | 0
        } seconds. Pls close tab manually or extend timer for this website!`;

        flag = 1;
        break;
      }
    }

    if (flag == 1) handleNotification(msg);
    else {
      chrome.storage.local.set({ siteTime }, () => {
        console.log("Site time updated", siteTime);
      });
    }
  });
}

const handleNotification = (msg) => {
  flag = 0;

  chrome.notifications.create(
    {
      title: "Time Limit Exceeded!",
      message: msg,
      iconUrl: "./clock.png",
      type: "basic",
      buttons: [{ title: "Extend time" }],
    },
    function (id) {
      myNotificationID = id;
    }
  );

  chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
    if (notifId === myNotificationID) {
      if (btnIdx === 0) {
        chrome.tabs.create({ url: "./dashboard/dashboard.html" });
      }
    }
  });
};

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

// chrome.tabs.onCreated.addListener(() => {
//   console.log("tab created");

//   chrome.notifications.create(
//     {
//       title: "notif okok",
//       message: "okok hehe",
//       iconUrl: "./clock.png",
//       type: "basic",
//       buttons: [{ title: "gmail" }, { title: "netflix" }],
//     },
//     function (id) {
//       myNotificationID = id;
//     }
//   );
// });

// chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
//   if (notifId === myNotificationID) {
//     if (btnIdx === 0) {
//       console.log("inserting");
//       try {
//         chrome.tabs.create({ url: "https://gmail.com" });
//       } catch (err) {}
//     } else if (btnIdx === 1) {
//       console.log("clearing");
//       chrome.tabs.create({ url: "https://netflix.com" });
//     }
//   }
// });

// chrome.notifications.onClicked.addListener(() => {
//   chrome.tabs.create({ url: "https://wikipedia.com" });
// });
