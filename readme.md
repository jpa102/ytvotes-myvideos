# YouTube Analytics - Data

## what's the purpose of this repository?

this repository **holds** *some data* from my youtube channel, mainly the **likes** & **dislikes** my videos received

i want to be transparent on how my videos perform, since youtube decided to remove the public dislike counter on all videos which i find extremely stupid

## how to fetch?

assuming you're getting data from `allinone_data.json`, here's the code: *(i only typed this code and pasted from devtools in the browser)*

example:

```
fetch("https://raw.githubusercontent.com/jpa102/ytvotes-myvideos/main/allinone_data.json").then((response) => {
	response.json().then((json) => {
		if (json) {
			let { info } = json;
			ReceivedIndexArrayData = info.ytvotes[indexarray].myvideo;
		})
	}
);
```

ReceivedIndexArrayData.id; // let's say you're getting the id stored in `ReceivedIndexArrayData`

where `indexarray` (0 for example) is the **index** number

this will be the result:

```json
{
	"id": "g4vUisXDmTg",
	"videoTitle": "sa: simulating \"Extended Gang Wars\" from PC to Mobile (revised vid)",
	"viewCount": 42471,
	"likeCount": 603,
	"dislikeCount": 19,
	"favoriteCount": 0,
	"commentCount": 174
}
```

# Questions

## can't you and me just rely on dislikes provided from [Return Youtube Dislike?](https://returnyoutubedislike.com/)

while it does a **decent job** at displaying the *"probable"* amount of **dislikes** a video has, it's still **mediocre** for me

by getting my dislike data myself from youtube studio, this makes the votes extremely accurate, like 1:1

## why are they far off compared to google's youtube api and return youtube dislike api?

just like https://returnyoutubedislikeapi.com, i don't get to update them often. they will stay that way until i decide to

## why are json files stored in their own directory?

if you're the type of person to have all things in **one** place, there's this file named `allinone_data.json`

they have their own directories because i use it to fetch the json data by their video id in the url path, example is https://raw.githubusercontent.com/jpa102/ytvotes-myvideos/main/videoids/g4vUisXDmTg/data.json

# side comment

if other *youtubers* have a github account and decided to share their video statistics like i did, i think it would be **great for everyone**
