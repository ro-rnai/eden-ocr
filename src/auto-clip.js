// 傳入檔案 OR CANVAS
// 輸出 canvas，並掛載一個事件可以取得自動裁切範圍

/**
 * 圖檔轉 HTMLImageElement
 * @param {File} file 
 * @returns {HTMLImageElement}
 */
async function file2img(file) {
    return new Promise(resolve => {
        let url = URL.createObjectURL(file);
        let img = document.createElement('img');
        img.onload = evt => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.src = url;
    });
}

/**
 * HTMLImageElement 轉 HTMLCanvasElement
 * @param {HTMLImageElement} image 
 * @returns {HTMLCanvasElement}
 */
function img2canvas(image) {
    let cvs = document.createElement('canvas');
    cvs.width = image.naturalWidth;
    cvs.height = image.naturalHeight;
    let ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0);
    return cvs;
}

/**
 * 對 canvas 掛載點擊事件，把座標交給 callback
 * @param {HTMLCanvasElement} cvs
 */
function addClickEvent(cvs, cbk) {
    cvs.addEventListener('click', evt => {
        let bbx = cvs.getBoundingClientRect();
        let x = Math.round((evt.clientX - bbx.x) / bbx.width * cvs.width);
        let y = Math.round((evt.clientY - bbx.y) / bbx.height * cvs.height);
        cbk(cvs, x, y);
    });
}

/**
 * 取得處理過的 imageData，處理過程：
 * 1. 轉成灰階
 * 2. 反轉黑白
 * 3. 消除接近背景的顏色
 * @param {HTMLCanvasElement} cvs 
 * @returns {ImageData}
 */
function getGrayImageData(cvs) {
    let ctx = cvs.getContext('2d');
    let imgdata = ctx.getImageData(0, 0, cvs.width, cvs.height);
    let len = imgdata.data.length;
    for (let i = 0; i < len; i += 4) {
        let maxValue = Math.max(
            imgdata.data[i],
            imgdata.data[i + 1],
            imgdata.data[i + 2]
        );
        let val = 255 - maxValue;
        val = val > 195 ? 255 : val;
        imgdata.data[i] = imgdata.data[i + 1] = imgdata.data[i + 2] = val;
    }
    return imgdata;
}

/**
 * 以指定座標為參考點，產生裁切後的圖片
 * 規則是：
 * * 以 2x2 像素為單位，需要都是白色
 * * 從起始點開始，搜尋鄰近符合上述條件的所有點
 * * 收集這些點，並以最大範圍矩形裁切
 * @param {ImageData} imagedata 
 * @param {number} sx 起始 x 座標
 * @param {number} sy 起始 y 座標
 * @returns {object}
 */
function getClippedCanvas(imagedata, sx, sy) {
    const imd = imagedata;
    function isInside(x, y) {
        return 0 <= x && x < imd.width && 0 <= y && y < imd.height;
    }
    function isBlank(x, y) {
        if (!isInside(x, y)) {
            return false;
        }
        let idx = (y * imd.width + x) * 4;
        return Math.min(
            imd.data[idx],
            imd.data[idx + 1],
            imd.data[idx + 2]
        ) === 255;
    }
    function isRangeTL(x, y) { // is blank block top left 
        return isBlank(x, y) && isBlank(x + 1, y) && isBlank(x, y + 1) && isBlank(x + 1, y + 1);
    }
    // 選出範圍
    let queue = [];
    let tesed = {};
    let range = {
        left: null,
        right: null,
        top: null,
        bottom: null,
    };
    function getXYKey(x, y) {
        return `${x},${y}`;
    }
    function isTested(x, y) {
        return tesed[getXYKey(x, y)] !== undefined;
    }
    function setPointStatus(x, y, isRange) {
        tesed[getXYKey(x, y)] = isRange;
        if (isRange) {
            if (range.left === null || range.left > x) {
                range.left = x;
            }
            if (range.right === null || range.right < x + 1) {
                range.right = x + 1;
            }
            if (range.top === null || range.top > y) {
                range.top = y;
            }
            if (range.bottom === null || range.bottom < y + 1) {
                range.bottom = y + 1;
            }
        }
    }
    function borderRange(range) {
        function Record() {
            this.val = null,
            this.x = null,
            this.y = null,
            this.update = (x, y, val) => {
                if(this.val === null || this.val > val) {
                    this.val = val;
                    this.x = x;
                    this.y = y;
                }
            }
        }
        function borderPos(cx, cy, dx, dy) {
            let r = new Record();
            for (let t = -2; t <= 2; ++t) {
                let x = cx + dx * t;
                let y = cy + dy * t;
                let idx = (y * imd.width + x) * 4;
                let val = Math.max(imd.data[idx], imd.data[idx + 1], imd.data[idx + 2]);
                r.update(x, y, val);
            }
            return r;
        }
        let cx = range.left + range.right >>> 1;
        let cy = range.top + range.bottom >>> 1;
        let left = borderPos(range.left, cy, 1, 0).x;
        let right = borderPos(range.right, cy, 1, 0).x;
        let top = borderPos(cx, range.top, 0, 1).y;
        let bottom = borderPos(cx, range.bottom, 0, 1).y;
        return {
            x: left,
            y: top,
            width: right - left + 1,
            height: bottom - top + 1
        };
    }
    // 1. 先取得起始點
    let testPoints = [[sx, sy], [sx - 1, sy], [sx, sy - 1], [sx - 1, sy - 1]];
    for (let i = 0; i < testPoints.length; ++i) {
        let [x, y] = testPoints[i];
        if (isRangeTL(x, y)) {
            queue.push([x, y]);
            setPointStatus(x, y, true);
            break;
        }
    }
    // 2. 廣度優先十字擴散搜尋整個範圍
    // 結果回儲存在 range 中，是鄰近 2x2 格子全黑的最大範圍
    while (queue.length > 0) {
        let [x, y] = queue.shift();
        [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(p => {
            if (!isTested(p[0], p[1])) {
                if (isRangeTL(p[0], p[1])) {
                    setPointStatus(p[0], p[1], true);
                    queue.push(p);
                    imd.data[(p[1] * imd.width + p[0]) * 4] = 255;
                } else {
                    setPointStatus(p[0], p[1], false);
                }
            }
        });
    }
    // 3. 產生灰階的截圖，給 OCR 使用
    let mtx = {
        x: range.left,
        y: range.top,
        w: range.right - range.left + 1,
        h: range.bottom - range.top + 1
    };
    let clip = document.createElement('canvas');
    clip.width = mtx.w;
    clip.height = mtx.h;
    let clipCTX = clip.getContext('2d');
    clipCTX.putImageData(imd, -mtx.x, -mtx.y);
    // 4. 以此範圍的左上與右下點為中心，在 5x5 區域找最亮的點，這是給後續產生彩色節圖使用
    let r = borderRange(range);
    // 5. 回傳結果
    r.canvas = clip;
    return r;
}

async function AutoClip(options) {
    let { file, load, clip } = options;
    let cvs = await file2img(file).then(img2canvas);
    load(cvs);
    addClickEvent(cvs, (cvs, x, y) => {
        let imagedata = getGrayImageData(cvs);
        let obj = getClippedCanvas(imagedata, x, y);
        obj.originalCanvas = cvs;
        clip(obj);
    });
}

export { AutoClip };