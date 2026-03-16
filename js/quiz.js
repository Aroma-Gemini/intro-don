
function extractPlaylistId(url){
try{
let u=new URL(url)
return u.searchParams.get("list")
}catch{
return ""
}
}


async function loadPlaylist(){

videos=[]
titles=[]

let pageToken=""

while(true){

let url=`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`

if(pageToken){
url+=`&pageToken=${pageToken}`
}

const res=await fetch(url)
const data=await res.json()

data.items.forEach(v=>{
videos.push(v.snippet.resourceId.videoId)
titles.push(v.snippet.title)
})

if(!data.nextPageToken) break

pageToken=data.nextPageToken

}

}


async function startGame(){

let url=document.getElementById("playlistUrl").value
PLAYLIST_ID=extractPlaylistId(url)

if(!PLAYLIST_ID){
alert("プレイリストURLを入力してください")
return
}

playerName=document.getElementById("nickname").value || "PLAYER"

maxQuestions=parseInt(document.getElementById("questionCount").value)

document.getElementById("titleScreen").style.display="none"
document.getElementById("loadingScreen").style.display="flex"

await loadPlaylist()

if(videos.length < maxQuestions){
alert("プレイリストの曲数が足りません")
location.reload()
return
}

document.getElementById("loadingScreen").style.display="none"

document.getElementById("playerLabelName").textContent=playerName
document.getElementById("gameHeader").style.display="block"
document.getElementById("startBtn").classList.add("started")

nextQuestion()

}


function buzz(){

pauseVideo()

showBuzz()

answerInput.disabled=false
answerInput.focus()

}


function prepareNext(){

nextBtn.style.display="none"
document.getElementById("controls").style.display="none"

document.getElementById("answerTitle").style.opacity="0"
document.getElementById("answerTitle").innerText=""

pauseVideo()

setTimeout(()=>{
nextQuestion()
},1000)

}


function nextQuestion(){

if(question>=maxQuestions){
showScore()
return
}

question++

skipLock=false

document.getElementById("playerBox").style.display="block"

let text = question == maxQuestions ? "最終問題！" : "第"+question+"問"

document.getElementById("questionNumber").innerText =
question + " / " + maxQuestions

document.getElementById("questionText").innerText=text

answerInput.value=""
answerInput.disabled=true

document.getElementById("black").style.display="block"
document.getElementById("black").style.opacity="1"

setSEVol()
document.getElementById("seStart").play()

setTimeout(startVideo,2000)

}


function startVideo(){

document.getElementById("questionText").innerText=""

let i=Math.floor(Math.random()*videos.length)

currentVideo=videos[i]
currentAnswer=titles[i]

videos.splice(i,1)
titles.splice(i,1)

let iframe=document.getElementById("player")

iframe.src=`https://www.youtube.com/embed/${currentVideo}?autoplay=1&controls=0&enablejsapi=1&mute=1`

document.getElementById("controls").style.display="flex"
document.getElementById("answerBox").style.display="block"

setTimeout(applyPlayerVolume,400)
setTimeout(applyPlayerVolume,1200)
setTimeout(unmutePlayer,1300)

}


function revealAnswer(correct){

if(correct){

score++
judge("correct")

}else{

judge("wrong")

answerInput.disabled=true
answerInput.value=""

setTimeout(()=>{

let iframe=document.getElementById("player")

iframe.src=`https://www.youtube.com/embed/${currentVideo}?autoplay=1&controls=0&enablejsapi=1&mute=1`

setTimeout(applyPlayerVolume,400)
setTimeout(applyPlayerVolume,1200)
setTimeout(unmutePlayer,1300)

},2000)

return

}

setTimeout(()=>{
let iframe=document.getElementById("player")
iframe.src=`https://www.youtube.com/embed/${currentVideo}?start=60&autoplay=1&controls=0&enablejsapi=1&mute=1`
setTimeout(applyPlayerVolume,400)
setTimeout(applyPlayerVolume,1200)
setTimeout(unmutePlayer,1300)

},2000)

setTimeout(()=>{
document.getElementById("black").style.opacity="0"
},3000)

setTimeout(()=>{
document.getElementById("black").style.display="none"
},8000)

let title=document.getElementById("answerTitle")

title.innerText=currentAnswer

setTimeout(()=>{
title.style.opacity="1"
},6000)

document.getElementById("controls").style.display="none"

if(question == maxQuestions){
nextBtn.innerText="結果表示"
nextBtn.onclick=showScore
}else{
nextBtn.innerText="次の問題"
nextBtn.onclick=prepareNext
}

setTimeout(()=>{
nextBtn.style.display="inline-block"
},10000)

}


function checkAnswer(){

if(answerInput.disabled) return

let input=answerInput.value

showAnswer(input)

setTimeout(()=>{

let lower=input.toLowerCase()

if(currentAnswer.toLowerCase().includes(lower)){
revealAnswer(true)
}else{
revealAnswer(false)
}

},3000)

}


function skip(){

if(skipLock) return
skipLock=true

let iframe=document.getElementById("player")

iframe.src=`https://www.youtube.com/embed/${currentVideo}?start=60&autoplay=1&controls=0&enablejsapi=1&mute=1`

setTimeout(applyPlayerVolume,400)
setTimeout(applyPlayerVolume,1200)
setTimeout(unmutePlayer,1300)

setTimeout(()=>{
document.getElementById("black").style.opacity="0"
},3000)

setTimeout(()=>{
document.getElementById("black").style.display="none"
},9000)

let title=document.getElementById("answerTitle")

title.innerText=currentAnswer

setTimeout(()=>{
title.style.opacity="1"
},6000)

document.getElementById("controls").style.display="none"

if(question == maxQuestions){
nextBtn.innerText="結果表示"
nextBtn.onclick=showScore
}else{
nextBtn.innerText="次の問題"
nextBtn.onclick=prepareNext
}

setTimeout(()=>{
nextBtn.style.display="inline-block"
},10000)

}


function showScore(){

document.getElementById("playerBox").style.display="none"
document.getElementById("controls").style.display="none"
nextBtn.style.display="none"
document.getElementById("answerBox").style.display="none"

document.getElementById("questionNumber").style.display="none"
document.getElementById("answerTitle").style.display="none"

let screen=document.getElementById("scoreScreen")

screen.innerHTML=`${playerName} のスコア<br>${score} / ${maxQuestions}`

screen.style.display="block"

let replay=document.getElementById("replay")
replay.style.display="inline-block"
replay.onclick=()=>location.reload()

}