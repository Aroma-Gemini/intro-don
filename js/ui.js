function showBuzz(){

let overlay=document.getElementById("buzzOverlay")

if(!overlay){

overlay=document.createElement("div")
overlay.id="buzzOverlay"

overlay.style.position="absolute"
overlay.style.top="50%"
overlay.style.left="50%"
overlay.style.transform="translate(-50%,-50%)"
overlay.style.textAlign="center"
overlay.style.zIndex="70"
overlay.style.width="80%"
overlay.style.pointerEvents="none"

document.getElementById("playerBox").appendChild(overlay)

}

overlay.innerHTML=""

let name=document.createElement("div")
name.innerText=playerName
name.style.fontSize="clamp(32px,6vw,80px)"
name.style.fontWeight="bold"

let text=document.createElement("div")
text.innerText="回答権を獲得！"
text.style.fontSize="clamp(28px,5vw,70px)"

overlay.appendChild(name)
overlay.appendChild(text)

}


function showAnswer(text){

let buzz=document.getElementById("buzzOverlay")
if(buzz) buzz.innerHTML=""

let overlay=document.getElementById("answerOverlay")

if(!overlay){

overlay=document.createElement("div")
overlay.id="answerOverlay"

overlay.style.position="absolute"
overlay.style.top="50%"
overlay.style.left="50%"
overlay.style.transform="translate(-50%,-50%)"
overlay.style.textAlign="center"
overlay.style.zIndex="80"
overlay.style.width="80%"
overlay.style.pointerEvents="none"

document.getElementById("playerBox").appendChild(overlay)

}

overlay.innerHTML=""

let name=document.createElement("div")
name.innerText=playerName
name.style.fontSize="clamp(28px,5vw,60px)"
name.style.fontWeight="bold"

let ans=document.createElement("div")
ans.innerText=text
ans.style.fontWeight="bold"
ans.style.whiteSpace="nowrap"

overlay.appendChild(name)
overlay.appendChild(ans)

/* 自動サイズ調整 */

let size=70

ans.style.fontSize=size+"px"

while(ans.scrollWidth > overlay.clientWidth && size>20){

size-=2
ans.style.fontSize=size+"px"

}

setTimeout(()=>{
overlay.innerHTML=""
},3000)

}


function judge(type){

let img=document.getElementById("judge")

img.src="img/"+type+".png"

img.style.display="block"

if(type==="correct"){
document.getElementById("seCorrect").play()
}else{
document.getElementById("seWrong").play()
}

setTimeout(()=>{
img.style.display="none"
},2000)

}