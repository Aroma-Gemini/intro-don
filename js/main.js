const startBtn=document.getElementById("startBtn")
const buzzBtn=document.getElementById("buzz")
const skipBtn=document.getElementById("skip")
const nextBtn=document.getElementById("next")
const submitBtn=document.getElementById("submitBtn")

const answerInput=document.getElementById("answerInput")

startBtn.onclick=startGame
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