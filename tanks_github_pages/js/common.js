
const SS={get(k,f){try{const v=sessionStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}},set(k,v){try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const DEFAULT_CFG={speedF:140,speedB:90,turn:2.8,turretTurn:4.5,bulletSpeed:520,reload:450,bulletDmg:34,fuelRate:1.0,fuelGain:25,barrelDmg:28,barrelRad:60,barrelSpawn:13500,fogRadiusUnits:7,fogDark:30,fps:15,mapScale:100,camScale:100,lives:3};
function getConfig(){return Object.assign({},DEFAULT_CFG,SS.get("config",{}))} function setConfig(cfg){SS.set("config",cfg)}
function getScores(){return SS.get("scores",[])} function setScores(a){SS.set("scores",a)}
function nav(){return `<nav><a href="index.html">Меню</a><a href="play.html">Играть</a><a href="admin.html">Админка</a><a href="scores.html">Рекорды</a></nav>`}
