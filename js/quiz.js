function extractPlaylistId(url){
  try{
    let u = new URL(url);
    return u.searchParams.get("list");
  }catch{
    return "";
  }
}

async function loadPlaylist(){
  videos = []; titles = []; let pageToken = "";
  try {
    while(true){
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
      if(pageToken) url += `&pageToken=${pageToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) break;
      if(!data.items) break;
      data.items.forEach(v => {
        videos.push(v.snippet.resourceId.videoId);
        titles.push(v.snippet.title);
      });
      if(!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }
  } catch (e) { console.error(e); }
}

async function startGame(){
  document.getElementById("titleScreen").style.display="none";
  document.getElementById("gameScreen").style.display="block";
  document.getElementById("loadingScreen").style.display="flex";

  onValue(ref(window.db, "rooms/" + roomId + "/settings"), async (snapshot) => {
    const settings = snapshot.val();
    if (!settings) return;
    PLAYLIST_ID = settings.playlistId;
    maxQuestions = settings.questionCount;
    playerName = document.getElementById("nickname").value || "PLAYER";
    await loadPlaylist();
    document.getElementById("loadingScreen").style.display="none";
    document.getElementById("playerLabelName").textContent = playerName;
    document.getElementById("gameHeader").style.display="block";
    document.getElementById("startBtn").classList.add("started");
    watchQuiz(); 
    nextQuestion();
  }, { onlyOnce: true }); 
}

async function buzz(){
  const buzzBtn = document.getElementById("buzz");
  if(buzzBtn.disabled) return;
  buzzBtn.disabled = true;
  set(ref(window.db, "rooms/" + roomId + "/buzzer"), { name: playerName, timestamp: Date.now() });
}

function prepareNext(){
  nextBtn.style.display="none";
  document.getElementById("controls").style.display="none";
  document.getElementById("answerTitle").style.opacity="0";
  document.getElementById("answerTitle").innerText="";
  pauseVideo();
  setTimeout(()=>{ nextQuestion(); }, 1000);
}

function nextQuestion(){
  if(!isHost) return;
  if(question >= maxQuestions){
    set(ref(window.db, "rooms/" + roomId + "/status"), "end");
    return;
  }
  let i = Math.floor(Math.random() * videos.length);
  let nextVideo = videos[i]; let nextAnswer = titles[i];
  videos.splice(i, 1); titles.splice(i, 1);
  set(ref(window.db, "rooms/" + roomId + "/currentQuiz"), {
    video: nextVideo, answer: nextAnswer, qNum: question + 1, timestamp: Date.now()
  });
}

function startVideo(quizData){
  document.getElementById("questionText").innerText = "";
  currentVideo = quizData.video;
  currentAnswer = quizData.answer;
  question = quizData.qNum;
  let iframe = document.getElementById("player");
  iframe.src = `https://www.youtube.com/embed/${currentVideo}?autoplay=1&controls=0&mute=1&enablejsapi=1`;
  document.getElementById("controls").style.display = "flex";
  document.getElementById("answerBox").style.display = "block";
  setTimeout(applyPlayerVolume, 400);
  setTimeout(applyPlayerVolume, 1200);
  setTimeout(unmutePlayer, 1300);
}

function checkAnswer(){
  if(answerInput.disabled) return;
  let input = answerInput.value;
  set(ref(window.db, "rooms/" + roomId + "/lastSubmit"), { text: input, playerName: playerName, timestamp: Date.now() });
  setTimeout(() => {
    let lower = input.toLowerCase();
    if(currentAnswer.toLowerCase().includes(lower)){
      set(ref(window.db, "rooms/" + roomId + "/lastResult"), { type: "correct", answer: currentAnswer, timestamp: Date.now() });
      score++;
      // 【同期】自分のスコアをFirebaseに保存
      set(ref(window.db, "rooms/" + roomId + "/players/" + playerName + "/score"), score);
    } else {
      set(ref(window.db, "rooms/" + roomId + "/lastResult"), { type: "wrong", answer: currentAnswer, timestamp: Date.now() });
    }
  }, 3000);
}

function skip(){
  if(skipLock) return;
  skipLock = true;
  const skipBtn = document.getElementById("skip");
  skipBtn.style.opacity = "0.5";
  set(ref(window.db, "rooms/" + roomId + "/skips/" + playerName), true);
}

async function showScore(){
  // 画面の掃除（★playerBoxを消さないのが音を残すコツ！）
  document.getElementById("controls").style.display="none";
  nextBtn.style.display="none";
  document.getElementById("answerBox").style.display="none";
  document.getElementById("questionNumber").style.display="none";
  document.getElementById("answerTitle").style.display="none";
  document.getElementById("black").style.display="none";

  const screen = document.getElementById("scoreScreen");
  screen.style.display = "block";
  
  // タイトルをセット
  screen.innerHTML = "<h2>🏆 最終ランキング 🏆</h2><div id='rankingList'></div>";

  const playersRef = ref(window.db, "rooms/" + roomId + "/players");
  onValue(playersRef, (snapshot) => {
    const playersData = snapshot.val();
    if (!playersData) return;

    let rankingArray = Object.keys(playersData).map(key => {
      return { name: key, score: playersData[key].score || 0 };
    });
    rankingArray.sort((a, b) => b.score - a.score);

    // 表の組み立て（white-space: nowrap; で改行を強制禁止！）
    let html = "<table style='margin: 30px auto; width: 100%; border-collapse: collapse;'>";
    rankingArray.forEach((player, index) => {
      const rank = index + 1;
      let sizeClass = (rank === 1) ? "rank-1" : (rank === 2) ? "rank-2" : (rank === 3) ? "rank-3" : "rank-others";
      let medal = (rank === 1) ? "🥇" : (rank === 2) ? "🥈" : (rank === 3) ? "🥉" : `${rank}位`;

      html += `
        <tr class="${sizeClass}" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 10px; text-align: center; white-space: nowrap;">${medal}</td>
          <td style="padding: 10px; text-align: left; white-space: nowrap;">${player.name}</td>
          <td style="padding: 10px; text-align: right; white-space: nowrap;">${player.score}点</td>
        </tr>`;
    });
    html += "</table>";
    document.getElementById("rankingList").innerHTML = html;
  }, { onlyOnce: true });

  // 再プレイボタン
  let replay = document.getElementById("replay");
  replay.style.display = "inline-block";
  replay.onclick = () => location.reload();
}

function watchQuiz(){
  // 1. 問題の監視
  onValue(ref(window.db, "rooms/" + roomId + "/currentQuiz"), (snapshot) => {
    const data = snapshot.val();
    if(!data) return;

    pauseVideo();
    document.getElementById("player").src = "";

    if(isHost) {
      set(ref(window.db, "rooms/" + roomId + "/buzzer"), null);
      set(ref(window.db, "rooms/" + roomId + "/lastSubmit"), null);
      set(ref(window.db, "rooms/" + roomId + "/lastResult"), null);
      set(ref(window.db, "rooms/" + roomId + "/skips"), null);
    }

    const black = document.getElementById("black");
    black.classList.remove("fade-out");
    black.style.display = "block";
    black.style.opacity = "1";

    skipLock = false;
    const skipBtn = document.getElementById("skip");
    skipBtn.style.opacity = "1";
    skipBtn.innerText = "わからない";

    document.getElementById("playerBox").style.display = "block";
    document.getElementById("questionText").innerText = "";
    document.getElementById("answerTitle").style.opacity = "0";

    setTimeout(() => {
      let text = data.qNum == maxQuestions ? "最終問題！" : "第" + data.qNum + "問";
      document.getElementById("questionNumber").innerText = data.qNum + " / " + maxQuestions;
      document.getElementById("questionText").innerText = text;
      answerInput.value = ""; answerInput.disabled = true; answerInput.placeholder = "曲名入力";
      setSEVol(); document.getElementById("seStart").play();
    }, 1000);

    setTimeout(() => { startVideo(data); }, 2500);
  });

  // 2. 回答ボタンの監視
  onValue(ref(window.db, "rooms/" + roomId + "/buzzer"), (snapshot) => {
    const data = snapshot.val();
    const buzzBtn = document.getElementById("buzz");
    if(data) {
      buzzBtn.disabled = true; buzzBtn.style.opacity = "0.5"; pauseVideo();
      const tempName = playerName; playerName = data.name; showBuzz(); playerName = tempName;
      if(data.name === playerName){
        answerInput.disabled = false; answerInput.focus();
        answerInput.placeholder = "回答を入力してください！";
      } else {
        answerInput.disabled = true;
        answerInput.placeholder = data.name + "さんが回答中...";
      }
    } else {
      buzzBtn.disabled = false; buzzBtn.style.opacity = "1";
      answerInput.placeholder = "曲名入力";
    }
  });

  // 3. 回答内容の監視
  onValue(ref(window.db, "rooms/" + roomId + "/lastSubmit"), (snapshot) => {
    const data = snapshot.val();
    if(!data) return;
    const temp = playerName; playerName = data.playerName; showAnswer(data.text); playerName = temp;
  });

  // 4. 結果の監視
  onValue(ref(window.db, "rooms/" + roomId + "/lastResult"), (snapshot) => {
    const data = snapshot.val();
    if(!data) return;
    if(data.type === "correct") {
      judge("correct"); handleReveal(true, data.answer);
    } else {
      judge("wrong"); handleReveal(false, data.answer);
    }
  });

  // 5. スキップ投票の監視
  onValue(ref(window.db, "rooms/" + roomId + "/skips"), (skipSnapshot) => {
    const skipData = skipSnapshot.val() || {};
    const skipCount = Object.keys(skipData).length;
    onValue(ref(window.db, "rooms/" + roomId + "/players"), (playerSnapshot) => {
      const playerData = playerSnapshot.val() || {};
      const playerCount = Object.keys(playerData).length;
      const skipBtn = document.getElementById("skip");
      if(skipLock) skipBtn.innerText = `${skipCount} / ${playerCount} 待機中...`;
      if(playerCount > 0 && skipCount === playerCount) {
        handleReveal(true, currentAnswer); 
      }
    }, { onlyOnce: true });
  });

  onValue(ref(window.db, "rooms/" + roomId + "/status"), (snapshot) => {
    if(snapshot.val() === "end") showScore();
  });
}

function handleReveal(isCorrect, answerText) {
  const black = document.getElementById("black");
  answerInput.disabled = true; answerInput.value = "";

  if(isCorrect) {
    black.classList.add("fade-out");
    setTimeout(() => {
      let iframe = document.getElementById("player");
      iframe.src = `https://www.youtube.com/embed/${currentVideo}?start=60&autoplay=1&controls=0&mute=1&enablejsapi=1`;
      setTimeout(applyPlayerVolume, 400); setTimeout(unmutePlayer, 1300);
    }, 2000);

    setTimeout(() => { black.style.opacity = "0"; }, 6000);
    let title = document.getElementById("answerTitle");
    title.innerText = answerText;
    setTimeout(() => { title.style.opacity = "1"; }, 9000);

    if(isHost) {
      setTimeout(() => {
        nextBtn.style.display = "inline-block";
        nextBtn.innerText = (question >= maxQuestions) ? "結果表示" : "次の問題";
      }, 13000);
    }
  } else {
    setTimeout(() => {
      let iframe = document.getElementById("player");
      iframe.src = `https://www.youtube.com/embed/${currentVideo}?autoplay=1&controls=0&mute=1&enablejsapi=1`;
      setTimeout(applyPlayerVolume, 400); setTimeout(unmutePlayer, 1300);
      if(isHost) {
        set(ref(window.db, "rooms/" + roomId + "/buzzer"), null);
        set(ref(window.db, "rooms/" + roomId + "/lastSubmit"), null);
        set(ref(window.db, "rooms/" + roomId + "/lastResult"), null);
      }
    }, 2000);
  }
}