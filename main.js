

class TimeBagel {

  constructor(params){
    //Settings
    this.options = params||{};
      this.options.beginKey=this.options.beginKey||"begin";
      this.options.endKey=this.options.endKey||"end";
      this.options.radius=this.options.radius||100;
      this.options.color=this.options.color||"#ffc007";
      this.options.showControl=this.options.showControl||true;
  }

  ///Test Array and detect collision by Combination of two.
  detectCollision=(data)=>{
    let buffer = data.slice();
    let A;
    let i = 0;
    while (buffer.length > 0) {
      A = buffer.shift();
      buffer.forEach(B => {
        (!(A[this.options.beginKey] < B[this.options.endKey]) && (A[this.options.endKey] > B[this.options.beginKey])) ? console.log("Detect collision beetween ", i, " and ", i + buffer.indexOf(B) + 1): null;
      });
      i++;
    }
  }

  ///Returns data for build diagrams divided by days
  splitDays=(obj)=>{
    const beginDate = new Date(obj[this.options.beginKey]);
    const endDate = new Date(obj[this.options.endKey]);
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
        this.splitDays({
          [`${this.options.beginKey}`]: parseInt(`${tempEndDate.getTime()+1}`),
          [`${this.options.endKey}`]: parseInt(`${obj[this.options.endKey]}`)
        })
      ].flat();
    }
  }
  ///Checking element for errors
  errorChecking=(element)=>{
    if (!(
        this.options.beginKey in element &&
        this.options.endKey in element &&
        typeof element[this.options.beginKey] === "number" &&
        typeof element[this.options.endKey] === "number"
      )) {
      console.log("Error format for " + element);
      return false;
    }
    if (element[this.options.beginKey] > element[this.options.endKey]) {
      console.log("Error time data for " + element);
      return false;
    }
    return true;
  }
  ///Group array by "group".
  group=(rv, x)=>{
    (rv[x["group"]] = rv[x["group"]] || []).push(x);
    delete x["group"];
    return rv;
  }
  ///compareFunction for sorting
  compareDates=(a, b)=>{
    function parseDate(str) {
      let parts = str.match(/(\d+)/g);
      return parseInt(parts[2] + parts[1] + parts[0]);
    }
    return parseDate(a[0]) - parseDate(b[0])
  }
  ///Transform raw data and returns data to build diagrams.
  remold=(data)=>{
    return Object.entries(
      data.filter(this.errorChecking).map(this.splitDays).flat().reduce(this.group, [])).
    sort(this.compareDates);
  }
  ///Converts polar coordinates to cartesian
  polarToCartesian=(ox, oy, r, Phi)=>{
    return {
      x: ox + (r * Math.cos((Phi - 90) * Math.PI / 180.0)),
      y: oy + (r * Math.sin((Phi - 90) * Math.PI / 180.0))
    };
  }
  ///Returns SVG path
  makePath=(cx, cy, radius, startAngle, endAngle, thickness, label)=>{
    const start = this.polarToCartesian(cx, cy, radius, endAngle);
    const end = this.polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    //var title=(new Date(TimeData[0].begin)).toLocaleTimeString()+"\n"+(new Date(TimeData[0].end)).toLocaleTimeString();
    const cutoutRadius = radius - thickness,
      start2 = this.polarToCartesian(cx, cy, cutoutRadius, endAngle),
      end2 = this.polarToCartesian(cx, cy, cutoutRadius, startAngle),
      d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", cx, cy,
        "Z",

        "M", start2.x, start2.y,
        "A", cutoutRadius, cutoutRadius, 0, largeArcFlag, 0, end2.x, end2.y,
        "L", cx, cy,
        "Z"
      ].join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill-rule", "evenodd");
    path.setAttribute("fill-opacity", ".85");
    path.setAttribute("fill", this.options.color);
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.innerHTML = label;
    path.appendChild(title);
    return path;
  }

  //create Time Bagel frow raw array in parentNodeName node.
  createTimeBagel=(parentNodeName, raw)=>{


    const data = this.remold(raw);
    let i = 0; //current page
    const SVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const dataGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const clockFace = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const leftArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const rightArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const shell = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    const reDraw=(parent, obj)=>{
      parent.innerHTML = "";
      obj[1].forEach((item, i, arr) => {
        parent.appendChild(this.makePath(this.options.radius, this.options.radius, this.options.radius, item.beginAngle, item.endAngle, this.options.radius * 0.3, item.beginLabel + "\n" + item.endLabel));
      });
      label.innerHTML = obj[0];
    }
    const parent = document.getElementById(parentNodeName);
    //ToDo Condition parent no null
    console.log(this.options);
    //SVG.setAttribute("viewBox", `0 0 ${this.options.radius*2} ${this.options.radius*2}`);
    SVG.setAttribute("width", `${this.options.radius*2}`);
    SVG.setAttribute("height", `${this.options.radius*2}`);
    SVG.setAttribute("id", "some_svg");


    outerCircle.setAttribute("r", this.options.radius);
    outerCircle.setAttribute("cx", this.options.radius);
    outerCircle.setAttribute("cy", this.options.radius);
    outerCircle.setAttribute("fill", "none");

    outerCircle.setAttribute("stroke", "black");
    outerCircle.setAttribute("stroke-width", .1);
    SVG.appendChild(outerCircle);

    dataGroup.setAttribute("id", "data");
    reDraw(dataGroup, data[0]);
    SVG.appendChild(dataGroup);


    for (let i = 0; i < 24; i++) {
      let shirt = document.createElementNS("http://www.w3.org/2000/svg", "line");
      shirt.setAttribute("x1", this.polarToCartesian(this.options.radius, this.options.radius, this.options.radius * 0.7 + (this.options.radius * 0.1 * !!(i % 6)), i * 15).x);
      shirt.setAttribute("y1", this.polarToCartesian(this.options.radius, this.options.radius, this.options.radius * 0.7 + (this.options.radius * 0.1 * !!(i % 6)), i * 15).y);
      shirt.setAttribute("x2", this.polarToCartesian(this.options.radius, this.options.radius, this.options.radius, i * 15).x); // * 0.9 + (this.options.radius * 0.2 * (!(i % 6))), i * 15).x);
      shirt.setAttribute("y2", this.polarToCartesian(this.options.radius, this.options.radius, this.options.radius, i * 15).y); // * 0.9 + (this.options.radius * 0.2 * (!(i % 6))), i * 15).y);
      shirt.setAttribute("stroke", "black");
      shirt.setAttribute("stroke-width", this.options.radius * 0.005 + (this.options.radius * 0.005 * (!(i % 6))));
      clockFace.appendChild(shirt);
    }
    SVG.appendChild(clockFace);

    innerCircle.setAttribute("r", this.options.radius * 0.7);
    innerCircle.setAttribute("cx", this.options.radius);
    innerCircle.setAttribute("cy", this.options.radius);
    innerCircle.setAttribute("fill", "white");
    SVG.appendChild(innerCircle);


    leftArrow.setAttribute("d", `M ${this.options.radius * 0.5} ${this.options.radius} v ${-this.options.radius/10} l ${-this.options.radius/10} ${this.options.radius/10} l ${this.options.radius/10} ${this.options.radius/10} `);
    leftArrow.setAttribute("fill", "black");
    leftArrow.addEventListener("click", (e) => {
      i--;
      if (i <= 0) {
        leftArrow.setAttribute("visibility", "hidden");

        i = 0;
      } else {
        rightArrow.setAttribute("visibility", "visible");
      }
      reDraw(dataGroup, data[i]);
    });

    rightArrow.setAttribute("d", `M ${this.options.radius * 1.5} ${this.options.radius} v ${this.options.radius/10} l ${this.options.radius/10} ${-this.options.radius/10} l ${-this.options.radius/10} ${-this.options.radius/10} `);
    rightArrow.setAttribute("fill", "black");
    rightArrow.addEventListener("click", (e) => {
      i++;
      if (i >= data.length - 1) {
        i = data.length - 1;
        rightArrow.setAttribute("visibility", "hidden");
      } else {
        leftArrow.setAttribute("visibility", "visible");
      }
      reDraw(dataGroup, data[i]);
    });

    (i == 0) ? leftArrow.setAttribute("visibility", "hidden"): void(0);
    (i == data.length - 1) ? rightArrow.setAttribute("visibility", "hidden"): void(0);
    if (this.options.showControl) {
      SVG.appendChild(leftArrow);
      SVG.appendChild(rightArrow);
    }

    label.setAttribute("x", this.options.radius);
    label.setAttribute("y", this.options.radius);
    label.setAttribute("dy", this.options.radius * 0.045);
    label.setAttribute("fill", "black");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("style", `fill: black;
      font: bold ${this.options.radius*0.18}px sans-serif;
      -moz-user-select: none;
      -ms-user-select: none;
      -khtml-user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;`);
    label.innerHTML = data[0][0];
    SVG.appendChild(label);


    parent.appendChild(SVG);
  }

}
