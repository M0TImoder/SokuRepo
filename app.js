const workspace = document.querySelector(".workspace");
const canvas = document.getElementById("canvasArea");
const contextMenu = document.getElementById("contextMenu");
const addBlockBtn = document.getElementById("addBlockBtn");
const gridToggle = document.getElementById("gridToggle");
const snapToggle = document.getElementById("snapToggle");

let menuX = 0;
let menuY = 0;

const GRID_SIZE = 48;
let snapEnabled = true;

function snapValue(value)
{
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function updateGridVisibility(isVisible)
{
  if (isVisible)
  {
    workspace.classList.add("grid-visible");
    workspace.classList.remove("grid-hidden");
    canvas.classList.remove("grid-hidden");
    return;
  }

  workspace.classList.add("grid-hidden");
  workspace.classList.remove("grid-visible");
  canvas.classList.add("grid-hidden");
}

updateGridVisibility(true);

gridToggle.addEventListener("change", () =>
{
  updateGridVisibility(gridToggle.checked);
});

snapToggle.addEventListener("change", () =>
{
  snapEnabled = snapToggle.checked;
});

// 右クリックメニュー
canvas.addEventListener("contextmenu", (e) =>
{
  e.preventDefault();

  const rect = canvas.getBoundingClientRect();
  menuX = e.clientX - rect.left;
  menuY = e.clientY - rect.top;

  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.style.display = "block";
});

document.addEventListener("click", (e) =>
{
  if (!contextMenu.contains(e.target))
  {
    contextMenu.style.display = "none";
  }
});

/*
  type: "placeholder"
  type: "var", name
  type: "number", value
  type: "fraction", numerator, denominator
  type: "sqrt", inside
*/

function makePlaceholder()
{
  return { type: "placeholder" };
}

// LaTeXに変換
function toLatex(node)
{
  switch (node.type)
  {
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

  return "";
}

// ブロック追加
addBlockBtn.addEventListener("click", () =>
{
  const block = document.createElement("div");
  block.className = "block";

  let left = menuX;
  let top = menuY;

  if (snapEnabled)
  {
    left = snapValue(left);
    top = snapValue(top);
  }

  block.style.left = `${Math.max(0, left)}px`;
  block.style.top = `${Math.max(0, top)}px`;

  // ノードは空白
  block.node = makePlaceholder();

  const span = document.createElement("span");
  span.className = "formula";
  block.appendChild(span);

  makeDraggable(block);
  canvas.appendChild(block);
  render(block);
  contextMenu.style.display = "none";
});

// ブロック描画
function render(block)
{
  const span = block.querySelector(".formula");
  const latex = toLatex(block.node);

  katex.render(latex, span, { throwOnError: false });

  // KaTeX内の□をクリック可能にする
  const elements = span.querySelectorAll(".mord");
  elements.forEach((el) =>
  {
    if (el.textContent === "□")
    {
      el.classList.add("placeholder");
      el.addEventListener("click", () => editPlaceholder(block, el));
    }
  });
}

// placeholderを編集
function editPlaceholder(block, el)
{
  const input = document.createElement("input");
  input.type = "text";

  const rect = el.getBoundingClientRect();
  input.style.position = "absolute";
  input.style.left = `${rect.left}px`;
  input.style.top = `${rect.top}px`;
  input.style.width = `${rect.width}px`;

  document.body.appendChild(input);
  input.focus();

  const finish = () => finishInput(block, el, input);

  input.addEventListener("blur", finish);
  input.addEventListener("keydown", (e) =>
  {
    if (e.key === "Enter")
    {
      finish();
    }
  });
}

function finishInput(block, el, input)
{
  const value = input.value.trim() || "□";
  //ノード書き換え
  replacePlaceholder(block.node, value);
  input.remove();
  render(block);
}

function replacePlaceholder(node, value)
{
  if (node.type === "placeholder")
  {
    if (/^[0-9]+$/.test(value))
    {
      node.type = "number";
      node.value = value;
    }
    else
    {
      node.type = "var";
      node.name = value;
    }
    return true;
  }

  if (node.type === "fraction")
  {
    return replacePlaceholder(node.numerator, value) ||
           replacePlaceholder(node.denominator, value);
  }
  if (node.type === "sqrt")
  {
    return replacePlaceholder(node.inside, value);
  }
  return false;
}

// パレットのパーツ追加
const items = document.querySelectorAll("#palette .item");
items.forEach((item) =>
{
  item.addEventListener("dragstart", (e) =>
  {
    e.dataTransfer.setData("text/type", item.dataset.type);
  });
});

canvas.addEventListener("dragover", (e) => e.preventDefault());

canvas.addEventListener("drop", (e) =>
{
  const type = e.dataTransfer.getData("text/type");
  const target = document.elementFromPoint(e.clientX, e.clientY);

  if (target && target.classList.contains("block"))
  {
    const block = target;
    insertNode(block.node, type);
    render(block);
  }
});

function insertNode(node, type)
{
  if (node.type === "placeholder")
  {
    switch (type)
    {
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

  if (node.type === "fraction")
  {
    return insertNode(node.numerator, type) ||
           insertNode(node.denominator, type);
  }
  if (node.type === "sqrt")
  {
    return insertNode(node.inside, type);
  }
  return false;
}

// ブロックを動かす
function makeDraggable(elem)
{
  let startX;
  let startY;
  let elemStartX;
  let elemStartY;

  elem.addEventListener("mousedown", (e) =>
  {
    if (e.button !== 0)
    {
      return;
    }

    e.preventDefault();

    startX = e.pageX;
    startY = e.pageY;
    elemStartX = parseFloat(elem.style.left) || 0;
    elemStartY = parseFloat(elem.style.top) || 0;

    function onMove(ev)
    {
      const deltaX = ev.pageX - startX;
      const deltaY = ev.pageY - startY;

      let nextX = elemStartX + deltaX;
      let nextY = elemStartY + deltaY;

      if (snapEnabled)
      {
        nextX = snapValue(nextX);
        nextY = snapValue(nextY);
      }

      elem.style.left = `${Math.max(0, nextX)}px`;
      elem.style.top = `${Math.max(0, nextY)}px`;
    }

    function onUp()
    {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}
