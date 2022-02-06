const trashcanSVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 1a.5.5 0 0 0-.5.5v1h4v-1a.5.5 0 0 0-.5-.5h-3ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1H3.042l.846 10.58a1 1 0 0 0 .997.92h6.23a1 1 0 0 0 .997-.92l.846-10.58Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/></svg>';

const listContainer = document.querySelector<HTMLUListElement>("div#list ul")!;
const fileInput = document.querySelector<HTMLInputElement>("input#file")!;
const dropzone = document.querySelector<HTMLLabelElement>("label#dropzone")!;
const basePath = location.pathname.split("/").slice(0, -1).join("/");

fileInput.addEventListener("change", () => {
  if (!fileInput.files) return;
  Array.from(fileInput.files).forEach((file) => uploadFile(file));
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("hover");
});

dropzone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropzone.classList.remove("hover");
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("hover");
  if (!e.dataTransfer?.files) return;
  Array.from(e.dataTransfer?.files).forEach((file) => uploadFile(file));
});

getList();

async function getList() {
  const res = await fetch(`${basePath}/list`, { method: "GET" });
  if (res.ok && res.headers.has("x-list")) {
    const text = await res.text();
    const list = text.split("\n").filter((file) => file.length);
    if (list.length) displayList(list);
  }
}

async function deleteFile(file: string) {
  const res = await fetch(`${basePath}/${file}`, { method: "DELETE" });
  if (!res.ok) {
    showInfo(`Couldn't delete file ${file}.`);
  }
  return res.ok;
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  const res = await fetch(`${basePath}/`, { method: "POST", body: formData });
  if (res.ok) {
    addToList(file.name);
  } else {
    showInfo(`Couldn't upload file ${file.name}.`);
  }
}

function showInfo(info: string) {
  const infoText = document.querySelector<HTMLSpanElement>("div#info span")!;
  infoText.innerText = info;
  infoText.parentElement?.classList.remove("hidden");
}

function displayList(fileList: string[]) {
  listContainer.innerHTML = "";
  fileList.forEach((file) => {
    addToList(file);
  });
}

function addToList(file: string) {
  const listItem = document.createElement("li");
  const link = document.createElement("a");
  link.innerText = `${location.host}${basePath}/${file}`;
  link.href = `${location.origin}${basePath}/${file}`;
  link.download = "download";

  const delBtn = document.createElement("button");
  delBtn.innerHTML = trashcanSVG;
  delBtn.addEventListener("click", async () => {
    (await deleteFile(file)) && listItem.remove();
  });
  listItem.append(link, delBtn);
  listContainer.appendChild(listItem);
}
