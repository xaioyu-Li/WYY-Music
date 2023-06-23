// 解决 click 事件的300ms延迟问题
FastClick.attach(document.body);

(async function () {
    let header = document.querySelector('.header'),
        apronBox = document.querySelector('.apron'),
        markImage = document.querySelector('.mark-image'),
        audioBox = document.querySelector('#audioBox'),
        loadingBox = document.querySelector('.loading-box'),
        lyricItem = document.querySelector('.lyric-item'),
        lyricWrapper = document.querySelector('.lyric-wrapper'),
        lyricTitle = document.querySelector('.lyric-title'),
        playBox = document.querySelector('.play-box'),
        barBox = document.querySelector('.bar'),
        currentBox = barBox.querySelector('.current'),
        durationBox = barBox.querySelector('.duration'),
        alreadyBox = barBox.querySelector('.already');
    let lyricList = [],
        timer = null,
        matchNum = 0;
    /* 音乐控制 */
    const format = function format(time) {
        let minutes = Math.floor(time / 60),
            seconds = Math.floor(time - minutes * 60)
        minutes = minutes < 10 ? '0' + minutes : '' + minutes
        seconds = seconds < 10 ? '0' + seconds : '' + seconds
        return {
            minutes,
            seconds
        }
    }


    const playend = function playend() {
        clearInterval(timer)
        timer = null
        lyricItem.style.transform = 'translateY(0)'
        lyricList.forEach(item => item.className = '')
        matchNum = 0
    }
    const handle = function handle() {
        let pH = lyricList[0].offsetHeight
        let { currentTime, duration } = audioBox
        if (isNaN(currentTime) || isNaN(duration)) return
        if (currentTime >= duration) {
            playend();
            return
        }
        //控制进度条
        let { minutes: currentTimeMinutes, seconds: currentTimeSeconds } = format(currentTime),
            { minutes: durationMinutes, seconds: durationSeconds } = format(duration),
            ratio = Math.round(currentTime / duration * 100)
        currentBox.innerHTML = `${currentTimeMinutes}:${currentTimeSeconds}`
        durationBox.innerHTML = `${durationMinutes}:${durationSeconds}`
        alreadyBox.style.width = `${ratio}%`
        let matchs = lyricList.filter(item => {
            let minutes = item.getAttribute('minutes'),
                seconds = item.getAttribute('seconds')
            return minutes === currentTimeMinutes && seconds === currentTimeSeconds;
        })
        if (matchs.length > 0) {
            lyricList.forEach(item => item.className = '')
            matchs.forEach(item => item.className = 'active')
        }
        matchNum += matchs.length
        console.log(matchNum);
        if (matchNum > 4) {
            let offset = (matchNum - 4) * pH
            lyricItem.style.transform = `translateY(${-offset}px)`;
        }
    }
    /* 播放音乐 */
    playBox.addEventListener('click', function () {
        if (audioBox.paused) {
            audioBox.play()
            handle()
            if (!timer) timer = setInterval(handle, 1000)
            apronBox.classList.add('move')
            apronBox.style.animationPlayState = 'running'
            playBox.style.opacity = '0'
            return
        }
        audioBox.pause()
        apronBox.style.animationPlayState = 'paused'
        clearInterval(timer)
        playBox.style.opacity = '1'
        timer = null
    })




    const bindLyric = function bindLyric(lyric) {
        let arr = [];
        lyric = lyric.replace(/\[(\d+):(\d+).(?:\d+)\](.+)\n/g, (_, $1, $2, $3) => {
            arr.push({
                minutes: $1,
                seconds: $2,
                text: $3
            });
        })
        let str = ``;
        arr.forEach(({ minutes, seconds, text }) => {
            str += `
                <p minutes="${minutes}" seconds="${seconds}">
                ${text}</p>`
        })
        lyricItem.innerHTML = str;
        lyricList = Array.from(lyricItem.querySelectorAll('p'));
    }


    const binding = function binding(data) {
        let { title, title1, author, duration, pic, pic1, pic2, audio, lyric } = data;
        header.innerHTML = `
        <div class="header-img">
            <img src="${pic}"
            alt="">
            <a href="">${title}</a>
        </div>
        <a class="have">打开看看></a> `;
        apronBox.innerHTML = `
            <div class="cove">
                <img src="${pic1}"
                alt="">
            </div>`;
        lyricTitle.innerHTML = `
                <span>${title1}</span>
                <i>-</i>
                <p>${author}</p> `
        markImage.style.backgroundImage = `url(${pic2})`;
        audioBox.src = audio;
        bindLyric(lyric)
        loadingBox.style.display = 'none'
    };
    try {
        let { code, data } = await API.queryLyric();
        if (+code === 0) {
            binding(data);
            return
        }
    } catch (_) { }
    alert('网络繁忙，请刷新页面');
})()