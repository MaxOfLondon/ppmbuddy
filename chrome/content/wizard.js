var wizard = {
  controls: new Array(),
  
  labels: new Array(),
  
  valueCount: 0,
  
  rowCount: 0,
  
  columnCount: 0,
  
  startDate: new Date(),
  
  endDate: new Date(),
  
  onLoad: function() {
    this.mapControls();
    this.mapLabels();
    this.columnCount = this.valueCount / this.rowCount;
    
    
    //this.labels.length does not work
//    this.rowCount = 0;
//    for (var i in this.labels) 
//      this.rowCount++;
    
    var value = 5;//100 / this.rowCount;
    for (i in this.labels) {
      this.addLabel(this.sanitizeString(this.labels[i]), value);
    } 
    
    var datePicker = document.getElementById("datePicker");
    var datePicker1 = document.getElementById("datePicker1");
    var now = new Date();
    
    datePicker1.value = now.format("Y-m-d");
    now.setDate(now.getDate()-6); // a week including today
    datePicker.value = now.format("Y-m-d");
    
    this.initialized = true;
    this.strings = document.getElementById("HelloWorld-strings");
  },

  mapControls: function() {
    this.controls = new Array();
    var s = window.arguments[0].document.getElementsByTagName('input');

    var condValidNames = /(^MISC|^TASK)_.+/i;
    var condDateControl = /.+_date$/i;
    for(var i=0;i<s.length;i++) {
      if (s[i].id.search(condValidNames) != -1) {
        if (s[i].id.search(condDateControl) == -1) {
          this.controls[s[i].id] = new Array(s[i], ""); 
        } else {
			this.valueCount++;
          this.controls[s[i].id.slice(0, -5)][1] = s[i].value;
        }
      }
    }
    //return controls;
  },
  
  mapLabels: function() {
    var items = new Array();
    
    var s = window.arguments[0].document.getElementsByTagName('input');
    var condValidNames = /(^1cw_MISC|^1cw_TASK)_.+/i;
    var condTypeSubItem = /(_\d+){2}$/i;
    for (var i=0; i < s.length; i++) {
      if (s[i].id.search(condValidNames) != -1) {
      	this.rowCount++;
        var tmp = s[i].parentNode.parentNode.innerHTML;
        items[s[i].id] = this.stripHtml(tmp);//.replace(/<[^>]*>?/g,'');
      }
    }
    this.labels = items;
  },
  
  addLabel: function(label, value) {
    var listbox = document.getElementById('itemList');
    var listItem = document.createElement('listitem');
    var cell = document.createElement('listcell');
    cell.setAttribute('label', label);
    listItem.appendChild(cell);
    cell = document.createElement('listcell');
    cell.setAttribute('label', value);
    listItem.appendChild(cell);
    listbox.appendChild(listItem);
  },
  
  loadWeight: function(value) {
  	var listbox = document.getElementById('itemList');
  	var selectedItem = listbox.selectedItem;
    var weight = document.getElementById('weight');
    weight.value = selectedItem.children[1].getAttribute('label');
    weight.disabled = false;
  },
  
  updateWeight: function() {
    var listbox = document.getElementById('itemList');
    var selectedItem = listbox.selectedItem;
    var ctrlWeight = document.getElementById('weight');
    
    if (selectedItem != null)
		selectedItem.children[1].setAttribute('label', ctrlWeight.value);    
  },
  
  
  
  updateWeight2: function() {
    var listbox = document.getElementById('itemList');
    var selectedItem = listbox.selectedItem;
    var selectedIndex = listbox.selectedIndex;
    var ctrlWeight = document.getElementById('weight');
    var newWeight = ctrlWeight.value;
    var oldWeight = selectedItem.children[1].getAttribute('label');
    var oldReminderWeight = (100 - oldWeight)/100;
    var newRemiderWeight = (100 - newWeight)/100;
    
    // create weights to array
    var weights = new Array();
    for (var i = 0; i < listbox.itemCount; i++ ) {
      var value = listbox.getItemAtIndex(i).children[1].getAttribute('label') / 100 / oldReminderWeight * newRemiderWeight;
      weights[i] = this.roundVal(value * 100 );
    }
    weights[selectedIndex] = this.roundVal(newWeight);
    
    //write back all values
    for (i = 0; i < listbox.itemCount; i++ ) {
      listbox.getItemAtIndex(i).children[1].setAttribute('label', weights[i]);
    }
    
    this.validateInput();
    ctrlWeight.value = selectedItem.children[1].getAttribute('label');
    ctrlWeight.focus(); 
  },
  
  updateValues: function() {
 	var datePicker = document.getElementById("datePicker");
    var datePicker1 = document.getElementById("datePicker1");
    var listbox = document.getElementById('itemList');
    var overwriteValues = !document.getElementById('keepExisting').checked;
    var overtimeTarget = parseFloat((document.getElementById('alowOvertime').checked?document.getElementById('overtimeHours').value:0));
    var dayTarget = parseFloat(document.getElementById('targetHours').value);
    var resolution = Math.round((document.getElementById('resolution').value/60)*100)/100;
    
  	var startDateParts = datePicker.value.split('-');
  	var endDateParts = datePicker1.value.split('-');
  	this.startDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2]);
  	this.endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2]); 
	
	//Firebug.Console.log(this.startDate);
	//alert(this.endDate);
	//this.startDate = new Date(datePicker.value);
	//this.endDate = new Date(datePicker1.value);
  	
  	if (this.endDate < this.startDate) {
  		// swap dates
  		var tnpDate = this.startDate;
  		this.endDate = this.startDate;
  		this.startDate = tnpDate;
  	}
  	
  	var includedColumnCount = DateDiff.inDays(this.startDate, this.endDate) + 1;
  	
  	var index = '';
  	var cols = new Array();
	var rowIdx = -1;
	var controlIdx = -1;
  	for (var i in this.controls) {
  		
  		var dateParts = this.controls[i][1].split('/');
  		var date = new Date(20+dateParts[2], dateParts[0] - 1, dateParts[1]);
		
		controlIdx ++;
		
		if (date.getDay() == 6 && !document.getElementById('saturdays').checked) continue;
		if (date.getDay() == 0 && !document.getElementById('sundays').checked) continue;
		
  		if ((date >= this.startDate) && (date <= this.endDate)) {

  			index = this.controls[i][1].replace(/\//g,'_');

  			rowIdx = Math.floor(controlIdx / this.columnCount);
  			
  			var value = parseFloat(this.controls[i][0].value);
  			var propability = parseFloat(listbox.getItemAtIndex(rowIdx).children[1].getAttribute('label'))/10;
  			var exclude = 	(!overwriteValues && value > 0) 
  							|| (propability == 0);

  			if (cols[index] == undefined) {
  					cols[index] = new Array();
  			}
  			
  			cols[index].push(
  				new Array(	this.controls[i][0]  	/* [0] object */ 
  							,propability 			/* [1] weight */
  							,(!overwriteValues && value > 0
  								?value
  								:0)					/* [2] value */
  							,false					/* [3] target reached */
  							,exclude 				/* [4] exclude from processing and updating */
  						)
  				);
  		}
  	} //for controls  	
  	
  	
  	for (index in cols) {
  		var columnValue = 0;
  		for (i = 0; i < cols[index].length; i++) {
  			columnValue += cols[index][i][2];
  		}
  		
  		var target = dayTarget - columnValue + Math.randomMax(overtimeTarget, true, resolution);
  		
  		do {
	  		for (i = 0; i < cols[index].length; i++) {
	  			if (cols[index][i][3] || cols[index][i][4]) continue;
				
				if (Math.random() <= cols[index][i][1]) {
					cols[index][i][2] += resolution;
					target -= resolution;
				}
				
				if (target <= 0) break;
	  		}
		} while (target > 0);
		
		// update timesheet
		for (i = 0; i < cols[index].length; i++) {
			if (cols[index][i][4]) continue;
			cols[index][i][0].value = cols[index][i][2].toFixed(2);
      //cols[index][i][0].onChange();
		}
  	}
  },
    
  roundVal: function(val) {
    var dec = 2;
    var result = Math.round(val*Math.pow(10,dec))/Math.pow(10,dec);
    return result;
  },
  
  stripHtml: function(html) {
    var tmp = window.arguments[0].document.createElement("div");
    tmp.innerHTML = html;
    var result = tmp.textContent;//||tmp.innerText;
    return result;
  },
  
  validateInput: function() {
	var field = document.getElementById('weight');
   	var value = field.value.replace(/[^\d\.]/g, '');
   	value = value.replace(/(\d*)\.+/g, '$1.');
   	value = value.replace(/(\d*)\.(\d*)\./g, '$1.$2');
   	if (parseFloat(value) < 0)  value = 0;
   	if (parseFloat(value) > 10) value = 10;
   	field.value = value;
    var button = document.getElementById('saveWeight');
    button.disabled = ((field.value == "") && !this.isNumeric(field.value));
  },
  
  isNumber: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  
  sanitizeString: function(str) {
    str = str.replace(/\s{2,}/g, ' ');
    str = str.replace(/\s\d+\.\d+/g, '');
    return str;
  },
  
  nextStep: function(step) {
    if (step == 1) {
      var tab = document.getElementById('myTabList');
      tab.tabs.advanceSelectedTab();
    } else {
      this.updateValues();
      window.close();
    }
  }
};


window.addEventListener("load", function () { wizard.onLoad(); }, false);

// Simulates PHP's date function
Date.prototype.format = function(format) {
        var returnStr = '';
        var replace = Date.replaceChars;
        for (var i = 0; i < format.length; i++) {               var curChar = format.charAt(i);                 if (i - 1 >= 0 && format.charAt(i - 1) == "\\") {
                        returnStr += curChar;
                }
                else if (replace[curChar]) {
                        returnStr += replace[curChar].call(this);
                } else if (curChar != "\\"){
                        returnStr += curChar;
                }
        }
        return returnStr;
};

Date.replaceChars = {
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        // Day
        d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
        D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
        j: function() { return this.getDate(); },
        l: function() { return Date.replaceChars.longDays[this.getDay()]; },
        N: function() { return this.getDay() + 1; },
        S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th'))); },
        w: function() { return this.getDay(); },
        z: function() { var d = new Date(this.getFullYear(),0,1); return Math.ceil((this - d) / 86400000); }, // Fixed now
        // Week
        W: function() { var d = new Date(this.getFullYear(), 0, 1); return Math.ceil((((this - d) / 86400000) + d.getDay() + 1) / 7); }, // Fixed now
        // Month
        F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
        m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
        M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
        n: function() { return this.getMonth() + 1; },
        t: function() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 0).getDate() }, // Fixed now, gets #days of date
        // Year
        L: function() { var year = this.getFullYear(); return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)); },       // Fixed now
        o: function() { var d  = new Date(this.valueOf());  d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3); return d.getFullYear();}, //Fixed now
        Y: function() { return this.getFullYear(); },
        y: function() { return ('' + this.getFullYear()).substr(2); },
        // Time
        a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
        A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
        B: function() { return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24); }, // Fixed now
        g: function() { return this.getHours() % 12 || 12; },
        G: function() { return this.getHours(); },
        h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
        H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
        i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
        s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
        u: function() { var m = this.getMilliseconds(); return (m < 10 ? '00' : (m < 100 ?'0' : '')) + m; },
        // Timezone
        e: function() { return "Not Yet Supported"; },
        I: function() { return "Not Yet Supported"; },
        O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
        P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':00'; }, // Fixed now
        T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
        Z: function() { return -this.getTimezoneOffset() * 60; },
        // Full Date/Time
        c: function() { return this.format("Y-m-d\\TH:i:sP"); }, // Fixed now
        r: function() { return this.toString(); },
        U: function() { return this.getTime() / 1000; }
};

Math.randomMax = function(maxVal, asFloat, resolution) {
	if (asFloat) {
		var result = Math.random()*maxVal;  
		if (resolution != undefined)
			result = Math.round(result/resolution)*resolution
		return result;
	} else
		return Math.floor(Math.random()*maxVal+1); 
}

// function to use while checking if element is in array
function convertToObject(a)
{
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
}
var DateDiff = {
 
    inDays: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
 
        return parseInt((t2-t1)/(24*3600*1000));
    },
 
    inWeeks: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
 
        return parseInt((t2-t1)/(24*3600*1000*7));
    },
 
    inMonths: function(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();
 
        return (d2M+12*d2Y)-(d1M+12*d1Y);
    },
 
    inYears: function(d1, d2) {
        return d2.getFullYear()-d1.getFullYear();
    }
}