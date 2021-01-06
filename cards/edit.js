var rmx,rmy=0;
var contextMenuSubject=null;
var mousedown=false;

var cards=[];

function isColorBright(c){ // This code was copied from https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black? by Alnitak. This code was modified. This function is licensed under the CC-BY-SA 4.0 license.
    var c = c.slice(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue
    
    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    
    return luma>=200;
}

function $(query){
    return document.querySelector(query);
}

function card(header,content,x,y,color,w,h){
    x=x||"0px";
    y=y||"60px";
    color=color||"#ff8f7f";
    var card={
        color:color,
        card:document.createElement("div"),
        header:document.createElement("div"),
        headertext:document.createElement("input"),
        content:document.createElement("div"),
        close:document.createElement("button"),
    };
    card.card.onmousedown=function(e){e.stopPropagation();};

    function startDrag(e){ // copying some code from w3schools, dont mind me
        document.activeElement.blur();
        if(e.button==0){
            rmx = e.clientX;
            rmy = e.clientY;
            document.addEventListener("mouseup",stopDrag);
            document.addEventListener("mousemove",drag);
            e.stopPropagation();
        }
    }
    function drag(e){
        var newx=card.card.offsetLeft-(rmx-e.clientX);
        var newy=card.card.offsetTop-(rmy-e.clientY);
        if(newx<0){
            newx=0;
        }
        if(newy<60){
            newy=60;
        }
        card.card.style.left=newx+"px";
        card.card.style.top=newy+"px";
        rmx = e.clientX;
        rmy = e.clientY;
    }
    function stopDrag(){
        $("#cards").appendChild($("#cards").removeChild(card.card));
        document.removeEventListener("mouseup",stopDrag);
        document.removeEventListener("mousemove",drag);
    }
    
    card.card.className="card";
    card.card.style.backgroundColor=color;
    if(w!==undefined){card.card.style.width=w;}
    if(h!==undefined){card.card.style.height=h;}
    card.card.style.top=y;
    card.card.style.left=x;
    
    card.close.innerHTML="&#10006";
    card.close.className="close";
    
    card.close.onclick=function(){
        cards.splice(cards.indexOf(card),1);
        $("#cards").removeChild(card.card);
    };
    card.close.onmousedown=function(e){e.stopPropagation();};
    function focusHeader(e){
        $("#cards").appendChild($("#cards").removeChild(card.card));
        card.headertext.onfocus=null;
        card.headertext.focus();
        document.execCommand("selectAll");
        card.headertext.onfocus=focusHeader;
    }

    card.headertext.onfocus=focusHeader;
    card.headertext.onmousedown=function(e){e.stopPropagation();};
    
    card.header.className="header";
    card.header.draggable=false;
    card.headertext.type='text';
    card.headertext.className="headertext";
    card.headertext.value=header;
    card.headertext.style.color=isColorBright(card.color)?"black":"white";
    card.headertext.spellcheck=false;
    card.header.appendChild(card.headertext);
    card.header.appendChild(card.close);

    card.header.onmousedown=startDrag;
    card.header.style.cursor="move";

    card.content.innerHTML=content;
    card.content.className="content";
    card.content.contentEditable=true;

    card.card.appendChild(card.header);
    card.card.appendChild(card.content);
    
    card.card.oncontextmenu=function(e){
        e.preventDefault();
        $("#contextMenu").style.left=e.clientX+"px";
        $("#contextMenu").style.top=e.clientY+"px";
        $("#contextMenu").style.display="block";
        contextMenuSubject=card;
    };

    $("#cards").appendChild(card.card);
    
    cards.push(card);
    return card;
}

document.body.addEventListener("mousemove",function(e){
    if(e.clientY<60){
        $("#toolbar").style.top="0px";
    } else {
        $("#toolbar").style.top="-30px";
    }

});

document.body.onclick=function(){
    $("#contextMenu").style.display="none";
}

function changeColor(){
    var cs=$("#colorselect");
    cs.value=contextMenuSubject.color;
    cs.click();
    cs.onchange=function(){
        contextMenuSubject.card.style.backgroundColor=this.value.toString();
        contextMenuSubject.color=this.value.toString();
        contextMenuSubject.headertext.style.color=isColorBright(contextMenuSubject.color)?"black":"white";
    }.bind(cs);
}
function duplicateCard(){
    var cardSave=cardToSaveJSON(contextMenuSubject);
    console.log(cardSave);
    console.log((cardSave.x+50)+"px",(cardSave.y+50)+"px");
    card(cardSave.header,cardSave.content,(cardSave.x+50)+"px",(cardSave.y+50)+"px",cardSave.color,cardSave.w,cardSave.h);
}
function removeCard(){
    cards.splice(cards.indexOf(contextMenuSubject),1);
    $("#cards").removeChild(contextMenuSubject.card);
}

function newCard(){
    card("New Card","");
}

var darktheme=localStorage.getItem("NotesDarkTheme")=="true";
stylesheet.href=darktheme?"dark.css":"light.css";

function toggleTheme(){
    var stylesheet=$("#stylesheet");
    darktheme=!darktheme;
    localStorage.setItem("NotesDarkTheme",darktheme.toString())
    console.log(darktheme);
    stylesheet.href=darktheme?"dark.css":"light.css";
}

function save(){
    var saveCards=[];
    for(var c in cards){
        saveCards.push(cardToSaveJSON(cards[c]));
    }
    return JSON.stringify({"cards":saveCards});
}

function load(s){
    saveCards=JSON.parse(s).cards;
    for(var c in saveCards){
        c=saveCards[c];
        card(c.header,c.content,c.x+"px",c.y+"px",c.color,c.w,c.h);
    }
}

function loadFile(){
    try{
        var fileselect=document.createElement("input"); //<input type="file" id="fileselect" accept="application/json">
        fileselect.type="file";
        fileselect.accept=".crd";
        
        fileselect.click();
        fileselect.onchange=async function(){
            if(confirm("Are you sure? This will replace all current content.")){
                $("#cards").innerHTML="";
                cards=[];
                fileselect.onblur=null;
                fileselect.onchange=null;

                var f=fileselect.files[0];
                var text=await f.text();
                load(text);
                console.log(text);
            }
        };
        fileselect.onblur=function(){
            $("#fileselect").onblur=null;
            $("#fileselect").onchange=null;
        };
    } catch (e){
        console.error(e);
    }
}

function saveFile(){
    $("#download").href="data:text/html,"+encodeURIComponent(save());
    $("#download").click();
}

function cardToSaveJSON(card){
    return {
        header: card.headertext.value.toString(),
        content: card.content.innerHTML.toString(),
        x: card.card.offsetLeft,
        y: card.card.offsetTop,
        color: card.color,
        w: card.card.style.width.toString(),
        h: card.card.style.height.toString()
    };
}

function selectStart(e){
    if(e.button==0){
        rmx=e.pageX;
        rmy=e.pageY;
        document.body.addEventListener("mousemove",select);
        document.body.addEventListener("mouseup",selectEnd);
        $("#sel").style.display="block";
        select(e);
    }
    document.activeElement.blur();
    
}
function select(e){
    var width=e.pageX-rmx;
    var height=e.pageY-rmy;
    var left=width>0?rmx:rmx+width;
    var top=height>0?rmy:rmy+height;
    
    $("#sel").style.left=left+"px";
    $("#sel").style.top=top+"px";
    $("#sel").style.width=Math.abs(width)+"px";
    $("#sel").style.height=Math.abs(height)+"px";
    document.getSelection().removeAllRanges();
}
function selectEnd(){
    document.body.removeEventListener("mousemove",select);
    document.body.removeEventListener("mouseup",selectEnd);
    document.getSelection().removeAllRanges();
    selectAllOverlapped();
    $("#sel").style.display="none";
}
function selectAllOverlapped(){ // This code was copied from https://stackoverflow.com/questions/12066870/how-to-check-if-an-element-is-overlapping-other-elements by Buu Nguyen. This code was modified. This function is licensed under the CC-BY-SA 4.0 license.
    var rect1=$("#sel").getBoundingClientRect();
    for(var c in cards){
        c=cards[c];
        var rect2=c.card.getBoundingClientRect();
        var overlap=!(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
        if(overlap){
            console.log("x");
            c.card.focus();
            document.execCommand("selectAll");
        }
    }
}

document.body.addEventListener("mousedown",selectStart);


document.body.addEventListener("mousedown",function(){mousedown=true;})
document.body.addEventListener("mouseup",function(){mousedown=false;})

function mode(){
    var edit=open("view.html?save="+encodeURIComponent(save()),"_self");
}

if(location.search!=""){
    load(decodeURIComponent(location.search.split("=")[1]));
}

$("#new").onmousedown=function(e){
    e.stopPropagation();
}