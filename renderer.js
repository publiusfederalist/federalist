// Browser Actions
document.getElementById('go').onclick = function() {
  window.api.send("go", document.getElementById('address').value);
  document.getElementById('go').disabled = true;
  document.getElementById('address').disabled = true;
}
document.getElementById('address').onkeyup = function(e) {
  if(e.key === 'Enter' || e.keyCode === 13)
    document.getElementById('go').click();
}
document.getElementById('back').onclick = function() {
  window.api.send("navigate",-1);
}
document.getElementById('forward').onclick = function() {
  window.api.send("navigate",1);
}

// Link Actions
document.getElementById('browser').onclick = function(e) {
  if(e.target.tagName === 'A') {
    if(e.target.href.startsWith('http:') || e.target.href.startsWith('https:')) {
      e.preventDefault();
      window.api.send("external", e.target.href);
    }
    else if (!(e.target.href.startsWith('federalist://') || e.target.origin==="file://")) {
      e.preventDefault();
    }

    else {
      e.preventDefault();
      window.api.send("go", e.target.href);
    }
  }
}



// IPC
window.api.receive("show", (data) => {
  document.getElementById('browser').innerHTML=data;
});
window.api.receive("toggleButtonOn", (data) => {
  document.getElementById(data).disabled=false;
});
window.api.receive("toggleButtonOff", (data) => {
  document.getElementById(data).disabled=true;
});
window.api.receive("updateAddress", (data) => {
  document.getElementById('address').value=data;
});
window.api.receive("enableAddress",() => {
  document.getElementById('go').disabled = false;
  document.getElementById('address').disabled = false;
});
