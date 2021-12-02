const doh = require('dohjs');
const resolver = new doh.DohResolver('https://easyhandshake.com:8053/dns-query');

let hresolver = async function(name) {
  let response = await resolver.query(name,'TXT');
  if(response.answers.length>0) {
    let returned=null;
    response.answers.forEach(ans=>{
      if(ans.data.toString().length==40)
        returned = ans.data.toString();
    });
    return (returned?returned:null);
  } 
  else
    return null;
}

module.exports = hresolver;
