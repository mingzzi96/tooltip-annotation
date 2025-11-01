class Canvas {
  constructor() {
    this.infos = [];
    this.imgCanvas;
    this.inputBubble;
    this.commentBubble;
    this.bubbleList = [];
    this.clickedPosition = { x: 0, y: 0 };
  }

  imgLoad(url, input, infos) {
    this.infos = infos;
    this.inputBubble = input;

    if (this.originImgResize) {
      this.originImgResize.onload = null;
    }

    this.originImgResize = new Image();
    this.originImgResize.crossOrigin = "anonymous";
    this.originImgResize.src = url;

    this.imgCanvas = document.querySelector(".image_canvas");

    this.originImgResize.onload = () => {
      if (!this.imgCanvas) return;
      this.imgCtx = this.imgCanvas.getContext("2d");

      this.imgCtx.imageSmoothingEnabled = true;
      this.imgCtx.imageSmoothingQuality = "high";
      this.imgCtx.webkitImageSmoothingEnabled = true;
      this.imgCtx.mozImageSmoothingEnabled = true;
      this.imgCtx.msImageSmoothingEnabled = true;

      this.imgCanvas.width = this.originImgResize.width;
      this.imgCanvas.height = this.originImgResize.height;
      this.imgCtx.drawImage(
        this.originImgResize,
        0,
        0,
        this.imgCanvas.width,
        this.imgCanvas.height
      );
      this.imgData = this.imgCtx.getImageData(
        0,
        0,
        this.imgCanvas.width,
        this.imgCanvas.height
      );

      this.addClickEvent();

      // if (camera) {
      //   let xRatio = this.originImgResize.width / camera.photoWidth;
      //   let yRatio = this.originImgResize.height / camera.photoHeight;
      //   this.drawBox(this.resultImgCtx, xRatio, yRatio);
      // }
    };
  }

  /**
   * 클릭한 위치 좌표값 받아올 수 있는 이벤트 생성
   */
  addClickEvent() {
    if (!this.imgCanvas) {
      console.error("❌ imgCanvas가 아직 초기화되지 않았습니다.");
      return;
    }

    this.imgCanvas.addEventListener("click", (event) => {
      const rect = this.imgCanvas.getBoundingClientRect();
      const scaleX = this.imgCanvas.width / rect.width;
      const scaleY = this.imgCanvas.height / rect.height;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      console.log(`🟢 클릭 좌표: x=${x}, y=${y}`);

      // 클릭 좌표 표시 (테스트용 점)
      // const ctx = this.imgCtx;
      // if (ctx) {
      //   ctx.beginPath();
      //   ctx.arc(x, y, 5, 0, Math.PI * 2);
      //   ctx.fillStyle = "red";
      //   ctx.fill();
      // }

      // annotation_input 띄우기
      this.showAnnotationInput(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
      this.clickedPosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    });
  }

  /**
   * 클릭 위치에 input 입력 영역 띄우기
   */
  showAnnotationInput(mouseX, mouseY) {
    if (!this.inputBubble || !this.imgCanvas) return;

    const canvasRect = this.imgCanvas.getBoundingClientRect();
    const el = this.inputBubble;
    el.style.position = "absolute";
    el.style.display = "block";

    const inputWidth = el.offsetWidth;
    const inputHeight = el.offsetHeight;
    // const offset = 5; // 마우스와 div 사이 간격

    let left = canvasRect.left + mouseX;
    let top;

    // 좌우 위치 조정
    if (left + inputWidth > canvasRect.right) {
      // 오른쪽 벗어나면 왼쪽으로
      left = canvasRect.left + mouseX - inputWidth;
    } else if (left < canvasRect.left) {
      left = canvasRect.left; // 왼쪽 고정
    }

    // 상하 위치 조정
    // 기본: 아래쪽, input 상단이 마우스 아래에 붙도록 inputHeight만큼 이동
    top = canvasRect.top + mouseY;

    // 아래로 넘치면 위쪽으로 전환
    if (top + inputHeight > canvasRect.bottom) {
      // input 하단이 마우스 위쪽에 붙도록
      top = canvasRect.top - inputHeight + mouseY;
    }

    // 최종 클램프: 캔버스 안으로 제한
    // if (top < canvasRect.top + offset) top = canvasRect.top + offset;
    // if (top + inputHeight > canvasRect.bottom - offset)
    //   top = canvasRect.bottom - inputHeight - offset;

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.zIndex = 1000;
  }

  hideAnnotationInput() {
    const el = this.inputBubble;
    el.style.display = "none";
  }

  /**
   * 클릭 위치에 버블(말풍선) 고정시키기
   */
  createAnnotationBubble(commentBubble) {
    this.commentBubble = commentBubble;
    console.log(this.commentBubble);
    if (!this.imgCanvas || !this.commentBubble) return;

    this.hideAnnotationInput();

    const canvasRect = this.imgCanvas.getBoundingClientRect();

    // 원본 ref에서 복제 (스타일 포함)
    const bubble = this.commentBubble.cloneNode(true);
    bubble.style.display = "block"; // 얘는 필요 — 원본이 display:none이니까

    // 화면에 추가
    document.body.appendChild(bubble);

    const bubbleWidth = 50;
    const bubbleHeight = 50;

    console.log(bubbleWidth);
    console.log(bubbleHeight);

    let left = canvasRect.left + bubbleWidth / 2 + this.clickedPosition.x;
    let top = canvasRect.top - bubbleHeight / 2 + this.clickedPosition.y;

    let transform = "";
    // let transformOrigin = "center center";

    // 좌우 반전
    if (left + bubbleWidth > canvasRect.right) {
      transform += " scaleX(-1)";
      left -= bubbleWidth; // 오른쪽 반전 보정
    }

    // 상하 반전 (위쪽 경계 벗어나면 반전)
    if (top < canvasRect.top) {
      transform += " scaleY(-1)";
      top += bubbleHeight; // 위쪽 반전 보정
    }

    // 클릭 위치 기준 중앙 보정
    left -= bubbleWidth * 0.5;
    top -= bubbleHeight * 0.5;

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
    bubble.style.transform = transform.trim();
    bubble.style.transformOrigin = "center center";
  }

  // ####################################################################################

  setImgData() {
    this.resultImgCtx.putImageData(this.resultImgData, 0, 0);
  }

  saveImgData(canvas) {
    if (canvas == "result") {
      this.resultImgData = this.resultImgCtx.getImageData(
        0,
        0,
        this.resultImgCanvas.width,
        this.resultImgCanvas.height
      );
    } else if (canvas == "edit") {
      this.editResultImgData = this.editResultImgCtx.getImageData(
        0,
        0,
        this.editResultImgCanvas.width,
        this.editResultImgCanvas.height
      );
    }
  }
  drawCrack(xRatio, yRatio, canvas, index) {
    let xmin = Math.round(this.infos[index].box.xmin * xRatio);
    let ymin = Math.round(this.infos[index].box.ymin * yRatio);

    if (this.infos[index].point) {
      for (let i = 0; i < this.infos[index].point.points.length; i++) {
        let x = Math.round(this.infos[index].point.points[i][0] * xRatio);
        let y = Math.round(this.infos[index].point.points[i][1] * yRatio);

        if (canvas == "result") {
          this.resultImgData.data[
            ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4
          ] = 255;
          this.resultImgData.data[
            ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4 + 1
          ] = 0;
          this.resultImgData.data[
            ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4 + 2
          ] = 0;
          this.resultImgData.data[
            ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4 + 3
          ] = 255;
        } else if (canvas == "edit") {
          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4
          ] = 255;
          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 1
          ] = 0;
          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 2
          ] = 0;
          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 3
          ] = 255;
        }
      }
    }
  }
  deleteCrack(xRatio, yRatio, canvas, index) {
    let xmin = Math.round(this.infos[index].box.xmin * xRatio);
    let ymin = Math.round(this.infos[index].box.ymin * yRatio);

    if (this.infos[index].point) {
      for (let i = 0; i < this.infos[index].point.points.length; i++) {
        let x = Math.round(this.infos[index].point.points[i][0] * xRatio);
        let y = Math.round(this.infos[index].point.points[i][1] * yRatio);

        if (canvas == "result") {
          this.resultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4
          ] =
            this.imgData.data[
              ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4
            ];

          this.resultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 1
          ] =
            this.imgData.data[
              ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4 + 1
            ];

          this.resultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 2
          ] =
            this.imgData.data[
              ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4 + 2
            ];

          this.resultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 3
          ] =
            this.imgData.data[
              ((y + ymin) * this.originImgResize.width + (x + xmin)) * 4 + 3
            ];
        } else if (canvas == "edit") {
          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4
          ] =
            this.editImgData.data[
              ((y + ymin) * this.originImg.width + (x + xmin)) * 4
            ];

          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 1
          ] =
            this.editImgData.data[
              ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 1
            ];

          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 2
          ] =
            this.editImgData.data[
              ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 2
            ];

          this.editResultImgData.data[
            ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 3
          ] =
            this.editImgData.data[
              ((y + ymin) * this.originImg.width + (x + xmin)) * 4 + 3
            ];
        }
      }
    }
  }
  drawCrackAll(xRatio, yRatio, canvas) {
    for (let i = 0; i < this.infos.length; i++) {
      if (this.infos[i].class == "crack") {
        this.drawCrack(xRatio, yRatio, canvas, i);
      }
    }
  }
  deleteCrackAll(xRatio, yRatio, canvas) {
    for (let i = 0; i < this.infos.length; i++) {
      if (this.infos[i].class == "crack") {
        this.deleteCrack(xRatio, yRatio, canvas, i);
      }
    }
  }
  drawBox(imgCtx, xRatio, yRatio, deleteIndex) {
    let xmin;
    let ymin;
    let xmax;
    let ymax;
    imgCtx.lineWidth = 7 * xRatio;
    imgCtx.font = `${150 * yRatio}px Arial`;
    for (let i = 0; i < this.infos.length; i++) {
      if (i === deleteIndex) {
        // 삭제하기 위해 선택된 박스라면 박스색을 검정색으로 통일시킨다.
        imgCtx.fillStyle = "#171717";
        imgCtx.strokeStyle = "#171717";
      } else {
        switch (this.infos[i].class) {
          case "crack": // 균열
            imgCtx.fillStyle = "#00FFFF";
            imgCtx.strokeStyle = "#00FFFF";
            break;
          case "efflorescence": // 백태
            imgCtx.fillStyle = "#00FF00";
            imgCtx.strokeStyle = "#00FF00";
            break;
          case "spalling": // 박락
            imgCtx.fillStyle = "#0000FF";
            imgCtx.strokeStyle = "#0000FF";
            break;
          case "rebar": // 철근노출
            imgCtx.fillStyle = "#FFFF00";
            imgCtx.strokeStyle = "#FFFF00";
            break;
          case "leakage": // 누수
            imgCtx.fillStyle = "#FFA500";
            imgCtx.strokeStyle = "#FFA500";
            break;
          case "net_crack": // 망상균열
            imgCtx.fillStyle = "#9D00FF";
            imgCtx.strokeStyle = "#9D00FF";
            break;
          case "etc": // 기타
            imgCtx.fillStyle = "#FFC0CB";
            imgCtx.strokeStyle = "#FFC0CB";
            break;
          default:
            break;
        }
      }
      xmin = Math.round(this.infos[i].box.xmin * xRatio);
      ymin = Math.round(this.infos[i].box.ymin * yRatio);
      xmax = Math.round(this.infos[i].box.xmax * xRatio);
      ymax = Math.round(this.infos[i].box.ymax * yRatio);
      imgCtx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
      if (ymin < 150 * yRatio) {
        imgCtx.fillText(i + 1, xmin, ymin + 150 * yRatio);
      } else {
        imgCtx.fillText(i + 1, xmin, ymin - 10 * yRatio);
      }
    }
  }
  /**
   * 균열 이외의 박스 삭제 버튼 눌렀을 때 컬러 변경되도록
   */
  deleteBox(camera, index) {
    let xRatio = this.originImgResize.width / camera.photoWidth;
    let yRatio = this.originImgResize.height / camera.photoHeight;

    this.drawBox(this.resultImgCtx, xRatio, yRatio, index);
  }
  changeBoxColor(imgCtx, xRatio, yRatio, index) {
    let xmin;
    let ymin;
    let xmax;
    let ymax;
    imgCtx.lineWidth = 7 * xRatio;
    imgCtx.font = `${150 * yRatio}px Arial`;

    for (let i = 0; i < this.infos.length; i++) {
      if (i === index) {
        imgCtx.fillStyle = "#171717";
        imgCtx.strokeStyle = "#171717";

        xmin = Math.round(this.infos[i].box.xmin * xRatio);
        ymin = Math.round(this.infos[i].box.ymin * yRatio);
        xmax = Math.round(this.infos[i].box.xmax * xRatio);
        ymax = Math.round(this.infos[i].box.ymax * yRatio);
        imgCtx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
        if (ymin < 150 * yRatio) {
          imgCtx.fillText(i + 1, xmin, ymin + 150 * yRatio);
        } else {
          imgCtx.fillText(i + 1, xmin, ymin - 10 * yRatio);
        }
      }
    }
  }
  ////
  setImageEventLine() {
    this.crackPoints = [];
    this.thickness = 2;
    this.clickEvent = (e) => {
      this.editResultImgCtx.lineWidth = 4;
      this.editResultImgCtx.fillStyle = "#FF0000";
      this.editResultImgCtx.strokeStyle = "#FF0000";

      let rect = this.editResultImgCanvas.getBoundingClientRect();

      let imgWidth = this.editResultImgCanvas.width;
      let imgHeight = this.editResultImgCanvas.height;

      if (imgWidth / imgHeight > rect.width / rect.height) {
        imgHeight = rect.width * (imgHeight / imgWidth);
        imgWidth = rect.width;
      } else {
        imgWidth = rect.height * (imgWidth / imgHeight);
        imgHeight = rect.height;
      }

      let imgLeft = rect.left + (rect.width - imgWidth) / 2;
      let imgTop = rect.top + (rect.height - imgHeight) / 2;

      let x =
        (e.clientX - imgLeft) * (this.editResultImgCanvas.width / imgWidth);
      let y =
        (e.clientY - imgTop) * (this.editResultImgCanvas.height / imgHeight);

      this.crackPoints.push({ x: x, y: y });

      this.editResultImgCtx.beginPath();
      this.editResultImgCtx.arc(x, y, 1, 0, Math.PI * 2);
      this.editResultImgCtx.fill();

      if (this.crackPoints.length > 1) {
        this.editResultImgCtx.beginPath();
        this.editResultImgCtx.moveTo(
          this.crackPoints[this.crackPoints.length - 2].x,
          this.crackPoints[this.crackPoints.length - 2].y
        );
        this.editResultImgCtx.lineTo(
          this.crackPoints[this.crackPoints.length - 1].x,
          this.crackPoints[this.crackPoints.length - 1].y
        );
        this.editResultImgCtx.stroke();
      }
    };
    this.editResultImgCanvas.addEventListener("click", this.clickEvent);
  }
  setImageEventBox(method) {
    this.isDrawingBox = false;
    this.startPoint = null;
    this.endPoint = null;
    this.beforePoint = null;

    this.editResultImgCtx.lineWidth = 7;
    if (method == "efflorescence")
      this.editResultImgCtx.strokeStyle = "#00FF00";
    else if (method == "spalling")
      this.editResultImgCtx.strokeStyle = "#0000FF";
    else if (method == "rebar") this.editResultImgCtx.strokeStyle = "#FFFF00";
    else if (method == "leakage") this.editResultImgCtx.strokeStyle = "#FFA500";
    else if (method == "net_crack")
      this.editResultImgCtx.strokeStyle = "#9D00FF";
    else if (method == "etc") this.editResultImgCtx.strokeStyle = "#FFC0CB";

    this.mousedownEvent = (e) => {
      this.isDrawingBox = true;

      let rect = this.editResultImgCanvas.getBoundingClientRect();

      let imgWidth = this.editResultImgCanvas.width;
      let imgHeight = this.editResultImgCanvas.height;

      if (imgWidth / imgHeight > rect.width / rect.height) {
        imgHeight = rect.width * (imgHeight / imgWidth);
        imgWidth = rect.width;
      } else {
        imgWidth = rect.height * (imgWidth / imgHeight);
        imgHeight = rect.height;
      }

      let imgLeft = rect.left + (rect.width - imgWidth) / 2;
      let imgTop = rect.top + (rect.height - imgHeight) / 2;

      let x =
        (e.clientX - imgLeft) * (this.editResultImgCanvas.width / imgWidth);
      let y =
        (e.clientY - imgTop) * (this.editResultImgCanvas.height / imgHeight);

      this.startPoint = { x, y };
    };
    this.mousemoveEvent = (e) => {
      if (!this.isDrawingBox) return;

      let rect = this.editResultImgCanvas.getBoundingClientRect();

      let imgWidth = this.editResultImgCanvas.width;
      let imgHeight = this.editResultImgCanvas.height;

      if (imgWidth / imgHeight > rect.width / rect.height) {
        imgHeight = rect.width * (imgHeight / imgWidth);
        imgWidth = rect.width;
      } else {
        imgWidth = rect.height * (imgWidth / imgHeight);
        imgHeight = rect.height;
      }

      let imgLeft = rect.left + (rect.width - imgWidth) / 2;
      let imgTop = rect.top + (rect.height - imgHeight) / 2;

      let x =
        (e.clientX - imgLeft) * (this.editResultImgCanvas.width / imgWidth);
      let y =
        (e.clientY - imgTop) * (this.editResultImgCanvas.height / imgHeight);

      this.endPoint = { x, y };

      if (this.beforePoint) {
        let dirtyX =
          Math.min(this.beforePoint.startPoint.x, this.beforePoint.endPoint.x) -
          this.editResultImgCtx.lineWidth;
        let dirtyY =
          Math.min(this.beforePoint.startPoint.y, this.beforePoint.endPoint.y) -
          this.editResultImgCtx.lineWidth;
        let dirtyWidth =
          Math.abs(
            this.beforePoint.endPoint.x - this.beforePoint.startPoint.x
          ) +
          2 * this.editResultImgCtx.lineWidth;
        let dirtyHeight =
          Math.abs(
            this.beforePoint.endPoint.y - this.beforePoint.startPoint.y
          ) +
          2 * this.editResultImgCtx.lineWidth;
        this.editResultImgCtx.putImageData(
          this.editResultImgData,
          0,
          0,
          dirtyX,
          dirtyY,
          dirtyWidth,
          dirtyHeight
        );
      }
      this.editResultImgCtx.beginPath();
      this.editResultImgCtx.rect(
        this.startPoint.x,
        this.startPoint.y,
        this.endPoint.x - this.startPoint.x,
        this.endPoint.y - this.startPoint.y
      );
      this.editResultImgCtx.stroke();

      this.beforePoint = {
        startPoint: this.startPoint,
        endPoint: this.endPoint,
      };
    };

    this.mouseupEvent = () => {
      this.isDrawingBox = false;
    };

    this.editResultImgCanvas.addEventListener(
      "pointerdown",
      this.mousedownEvent
    );
    this.editResultImgCanvas.addEventListener(
      "pointermove",
      this.mousemoveEvent
    );
    this.editResultImgCanvas.addEventListener("pointerup", this.mouseupEvent);
  }
  deleteImageEvent() {
    if (this.clickEvent) {
      this.editResultImgCanvas.removeEventListener("click", this.clickEvent);
      this.clickEvent = null;
    }
    if (this.mousedownEvent) {
      this.editResultImgCanvas.removeEventListener(
        "pointerdown",
        this.mousedownEvent
      );
      this.mousedownEvent = null;
    }
    if (this.mousemoveEvent) {
      this.editResultImgCanvas.removeEventListener(
        "pointermove",
        this.mousemoveEvent
      );
      this.mousemoveEvent = null;
    }
    if (this.mouseupEvent) {
      this.editResultImgCanvas.removeEventListener(
        "pointerup",
        this.mouseupEvent
      );
      this.mouseupEvent = null;
    }
  }
  drawLine(thickness) {
    this.setImgData("edit");
    this.editResultImgCtx.fillStyle = "#FF0000";
    this.editResultImgCtx.strokeStyle = "#FF0000";
    if (this.crackPoints.length > 1) {
      this.editResultImgCtx.beginPath();
      this.editResultImgCtx.moveTo(
        this.crackPoints[0].x,
        this.crackPoints[0].y
      );
      this.editResultImgCtx.lineWidth = thickness;
      for (let i = 1; i < this.crackPoints.length; i++) {
        this.editResultImgCtx.lineTo(
          this.crackPoints[i].x,
          this.crackPoints[i].y
        );
      }
      this.editResultImgCtx.stroke();
      for (let i = 0; i < this.crackPoints.length; i++) {
        this.editResultImgCtx.beginPath();
        this.editResultImgCtx.arc(
          this.crackPoints[i].x,
          this.crackPoints[i].y,
          thickness / 2,
          0,
          Math.PI * 2
        ); // 원의 반지름을 선의 굵기의 절반으로 설정
        this.editResultImgCtx.fill();
      }
    }
    this.thickness = thickness;
  }
  saveLine() {
    this.saveImgData("edit");
    this.crackPointsArray.push(this.crackPoints);
    this.crackPoints = [];
  }
  saveBox(method) {
    this.saveImgData("edit");
    this.beforePoint.class = method;
    this.classBoxArray.push(this.beforePoint);
  }
  deleteDraw() {
    this.editResultImgCtx.putImageData(this.editResultImgData, 0, 0);
  }
  saveJson(indexArray, callback) {
    if (indexArray.length > 0) {
      let removeArray = indexArray;
      removeArray.sort((a, b) => b - a);
      removeArray.forEach((index) => {
        this.infos.splice(index, 1);
      });
    }
    if (this.crackPointsArray.length != 0) {
      for (let i = 0; i < this.crackPointsArray.length; i++) {
        this.getBoundingBoxFromPoints(this.crackPointsArray[i]);
      }
    }
    if (this.classBoxArray.length != 0) {
      for (let i = 0; i < this.classBoxArray.length; i++) {
        let xmax;
        let xmin;
        let ymax;
        let ymin;
        if (
          this.classBoxArray[i].startPoint.x < this.classBoxArray[i].endPoint.x
        ) {
          xmax = this.classBoxArray[i].endPoint.x;
          xmin = this.classBoxArray[i].startPoint.x;
        } else {
          xmax = this.classBoxArray[i].startPoint.x;
          xmin = this.classBoxArray[i].endPoint.x;
        }
        if (
          this.classBoxArray[i].startPoint.y < this.classBoxArray[i].endPoint.y
        ) {
          ymax = this.classBoxArray[i].endPoint.y;
          ymin = this.classBoxArray[i].startPoint.y;
        } else {
          ymax = this.classBoxArray[i].startPoint.y;
          ymin = this.classBoxArray[i].endPoint.y;
        }
        let length = ymax - ymin;
        let width = xmax - xmin;
        let infoJson = {
          box: { xmax: xmax, xmin: xmin, ymax: ymax, ymin: ymin },
          length: length,
          width: width,
          class: this.classBoxArray[i].class,
        };
        this.infos.push(infoJson);
      }
    }
    this.infos.sort((a, b) => a.box.ymin - b.box.ymin);
    callback(this.infos);
  }
  getBoundingBoxFromPoints(crackPoints) {
    let totalLength = 0;
    let xmin = Infinity;
    let xmax = -Infinity;
    let ymin = Infinity;
    let ymax = -Infinity;
    for (let i = 0; i < crackPoints.length; i++) {
      let x = Math.round(crackPoints[i].x);
      let y = Math.round(crackPoints[i].y);
      if (xmin > x) {
        xmin = x;
      }
      if (xmax < x) {
        xmax = x;
      }
      if (ymin > y) {
        ymin = y;
      }
      if (ymax < y) {
        ymax = y;
      }
      if (i != 0) {
        let dx = crackPoints[i].x - crackPoints[i - 1].x;
        let dy = crackPoints[i].y - crackPoints[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }
    }
    this.getPixelFromBoundingBox(xmin, ymin, xmax, ymax, totalLength);
  }

  getPixelFromBoundingBox(xmin, ymin, xmax, ymax, totalLength) {
    let imageData = this.editResultImgCtx.getImageData(
      xmin,
      ymin,
      xmax - xmin,
      ymax - ymin
    );
    let points = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];

      if (r === 255 && g === 0 && b === 0 && a === 255) {
        const x = (i / 4) % imageData.width;
        const y = Math.floor(i / 4 / imageData.width);
        points.push([x, y]);
      }
    }
    let length = totalLength;
    let width = this.thickness;

    let infoJson = {
      box: { xmax: xmax, xmin: xmin, ymax: ymax, ymin: ymin },
      length: length,
      width: width / 2,
      point: { points: points },
      class: "crack",
    };
    this.infos.push(infoJson);
  }
}

export default Canvas;
