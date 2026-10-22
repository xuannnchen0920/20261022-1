// 儲存六道寵物生活常識題目與對應答案文字。
const quizItems = [
  // 第一道題目：狗狗以嗅覺認識環境。
  { title: '狗狗探索世界', answer: '狗狗的嗅覺非常靈敏，常用鼻子蒐集環境資訊。', gif: 'https://cataas.com/cat/gif?width=360&height=220&v=1' },
  // 第二道題目：貓咪透過鬍鬚感受周圍空間。
  { title: '貓咪的鬍鬚', answer: '鬍鬚能幫助貓咪感知狹窄空間與周遭動靜。', gif: 'https://cataas.com/cat/gif?width=360&height=220&v=2' },
  // 第三道題目：兔子的牙齒會持續生長。
  { title: '兔兔的大門牙', answer: '兔子的牙齒會持續生長，需要適合的牧草磨牙。', gif: 'https://cataas.com/cat/gif?width=360&height=220&v=3' },
  // 第四道題目：魚缸需要維持水質穩定。
  { title: '魚兒的家', answer: '魚缸要定期照顧水質，不能一次全部換成新水。', gif: 'https://cataas.com/cat/gif?width=360&height=220&v=4' },
  // 第五道題目：天竺鼠需要攝取維生素 C。
  { title: '天竺鼠的點心', answer: '天竺鼠無法自行製造維生素 C，需要從飲食補充。', gif: 'https://cataas.com/cat/gif?width=360&height=220&v=5' },
  // 第六道題目：狗狗散步時需要補充飲水。
  { title: '散步補充水分', answer: '天氣炎熱或散步較久時，記得讓狗狗補充飲水。', gif: 'https://cataas.com/cat/gif?width=360&height=220&v=6' }
];

// 儲存每一題目前放入的答案編號。
let placedAnswers = Array(quizItems.length).fill(null);
// 儲存六張會持續播放的 GIF 圖片元素。
let gifImages = [];
// 儲存目前拖曳中的答案編號。
let draggingAnswer = null;
// 儲存拖曳時手指或滑鼠的水平位置。
let pointerX = 0;
// 儲存拖曳時手指或滑鼠的垂直位置。
let pointerY = 0;
// 記錄是否已經交卷。
let submitted = false;
// 記錄測驗分數百分比。
let finalScore = 0;
// 儲存彩帶粒子資料。
let confetti = [];
// 儲存交卷按鈕的位置與尺寸。
let submitButton = { x: 0, y: 0, w: 0, h: 0 };
// 儲存重新作答按鈕的位置與尺寸。
let restartButton = { x: 0, y: 0, w: 0, h: 0 };

// 建立全螢幕畫布並載入六張 GIF 圖片。
function setup() {
  // 使用瀏覽器目前可用的視窗尺寸建立畫布。
  createCanvas(windowWidth, windowHeight);
  // 設定高畫質螢幕上的畫布像素密度。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  // 啟用圓角線條效果。
  strokeJoin(ROUND);
  // 逐一建立原生圖片元素以保留 GIF 動畫。
  quizItems.forEach((item, index) => {
    // 建立含有替代文字的圖片元素。
    const imageElement = createImg(item.gif, `${item.title}動畫圖片`);
    // 將圖片元素放到畫布之下，由程式指定實際位置。
    imageElement.style('position', 'fixed');
    // 讓圖片覆蓋在畫布上方以呈現動態 GIF。
    imageElement.style('z-index', '1');
    // 避免圖片攔截滑鼠或觸控拖曳事件。
    imageElement.style('pointer-events', 'none');
    // 裁切圖片以填滿題目卡片的圖片區域。
    imageElement.style('object-fit', 'cover');
    // 設定題目圖片的圓角外觀。
    imageElement.style('border-radius', '12px');
    // 將圖片元素保存在陣列中供後續定位。
    gifImages[index] = imageElement;
  });
}

// 每一影格重繪測驗版面、拖曳內容與動畫。
function draw() {
  // 以淡奶油色清除上一影格內容。
  background('#f7f5ef');
  // 計算目前畫面中六張題目卡片的版面位置。
  const layout = getLayout();
  // 繪製頁首標題、進度與操作提示。
  drawHeader(layout);
  // 繪製六張固定題目卡與答案放置區。
  drawQuestionCards(layout);
  // 繪製尚未放入題格的答案選項。
  drawAnswerTray(layout);
  // 繪製交卷或重新作答按鈕。
  drawActionButton(layout);
  // 繪製目前拖曳中的答案卡片。
  drawDraggingAnswer();
  // 繪製高分時出現的彩帶動畫。
  drawConfetti();
  // 在交卷後顯示分數結果面板。
  drawResultOverlay();
}

// 依視窗大小計算卡片、選項與按鈕的排版。
function getLayout() {
  // 判斷目前畫面是否適合使用雙欄卡片版面。
  const compact = width < 680;
  // 設定題目卡片的欄數。
  const columns = compact ? 2 : 3;
  // 設定題目卡片的外側留白。
  const margin = compact ? 14 : Math.min(38, width * 0.04);
  // 設定卡片之間的水平與垂直間距。
  const gap = compact ? 10 : 16;
  // 計算卡片可使用的總寬度。
  const availableWidth = width - margin * 2 - gap * (columns - 1);
  // 計算每張題目卡片的寬度。
  const cardWidth = availableWidth / columns;
  // 根據行動裝置寬度限制卡片高度。
  const cardHeight = compact ? Math.min(124, Math.max(102, height * 0.145)) : Math.min(188, Math.max(148, height * 0.205));
  // 計算題目區域起始位置。
  const cardsTop = compact ? 92 : 112;
  // 計算答案選項區域的起始位置。
  const trayTop = cardsTop + Math.ceil(quizItems.length / columns) * (cardHeight + gap) + (compact ? 22 : 28);
  // 計算每個答案選項的欄數。
  const trayColumns = compact ? 2 : 3;
  // 計算答案選項之間的間距。
  const trayGap = compact ? 8 : 12;
  // 計算答案選項的卡片寬度。
  const trayWidth = (width - margin * 2 - trayGap * (trayColumns - 1)) / trayColumns;
  // 根據畫面高度計算答案卡片高度。
  const trayHeight = compact ? 48 : 58;
  // 計算底部操作區的位置。
  const actionY = Math.min(height - 60, trayTop + Math.ceil(quizItems.length / trayColumns) * (trayHeight + trayGap) + 14);
  // 回傳目前版面的所有尺寸與位置資料。
  return { compact, columns, margin, gap, cardWidth, cardHeight, cardsTop, trayTop, trayColumns, trayGap, trayWidth, trayHeight, actionY };
}

// 繪製測驗標題、副標題與已完成題數。
function drawHeader(layout) {
  // 設定標題文字顏色。
  fill('#20352e');
  // 設定標題不顯示外框。
  noStroke();
  // 設定標題文字大小。
  textSize(layout.compact ? 21 : 27);
  // 設定標題文字粗細與對齊方式。
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  // 繪製測驗主標題。
  text('毛孩生活觀察室', layout.margin, 30);
  // 設定副標題與題數提示的文字樣式。
  fill('#61766b');
  textSize(layout.compact ? 11 : 13);
  textStyle(NORMAL);
  // 繪製拖曳配對操作提示。
  text('把正確的生活常識拖到對應的毛孩卡片', layout.margin, 58);
  // 計算已完成的配對題數。
  const completedCount = placedAnswers.filter((answer) => answer !== null).length;
  // 設定進度文字的水平對齊方式。
  textAlign(RIGHT, CENTER);
  // 繪製目前配對進度。
  text(`${completedCount} / ${quizItems.length} 題`, width - layout.margin, 31);
}

// 繪製六張動畫題卡、題目標籤與答案放置提示。
function drawQuestionCards(layout) {
  // 逐一處理六個題目位置。
  quizItems.forEach((item, index) => {
    // 計算題目卡片的欄位置。
    const column = index % layout.columns;
    // 計算題目卡片的列位置。
    const row = Math.floor(index / layout.columns);
    // 計算題目卡片的水平座標。
    const x = layout.margin + column * (layout.cardWidth + layout.gap);
    // 計算題目卡片的垂直座標。
    const y = layout.cardsTop + row * (layout.cardHeight + layout.gap);
    // 繪製白色圓角卡片底色。
    noStroke();
    fill('#ffffff');
    rect(x, y, layout.cardWidth, layout.cardHeight, 15);
    // 計算圖片元素的內距與高度。
    const imagePadding = 7;
    const imageHeight = layout.cardHeight * 0.61;
    // 定位對應的 GIF 圖片元素。
    gifImages[index].position(x + imagePadding, y + imagePadding);
    // 設定圖片元素的寬度與高度。
    gifImages[index].size(layout.cardWidth - imagePadding * 2, imageHeight);
    // 繪製題目名稱文字。
    fill('#20352e');
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(layout.compact ? 12 : 14);
    text(item.title, x + 12, y + imageHeight + 15, layout.cardWidth - 24, 22);
    // 計算答案放置區的位置與尺寸。
    const slotY = y + imageHeight + 29;
    const slotHeight = layout.cardHeight - imageHeight - 36;
    // 繪製放置區底色與虛線外框。
    fill(placedAnswers[index] === null ? '#f3f6f1' : '#e8f1e8');
    stroke(placedAnswers[index] === null ? '#b9c8ba' : '#6e9b77');
    strokeWeight(1.2);
    drawingContext.setLineDash(placedAnswers[index] === null ? [4, 4] : []);
    rect(x + 7, slotY, layout.cardWidth - 14, Math.max(22, slotHeight), 9);
    drawingContext.setLineDash([]);
    // 若答案尚未放入，就顯示題格提示文字。
    if (placedAnswers[index] === null) {
      fill('#829187');
      noStroke();
      textAlign(CENTER, CENTER);
      textStyle(NORMAL);
      textSize(layout.compact ? 10 : 12);
      text('拖曳答案到這裡', x + 12, slotY, layout.cardWidth - 24, Math.max(22, slotHeight));
    } else if (placedAnswers[index] !== draggingAnswer) {
      // 若答案已放入，就在題格中顯示完整答案文字。
      fill('#2d513a');
      noStroke();
      textAlign(LEFT, CENTER);
      textStyle(NORMAL);
      textSize(layout.compact ? 9 : 11);
      text(quizItems[placedAnswers[index]].answer, x + 12, slotY + 2, layout.cardWidth - 24, Math.max(18, slotHeight - 4));
    }
    // 儲存每一題放置區的互動範圍。
    item.bounds = { x, y, w: layout.cardWidth, h: layout.cardHeight, slotY, slotH: Math.max(22, slotHeight) };
  });
}

// 繪製尚未配對的六個文字答案選項。
function drawAnswerTray(layout) {
  // 設定答案區標題樣式。
  fill('#20352e');
  noStroke();
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(layout.compact ? 12 : 14);
  // 繪製答案區標題。
  text('答案選項', layout.margin, layout.trayTop - 12);
  // 逐一繪製尚未放入題格的答案卡片。
  quizItems.forEach((item, answerIndex) => {
    // 略過已經放入題格或正被拖曳的答案。
    if (placedAnswers.includes(answerIndex) || draggingAnswer === answerIndex) return;
    // 依序找出答案在選項區中的位置。
    const availableIndex = quizItems
      .map((_, index) => index)
      .filter((index) => !placedAnswers.includes(index) && draggingAnswer !== index)
      .indexOf(answerIndex);
    // 計算答案卡片的欄位置。
    const column = availableIndex % layout.trayColumns;
    // 計算答案卡片的列位置。
    const row = Math.floor(availableIndex / layout.trayColumns);
    // 計算答案卡片的水平座標。
    const x = layout.margin + column * (layout.trayWidth + layout.trayGap);
    // 計算答案卡片的垂直座標。
    const y = layout.trayTop + row * (layout.trayHeight + layout.trayGap);
    // 繪製答案卡片底色與邊框。
    fill('#fffdf8');
    stroke('#d8d9cf');
    strokeWeight(1);
    rect(x, y, layout.trayWidth, layout.trayHeight, 10);
    // 繪製答案文字並允許較長內容換行。
    fill('#34483d');
    noStroke();
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    textSize(layout.compact ? 9 : 11);
    text(item.answer, x + 9, y + 3, layout.trayWidth - 18, layout.trayHeight - 6);
    // 儲存答案卡片的互動範圍。
    item.answerBounds = { x, y, w: layout.trayWidth, h: layout.trayHeight };
  });
}

// 繪製交卷按鈕或重新作答按鈕。
function drawActionButton(layout) {
  // 設定按鈕寬度並置中對齊畫面。
  const buttonWidth = layout.compact ? 168 : 190;
  const buttonHeight = 42;
  const buttonX = (width - buttonWidth) / 2;
  // 儲存交卷按鈕的點擊範圍。
  submitButton = { x: buttonX, y: layout.actionY, w: buttonWidth, h: buttonHeight };
  // 儲存重新作答按鈕的位置與尺寸。
  restartButton = { x: buttonX, y: layout.actionY, w: buttonWidth, h: buttonHeight };
  // 設定尚未完成時的按鈕底色。
  fill(submitted ? '#d9e7d8' : (placedAnswers.every((answer) => answer !== null) ? '#2f6544' : '#aab6aa'));
  noStroke();
  // 繪製圓角操作按鈕。
  rect(buttonX, layout.actionY, buttonWidth, buttonHeight, 12);
  // 設定按鈕文字樣式。
  fill(submitted ? '#2f6544' : '#ffffff');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);
  // 顯示交卷或重新作答文字。
  text(submitted ? '重新作答' : '交卷看成績', width / 2, layout.actionY + buttonHeight / 2);
}

// 繪製跟隨滑鼠或手指移動的答案卡片。
function drawDraggingAnswer() {
  // 沒有正在拖曳的答案時就不繪製拖曳卡片。
  if (draggingAnswer === null) return;
  // 設定拖曳卡片的寬度。
  const cardWidth = Math.min(width * 0.72, 320);
  // 設定拖曳卡片的高度。
  const cardHeight = 62;
  // 繪製拖曳卡片陰影與底色。
  drawingContext.shadowColor = 'rgba(28, 46, 35, 0.24)';
  drawingContext.shadowBlur = 15;
  drawingContext.shadowOffsetY = 5;
  fill('#ffffff');
  noStroke();
  rect(pointerX - cardWidth / 2, pointerY - cardHeight / 2, cardWidth, cardHeight, 12);
  // 清除陰影，避免影響後續圖形。
  drawingContext.shadowColor = 'transparent';
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetY = 0;
  // 在拖曳卡片中繪製答案文字。
  fill('#2e4937');
  textAlign(CENTER, CENTER);
  textStyle(NORMAL);
  textSize(11);
  text(quizItems[draggingAnswer].answer, pointerX - cardWidth / 2 + 10, pointerY - cardHeight / 2 + 5, cardWidth - 20, cardHeight - 10);
}

// 繪製超過八十分時的彩帶粒子動畫。
function drawConfetti() {
  // 尚未達到高分時不顯示彩帶。
  if (!submitted || finalScore <= 80) return;
  // 每隔一段時間從畫面上方加入彩帶粒子。
  if (frameCount % 3 === 0) {
    // 每次新增多個彩色紙片。
    for (let index = 0; index < 4; index += 1) {
      // 建立具有隨機位置、速度、顏色與旋轉角度的紙片。
      confetti.push({ x: random(width), y: random(-30, -5), vx: random(-1.5, 1.5), vy: random(2, 5), size: random(5, 10), angle: random(TWO_PI), spin: random(-0.08, 0.08), color: random(['#e85d4a', '#f0b429', '#317c63', '#4387a6', '#d879a9']) });
    }
  }
  // 逐一更新並繪製所有彩帶紙片。
  confetti = confetti.filter((piece) => {
    // 更新彩帶的位置與旋轉角度。
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.angle += piece.spin;
    // 繪製旋轉的彩帶矩形。
    push();
    translate(piece.x, piece.y);
    rotate(piece.angle);
    noStroke();
    fill(piece.color);
    rectMode(CENTER);
    rect(0, 0, piece.size, piece.size * 0.55, 2);
    pop();
    // 保留尚未離開畫面的彩帶。
    return piece.y < height + 20;
  });
}

// 交卷後以半透明遮罩顯示成績與評語。
function drawResultOverlay() {
  // 尚未交卷時不顯示結果畫面。
  if (!submitted) return;
  // 覆蓋柔和透明底色以突出成績面板。
  noStroke();
  fill(32, 53, 46, 105);
  rect(0, 0, width, height);
  // 計算置中結果面板的尺寸與座標。
  const panelWidth = Math.min(width - 36, 420);
  const panelHeight = 245;
  const panelX = (width - panelWidth) / 2;
  const panelY = (height - panelHeight) / 2;
  // 繪製白色結果面板。
  fill('#fffdf8');
  rect(panelX, panelY, panelWidth, panelHeight, 18);
  // 顯示成績百分比。
  fill('#20352e');
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(18);
  text('你的毛孩常識成績', width / 2, panelY + 42);
  textSize(48);
  fill(finalScore > 80 ? '#2f7650' : '#b66b39');
  text(`${finalScore}%`, width / 2, panelY + 105);
  // 顯示依照分數變化的評語。
  fill('#596c60');
  textStyle(NORMAL);
  textSize(14);
  text(finalScore > 80 ? '太棒了！你是毛孩生活小達人！' : '再多認識一些毛孩知識，下次會更棒！', width / 2, panelY + 151);
  // 將重新作答按鈕定位在結果面板內。
  restartButton = { x: width / 2 - 80, y: panelY + 181, w: 160, h: 42 };
  // 繪製重新作答按鈕。
  fill('#2f6544');
  rect(restartButton.x, restartButton.y, restartButton.w, restartButton.h, 11);
  fill('#ffffff');
  textStyle(BOLD);
  textSize(14);
  text('重新作答', width / 2, restartButton.y + restartButton.h / 2);
}

// 在按下滑鼠或觸控時開始拖曳答案。
function mousePressed() {
  // 將目前指標座標記錄為拖曳起點。
  pointerX = mouseX;
  pointerY = mouseY;
  // 交卷後只接受結果面板中的重新作答點擊。
  if (submitted) {
    // 點擊重新作答按鈕時重設測驗狀態。
    if (isInside(mouseX, mouseY, restartButton)) resetQuiz();
    return false;
  }
  // 點擊已填入的答案格時，取出答案開始拖曳。
  for (let index = 0; index < placedAnswers.length; index += 1) {
    // 取得目前題目卡片的答案格範圍。
    const bounds = quizItems[index].bounds;
    // 指標位於答案格內且格子已有答案時開始拖曳。
    if (placedAnswers[index] !== null && isInside(mouseX, mouseY, { x: bounds.x, y: bounds.slotY, w: bounds.w, h: bounds.slotH })) {
      draggingAnswer = placedAnswers[index];
      placedAnswers[index] = null;
      return false;
    }
  }
  // 點擊答案選項時開始拖曳該文字答案。
  for (let index = 0; index < quizItems.length; index += 1) {
    // 取得目前答案卡片的互動範圍。
    const bounds = quizItems[index].answerBounds;
    // 指標位於尚未使用的答案卡片內時開始拖曳。
    if (!placedAnswers.includes(index) && bounds && isInside(mouseX, mouseY, bounds)) {
      draggingAnswer = index;
      return false;
    }
  }
  // 若按下畫面其他位置則不啟動拖曳。
  return false;
}

// 在拖曳過程中更新答案卡片的位置。
function mouseDragged() {
  // 將拖曳卡片中心同步至目前指標位置。
  pointerX = mouseX;
  pointerY = mouseY;
  // 阻止瀏覽器在觸控拖曳時捲動畫面。
  return false;
}

// 放開滑鼠或手指時將答案放入對應題格。
function mouseReleased() {
  // 沒有拖曳答案時不需進行放置判定。
  if (draggingAnswer === null) return false;
  // 逐一檢查答案是否放在某一題的答案格內。
  for (let index = 0; index < quizItems.length; index += 1) {
    // 取得目前題格範圍。
    const bounds = quizItems[index].bounds;
    // 判斷指標是否放在目前題格中。
    const droppedInSlot = isInside(mouseX, mouseY, { x: bounds.x, y: bounds.slotY, w: bounds.w, h: bounds.slotH });
    // 若放在題格中，就將答案放入該題。
    if (droppedInSlot) {
      // 若目標題格已有其他答案，舊答案會自動回到選項區。
      placedAnswers[index] = draggingAnswer;
      break;
    }
  }
  // 清除拖曳狀態並結束本次拖放操作。
  draggingAnswer = null;
  return false;
}

// 點擊已完成題目的交卷按鈕。
function mouseClicked() {
  // 已交卷時不再處理交卷按鈕。
  if (submitted) return false;
  // 只有六題都已放入答案，且點擊按鈕時才計算成績。
  if (placedAnswers.every((answer) => answer !== null) && isInside(mouseX, mouseY, submitButton)) {
    // 計算配對正確的題數。
    const correctCount = placedAnswers.filter((answer, index) => answer === index).length;
    // 將答對題數換算成百分比。
    finalScore = Math.round((correctCount / quizItems.length) * 100);
    // 設定交卷狀態以顯示結果面板。
    submitted = true;
    // 高分時清空舊彩帶，從新的一輪動畫開始。
    confetti = [];
  }
  // 阻止瀏覽器執行預設點擊行為。
  return false;
}

// 判斷指標座標是否位於指定矩形範圍。
function isInside(x, y, bounds) {
  // 回傳指標是否同時落在矩形的水平與垂直範圍。
  return x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h;
}

// 清空配對結果並重新開始測驗。
function resetQuiz() {
  // 將六個題格恢復為未作答狀態。
  placedAnswers = Array(quizItems.length).fill(null);
  // 清除交卷與成績狀態。
  submitted = false;
  finalScore = 0;
  // 清除畫面上已存在的彩帶。
  confetti = [];
  // 清除拖曳狀態。
  draggingAnswer = null;
}

// 視窗尺寸改變時同步調整全螢幕畫布尺寸。
function windowResized() {
  // 讓畫布延伸至新的瀏覽器視窗尺寸。
  resizeCanvas(windowWidth, windowHeight);
}
