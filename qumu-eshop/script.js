// key AIzaSyCjIAAMHQW2bQi5H9-w1lEdcRrfQGuf15g
var tab = location.hash.slice(1);
var content = document.querySelector(".content");

const key = "AIzaSyCjIAAMHQW2bQi5H9-w1lEdcRrfQGuf15g";
const qumu = "UC0QbcOX2gI5zruEvpSmnf6Q";

var nextPageToken = null;

function createCard(id){
    var link = document.createElement("a");
    link.className = "card-container";
    link.href = `http://youtu.be/${id}`;

    var card = document.createElement("div");
    card.className = "card";

    var thumbnail = document.createElement("div");
    thumbnail.className = "vd-thumb";
    var thumbimg = document.createElement("img");
    thumbimg.src = `http://img.youtube.com/vi/${id}/sddefault.jpg`;
    thumbnail.appendChild(thumbimg);

    card.appendChild(thumbnail);

    var purchaseNotice = document.createElement("div");
    purchaseNotice.className = "pnotice";
    purchaseNotice.innerText = "Free w/ attr.";

    card.appendChild(purchaseNotice);

    link.appendChild(card);

    return link;
}

async function getVideos(pageToken){
    var url = `https://www.googleapis.com/youtube/v3/search?key=${key}&channelId=${qumu}&part=snippet,id&order=date&maxResults=20`;
    if(pageToken){
        url+=`&pageToken=${pageToken}`;
    }
    var videos = JSON.parse(await(await fetch(url)).text());
    return videos;
}

function soon(){
    var wtf = document.createElement("h1");
    wtf.innerHTML = "go ask Qumu. &#128528;";
    wtf.className = "large";
    content.appendChild(wtf);
}

async function recent(){
    var videos = (await getVideos());
    videos.items.slice(0,12).forEach(v=>{
        content.appendChild(createCard(v.id.videoId));
    });
}

var lm;

async function discover(){
    await loadMore();
}

async function loadMore(){
    var videos = (await getVideos(nextPageToken));
    videos.items.forEach(v=>{
        content.appendChild(createCard(v.id.videoId));
    });
    nextPageToken = videos.nextPageToken;

    if(lm){
        content.removeChild(lm);
    } else {
        lm = document.createElement("button");
        lm.className = "loadmore";
        lm.innerText = "Load More";
        lm.onclick = loadMore;
    }
    if(nextPageToken){
        content.appendChild(lm);
    }
}

var tabs = {
    "discover":discover,
    "recent":recent,
    "soon":soon
}

function init(){
    document.querySelectorAll(".sidebar div a").forEach(el=>{
        console.log(el);
        el.addEventListener("click",()=>{
            location = el.href;
            location.reload();
        });
    });
    document.querySelector(location.hash).className += "sbselected";

    if(tabs[tab] instanceof Function){
        tabs[tab]();
    }
}

if(!Object.keys(tabs).includes(tab)){
    location.hash="recent";
}
init();
