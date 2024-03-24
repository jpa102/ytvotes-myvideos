/*
	fetch data from https://raw.githubusercontent.com/
*/

fetch(
	`https://raw.githubusercontent.com/jpa102/ytvotes-myvideos/main/allinone_data.json`
	).then((response) => {
		response.json().then((json) => {
			if (json) {
				let { jsoninfo } = json;
				ReceivedData = jsoninfo;
				console.log(jsoninfo);
				alert(ReceivedData.responseText + "\n\nLast updated: " + ReceivedData.lastUpdateDate + " at " + ReceivedData.lastUpdateTime + "\nVersion: " + ReceivedData.version );
			}
		})
	}
);
