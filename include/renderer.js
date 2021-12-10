// webview Items
const webview = document.querySelector('webview');

var buttonForward = document.getElementById('forward');
var buttonBack = document.getElementById('back');
var buttonGo = document.getElementById('go');
var addressBar = document.getElementById('address');

var rapidFire='';

var hUrls = [];
hUrls[0]="federalist://";
var curPos = 0;

webview.addEventListener('dom-ready',()=>{
  // webview Actions
  buttonGo.onclick = function() {
    window.api.send("go", document.getElementById('address').value);
    buttonGo.disabled = true;
    addressBar.disabled = true;
  }
  addressBar.onkeyup = function(e) {
    if(e.key === 'Enter' || e.keyCode === 13)
      buttonGo.click();
  }
  buttonBack.onclick = function() {
    if(webview.canGoBack()) {
      curPos--;
      addressBar.value=hUrls[curPos];
      webview.goBack();
    }
    toggleButtons();
  }
  buttonForward.onclick = function() {
    if(webview.canGoForward()) {
      curPos++;
      addressBar.value=hUrls[curPos];
      webview.goForward();
    }
    toggleButtons();
  }
  toggleButtons();
  webview.addEventListener('did-finish-load',(e) => {
    window.api.send("title",webview.getTitle() + " - federalist");
  });
  webview.addEventListener('will-navigate',(e)=>{
    webview.stop();
    if(rapidFire!=e.url) {
      rapidFire=e.url;
      setTimeout(()=>{
        rapidFire="";
      },1000);
      if(e.url.substr(0,4)=="http")
        window.api.send("external", e.url);
      else if(e.url.substr(0,4)=="file" || e.url.substr(0,4)=="magn" || e.url.substr(0,4)=="fede")
        window.api.send("go",e.url);
      else
        doLoadURL(e.url);
    }
  });
});


// IPC
window.api.receive("notfound", (data) => {
  webview.src="404.html";
  curPos++;
  hUrls[curPos]=data;
});
window.api.receive("show", (data) => {
  doLoadURL(data);
  toggleButtons();
});
window.api.receive("updateAddress", (data) => {
  curPos++;
  hUrls[curPos]=data;
  addressBar.value=data;
});
window.api.receive("enableAddress",() => {
  buttonGo.disabled = false;
  addressBar.disabled = false;
});
window.api.receive("disableAddress",() => {
  buttonGo.disabled = true;
  addressBar.disabled = true;
});


function doLoadURL(url) {
  webview.loadURL(url);
}
function toggleButtons() {
  if(webview.canGoBack())
    buttonBack.disabled=false;
  else
    buttonBack.disabled=true;
  if(webview.canGoForward())
    buttonForward.disabled=false;
  else
    buttonForward.disabled=true;
}
