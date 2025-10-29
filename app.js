const canvas = document.getElementById("canvasArea");
const contextMenu = document.getElementById("contextMenu");
const addBlockBtn = document.getElementById("addBlockBtn");

let menuX = 0;
let menuY = 0;

// 右クリックメニュー
canvas.addEventListener("contextmenu", e => {
  e.preventDefault();
  menuX = e.clientX;
  menuY = e.clientY;

  contextMenu.style.left = menuX + "px";
  contextMenu.style.top = menuY + "px";
  contextMenu.style.display = "block";
});

document.addEventListener("click", () => {
  contextMenu.style.display = "none";
});

/*
  type: "placeholder"
  type: "var", name
  type: "number", value
  type: "fraction", numerator, denominator
  type: "sqrt", inside
*/

function makePlaceholder() {
  return { type: "placeholder" };
}

// LaTeXに変換
function toLatex(node) {
  switch (node.type) {
    case "placeholder":
      return "□";
    case "var":
      return node.name;
    case "number":
      return node.value;
    case "fraction":
      return `\\frac{${toLatex(node.numerator)}}{${toLatex(node.denominator)}}`;
    case "sqrt":
      return `\\sqrt{${toLatex(node.inside)}}`;
  }
}

// ブロック追加
addBlockBtn.addEventListener("click", () => {
  const block = document.createElement("div");
  block.className = "block";
  block.style.left = menuX + "px";
  block.style.top = menuY + "px";

  // ノードは空白
  block.node = makePlaceholder();

  const span = document.createElement("span");
  span.className = "formula";
  block.appendChild(span);

  makeDraggable(block);
  canvas.appendChild(block);
  render(block);
});

// ブロック描画
function render(block) {
  const span = block.querySelector(".formula");
  const latex = toLatex(block.node);

  katex.render(latex, span, { throwOnError: false });

  // KaTeX内の □ をクリック可能にする
  const elements = span.querySelectorAll(".mord");
  elements.forEach(el => {
    if (el.textContent === "□") {
      el.classList.add("placeholder");
      el.addEventListener("click", () => editPlaceholder(block, el));
    }
  });
}

// placeholderを編集
function editPlaceholder(block, el) {
  const input = document.createElement("input");
  input.type = "text";

  const rect = el.getBoundingClientRect();
  input.style.position = "absolute";
  input.style.left = rect.left + "px";
  input.style.top = rect.top + "px";
  input.style.width = rect.width + "px";

  document.body.appendChild(input);
  input.focus();

  input.addEventListener("blur", () => finishInput(block, el, input));
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") finishInput(block, el, input);
  });
}

function finishInput(block, el, input) {
  const value = input.value.trim() || "□";
  //ノード書き換え
  replacePlaceholder(block.node, value);
  input.remove();
  render(block);
}

function replacePlaceholder(node, value) {
  if (node.type === "placeholder") {
    if (/^[0-9]+$/.test(value)) {
      node.type = "number";
      node.value = value;
    } else {
      node.type = "var";
      node.name = value;
    }
    return true;
  }

  if (node.type === "fraction") {
    return replacePlaceholder(node.numerator, value) ||
           replacePlaceholder(node.denominator, value);
  }
  if (node.type === "sqrt") {
    return replacePlaceholder(node.inside, value);
  }
  return false;
}

// パレットのパーツ追加
const items = document.querySelectorAll("#palette .item");
items.forEach(item => {
  item.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/type", item.dataset.type);
  });
});

canvas.addEventListener("dragover", e => e.preventDefault());

canvas.addEventListener("drop", e => {
  const type = e.dataTransfer.getData("text/type");
  const target = document.elementFromPoint(e.clientX, e.clientY);

  if (target.classList.contains("block")) {
    const block = target;
    insertNode(block.node, type);
    render(block);
  }
});

function insertNode(node, type) {
  if (node.type === "placeholder") {
    switch (type) {
      case "var":
        node.type = "var";
        node.name = "x";
        break;
      case "number":
        node.type = "number";
        node.value = "0";
        break;
      case "fraction":
        node.type = "fraction";
        node.numerator = makePlaceholder();
        node.denominator = makePlaceholder();
        break;
      case "sqrt":
        node.type = "sqrt";
        node.inside = makePlaceholder();
        break;
    }
    return true;
  }

  if (node.type === "fraction") {
    return insertNode(node.numerator, type) ||
           insertNode(node.denominator, type);
  }
  if (node.type === "sqrt") {
    return insertNode(node.inside, type);
  }
  return false;
}

// ブロックを動かす
function makeDraggable(elem) {
  let startX, startY, elemStartX, elemStartY;

  elem.addEventListener("mousedown", e => {
    if (e.button !== 0) return;

    startX = e.pageX;
    startY = e.pageY;
    elemStartX = parseInt(elem.style.left) || 0;
    elemStartY = parseInt(elem.style.top) || 0;

    function onMove(ev) {
      elem.style.left = elemStartX + (ev.pageX - startX) + "px";
      elem.style.top = elemStartY + (ev.pageY - startY) + "px";
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}
