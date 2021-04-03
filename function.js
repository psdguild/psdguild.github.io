let inFocus=0;
let col;


let mediaItems;
let mediaArray;
let maxFocus;

function startUp(){
  jitter();
  sortProjects();
  sizeReference();
  lazyLoad();
  dragSetUp();
  logoSwitch();
  listeners();
  checkIntersection();
}


function jitter(){
  //rotates text
  let jitters=document.querySelectorAll('.jitter');
  jitters.forEach((item, i) => {
    let rotation=2+Math.random()*1;
    rotation=rotation*(Math.random()>0.5?1:-1);
    item.style.setProperty('--rotate-amount', rotation+'deg');
  });
}

function sizeReference(){
  //manually sets sizing for child elements, because CSS subgrid isn't widely supported
  col=document.querySelector('.col-reference').getBoundingClientRect().width;
  document.documentElement.style.setProperty('--col', col+10+'px');
  let widewidth=document.querySelector('#reg-reference').getBoundingClientRect().width;
  document.documentElement.style.setProperty('--widewidth', widewidth+'px');
  let ratioHeight=document.querySelector('.first-media').getBoundingClientRect().height;
  document.documentElement.style.setProperty('--ratioheight', ratioHeight+'px');
  // document.querySelectorAll('.stream').forEach((item, i) => {
  //   let ratioHeight=item.querySelector('.first-media').getBoundingClientRect().height;
  //   item.style.setProperty('--ratioheight', ratioHeight+'px');
  // });

}

function lazyLoad(){
  //lazy loads images
  const loadObserver = lozad();
  loadObserver.observe();
}

function dragSetUp(){
  //sets up drag-scroll for projects
  let dragPos = { elLeft: 0, mouseX: 0 };
  let dragEl=document.querySelector('.stream');

  dragEl.addEventListener('mousedown',dragMouseDown);
  dragEl.addEventListener('wheel',cancelMomentumTracking);
  function dragMouseDown(e){
    dragPos={
      elLeft:dragEl.scrollLeft,
      mouseX:e.clientX,
      velocity:0
    }
    dragEl.style.cursor = 'grabbing';
    dragEl.style.userSelect = 'none';
    document.addEventListener('mousemove', dragMouseMove);
    document.addEventListener('mouseup', dragMouseUp);
    cancelMomentumTracking();
  }
  function dragMouseMove(e){
    const dx = (e.clientX - dragPos.mouseX)*1.7;
    // dragEl.scrollLeft = dragPos.elLeft - dx;
    var prevLeft = dragEl.scrollLeft;
    dragEl.scrollLeft = dragPos.elLeft - dx;
    // Compare change in position to work out drag speed
    dragPos.velocity = dragEl.scrollLeft - prevLeft;
  }
  function dragMouseUp(){
    dragEl.style.removeProperty('cursor');
    dragEl.style.removeProperty('user-select');
    document.removeEventListener('mousemove', dragMouseMove);
    document.removeEventListener('mouseup', dragMouseUp);
    beginMomentumTracking();
  }
  //thank you to SO user Loks
  // https://stackoverflow.com/questions/59008427/add-easing-smooth-scroll-to-click-and-drag-with-js
  let momentum;
  function beginMomentumTracking(){
    cancelMomentumTracking();
    momentum = requestAnimationFrame(momentumLoop);
  }
  function cancelMomentumTracking(){
    cancelAnimationFrame(momentum);
  }
  function momentumLoop(){
    dragEl.scrollLeft += dragPos.velocity;
    dragPos.velocity *= 0.95;
    if (Math.abs(dragPos.velocity) > 0.5){
      momentumID = requestAnimationFrame(momentumLoop);
    }
  }
}


function logoSwitch(){
  let nodePsds=document.querySelectorAll('#psd>img');
  let psds=Array.from(nodePsds);
  let psdCount=1;
  setInterval(function () {
    psds[psdCount].classList.add('viz');
    let last=(psdCount==0)?psds[psds.length-1]:psds[psdCount-1];
    last.classList.remove('viz');
    psdCount=(psdCount==psds.length-1)?0:psdCount+1;
  }, 500);
}

function listeners(){
  //event listeners for button clicks and scrolling projefcts
  document.querySelector('#learn-more').addEventListener('click',function(){
    let elTop=document.querySelector('#about').getBoundingClientRect().top;
    window.scrollTo({
      top: elTop - 20,
      left: 0,
      behavior: 'smooth'
    })
  })
  document.querySelectorAll('.arrows svg').forEach((item, i) => {
    item.addEventListener('click',function(){
      let colOffset=parseInt(getComputedStyle(document.body).getPropertyValue('--col').replace('px',''));
      if(event.currentTarget.dataset.dir=='fwd'){
        newFocus=inFocus+1;
      }else{
        newFocus=inFocus-1;
      }
      let elLeft=document.querySelector(`.media-wrapper[data-count="${newFocus}"]`).offsetLeft;
      document.querySelector('.stream').scrollTo({
        top: 0,
        left: elLeft - colOffset,
        behavior: 'smooth'
      })
    })
  });

  maxFocus=mediaArray.length-1;
  document.querySelector('.stream').addEventListener('scroll',_.debounce(checkIntersection, 100));
}

function checkIntersection(){
  //this checks what element is currently in the viewing area.
  //runs debounced when the page scrolls
  let intersecting=mediaArray.filter(a=>crossing(a))
  if(intersecting.length>0){
    inFocus=parseInt(intersecting[0].dataset.count);
    bckStyle.opacity=(inFocus==0)?0:1;
    bckStyle.pointerEvents=(inFocus==0)?"none":"all";
    fwdStyle.opacity=(inFocus==maxFocus)?0:1;
    fwdStyle.pointerEvents=(inFocus==maxFocus)?"none":"all";
  }
}

var crossing=(node)=>{
  //checks if element intersects left margin
  // intersectionObserver was being extremely buggy, so I am switching to getBoundingClientRect
  let bounding=node.getBoundingClientRect();
  let left=bounding.left;
  let right=bounding.right;
  let intersectLine=col+20;
  if(left<=intersectLine&&right>=intersectLine){
    return true;
  }else{
    return false;
  }
};

let bckStyle=document.querySelector('.arrows svg[data-dir="bck"]').style;
let fwdStyle=document.querySelector('.arrows svg[data-dir="fwd"]').style;

function sortProjects(){
  //this gets all the media items and counts how many counts how many videos versus images
  mediaItems=document.querySelectorAll('.media-wrapper');
  mediaArray=Array.from(mediaItems);
  let videos=mediaArray.filter(a=>a.dataset.type=="video/mp4");
  let static=mediaArray.filter(a=>a.dataset.type!=="video/mp4");
  let countVideos=videos.length;
  let countStatic=static.length;
  //this figures out how many images there are for each video (and gets the remainder)
  let dist=[Math.floor(countStatic/countVideos), countStatic%countVideos];

  //this makes a placeholder array that distributes the items evenly using dist
  let newArray=[];
  for(let x=0; x<countVideos;x++){
    newArray.push('video');
    for (let i = 0; i < dist[0]; i++) {
      newArray.push('image');
    }
    if(dist[1]>0){
      newArray.push('image');
      dist[1]--;
    }
  }

  //this decides whether to flip the array, so it's not always a video in the front
  if(Math.random()>0.5 && window.matchMedia("(min-width: 600px)").matches){
    newArray.reverse();
  }

  //this shuffles the order of the list of media (the actual randomizing)
  durstShuffle(mediaArray);

  //then this assigns a new place for each item using the placeholder as a guide
  //uses flexbox order to minimize costly operations
  mediaArray.forEach((item, i) => {
    newInd=newArray.findIndex(a=>item.dataset.type.includes(a))
    newArray[newInd]="filler";
    item.style.order=newInd;
    item.dataset.count=newInd;

    //this if-else assigns classes to the new first and last item
    //so that they can be targeted with CSS/JS
    if(newInd==mediaArray.length-1){
      item.classList.add('last-media');
    }else if(newInd==0){
      item.classList.add('first-media');
      //this also gets the aspect ratio of a video item
      // because Hugo can't do this on the back-end
      // and we need it to size the gallery properly
      if(item.dataset.type.includes('video')){
        let natHeight=item.querySelector('video').videoHeight;
        let natWidth=item.querySelector('video').videoWidth;
        item.querySelector('.aspect-ratio').style.paddingBottom=`${natHeight/natWidth*100}%`;
      }
    }
  });
}

function durstShuffle(arr){
  for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    //thank you to https://stackoverflow.com/a/12646864/11855303
}


window.addEventListener('resize',sizeReference);
window.addEventListener('load',startUp);
