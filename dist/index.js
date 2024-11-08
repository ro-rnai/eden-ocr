!function(){"use strict";function t(t){let e=document.createElement("canvas");e.width=t.naturalWidth,e.height=t.naturalHeight;let n=e.getContext("2d");return n.imageSmoothingEnabled=!1,n.drawImage(t,0,0),e}function e(t,e,n){const l=t;function a(t,e){if(!function(t,e){return 0<=t&&t<l.width&&0<=e&&e<l.height}(t,e))return!1;let n=4*(e*l.width+t);return 255===Math.min(l.data[n],l.data[n+1],l.data[n+2])}function o(t,e){return a(t,e)&&a(t+1,e)&&a(t,e+1)&&a(t+1,e+1)}let i=[],r={},c={left:null,right:null,top:null,bottom:null};function u(t,e){return`${t},${e}`}function d(t,e){return void 0!==r[u(t,e)]}function h(t,e,n){r[u(t,e)]=n,n&&((null===c.left||c.left>t)&&(c.left=t),(null===c.right||c.right<t+1)&&(c.right=t+1),(null===c.top||c.top>e)&&(c.top=e),(null===c.bottom||c.bottom<e+1)&&(c.bottom=e+1))}let s=[[e,n],[e-1,n],[e,n-1],[e-1,n-1]];for(let t=0;t<s.length;++t){let[e,n]=s[t];if(o(e,n)){i.push([e,n]),h(e,n,!0);break}}for(;i.length>0;){let[t,e]=i.shift();[[t+1,e],[t-1,e],[t,e+1],[t,e-1]].forEach((t=>{d(t[0],t[1])||(o(t[0],t[1])?(h(t[0],t[1],!0),i.push(t),l.data[4*(t[1]*l.width+t[0])]=255):h(t[0],t[1],!1))}))}let g={x:c.left,y:c.top,w:c.right-c.left+1,h:c.bottom-c.top+1},f=document.createElement("canvas");f.width=g.w,f.height=g.h,f.getContext("2d").putImageData(l,-g.x,-g.y);let m=function(t){function e(){this.val=null,this.x=null,this.y=null,this.update=(t,e,n)=>{(null===this.val||this.val>n)&&(this.val=n,this.x=t,this.y=e)}}function n(t,n,a,o){let i=new e;for(let e=-2;e<=2;++e){let r=t+a*e,c=n+o*e,u=4*(c*l.width+r),d=Math.max(l.data[u],l.data[u+1],l.data[u+2]);i.update(r,c,d)}return i}let a=t.left+t.right>>>1,o=t.top+t.bottom>>>1,i=n(t.left,o,1,0).x,r=n(t.right,o,1,0).x,c=n(a,t.top,0,1).y;return{x:i,y:c,width:r-i+1,height:n(a,t.bottom,0,1).y-c+1}}(c);return m.canvas=f,m}async function n(n){let{file:l,load:a,clip:o}=n,i=await async function(t){return new Promise((e=>{let n=URL.createObjectURL(t),l=document.createElement("img");l.onload=t=>{URL.revokeObjectURL(n),e(l)},l.src=n}))}(l).then(t);a(i),function(t,e){t.addEventListener("click",(n=>{let l=t.getBoundingClientRect(),a=Math.round((n.clientX-l.x)/l.width*t.width),o=Math.round((n.clientY-l.y)/l.height*t.height);e(t,a,o)}))}(i,((t,n,l)=>{let a=function(t){let e=t.getContext("2d").getImageData(0,0,t.width,t.height),n=e.data.length;for(let t=0;t<n;t+=4){let n=255-Math.max(e.data[t],e.data[t+1],e.data[t+2]);n=n>195?255:n,e.data[t]=e.data[t+1]=e.data[t+2]=n}return e}(t),i=e(a,n,l);i.originalCanvas=t,o(i)}))}let l=null;function a(t){let e=document.querySelector("#img-select");e.innerHTML="",e.appendChild(t),e.setAttribute("class","overall")}function o(t){document.querySelector("#img-select").setAttribute("class","hide"),function(t){document.querySelector("#toolbar").style.display="none";let e=document.querySelector("#demo");e.innerHTML="",e.appendChild(t),document.querySelector("#toolbar").style.display="inline"}((()=>{let e=document.createElement("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d"),l=t.originalCanvas.getContext("2d").getImageData(t.x,t.y,t.width,t.height);return n.putImageData(l,0,0),e})()),l.recognize(t.canvas).then((t=>{let e=t.data.text;document.querySelector("#t-left").value=function(t){return function(t){let e="",n="s";for(let l of t){let t=l.codePointAt(0);l.search(/[\s（）]/)>=0?(e+=l,n="s"):t<127?("c"===n&&(e+=" "),e+=l,n="e"):("e"===n&&(e+=" "),e+=l,n="c")}return e}(function(t){const e=",():;",n="，（）：；";for(let l=0;l<e.length;++l)t=t.replaceAll(e[l],n[l]);return t}(function(t){return t.split("\n").map((t=>t.replaceAll(/\s/g,""))).join("\n").replaceAll(/\n+/g,"\n")}(t)))}(e)}))}Tesseract.createWorker("chi_tra").then((t=>{l=t,document.querySelector("#finput").addEventListener("change",(t=>{n({file:t.target.files[0],load:a,clip:o})})),document.addEventListener("paste",(t=>{let e=(t.clipboardData||window.clipboardData).files;e.length>0&&0===e[0].type.search("image")&&n({file:e[0],load:a,clip:o})})),document.querySelector("#append-btn").addEventListener("click",(t=>{let e=document.querySelector("#t-left").value,n=document.querySelector("#t-right");n.value=(n.value.trim()+"\n\n"+e.trim()).trim()})),document.querySelector("#toolbar>span").addEventListener("animationend",(t=>{t.target.textContent=""})),document.querySelector("#toolbar>button").addEventListener("click",(t=>{let e=document.querySelector("#demo>canvas");e&&e.toBlob((t=>{navigator.clipboard.write([new ClipboardItem({[t.type]:t})]).then((()=>{let t=document.querySelector("#toolbar>span");t.classList.toggle("anistart",!1),t.offsetHeight,t.textContent="已複製",t.classList.toggle("anistart",!0)})).catch((t=>{let e=document.querySelector("#toolbar>span");e.classList.toggle("anistart",!1),e.offsetHeight,e.textContent="複製失敗，請手動複製",e.classList.toggle("anistart",!0)}))}))}))}))}();