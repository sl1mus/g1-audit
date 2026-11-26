/* G1-AUDIT 1.0.0: local passive diagnostics. No product mappings. */
(function () {
  'use strict';
  var VERSION='1.0.0', KEY='g1.audit.local.v1', ROOT='https://one.google.com/g1-audit-local-v1';
  var LIMIT=300, MAX_BODY=1048576;
  var ID=/^(?:g1\.(?:ios\.|play\.)?[0-9]{1,4}(?:gb|tb)\.[a-z0-9._-]{1,100}|g1\.(?:ios\.|play\.)?(?:helium|sapphire)(?:\.[a-z0-9._-]{1,80})?|com\.google\.(?:one|gemini)\.[a-z0-9._-]{1,100})$/;
  function n(x){return typeof x==='number'&&isFinite(x)&&x>=0?Math.min(Math.floor(x),9007199254740990):0;}
  function stamp(x){return typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)?x:'';}
  function blank(){return {version:VERSION,mode:'passive',updatedAt:'',responses:0,textResponses:0,skippedResponses:0,matchedResponses:0,truncated:false,skus:[],countries:[],currencies:[]};}
  function cleanList(a,re){return Array.isArray(a)?a.filter(function(x){return typeof x==='string'&&re.test(x);}).filter(function(x,i,arr){return arr.indexOf(x)===i;}).slice(0,40):[];}
  function load(){var s=blank();try{var x=JSON.parse($persistentStore.read(KEY)||'{}');if(!x||x.version!==VERSION||x.mode!=='passive')return s;
    ['responses','textResponses','skippedResponses','matchedResponses'].forEach(function(k){s[k]=n(x[k]);});s.updatedAt=stamp(x.updatedAt);s.truncated=x.truncated===true;
    s.countries=cleanList(x.countries,/^[A-Z]{2}$/);s.currencies=cleanList(x.currencies,/^[A-Z]{3}$/);
    if(Array.isArray(x.skus)){var seen=Object.create(null);x.skus.slice(0,LIMIT).forEach(function(r){if(r&&typeof r.id==='string'&&ID.test(r.id)&&!seen[r.id]){seen[r.id]=true;s.skus.push({id:r.id,count:n(r.count),lastSeen:stamp(r.lastSeen)});}});}return s;
  }catch(e){return s;}}
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function report(url){var state=load(), json=url===ROOT+'?format=json';var h={'Content-Type':json?'application/json; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"};
    if(json){h['Content-Disposition']='attachment; filename="g1-audit.json"';$done({response:{status:200,headers:h,body:JSON.stringify(state,null,2)}});return;}
    var rows=state.skus.map(function(r){return '<tr><td>'+esc(r.id)+'</td><td>'+r.count+'</td><td>'+esc(r.lastSeen)+'</td></tr>';}).join('');
    var html='<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>G1-AUDIT</title><style>body{font:16px system-ui;margin:22px;color:#202632;background:#fafafa}section{padding:14px;border:1px solid #ccc;border-radius:12px;margin:14px 0}a{color:#1763bb}table{border-collapse:collapse;width:100%;font-size:13px}td,th{padding:7px;text-align:left;border-bottom:1px solid #ddd;overflow-wrap:anywhere}td:first-child{max-width:190px}</style><h1>G1-AUDIT '+VERSION+'</h1><p>Локальный отчёт · пассивный режим</p><p><a href="'+ROOT+'">Обновить</a> · <a href="'+ROOT+'?format=json">JSON</a></p><section>Ответы: '+state.responses+'<br>Текстовые: '+state.textResponses+'<br>Пропущенные: '+state.skippedResponses+'<br>С SKU: '+state.matchedResponses+'<br>Уникальные SKU: '+state.skus.length+'<br>Последнее обновление UTC: '+esc(state.updatedAt||'нет данных')+'<br>Лимит достигнут: '+(state.truncated?'да':'нет')+'</section><section>Коды страны в явных полях: '+esc(state.countries.join(', ')||'нет данных')+'<br>Коды валют в явных полях: '+esc(state.currencies.join(', ')||'нет данных')+'<p>Это наблюдения из ответов, а не подтверждение региона аккаунта, цены или права на акцию.</p></section><table><thead><tr><th>SKU</th><th>Упоминания</th><th>UTC</th></tr></thead><tbody>'+rows+'</tbody></table><p>Тела запросов и ответов, заголовки, URL и учётные данные не сохраняются. Список SKU не является каталогом доступных покупок.</p></html>';
    $done({response:{status:200,headers:h,body:html}});
  }
  var url=typeof $request==='object'&&$request&&typeof $request.url==='string'?$request.url:'';
  if(typeof $response==='undefined') {if(url===ROOT||url===ROOT+'?format=json'){report(url);}else{$done({});}return;}
  if(!/^https:\/\/one\.google\.com\//.test(url)||url.indexOf(ROOT)===0){$done({});return;}
  try{
    var s=load(), now=new Date().toISOString(), body=$response&&$response.body;s.responses++;s.updatedAt=now;
    if(typeof body!=='string'||body.length>MAX_BODY){s.skippedResponses++;}else{
      s.textResponses++;
      var text=body.replace(/\\u002e|\\x2e|&#0*46;|&#x0*2e;|&period;/gi,'.');
      var token=/(^|[^A-Za-z0-9._@%/-])((?:g1\.|com\.google\.(?:one|gemini)\.)[a-z0-9._-]+)(?=$|[^A-Za-z0-9._@%/-])/g;
      var by=Object.create(null), m, matched=false;s.skus.forEach(function(r){by[r.id]=r;});
      while((m=token.exec(text))!==null){var id=m[2];if(!ID.test(id))continue;matched=true;if(!by[id]){if(s.skus.length>=LIMIT){s.truncated=true;continue;}by[id]={id:id,count:0,lastSeen:now};s.skus.push(by[id]);}by[id].count++;by[id].lastSeen=now;}
      if(matched)s.matchedResponses++;
      function fields(re,arr){var v;while((v=re.exec(text))!==null){if(arr.indexOf(v[1])===-1&&arr.length<40)arr.push(v[1]);}}
      fields(/"(?:countryCode|country_code|billingCountryCode)"\s*:\s*"([A-Z]{2})"/g,s.countries);
      fields(/"(?:currencyCode|currency_code|currency)"\s*:\s*"([A-Z]{3})"/g,s.currencies);
      s.skus.sort(function(a,b){return a.id<b.id?-1:a.id>b.id?1:0;});
    }
    $persistentStore.write(JSON.stringify(s),KEY);
  }catch(e){/* fail open; do not log raw data */}
  $done({});
})();
