const webList = document.getElementById("webList");

(async () => {
  await displayEntries();
})();

async function displayEntries() {
  const list = await chrome.storage.sync.get();

  console.log("dashboard.js showing user list", list);

  webList.innerHTML = "";

  if (Object.keys(list).length > 0) {
    for (const key in list) {
      const entry = list[key];

      const container = document.createElement("ul");
      container.classList.add("wrapper");

      const listItem = document.createElement("li");
      listItem.textContent = `${entry.url} - ${Math.floor(
        entry.time / 60
      )} hrs ${entry.time % 60} mins`;

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("edit-button");
      editButton.addEventListener("click", () => handleEdit(entry.url));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", () => handleDelete(entry.url));

      container.appendChild(listItem);
      container.appendChild(editButton);
      container.appendChild(deleteButton);
      webList.appendChild(container);
    }
  } else {
    webList.innerHTML = "<p>No entries found!</p>";
  }
}

async function handleEdit(url) {
  console.log("Edit clicked for:", url);

  let input = prompt(
    "Enter new time in hh mm format. (e.g. if 1hr 15min, write 1 15, with space in between)"
  );

  input = input.split(" ");

  if (input.length !== 2) {
    throw new Error("Invalid time format. Expected 'hh mm'");
  }

  const hours = parseInt(input[0]);
  const minutes = parseInt(input[1]);
  const newTime = hours * 60 + minutes;

  console.log(newTime);

  const newData = {};

  try {
    const data = await chrome.storage.sync.get(null);
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      if (value.url !== url)
        newData[key] = { time: value.time, url: value.url };
      else newData[key] = { time: newTime, url: value.url };
    }

    chrome.storage.sync.clear();

    await chrome.storage.sync.set(newData);

    console.log("Entry edited:", url, newTime);
    displayEntries();
  } catch (error) {
    console.error("Error editing entry:", error);
  }

  alert("Entry edited successfully!");
}

async function handleDelete(url) {
  console.log("Delete clicked for:", url);

  const confirmation = confirm(
    `Are you sure you want to delete the entry for "${url}"?`
  );

  if (confirmation) {
    const newData = {};

    try {
      const data = await chrome.storage.sync.get(null);
      const entries = Object.entries(data);

      for (const [key, value] of entries) {
        if (value.url !== url)
          newData[key] = { time: value.time, url: value.url };
      }

      chrome.storage.sync.clear();

      await chrome.storage.sync.set(newData);
      console.log("Entry removed from storage:", url);
      displayEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }

    alert("Entry deleted successfully!");
  }
}
