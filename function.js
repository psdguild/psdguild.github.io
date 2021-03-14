let inFocus=0;


function startUp(){
  jitter();
  sizeReference();
  lazyLoad();
  dragSetUp();
  logoSwitch();
  listeners();
  startObserver();

  document.querySelectorAll('video').forEach((item, i) => {
    console.log(item.videoWidth / item.videoHeight);
  });

}


function jitter(){
  let jitters=document.querySelectorAll('.jitter');

  jitters.forEach((item, i) => {
    let rotation=2+Math.random()*1;
    // let rotation=5+Math.random()*5;
    rotation=rotation*(Math.random()>0.5?1:-1);
    item.style.setProperty('--rotate-amount', rotation+'deg');
  });
}

function sizeReference(){
  let col=document.querySelector('.col-reference').getBoundingClientRect().width;
  document.documentElement.style.setProperty('--col', col+10+'px');
  let widewidth=document.querySelector('#reg-reference').getBoundingClientRect().width;
  document.documentElement.style.setProperty('--widewidth', widewidth+'px');
  document.querySelectorAll('.stream').forEach((item, i) => {
    let ratioHeight=item.querySelector('.media-wrapper:first-child').getBoundingClientRect().height;
    item.style.setProperty('--ratioheight', ratioHeight+'px');
  });

}

function lazyLoad(){
  const observer = lozad(); // lazy loads elements with default selector as '.lozad'
  observer.observe();
}

function dragSetUp(){
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
  let psdSigs=[
    "cecilialogo.png",
    "stephlogo.png",
    "karissalogo.png",
    "nicologo.png",
    "pmaclogo.png"
  ]
  let psdCount=1;
  setInterval(function () {
    document.querySelector('#psd').style.backgroundImage=`url("signatures/${psdSigs[psdCount]}")`;
    psdCount=(psdCount==psdSigs.length-1)?0:psdCount+1;
  }, 500);
}

function listeners(){
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

}

let observer;

let maxFocus;
function startObserver(){
// getComputedStyle(document.body).getPropertyValue('--col')
  let options = {
    root: document.querySelector('.stream'),
    rootMargin: "0px -75% 0px 0px",
    threshold: [0,1]
  }

  observer = new IntersectionObserver(observerCallback, options);
  document.querySelectorAll('.media-wrapper').forEach((item, i) => {
    observer.observe(item);
    maxFocus=i;
  });
  inFocus=0;
}

let interCount=0;
function observerCallback(event){
  // console.log(event[0]);
  if(event[0].isIntersecting){
    interCount++;
    inFocus=parseInt(event[0].target.dataset.count);
    console.log(inFocus)
    let bckStyle=document.querySelector('.arrows svg[data-dir="bck"]').style;
    let fwdStyle=document.querySelector('.arrows svg[data-dir="fwd"]').style;
    bckStyle.opacity=(inFocus==0)?0:1;
    bckStyle.pointerEvents=(inFocus==0)?"none":"all";
    fwdStyle.opacity=(inFocus==maxFocus)?0:1;
    fwdStyle.pointerEvents=(inFocus==maxFocus)?"none":"all";


  }

}



window.addEventListener('resize',sizeReference);
window.addEventListener('load',startUp);
