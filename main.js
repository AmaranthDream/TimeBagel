//Settings
const options={
        beginKey:"begin",
        endKey:"end"
    }


///Returns data for build diagrams divided by days
function splitDays(obj){
    const beginDate= new Date(obj[options.beginKey]);
    const endDate= new Date(obj[options.endKey]);
    if(beginDate.toDateString()==endDate.toDateString()){
        return [{
            group:beginDate.toLocaleDateString(),
            beginAngle:Date.parse("Thu Jan 01 1970 "+beginDate.toLocaleTimeString()+" GMT+0000")*(360/86400000) ,
            beginLabel:beginDate.toLocaleTimeString(),
            endAngle:Date.parse("Thu Jan 01 1970 "+endDate.toLocaleTimeString()+" GMT+0000")*(360/86400000),
            endLabel:endDate.toLocaleTimeString()
        }]
    }else{
        const tempEndDate=new Date(beginDate);
        tempEndDate.setHours(23,59,59,999);
        return [{
            group:beginDate.toLocaleDateString(),
            beginAngle:Date.parse("Thu Jan 01 1970 "+beginDate.toLocaleTimeString()+" GMT+0000")*(360/86400000) ,
            beginLabel:beginDate.toLocaleTimeString(),
            endAngle:Date.parse("Thu Jan 01 1970 "+tempEndDate.toLocaleTimeString()+" GMT+0000")*(360/86400000),
            endAngle: tempEndDate,
            endLabel:tempEndDate.toLocaleTimeString()
        },
            splitDays(
                {[`${options.beginKey}`]:parseInt(`${tempEndDate.getTime()+1}`),[`${options.endKey}`]:parseInt(`${obj[options.endKey]}`)}
            )
        ].flat();
    }
}

///Test Array and detect collision by Combination of two.
function detectCollision(data){
	let buffer=data.slice();
	let A;
	let i=0;
	while (buffer.length>0){
		A=buffer.shift();
		buffer.forEach(B=>{
			(!(A[options.beginKey]<B[options.endKey])&&(A[options.endKey]>B[options.beginKey]))?console.log("Detect collision beetween ",i," and ",i+buffer.indexOf(B)+1):null;
    });
    i++;
	}
}

///Checking element for errors
function errorChecking(element){
  if  (!(
      options.beginKey in element &&
      options.endKey in element &&
      typeof element[options.beginKey]==="number" &&
      typeof element[options.endKey]==="number"
      )){
          console.log("Error format for "+element);
          return false;
      }
  if (element[options.beginKey]>element[options.endKey]) {
      console.log("Error time data for "+element);
      return false;
  }
      return true;
}

///Group array by "group".
function group(rv, x){
    (rv[x["group"]] = rv[x["group"]] || []).push(x);
    delete x["group"];
    return rv;
}

///compareFunction for sorting
function compareDates(a, b){
    function parseDate(str) {
      let parts = str.match(/(\d+)/g);
      return parseInt(parts[2]+parts[1]+parts[0]);
    }
    return parseDate(a[0]) - parseDate(b[0])
}

///Transform raw data and returns data to build diagrams.
function remold(data){
    return Object.entries(
        data.filter(errorChecking).
        map(splitDays).
        flat().
        reduce(group, [])).
      sort(compareDates);
}
