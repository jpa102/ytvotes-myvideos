// title: author's dislike count fetcher
// description: allows you to see the dislike counts provided by the creator of the video
// creator: John Patrick Adem

/*
	VARIABLES
*/

var gitfetchurl;
var likes;
var dislikes;



/*
	FUNCTIONS
*/

// code source: https://www.reddit.com/r/GoogleAppsScript/comments/185tw8f/comment/kb4t2o4/
// youtube seems to be restrictive now, urban dictionary doesn't behave like this
// this code block is here for the ratio bar to render below the like & dislike buttons
if (window.trustedTypes && window.trustedTypes.createPolicy) {
	window.trustedTypes.createPolicy('default', {
		createHTML: string => string,
		createScriptURL: string => string,
		createScript: string => string,
	});
}

function getVideoId() {
	const urlObject = new URL(window.location.href);
	const pathname = urlObject.pathname;
	if (pathname.startsWith("/clip")) {
		return document.querySelector("meta[itemprop='videoId']").content;
	} else {
		if (pathname.startsWith("/shorts")) {
			return pathname.slice(8);
		}
		return urlObject.searchParams.get("v");
	}
}

function checkForUserAvatarButton() {
	if (document.querySelector("#avatar-btn")) {
		isSignedOut = true;
	} else {
		isSignedOut = false;
	}
}

function UrlExists(url) {
	var http = new XMLHttpRequest();
	http.open('HEAD', url, false);
	http.send();
	if (http.status != 404) {
		urldoesexists = true;
	} else {
		urldoesexists = false;
	}
}

function addDislikeCounts() {
	document.querySelector("dislike-button-view-model > toggle-button-view-model > button-view-model > button").insertAdjacentHTML(
		"beforeend",
		`
		<div id="dislike-count-renderer" class="yt-spec-button-shape-next__button-text-content">${dislikes}</div>
		`
	);
}

function getAverageRating() {
	oneStar = ReceivedDislikes * 1;
	fiveStar = ReceivedLikes * 5;
	totalVotes = (ReceivedDislikes + ReceivedLikes);
	totalStars = (oneStar + fiveStar);
	averageRating = (totalStars / totalVotes);
}

function getPercentage() {
	likepercentage = ReceivedLikes + ReceivedDislikes > 0 ? (ReceivedLikes / (ReceivedLikes + ReceivedDislikes)) * 100 : 50;
	roundedlikepercent = likepercentage.toFixed(1);
}

function addRatioBar() {
	ratiobarlength = document.querySelector(".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper").clientWidth;
	document.querySelector("#top-row").style = "padding-bottom: 6px; border-bottom: 1px solid var(--yt-spec-10-percent-layer);";
	
	if (document.querySelector("#ratio-bar-from-javascript") != null && document.querySelector("ratio-bar-renderer") == null) {
		console.log("ratio bar styles is already present but the ratio bar html is missing, readding...");
		
		ratiobarlength = document.querySelector(".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper").clientWidth;
		
		document.querySelector(".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper").insertAdjacentHTML(
			"beforeend",
			`
				<ratio-bar-renderer id="sentiment" class="like-dislike-info-renderer" style="width: ${ratiobarlength}px;" title="${likepercentage} / ${averageRating}">
					<div id="container" class="like-dislike-info-renderer">
						<div id="like-bar" class="like-dislike-info-renderer" style="width: ${roundedlikepercent}%"></div>
					</div>
					<tp-yt-paper-tooltip position="top" class="style-scope ytd-sentiment-bar-renderer" role="tooltip" tabindex="-1">
						${likes} / ${dislikes} &nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						<div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">
							${likes} / ${dislikes} &nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						</div>
					</tp-yt-paper-tooltip>
				</ratio-bar-renderer>
			`
		);
	}
	
	if (document.querySelector("#ratio-bar-from-javascript") == null) {
		document.head.insertAdjacentHTML(
			"afterbegin",
			`
				<style id="ratio-bar-from-javascript">
					#sentiment.like-dislike-info-renderer {
						position: absolute;
						margin-top: 36px;
						padding-top: 8px;
						padding-bottom: 14px;
					}
					
					#container.like-dislike-info-renderer {
						height: 2px;
						background-color: #909090;
					}
					
					#like-bar.like-dislike-info-renderer {
						width: 100%;
						background: #000;
						height: 2px;
						transition: width 0.3s;
					}
				</style>
			`
		);
	} else {
		console.log("ratio bar styles is already present");
		
		ratiobarlength = document.querySelector(".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper").clientWidth;
		document.querySelector("ratio-bar-renderer").style = "width: " + ratiobarlength + "px";
	}
	
	if (document.querySelector("ratio-bar-renderer") == null) {
		document.querySelector(".YtSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper").insertAdjacentHTML(
			"beforeend",
			`
				<ratio-bar-renderer id="sentiment" class="like-dislike-info-renderer" style="width: ${ratiobarlength}px;" title="${likepercentage} / ${averageRating}">
					<div id="container" class="like-dislike-info-renderer">
						<div id="like-bar" class="like-dislike-info-renderer" style="width: ${roundedlikepercent}%"></div>
					</div>
					<tp-yt-paper-tooltip position="top" class="style-scope ytd-sentiment-bar-renderer" role="tooltip" tabindex="-1">
						${likes} / ${dislikes} &nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						<div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">
							${likes} / ${dislikes} &nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						</div>
					</tp-yt-paper-tooltip>
				</ratio-bar-renderer>
			`
		);
	} else {
		console.log("ratio bar html is already present");
	}
}

function FetchTheVideoDislikeData() {
	gitfetchurl = "https://raw.githubusercontent.com/jpa102/ytvotes-myvideos/main/videoids/" + getVideoId() + "/data.json";
	
	UrlExists(gitfetchurl);
	
	if (urldoesexists == true) {
		fetch(gitfetchurl).then((response) => {
			response.json().then((json) => {
				if (json) {
					let { id, videoTitle, likeCount, dislikeCount, viewCount, favoriteCount, commentCount } = json;
					console.log("Data provided by jpa102 \(github\)\n\nVideo ID: " + id + "\nVideo title: " + videoTitle + "\nViews: " + viewCount + "\nLike count: " + likeCount + "\nDislike count: " + dislikeCount);
					
					ReceivedLikes = likeCount;
					ReceivedDislikes = dislikeCount;
					likes = ReceivedLikes.toLocaleString();
					dislikes = ReceivedDislikes.toLocaleString();
					
					likeCount = likeCount;
					dislikeCount = dislikeCount;
					viewCount = viewCount;
					videoTitle = videoTitle;
					
					getAverageRating();
					getPercentage();
				}
			})
		});
	}
	
	if (urldoesexists == false) {
		fetch(`https://raw.githubusercontent.com/jpa102/ytvotes-myvideos/main/videoids/null/data.json`).then((response) => {
			response.json().then((json) => {
				if (json) {
					let { id, videoTitle, likeCount, dislikeCount, viewCount, favoriteCount, commentCount } = json;
					console.log("Data provided by jpa102 \(github\)\n\nVideo ID: " + id + "\nVideo title: " + videoTitle + "\nViews: " + viewCount + "\nLike count: " + likeCount + "\nDislike count: " + dislikeCount);
					
					ReceivedLikes = likeCount;
					ReceivedDislikes = dislikeCount;
					
					likeCount = likeCount;
					dislikeCount = dislikeCount;
					viewCount = viewCount;
					videoTitle = videoTitle;
					
					likes = likeCount.toLocaleString();
					dislikes = dislikeCount;
				}
			})
		});
	}
}

function IncreaseLikeCount() {
	checkForUserAvatarButton();
	
	
}

function DecreaseLikeCount() {
	checkForUserAvatarButton();
	
	
}

function IncreaseDislikeCount() {
	checkForUserAvatarButton();
	
	
}

function DecreaseDislikeCount() {
	checkForUserAvatarButton();
	
	
}



/*
	MAIN EXECUTION
*/



// attempt to match the video id with the one from github repository
FetchTheVideoDislikeData();

// inject the dislike count to the dislike button
setTimeout(function() {
	// like and dislike button padding patch (included)
	var paddingLeftPxSize = 20; // the px for the padding-left css; default is 20px
	var paddingRightPxSize = 15; // the px for the padding-right css; default is 15px
	
	document.querySelector("head").insertAdjacentHTML(
		"afterbegin",
		`
			<style id="like-dislike-button-padding-patch-css">
				.like-and-dislike-padding-patch {
					padding-left: ${paddingLeftPxSize}px !important;
					padding-right: ${paddingRightPxSize}px !important;
				}
			</style>
		`
	);
	
	document.querySelector("like-button-view-model > toggle-button-view-model > button-view-model > button").classList.add("like-and-dislike-padding-patch"); // like button
	document.querySelector("dislike-button-view-model > toggle-button-view-model > button-view-model > button").classList.add("like-and-dislike-padding-patch"); // dislike button
	// [end] like and dislike button padding patch (included)
	
	document.querySelector("dislike-button-view-model > toggle-button-view-model > button-view-model > button").classList.remove("yt-spec-button-shape-next--icon-button");
	document.querySelector("dislike-button-view-model > toggle-button-view-model > button-view-model > button").classList.add("yt-spec-button-shape-next--icon-leading");
	
	if (urldoesexists != false) {
		getAverageRating();
		getPercentage();
		addDislikeCounts();
		addRatioBar();
	}
	
	setInterval(function() {
		if (document.querySelector("#dislike-count-renderer") == null) {
			addDislikeCounts();
		}
	}, 500);
	
	// todo: add event listeners and code to increase or decrease the dislike count
	
}, 6500); // wait time to properly inject the dislikes (6.5 seconds)
