//Settings
const options={
        beginKey:"begin",
        endKey:"end"
    }


///Returns timeslots divided by days
function splitDays(obj){
    const beginDate= new Date(obj[options.beginKey]);
    const endDate= new Date(obj[options.endKey]);
    if(beginDate.toDateString()==endDate.toDateString()){
        return     [{
            begin:beginDate,
            end:endDate
        }]
    }else{
        const tempEndDate=new Date(beginDate);
        tempEndDate.setHours(23);
        tempEndDate.setMinutes(59);
        tempEndDate.setSeconds(59);
        tempEndDate.setMilliseconds(999);
        return [{
            begin:beginDate,
            end: tempEndDate
        },
            splitDays(
                {[`${options.beginKey}`]:parseInt(`${tempEndDate.getTime()+1}`),[`${options.endKey}`]:parseInt(`${obj[options.endKey]}`)}
            )
        ].flat();
    }
}

///Detect collision by Combination of two.
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



///Transform raw data and returns data to build diagrams.
function remold(data){
    //filters encorrect data
    return data.filter(element=>{
        if     (!(
            options.beginKey in element &&
            "end" in element &&
            typeof element[options.beginKey]==="number" &&
            typeof element[options.endKey]==="number"
            )){
                console.log("Error format for index "+data.indexOf(element));
                return false;
            }
        if (element[options.beginKey]>element[options.endKey]) {
            console.log("Error time data for index "+data.indexOf(element));
            return false;
        }
            return true;
        //Splits into timeslots and sort asc
    }).map(splitDays).flat().sort((a,b)=>{
        return (a[options.beginKey]<b[options.beginKey])?-1:1;
    });
}
