console.log("hi! im awful-coder! ");
var b=100;
var cx=0;
var cy=0;
document.body.addEventListener("mousemove",function(e){
    document.body.style.backgroundPosition=(e.clientX/20)+"px "+(e.clientY/20)+"px";
    b+=Math.abs((e.clientX-cx)+(e.clientY-cy))/30;
    if(b>255){b=255;}
    document.body.style.setProperty("--b",b);
    cx=e.clientX;
    cy=e.clientY;
});
document.body.addEventListener("wheel",function(e){
    b+=Math.abs(e.deltaX+e.deltaY+e.deltaZ)/30;
    if(b>255){b=255;}
    document.body.style.setProperty("--b",b);
});

window.setInterval(function(){
    if(b>94){b-=5;}
    document.body.style.setProperty("--b",b);
},50);

var x=0;

window.setInterval(function(){
    x++;
    b+=Math.sin(x/10)*2;
},50);