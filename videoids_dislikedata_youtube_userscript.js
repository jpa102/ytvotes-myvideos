// ==UserScript==
// @name         author's dislike count fetcher
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  allows you to see the dislike counts provided by the creator of the video
// @author       John Patrick Adem
// @match        *://*.youtube.com/*
// @downloadURL  https://github.com/jpa102/ytvotes-myvideos/raw/main/videoids_dislikedata_youtube_userscript.js
// @updateURL    https://github.com/jpa102/ytvotes-myvideos/raw/main/videoids_dislikedata_youtube_userscript.js
// @require      https://raw.githubusercontent.com/jpa102/ytscripts/main/trustedtypes_patch.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM.xmlHttpRequest
// @connect      youtube.com
// @run-at       document-end
// ==/UserScript==

/*
	VARIABLES
*/

var gitfetchurl;
var likes;
var dislikes;

// this is required for userscript
var urldoesexists;
var isSignedOut;
var oneStar;
var fiveStar;
var totalVotes;
var totalStars;
var averageRating;
var likepercentage;
var roundedlikepercent;
var ratiobarlength;
var ReceivedLikes;
var ReceivedDislikes;




/*
	FUNCTIONS
*/



// obtained from return youtube dislike
// project: https://github.com/Anarios/return-youtube-dislike
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

// obtained from return youtube dislike
// project: https://github.com/Anarios/return-youtube-dislike
// this check is weak in my opinion
function checkForSignInButton() {
	if (
		document.querySelector(
			"a[href^='https://accounts.google.com/ServiceLogin']"
		)
	) {
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
	let dislikeButton = document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > dislike-button-view-model > toggle-button-view-model > button-view-model > button");
	let dislikeContainer = document.createElement("div");
	dislikeContainer.id = "dislike-count-renderer";
	dislikeContainer.setAttribute("class", "yt-spec-button-shape-next__button-text-content");
	dislikeContainer.innerText = dislikes;
	dislikeButton.insertBefore(dislikeContainer, dislikeButton.children[0].nextSibling);
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

function addRatioBar(resizeIfTrue) {
	ratiobarlength = document.querySelector("ytd-menu-renderer.ytd-watch-metadata > #top-level-buttons-computed.ytd-menu-renderer > segmented-like-dislike-button-view-model").clientWidth;
	
	if (resizeIfTrue == true) {
		document.querySelector(".ratio-bar-renderer-html").style = "width: " + ratiobarlength + "px;";
		return;
	}

	if (document.querySelector(".ratio-bar-renderer-html") == null && document.querySelector(".ratio-bar-renderer") != null) {
		console.log("ratio bar styles is already present but the ratio bar html is missing, readding...");
	
		ratiobarlength = document.querySelector("ytd-menu-renderer.ytd-watch-metadata > #top-level-buttons-computed.ytd-menu-renderer > segmented-like-dislike-button-view-model").clientWidth;
	
		document.querySelector("ytd-menu-renderer.ytd-watch-metadata > #top-level-buttons-computed.ytd-menu-renderer").insertAdjacentHTML(
			"beforeend",
			`
				<ytd-sentiment-bar-renderer id="sentiment" class="style-scope ytd-video-primary-info-renderer ratio-bar-renderer-html" style="width: ${ratiobarlength}px;" title="${likepercentage}% / ${averageRating}">
					<div id="container" class="style-scope ytd-sentiment-bar-renderer">
						<div id="like-bar" class="style-scope ytd-sentiment-bar-renderer" style="width: ${roundedlikepercent}%"></div>
					</div>
					<tp-yt-paper-tooltip position="top" class="style-scope ytd-sentiment-bar-renderer" role="tooltip" tabindex="-1" aria-label="tooltip">
						${likes} / ${dislikes}&nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						<!--css-build:shady-->
						<!--css_build_scope:tp-yt-paper-tooltip-->
						<!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js-->
						<div id="tooltip" class="style-scope tp-yt-paper-tooltip hidden" style-target="tooltip">
							${likes} / ${dislikes}&nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						</div>
					</tp-yt-paper-tooltip>
				</ytd-sentiment-bar-renderer>
			`
		);
	}
	
	if (document.querySelector(".ratio-bar-renderer-html") != null && document.querySelector(".ratio-bar-renderer") == null) {
		console.log("ratio bar styles is missing but the ratio bar html is already present, readding...");
		
		document.head.insertAdjacentHTML(
			"afterbegin",
			`
				<style class="ratio-bar-renderer">
					#top-row.ytd-watch-metadata {
						padding-bottom: 6px;
						border-bottom: 1px solid var(--yt-spec-10-percent-layer);
					}
					
					ytd-watch-metadata[actions-on-separate-line] #top-row.ytd-watch-metadata  {
						padding-bottom: 10px;
					}
					
					ytd-sentiment-bar-renderer.ratio-bar-renderer-html {
						left: unset !important;
						top: 77px;
					}
					
					ytd-watch-flexy[is-single-column] ytd-sentiment-bar-renderer.ratio-bar-renderer-html {
						left: unset !important;
						top: 89px;
					}
					
					ytd-watch-flexy[is-single-column] ytd-watch-metadata[actions-on-separate-line] ytd-sentiment-bar-renderer.ratio-bar-renderer-html {
						left: unset !important;
						top: 141px;
					}
				</style>
			`
		);
	}
	
	if (document.querySelector(".ratio-bar-renderer-html") == null) {
		document.querySelector("ytd-menu-renderer.ytd-watch-metadata > #top-level-buttons-computed.ytd-menu-renderer").insertAdjacentHTML(
			"beforeend",
			`
				<ytd-sentiment-bar-renderer id="sentiment" class="style-scope ytd-video-primary-info-renderer ratio-bar-renderer-html" style="width: ${ratiobarlength}px;" title="${likepercentage}% / ${averageRating}">
					<div id="container" class="style-scope ytd-sentiment-bar-renderer">
						<div id="like-bar" class="style-scope ytd-sentiment-bar-renderer" style="width: ${roundedlikepercent}%"></div>
					</div>
					<tp-yt-paper-tooltip position="top" class="style-scope ytd-sentiment-bar-renderer" role="tooltip" tabindex="-1" aria-label="tooltip">
						${likes} / ${dislikes}&nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						<!--css-build:shady-->
						<!--css_build_scope:tp-yt-paper-tooltip-->
						<!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js-->
						<div id="tooltip" class="style-scope tp-yt-paper-tooltip hidden" style-target="tooltip">
							${likes} / ${dislikes}&nbsp;&nbsp;-&nbsp; ${roundedlikepercent}%
						</div>
					</tp-yt-paper-tooltip>
				</ytd-sentiment-bar-renderer>
			`
		);
	} else {
		console.log("ratio bar html is already present");
	}
	
	if (document.querySelector(".ratio-bar-renderer") == null) {
		document.head.insertAdjacentHTML(
			"afterbegin",
			`
				<style class="ratio-bar-renderer">
					#top-row.ytd-watch-metadata {
						padding-bottom: 6px;
						border-bottom: 1px solid var(--yt-spec-10-percent-layer);
					}
					
					ytd-watch-metadata[actions-on-separate-line] #top-row.ytd-watch-metadata  {
						padding-bottom: 10px;
					}
					
					ytd-sentiment-bar-renderer.ratio-bar-renderer-html {
						left: unset !important;
						top: 77px;
					}
					
					ytd-watch-flexy[is-single-column] ytd-sentiment-bar-renderer.ratio-bar-renderer-html {
						left: unset !important;
						top: 89px;
					}
					
					ytd-watch-flexy[is-single-column] ytd-watch-metadata[actions-on-separate-line] ytd-sentiment-bar-renderer.ratio-bar-renderer-html {
						left: unset !important;
						top: 141px;
					}
				</style>
			`
		);
	} else {
		console.log("ratio bar styles is already present");
	}
}

function FetchTheVideoDislikeData() {
	gitfetchurl = "https://raw.githubusercontent.com/jpa102/ytvotes-myvideos/refs/heads/main/allinone_data.json";
	fetch(gitfetchurl).then((response) => {
		response.json().then((json) => {
			if (json) {
				let { jsoninfo, info } = json;

				let videoIdFound = false;
				let i = 0;
				let v = info.ytvotes.length - 1;
				while (videoIdFound == false) {
					let s = getVideoId();
					let t = info.ytvotes[i].myvideo.id;

					if (s != t) {
						i++;
					} else {
						videoIdFound = true;
					}
				}

				if (videoIdFound == true) {
					// instead of getting the data from json, get it from the main like button instead
					ReceivedLikes = parseInt(document.querySelector("like-button-view-model > toggle-button-view-model > button-view-model > button").ariaLabel.replace(/\D/g, ""));
					ReceivedDislikes = info.ytvotes[i].myvideo.dislikeCount;
					likes = ReceivedLikes.toLocaleString();
					dislikes = ReceivedDislikes.toLocaleString();

					// this will get the data from the json, unlike ReceivedLikes
					likeCount = info.ytvotes[i].myvideo.likeCount;
					dislikeCount = info.ytvotes[i].myvideo.dislikeCount;
					viewCount = info.ytvotes[i].myvideo.viewCount;
					videoTitle = info.ytvotes[i].myvideo.videoTitle;

					getAverageRating();
					getPercentage();
					
					console.log(`video id ${getVideoId()}' index is at ${i}`);
					console.log("Data provided by jpa102 \(github\)\n\nVideo ID: " + info.ytvotes[i].myvideo.id + "\nVideo title: " + info.ytvotes[i].myvideo.videoTitle + "\nViews: " + info.ytvotes[i].myvideo.viewCount + "\nLike count: " + info.ytvotes[i].myvideo.likeCount + "\nDislike count: " + info.ytvotes[i].myvideo.dislikeCount);
				} else {
					console.log(`video id '${getVideoId()}' is not found on the index :(`);
				}
			}
		})
	});
}

function likeCountPlusPlus() {
	ReceivedLikes++;
	getAverageRating();
	getPercentage();
	likes = ReceivedLikes.toLocaleString();
}

function likeCountMinusMinus() {
	ReceivedLikes--;
	getAverageRating();
	getPercentage();
	likes = ReceivedLikes.toLocaleString();
}

function dislikeCountPlusPlus() {
	ReceivedDislikes++;
	getAverageRating();
	getPercentage();
	dislikes = ReceivedDislikes.toLocaleString();
}

function dislikeCountMinusMinus() {
	ReceivedDislikes--;
	getAverageRating();
	getPercentage();
	dislikes = ReceivedDislikes.toLocaleString();
}



/*
	this is going to give you a major headache
	the true and false statements are reverse because i have no fucking idea why it does that
	if i set it to true, the counts decrease, and vice versa
*/
function increaseOrDecreaseLikeCount() {
	if (isSignedOut == true) {
		console.log("you are signed out, no action taken.");
		return;
	}

	if (document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed == "true") {
		likeCountPlusPlus();
		document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button > .yt-spec-button-shape-next__button-text-content")[0].innerText.innerText = likes;
		document.querySelector(".ratio-bar-renderer-html").title = likepercentage + "% / " + averageRating;
		document.querySelector(".ratio-bar-renderer-html > tp-yt-paper-tooltip > #tooltip").innerHTML = likes + " / " + dislikes + "&nbsp; - &nbsp;" + roundedlikepercent + "%";
		document.querySelector(".ratio-bar-renderer-html > #container > #like-bar").style = "width: " + likepercentage + "%";
		document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed = "true";
		addRatioBar(true);

		//	check to see if dislike button is already pressed before liking it
		if (document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed == "true") {
			dislikeCountMinusMinus();
			document.querySelector("#dislike-count-renderer").innerText = dislikes;
			document.querySelector(".ratio-bar-renderer-html").title = likepercentage + "% / " + averageRating;
			document.querySelector(".ratio-bar-renderer-html > tp-yt-paper-tooltip > #tooltip").innerHTML = likes + " / " + dislikes + "&nbsp; - &nbsp;" + roundedlikepercent + "%";
			document.querySelector(".ratio-bar-renderer-html > #container > #like-bar").style = "width: " + likepercentage + "%";
			document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed = "false";
			addRatioBar(true);
		}
		return;
	}

	if (document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed == "false") {
		likeCountMinusMinus();
		document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button > .yt-spec-button-shape-next__button-text-content")[0].innerText.innerText = likes;
		document.querySelector(".ratio-bar-renderer-html").title = likepercentage + "% / " + averageRating;
		document.querySelector(".ratio-bar-renderer-html > tp-yt-paper-tooltip > #tooltip").innerHTML = likes + " / " + dislikes + "&nbsp; - &nbsp;" + roundedlikepercent + "%";
		document.querySelector(".ratio-bar-renderer-html > #container > #like-bar").style = "width: " + likepercentage + "%";
		document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed = "false";
		addRatioBar(true);
		return;
	}
}

function increaseOrDecreaseDislikeCount() {
	if (isSignedOut == true) {
		console.log("you are signed out, no action taken.");
		return;
	}

	if (document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed == "true") {
		dislikeCountPlusPlus();
		document.querySelector("#dislike-count-renderer").innerText = dislikes;
		document.querySelector(".ratio-bar-renderer-html").title = likepercentage + "% / " + averageRating;
		document.querySelector(".ratio-bar-renderer-html > tp-yt-paper-tooltip > #tooltip").innerHTML = likes + " / " + dislikes + "&nbsp; - &nbsp;" + roundedlikepercent + "%";
		document.querySelector(".ratio-bar-renderer-html > #container > #like-bar").style = "width: " + likepercentage + "%";
		document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed = "true";
		console.log("dislike button state is " + document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed);
		addRatioBar(true);

		//	check to see if like button is already pressed before liking it
		if (document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed == "true") {
			likeCountMinusMinus();
			document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button > .yt-spec-button-shape-next__button-text-content")[0].innerText.innerText = likes;
			document.querySelector(".ratio-bar-renderer-html").title = likepercentage + "% / " + averageRating;
			document.querySelector(".ratio-bar-renderer-html > tp-yt-paper-tooltip > #tooltip").innerHTML = likes + " / " + dislikes + "&nbsp; - &nbsp;" + roundedlikepercent + "%";
			document.querySelector(".ratio-bar-renderer-html > #container > #like-bar").style = "width: " + likepercentage + "%";
			document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed = "false";
			console.log("like button state is " + document.querySelectorAll("like-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed);
			addRatioBar(true);
		}
		return;
	}

	if (document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed == "false") {
		dislikeCountMinusMinus();
		document.querySelector("#dislike-count-renderer").innerText = dislikes;
		document.querySelector(".ratio-bar-renderer-html").title = likepercentage + "% / " + averageRating;
		document.querySelector(".ratio-bar-renderer-html > tp-yt-paper-tooltip > #tooltip").innerHTML = likes + " / " + dislikes + "&nbsp; - &nbsp;" + roundedlikepercent + "%";
		document.querySelector(".ratio-bar-renderer-html > #container > #like-bar").style = "width: " + likepercentage + "%";
		document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed = "false";
		console.log("dislike button state is " + document.querySelectorAll("dislike-button-view-model > toggle-button-view-model > button-view-model > button")[0].ariaPressed);
		addRatioBar(true);
		return;
	}
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

	document.head.insertAdjacentHTML(
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

	document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > like-button-view-model > toggle-button-view-model > button-view-model > button").classList.add("like-and-dislike-padding-patch"); // like button
	document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > dislike-button-view-model > toggle-button-view-model > button-view-model > button").classList.add("like-and-dislike-padding-patch"); // dislike button
	// [end] like and dislike button padding patch (included)

	document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > dislike-button-view-model > toggle-button-view-model > button-view-model > button").classList.remove("yt-spec-button-shape-next--icon-button");
	document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > dislike-button-view-model > toggle-button-view-model > button-view-model > button").classList.add("yt-spec-button-shape-next--icon-leading");

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
	checkForSignInButton();
	document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > like-button-view-model > toggle-button-view-model > button-view-model > button").addEventListener("click", increaseOrDecreaseLikeCount); // like button
	document.querySelector(".ytSegmentedLikeDislikeButtonViewModelSegmentedButtonsWrapper > dislike-button-view-model > toggle-button-view-model > button-view-model > button").addEventListener("click", increaseOrDecreaseDislikeCount); // dislike button
	
}, 6500); // wait time to properly inject the dislikes (6.5 seconds)
