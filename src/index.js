import { AutoClip } from './auto-clip.js';
import textFilter from './text-filter.js';

let worker = null;

function updateDemo(cvs) {
    document.querySelector('#toolbar').style.display = 'none';
    let div = document.querySelector('#demo');
    div.innerHTML = '';
    div.appendChild(cvs);
    document.querySelector('#toolbar').style.display = 'inline';
}

function onLoadCanvas(cvs) {
    let div = document.querySelector('#img-select');
    div.innerHTML = '';
    div.appendChild(cvs);
    div.setAttribute('class', 'overall');
}

function onClippedCanvas(obj) {
    document.querySelector('#img-select').setAttribute('class', 'hide');
    let newCvs = (() => {
        let newCvs = document.createElement('canvas');
        newCvs.width = obj.width;
        newCvs.height = obj.height;
        let newCTX = newCvs.getContext('2d');
        let imgdata = obj.originalCanvas.getContext('2d').getImageData(obj.x, obj.y, obj.width, obj.height);
        newCTX.putImageData(imgdata, 0, 0);
        return newCvs;
    })();
    updateDemo(newCvs);
    worker.recognize(obj.canvas).then(data => {
        let text = data.data.text;
        document.querySelector('#t-left').value = textFilter(text);
    });
}

Tesseract.createWorker('chi_tra').then(workerRet => {
    worker = workerRet;
    document.querySelector('#finput').addEventListener('change', evt => {
        AutoClip({
            file: evt.target.files[0],
            load: onLoadCanvas,
            clip: onClippedCanvas,
        });
    });
    document.addEventListener('paste', evt => {
        let files = (evt.clipboardData || window.clipboardData).files;
        if (files.length > 0 && files[0].type.search('image') === 0) {
            AutoClip({
                file: files[0],
                load: onLoadCanvas,
                clip: onClippedCanvas,
            });
        }
    });
    document.querySelector('#append-btn').addEventListener('click', evt => {
        let t = document.querySelector('#t-left').value;
        let ele = document.querySelector('#t-right');
        ele.value = (ele.value.trim() + '\n\n' + t.trim()).trim();
    });
    document.querySelector('#toolbar>span').addEventListener('animationend', evt => {
        evt.target.textContent = '';
    });
    document.querySelector('#toolbar>button').addEventListener('click', evt => {
        let cvs = document.querySelector('#demo>canvas');
        if (cvs) {
            cvs.toBlob(blob => {
                navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob,
                    }),
                ]).then(() => {
                    let span = document.querySelector('#toolbar>span');
                    span.classList.toggle('anistart', false);
                    span.offsetHeight;
                    span.textContent = '已複製';
                    span.classList.toggle('anistart', true);
                }).catch(e => {
                    let span = document.querySelector('#toolbar>span');
                    span.classList.toggle('anistart', false);
                    span.offsetHeight;
                    span.textContent = '複製失敗，請手動複製';
                    span.classList.toggle('anistart', true);
                });
            });
        }
    });
});
