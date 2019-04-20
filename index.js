//опции 
const options={
		beginKey:"begin",
		endKey:"end"
	}

let TimeData=[{
	begin:1555611441000,
	end:1555618641000
	},{
	begin:1555277652000,
	end:1555285632000
	},
	{"dfd":1,
	"begin":13232},
	{
	begin:1555682671000,
	end:1555689870000
	},
	{
	begin:1555787070000,
	end:1556819470000
	}
	
]

let splitTest={
	begin:1555773103000,
	end:1556039503000
}


//ToDo должен вернуть обьект для построение диаграммы. а не только даты.
function splitDays(obj){
	const beginDate= new Date(obj[options.beginKey]);
	const endDate= new Date(obj[options.endKey]);
	if (beginDate.toDateString()==endDate.toDateString()){
	return 	{
				begin:beginDate,
				end:endDate
			}
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

function detectCollision(data){
console.log(data);
	let buffer=data.slice();
	let a;
	let i=0;
	//проверка на коллизии. через перебор сочетаний по два. 
	while (buffer.length>0){
		a=buffer.shift();
		buffer.forEach(b=>{
			//ох щас как напиздячу условий
			//ToDo свернуть условие
			switch (true){
				case (	(a[options.beginKey]<b[options.beginKey])&&
						(a[options.endKey]>b[options.endKey])&&
						(a[options.beginKey]<b[options.endKey])&&
						(b[options.beginKey]<a[options.beginKey])): console.log("Collission detected!  Элемент ",i+buffer.indexOf(b)+1," полностью включен в элемент ",i);
						break;
				case (	(a[options.beginKey]>b[options.beginKey])&&
						(a[options.endKey]<b[options.endKey]) &&
						(a[options.beginKey]<b[options.endKey]) &&
						(b[options.beginKey]<a[options.endKey])) : console.log("2Collission between elements: ",i," and ",i+buffer.indexOf(b)+1);
						break;
				case (	(a[options.endKey]==b[options.endKey]) &&
						(a[options.beginKey]<b[options.endKey]) &&
						(b[options.beginKey]<a[options.endKey]) ) : console.log("3Collission between elements: ",i," and ",i+buffer.indexOf(b)+1);
						break;
				case (  (a[options.beginKey]<b[options.endKey])&&
						(a[options.endKey]>b[options.beginKey]) &&
						(a[options.beginKey]<b[options.endKey]) &&
						(b[options.beginKey]<a[options.endKey]) ): console.log("4Collission between elements: ",i," and ",i+buffer.indexOf(b)+1);
						break;
				case (	(a[options.beginKey]==b[options.beginKey])&&
						(a[options.endKey]==b[options.endKey]) ): console.log("Collission between elements: ",i," and ",i+buffer.indexOf(b)+1);
						break;
				case (	(a[options.beginKey]==b[options.beginKey])&&
						(a[options.beginKey]<b[options.endKey]) &&
						(b[options.beginKey]<a[options.endKey])) : console.log("Collission between elements: ",i," and ",i+buffer.indexOf(b)+1);
						break;
				case (	(a[options.beginKey]<b[options.beginKey])&&
						(a[options.endKey]<b[options.endKey]) &&
						(a[options.beginKey]<b[options.endKey]) &&
						(b[options.beginKey]<a[options.endKey]) ): console.log("Collission between elements: ",i," and ",i+buffer.indexOf(b)+1);
						break;
				default: //console.log()
				}
				

		});
		i++;
	}
}



//Преобразовать массив входных данных
// в данные для построения диаграммы
function remold(data){
	//Фильтрация валидных данных
 return data.filter(element=>{
	//console.log(data.indexOf(element));
	if 	(!(
			options.beginKey in element &&
			"end" in element &&
			typeof element[options.beginKey]==="number" &&
			typeof element[options.endKey]==="number"
		)) {
			console.log("Error format for index "+data.indexOf(element));
			return false;
		}
	if (element[options.beginKey]>element[options.endKey]) {
		console.log("Error time data for index "+data.indexOf(element));
		return false;
	}
		return true;
	}).map(splitDays).flat().sort((a,b)=>{
		return (a[options.beginKey]<b[options.beginKey])?-1:1;
	});
}

