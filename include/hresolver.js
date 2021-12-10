const doh = require('dohjs');
const resolver = new doh.DohResolver('https://query.hdns.io/dns-query');

let hresolver = async function(name) {
  let response = await resolver.query(name,'TXT');
  if(response.answers.length>0) {
    let returned=null;
    response.answers.forEach(ans=>{
      returned = ans.data.toString();
    });
    return (returned?returned:null);
  } 
  else
    return null;
}

module.exports = hresolver;
