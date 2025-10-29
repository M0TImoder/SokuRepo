const canvas = document.getElementById("canvasArea");
const contextMenu = document.getElementById("contextMenu");
const addBlockBtn = document.getElementById("addBlockBtn");

let menuX = 0;
let menuY = 0;

// 右クリック禁止の標準メニューを止める
canvas.addEventListener("contextmenu", e => {
  e.preventDefault();
  menuX = e.clientX;
  menuY = e.clientY;
  contextMenu.style.left = menuX + "px";
  contextMenu.style.top = menuY + "px";
  contextMenu.style.display = "block";
});

// 左クリックしたらメニュー消す
document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});

// 数式ブロックを追加
addBlockBtn.addEventListener("click", () => {
  const block = document.createElement("div");
  block.className = "block";
  block.style.left = menuX + "px";
  block.style.top = menuY + "px";
  block.setAttribute("data-content", "");

  // ブロック内に表示する式
  block.textContent = "(空)";
  makeBlockDraggable(block);

  canvas.appendChild(block);
});

// ブロックをドラッグで移動
function makeBlockDraggable(elem) {
  let offsetX, offsetY;

  elem.addEventListener("mousedown", e => {
    if (e.button !== 0) return;
    offsetX = e.offsetX;
    offsetY = e.offsetY;

    function onMove(ev) {
      elem.style.left = ev.clientX - offsetX + "px";
      elem.style.top = ev.clientY - offsetY + "px";
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// パレット
const items = document.querySelectorAll("#palette .item");
items.forEach(item => {
  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", item.dataset.symbol);
  });
});

canvas.addEventListener("dragover", e => e.preventDefault());

canvas.addEventListener("drop", e => {
  const symbol = e.dataTransfer.getData("text/plain");

  // ドロップ先の要素がブロックか判定
  const target = document.elementFromPoint(e.clientX, e.clientY);

  if (target.classList.contains("block")) {
    const oldText = target.getAttribute("data-content") || "";
    const newText = oldText + " " + symbol;
    target.setAttribute("data-content", newText);
    target.textContent = newText;
  }
});
