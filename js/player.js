function pauseVideo(){

let iframe=document.getElementById("player")

iframe.contentWindow.postMessage(
'{"event":"command","func":"pauseVideo","args":""}','*'
)

}

function applyPlayerVolume(){

let volume=document.getElementById("volume").value

let iframe=document.getElementById("player")

iframe.contentWindow.postMessage(
`{"event":"command","func":"setVolume","args":[${volume}]}`,
'*'
)

}