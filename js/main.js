const startBtn=document.getElementById("startBtn")

const hostBtn=document.getElementById("hostBtn")
const joinBtn=document.getElementById("joinBtn")
const buzzBtn=document.getElementById("buzz")
const skipBtn=document.getElementById("skip")
const nextBtn=document.getElementById("next")
const submitBtn=document.getElementById("submitBtn")

const answerInput=document.getElementById("answerInput")

startBtn.onclick = async () => {
  const urlInput = document.getElementById("playlistUrl").value;
  const count = document.getElementById("questionCount").value;
  const name = document.getElementById("nickname").value;

  if(name === "") return alert("ニックネームを入力してください");

  const playlistId = extractPlaylistId(urlInput);
  if (!playlistId) return alert("有効なプレイリストURLを入力してください");

  // 【重要】ホスト自身もプレイヤーとして登録
  await set(ref(window.db, "rooms/" + roomId + "/players/" + name), {
    name: name,
    score: 0
  });

  await set(ref(window.db, "rooms/" + roomId + "/settings"), {
    playlistId: playlistId,
    questionCount: count
  });

  set(ref(window.db, "rooms/" + roomId + "/status"), "start");
  startGame();
};

buzzBtn.onclick=buzz
skipBtn.onclick=skip
nextBtn.onclick=prepareNext
submitBtn.onclick=checkAnswer

function getVol(){
return document.getElementById("volume").value/100
}

function setSEVol(){
document.getElementById("seStart").volume=getVol()
document.getElementById("seCorrect").volume=getVol()
document.getElementById("seWrong").volume=getVol()
}

document.getElementById("volume").oninput=setSEVol



hostBtn.onclick=()=>{
    isHost = true; // ホストフラグを立てる
    roomId=Math.floor(1000+Math.random()*9000)

console.log("ROOM ID:",roomId)

watchPlayers(roomId)

document.getElementById("roomDisplay").innerText="ROOM "+roomId
document.getElementById("roomDisplay").style.display="block"

hostBtn.style.display="none"
joinBtn.style.display="none"

document.getElementById("playlistBox").style.display="block"
document.getElementById("nickname").style.display="block"
document.getElementById("questionCount").style.display="block"
startBtn.style.display="block"

document.getElementById("roomId").style.display="none"

}



joinBtn.onclick=()=>{

hostBtn.style.display="none"
joinBtn.style.display="none"

document.getElementById("roomId").style.display="block"
document.getElementById("nickname").style.display="block"

document.getElementById("playlistBox").style.display="none"
document.getElementById("questionCount").style.display="none"
document.getElementById("startBtn").style.display="none"

document.getElementById("joinRoomBtn").style.display="block"

}



joinRoomBtn.onclick=()=>{
    isHost = false; // ←これを追加！
    let name=document.getElementById("nickname").value

let room=document.getElementById("roomId").value

if(name==="") return alert("ニックネームを入力してください")
if(room==="") return alert("部屋IDを入力してください")

console.log("NAME:",name)
console.log("ROOM:",room)

set(ref(window.db,"rooms/"+room+"/players/"+name),{
name:name,
score:0
})

roomId = room

watchStart(room)

document.getElementById("title").innerHTML =
"<h2>参加しました</h2><p>ホストの開始を待っています...</p>"

}



function watchPlayers(room){

const playersRef = ref(window.db,"rooms/"+room+"/players")

onValue(playersRef,(snapshot)=>{

const data = snapshot.val()

const list = document.getElementById("playerList")

list.innerHTML=""

if(!data) return

Object.values(data).forEach(player=>{

const div=document.createElement("div")
div.innerText=player.name

list.appendChild(div)

})

})

}



function watchStart(room){

const statusRef = ref(window.db,"rooms/"+room+"/status")

onValue(statusRef,(snapshot)=>{

const status = snapshot.val()

if(status==="start"){
startGame()
}

})

}