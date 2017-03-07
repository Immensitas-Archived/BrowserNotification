var type = "LIVE";
var version = "v1";
var status = {};
var advid = 'VIZVRMXYZ';
var target = "XXXX.vizury.com";

self.addEventListener('install', function(event) {
  self.skipWaiting()
  .catch(function(err){
    logError(err);
  });
});

self.addEventListener('activate', function(event) {
});

self.addEventListener('push', function(event) {
  try {
    var data = event.data ? event.data.text() : '{}';  
    data = JSON.parse(data);
    var showAd = true;
    if( !(data.hasOwnProperty('bannerid') && data.hasOwnProperty('zoneid') && data.hasOwnProperty('notificationid') && data.hasOwnProperty('title') && data.hasOwnProperty('body') && data.hasOwnProperty('icon') && data.hasOwnProperty('lp') )){
      showAd = false;
    }
    uuid = getUuid();
    status[uuid] = 1;
    var epoch = (new Date).getTime();

var vizObj= { body: data.body,icon: data.icon,tag: data.tag,requireInteraction : true,data: {url: data.lp, ts: epoch, notificationid:data.notificationid, bannerid:data.bannerid, zoneid:data.zoneid, uuid: uuid, time_to_live:data.time_to_live}};

if(data.b1_lp) {vizObj.data.b1_lp = data.b1_lp }
if(data.b2_lp) {vizObj.data.b2_lp = data.b2_lp }

if((data.b1_t && data.b2_t) && (isNaN(data.b1_t) && isNaN(data.b2_t)))  {vizObj.actions =  [{action: 'but1', title: data.b1_t, url: data.b1_lp},{action: 'but2', title: data.b2_t, url:data.b2_lp}]}
else if(data.b1_t  && isNaN(data.b1_t)) {vizObj.actions =  [{action: 'but1', title: data.b1_t, url: data.b1_lp}]}

var not_ttl = 20000;
if(data.not_ttl) {
    not_ttl = data.not_ttl;
}


    if(showAd){
      event.waitUntil(
        self.registration.showNotification(data.title, vizObj).then(function(){
          logEvent(uuid, 'PUSH', epoch, data.bannerid, data.notificationid, data.zoneid);
          self.registration.getNotifications()
          .then(function(nots){
            for (var i=0;i<nots.length; i++){
              if(nots[i].data.uuid === uuid){
                var n = nots[i];
                setTimeout(function(){
                  if(status[uuid] === 1){
                    delete status[uuid];
                    n.close();                    
                    epoch = (new Date).getTime();
                    logEvent(uuid, 'DISMISS', epoch, data.bannerid, data.notificationid, data.zoneid);
                  }  
                  delete status[uuid];                
                },not_ttl);
              }
            }
          }).catch(function(err){
            logError(err.message);
          })               
        }).catch(function(err){
          logError(err.message);
        })
      );
    } else{
      logError("Not sufficient data to show push");
    }
  } catch(err){
    logError("Error in push " + err.message);
  }
});

self.addEventListener('notificationclick', function(event) {   
  delete status[event.notification.data.uuid];
  var targetUrl  = event.notification.data && event.notification.data.url;
  if(event.action === 'but1'){
          logEvent(event.notification.data.uuid, 'CLICK-YES', epoch, event.notification.data.bannerid, event.notification.data.notificationid, event.notification.data.zoneid);
         if(event.notification.data.b1_lp)
             clients.openWindow(event.notification.data.b1_lp);
         else
             clients.openWindow(targetUrl);
  }
  else if(event.action === 'but2'){
          logEvent(event.notification.data.uuid, 'CLICK-NO', epoch, event.notification.data.bannerid, event.notification.data.notificationid, event.notification.data.zoneid);
        if(event.notification.data.b2_lp)
            clients.openWindow(event.notification.data.b2_lp);
        else
            clients.openWindow(targetUrl);
  }
  var epoch = (new Date).getTime();
  logEvent(event.notification.data.uuid, 'CLICK', epoch, event.notification.data.bannerid, event.notification.data.notificationid, event.notification.data.zoneid);  
  event.notification.close();
  if(targetUrl)
    event.waitUntil(  clients.openWindow(targetUrl) );
});

self.addEventListener('notificationclose', function(event) {  
  delete status[event.notification.data.uuid]; 
  var epoch = (new Date).getTime();
  logEvent(event.notification.data.uuid, 'CLOSE', epoch, event.notification.data.bannerid, event.notification.data.notificationid, event.notification.data.zoneid); 
});

self.addEventListener('error', function(event) {
  logError("Error on service worker install");
});

logEvent = function logEvent(tag, action, ts, bnid, iid, zoneid){
  if(action === 'PUSH')
    logImpression(bnid,zoneid,iid);
  if(action === 'CLICK')
    logClick(bnid,zoneid,iid);
  var notify = "https://"+target+"/analyze/ecnotification?"+"&version="+version+"&action="+action+"&tag="+tag+"&bnid="+bnid+"&iid="+iid+"&ts="+ts;
  fetch(notify,{credentials: 'include'})
}

logImpression = function logImpression(bnid,znid,iid) {
  var notify = "https://www.vizury.com/banners/images/common/mobile_notify.php?t=impr&u=&adid="+bnid+"&zid="+znid+"&iid="+iid+"&ibid=bpush&p=price&eid=_bpush";
  fetch(notify,{credentials: 'include'})
}

logClick = function logClick(bnid,znid,iid) {
  var notify = "https://www.vizury.com/vizserver//www/delivery/ck.php?oaparams=2__bannerid="+bnid+"__zoneid="+znid+"__deviceid=__vzimid="+iid+"__sfpc=";
  fetch(notify,{credentials: 'include'})
}

logError = function logError(err){
  if(type === 'LIVE' || type ==="DEMO" ){
    var message = encodeURIComponent(err);
    var notify = "https://"+target+"/analyze/error?message="+message+"&advid="+advid+"&version="+version;
    fetch(notify,{credentials: 'include'})
  } else{
    console.log(err);
  }
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
function getUuid(){
  return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
} 


