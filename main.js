//Settings
const options = {
  beginKey: "begin",
  endKey: "end"
}


///Returns data for build diagrams divided by days
function splitDays(obj) {
  const beginDate = new Date(obj[options.beginKey]);
  const endDate = new Date(obj[options.endKey]);
  const dateToDegree = (date) => {
    return Date.parse("Thu Jan 01 1970 " + date.toLocaleTimeString() + " GMT+0000") * (360 / 86400000)
  }
  if (beginDate.toDateString() == endDate.toDateString()) {
    return [{
      group: beginDate.toLocaleDateString(),
      beginAngle: dateToDegree(beginDate),
      beginLabel: beginDate.toLocaleTimeString(),
      endAngle: dateToDegree(endDate),
      endLabel: endDate.toLocaleTimeString()
    }]
  } else {
    const tempEndDate = new Date(beginDate);
    tempEndDate.setHours(23, 59, 59, 999);
    return [{
        group: beginDate.toLocaleDateString(),
        beginAngle: dateToDegree(beginDate),
        beginLabel: beginDate.toLocaleTimeString(),
        endAngle: dateToDegree(tempEndDate),
        endLabel: tempEndDate.toLocaleTimeString()
      },
      splitDays({
        [`${options.beginKey}`]: parseInt(`${tempEndDate.getTime()+1}`),
        [`${options.endKey}`]: parseInt(`${obj[options.endKey]}`)
      })
    ].flat();
  }
}

///Test Array and detect collision by Combination of two.
function detectCollision(data) {
  let buffer = data.slice();
  let A;
  let i = 0;
  while (buffer.length > 0) {
    A = buffer.shift();
    buffer.forEach(B => {
      (!(A[options.beginKey] < B[options.endKey]) && (A[options.endKey] > B[options.beginKey])) ? console.log("Detect collision beetween ", i, " and ", i + buffer.indexOf(B) + 1): null;
    });
    i++;
  }
}

///Checking element for errors
function errorChecking(element) {
  if (!(
      options.beginKey in element &&
      options.endKey in element &&
      typeof element[options.beginKey] === "number" &&
      typeof element[options.endKey] === "number"
    )) {
    console.log("Error format for " + element);
    return false;
  }
  if (element[options.beginKey] > element[options.endKey]) {
    console.log("Error time data for " + element);
    return false;
  }
  return true;
}

///Group array by "group".
function group(rv, x) {
  (rv[x["group"]] = rv[x["group"]] || []).push(x);
  delete x["group"];
  return rv;
}

///compareFunction for sorting
function compareDates(a, b) {
  function parseDate(str) {
    let parts = str.match(/(\d+)/g);
    return parseInt(parts[2] + parts[1] + parts[0]);
  }
  return parseDate(a[0]) - parseDate(b[0])
}

///Transform raw data and returns data to build diagrams.
function remold(data) {
  return Object.entries(
    data.filter(errorChecking).map(splitDays).flat().reduce(group, [])).
  sort(compareDates);
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

//create SVG node
function createSVG(parentNodeName,data) {
  let i=0; //current page
  const SVG = document.createElementNS ("http://www.w3.org/2000/svg", "svg");
  const label=document.createElementNS ("http://www.w3.org/2000/svg", "text");
  const outerCircle= document.createElementNS ("http://www.w3.org/2000/svg", "circle");
  const dataGroup=document.createElementNS ("http://www.w3.org/2000/svg", "g");
  const clockFace=document.createElementNS ("http://www.w3.org/2000/svg", "g");
  const innerCircle= document.createElementNS ("http://www.w3.org/2000/svg", "circle");
  const leftArrow= document.createElementNS ("http://www.w3.org/2000/svg", "circle");
  const rightArrow= document.createElementNS ("http://www.w3.org/2000/svg", "circle");


  function reDraw(parent,obj){
    parent.innerHTML="";
    console.log(obj);
    obj[1].forEach((item,i,arr)=>{
      parent.appendChild(makePath(200,200,200,item.beginAngle,item.endAngle,60,item.beginLabel+"\n"+item.endLabel));
    });
    label.innerHTML=obj[0];
  }
  const parent = document.getElementById(parentNodeName);
  //ToDo Condition parent no null

  SVG.setAttribute("viewBox", "0 0 400 400");
  SVG.setAttribute("width", "400");
  SVG.setAttribute("height", "400");
  SVG.setAttribute("id", "some_svg");


  outerCircle.setAttribute("r",200);
  outerCircle.setAttribute("cx",200);
  outerCircle.setAttribute("cy",200);
  outerCircle.setAttribute("fill","none");
  //outerCircle.setAttribute("stroke","black");
  //outerCircle.setAttribute("stroke-width",1);
  SVG.appendChild(outerCircle);

  dataGroup.setAttribute("id","data");
  reDraw(dataGroup,data[0]);
  SVG.appendChild(dataGroup);


  for (let i=0;i<24;i++){
    let shirt=document.createElementNS ("http://www.w3.org/2000/svg", "line");
    shirt.setAttribute("x1",polarToCartesian(200,200,140,i*15).x);
    shirt.setAttribute("y1",polarToCartesian(200,200,140,i*15).y);
    shirt.setAttribute("x2",polarToCartesian(200,200,180+(40*(!(i%6))),i*15).x);
    shirt.setAttribute("y2",polarToCartesian(200,200,180+(40*(!(i%6))),i*15).y);
    shirt.setAttribute("stroke","black");
    shirt.setAttribute("stroke-width",1+(!(i%6)));
    clockFace.appendChild(shirt);
  }
  SVG.appendChild(clockFace);

  innerCircle.setAttribute("r",140);
  innerCircle.setAttribute("cx",200);
  innerCircle.setAttribute("cy",200);
  innerCircle.setAttribute("fill","white");
  SVG.appendChild(innerCircle);


  leftArrow.setAttribute("r",10);
  leftArrow.setAttribute("cx",100);
  leftArrow.setAttribute("cy",200);
  leftArrow.setAttribute("fill","black");
  leftArrow.addEventListener("click",onClick=(e)=>{(i==0)?i=0:i--;reDraw(dataGroup,data[i]);});

  rightArrow.setAttribute("r",10);
  rightArrow.setAttribute("cx",300);
  rightArrow.setAttribute("cy",200);
  rightArrow.setAttribute("fill","black");
  rightArrow.addEventListener("click",onClick=(e)=>{(i==data.length-1)?i=data.length-1:i++;reDraw(dataGroup,data[i]);});
  SVG.appendChild(leftArrow);
  SVG.appendChild(rightArrow);


  label.setAttribute("x",200);
  label.setAttribute("y",200);
  label.setAttribute("fill","black");
  label.setAttribute("text-anchor","middle");
  label.setAttribute("style","fill: red; font-size: 200%");
  label.innerHTML=data[0][0];
  SVG.appendChild(label);
  parent.appendChild(SVG);
}

function makePath(cx, cy, radius, start_angle, end_angle, thickness,label) {
  const start = polarToCartesian(cx, cy, radius, end_angle);
  const end = polarToCartesian(cx, cy, radius, start_angle);
  const largeArcFlag = end_angle - start_angle <= 180 ? "0" : "1";
  //var title=(new Date(TimeData[0].begin)).toLocaleTimeString()+"\n"+(new Date(TimeData[0].end)).toLocaleTimeString();
  const cutout_radius = radius - thickness,
    start2 = polarToCartesian(cx, cy, cutout_radius, end_angle),
    end2 = polarToCartesian(cx, cy, cutout_radius, start_angle),
    d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", cx, cy,
      "Z",

      "M", start2.x, start2.y,
      "A", cutout_radius, cutout_radius, 0, largeArcFlag, 0, end2.x, end2.y,
      "L", cx, cy,
      "Z"
    ].join(" ");
    const path=document.createElementNS ("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("fill-opacity", ".6");
    path.setAttribute("fill", "green");
    const title=document.createElementNS("http://www.w3.org/2000/svg","title");
    title.innerHTML=label;
    //console.log(label);
    path.appendChild(title);
    return path;
}
