const allCards = [{
  id: 1,
  img: "/cards/1B.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 2,
  img: "/cards/2S.svg",
  selected: false,
  selectedby : "",
  matches: [2, 87]
}, {
  id: 3,
  img: "/cards/3S.svg",
  selected: false,
  selectedby : "",
  matches: [3, 86]
}, {
  id: 4,
  img: "/cards/4S.svg",
  selected: false,
  selectedby : "",
  matches: [4, 85]
}, {
  id: 5,
  img: "/cards/5S.svg",
  selected: false,
  selectedby : "",
  matches: [5, 84]
}, {
  id: 6,
  img: "/cards/6S.svg",
  selected: false,
  selectedby : "",
  matches: [6, 83]
}, {
  id: 7,
  img: "/cards/7S.svg",
  selected: false,
  selectedby : "",
  matches: [7, 82]
}, {
  id: 8,
  img: "/cards/8S.svg",
  selected: false,
  selectedby : "",
  matches: [8, 72]
}, {
  id: 9,
  img: "/cards/9S.svg",
  selected: false,
  selectedby : "",
  matches: [9, 62]
}, {
  id: 10,
  img: "/cards/1B.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 11,
  img: "/cards/6C.svg",
  selected: false,
  selectedby : "",
  matches: [11, 33]
}, {
  id: 12,
  img: "/cards/5C.svg",
  selected: false,
  selectedby : "",
  matches: [12, 34]
}, {
  id: 13,
  img: "/cards/4C.svg",
  selected: false,
  selectedby : "",
  matches: [13, 35]
}, {
  id: 14,
  img: "/cards/3C.svg",
  selected: false,
  selectedby : "",
  matches: [14, 36]
}, {
  id: 15,
  img: "/cards/2C.svg",
  selected: false,
  selectedby : "",
  matches: [15, 37]
}, {
  id: 16,
  img: "/cards/AH.svg",
  selected: false,
  selectedby : "",
  matches: [16, 47]
}, {
  id: 17,
  img: "/cards/KH.svg",
  selected: false,
  selectedby : "",
  matches: [17, 57]
}, {
  id: 18,
  img: "/cards/QH.svg",
  selected: false,
  selectedby : "",
  matches: [18, 67]
}, {
  id: 19,
  img: "/cards/TH.svg",
  selected: false,
  selectedby : "",
  matches: [19, 66]
}, {
  id: 20,
  img: "/cards/TS.svg",
  selected: false,
  selectedby : "",
  matches: [20, 52]
}, {
  id: 21,
  img: "/cards/7C.svg",
  selected: false,
  selectedby : "",
  matches: [21, 43]
}, {
  id: 22,
  img: "/cards/AS.svg",
  selected: false,
  selectedby : "",
  matches: [22, 50]
}, {
  id: 23,
  img: "/cards/2D.svg",
  selected: false,
  selectedby : "",
  matches: [23, 60]
}, {
  id: 24,
  img: "/cards/3D.svg",
  selected: false,
  selectedby : "",
  matches: [24, 70]
}, {
  id: 25,
  img: "/cards/4D.svg",
  selected: false,
  selectedby : "",
  matches: [25, 80]
}, {
  id: 26,
  img: "/cards/5D.svg",
  selected: false,
  selectedby : "",
  matches: [26, 90]
}, {
  id: 27,
  img: "/cards/6D.svg",
  selected: false,
  selectedby : "",
  matches: [27, 99]
}, {
  id: 28,
  img: "/cards/7D.svg",
  selected: false,
  selectedby : "",
  matches: [28, 98]
}, {
  id: 29,
  img: "/cards/9H.svg",
  selected: false,
  selectedby : "",
  matches: [29, 65]
}, {
  id: 30,
  img: "/cards/QS.svg",
  selected: false,
  selectedby : "",
  matches: [30, 42]
}, {
  id: 31,
  img: "/cards/8C.svg",
  selected: false,
  selectedby : "",
  matches: [31, 53]
}, {
  id: 32,
  img: "/cards/KS.svg",
  selected: false,
  selectedby : "",
  matches: [32, 40]
}, {
  id: 33,
  img: "/cards/6C.svg",
  selected: false,
  selectedby : "",
  matches: [11, 33]
}, {
  id: 34,
  img: "/cards/5C.svg",
  selected: false,
  selectedby : "",
  matches: [12, 34]
}, {
  id: 35,
  img: "/cards/4C.svg",
  selected: false,
  selectedby : "",
  matches: [13, 35]
}, {
  id: 36,
  img: "/cards/3C.svg",
  selected: false,
  selectedby : "",
  matches: [14, 36]
}, {
  id: 37,
  img: "/cards/2C.svg",
  selected: false,
  selectedby : "",
  matches: [15, 37]
}, {
  id: 38,
  img: "/cards/8D.svg",
  selected: false,
  selectedby : "",
  matches: [38, 97]
}, {
  id: 39,
  img: "/cards/8H.svg",
  selected: false,
  selectedby : "",
  matches: [39, 64]
}, {
  id: 40,
  img: "/cards/KS.svg",
  selected: false,
  selectedby : "",
  matches: [32, 40]
}, {
  id: 41,
  img: "/cards/9C.svg",
  selected: false,
  selectedby : "",
  matches: [41, 63]
}, {
  id: 42,
  img: "/cards/QS.svg",
  selected: false,
  selectedby : "",
  matches: [30, 42]
}, {
  id: 43,
  img: "/cards/7C.svg",
  selected: false,
  selectedby : "",
  matches: [21, 43]
}, {
  id: 44,
  img: "/cards/6H.svg",
  selected: false,
  selectedby : "",
  matches: [44, 59]
}, {
  id: 45,
  img: "/cards/5H.svg",
  selected: false,
  selectedby : "",
  matches: [45, 69]
}, {
  id: 46,
  img: "/cards/4H.svg",
  selected: false,
  selectedby : "",
  matches: [46, 79]
}, {
  id: 47,
  img: "/cards/AH.svg",
  selected: false,
  selectedby : "",
  matches: [16, 47]
}, {
  id: 48,
  img: "/cards/9D.svg",
  selected: false,
  selectedby : "",
  matches: [48, 96]
}, {
  id: 49,
  img: "/cards/7H.svg",
  selected: false,
  selectedby : "",
  matches: [49, 54]
}, {
  id: 50,
  img: "/cards/AS.svg",
  selected: false,
  selectedby : "",
  matches: [22, 50]
}, {
  id: 51,
  img: "/cards/TC.svg",
  selected: false,
  selectedby : "",
  matches: [51, 73]
}, {
  id: 52,
  img: "/cards/TS.svg",
  selected: false,
  selectedby : "",
  matches: [20, 52]
}, {
  id: 53,
  img: "/cards/8C.svg",
  selected: false,
  selectedby : "",
  matches: [31, 53]
}, {
  id: 54,
  img: "/cards/7H.svg",
  selected: false,
  selectedby : "",
  matches: [49, 54]
}, {
  id: 55,
  img: "/cards/2H.svg",
  selected: false,
  selectedby : "",
  matches: [55, 88]
}, {
  id: 56,
  img: "/cards/3H.svg",
  selected: false,
  selectedby : "",
  matches: [56, 89]
}, {
  id: 57,
  img: "/cards/KH.svg",
  selected: false,
  selectedby : "",
  matches: [17, 57]
}, {
  id: 58,
  img: "/cards/TD.svg",
  selected: false,
  selectedby : "",
  matches: [58, 95]
}, {
  id: 59,
  img: "/cards/6H.svg",
  selected: false,
  selectedby : "",
  matches: [44, 59]
}, {
  id: 60,
  img: "/cards/2D.svg",
  selected: false,
  selectedby : "",
  matches: [23, 60]
}, {
  id: 61,
  img: "/cards/QC.svg",
  selected: false,
  selectedby : "",
  matches: [61, 74]
}, {
  id: 62,
  img: "/cards/9S.svg",
  selected: false,
  selectedby : "",
  matches: [9, 62]
}, {
  id: 63,
  img: "/cards/9C.svg",
  selected: false,
  selectedby : "",
  matches: [41, 63]
}, {
  id: 64,
  img: "/cards/8H.svg",
  selected: false,
  selectedby : "",
  matches: [39, 64]
}, {
  id: 65,
  img: "/cards/9H.svg",
  selected: false,
  selectedby : "",
  matches: [29, 65]
}, {
  id: 66,
  img: "/cards/TH.svg",
  selected: false,
  selectedby : "",
  matches: [19, 66]
}, {
  id: 67,
  img: "/cards/QH.svg",
  selected: false,
  selectedby : "",
  matches: [18, 67]
}, {
  id: 68,
  img: "/cards/QD.svg",
  selected: false,
  selectedby : "",
  matches: [68, 94]
}, {
  id: 69,
  img: "/cards/5H.svg",
  selected: false,
  selectedby : "",
  matches: [45, 69]
}, {
  id: 70,
  img: "/cards/3D.svg",
  selected: false,
  selectedby : "",
  matches: [24, 70]
}, {
  id: 71,
  img: "/cards/KC.svg",
  selected: false,
  selectedby : "",
  matches: [71, 75]
}, {
  id: 72,
  img: "/cards/8S.svg",
  selected: false,
  selectedby : "",
  matches: [8, 72]
}, {
  id: 73,
  img: "/cards/TC.svg",
  selected: false,
  selectedby : "",
  matches: [51, 73]
}, {
  id: 74,
  img: "/cards/QC.svg",
  selected: false,
  selectedby : "",
  matches: [61, 74]
}, {
  id: 75,
  img: "/cards/KC.svg",
  selected: false,
  selectedby : "",
  matches: [71, 75]
}, {
  id: 76,
  img: "/cards/AC.svg",
  selected: false,
  selectedby : "",
  matches: [76, 81]
}, {
  id: 77,
  img: "/cards/AD.svg",
  selected: false,
  selectedby : "",
  matches: [77, 92]
}, {
  id: 78,
  img: "/cards/KD.svg",
  selected: false,
  selectedby : "",
  matches: [78, 93]
}, {
  id: 79,
  img: "/cards/4H.svg",
  selected: false,
  selectedby : "",
  matches: [46, 79]
}, {
  id: 80,
  img: "/cards/4D.svg",
  selected: false,
  selectedby : "",
  matches: [25, 80]
}, {
  id: 81,
  img: "/cards/AC.svg",
  selected: false,
  selectedby : "",
  matches: [76, 81]
}, {
  id: 82,
  img: "/cards/7S.svg",
  selected: false,
  selectedby : "",
  matches: [7, 82]
}, {
  id: 83,
  img: "/cards/6S.svg",
  selected: false,
  selectedby : "",
  matches: [6, 83]
}, {
  id: 84,
  img: "/cards/5S.svg",
  selected: false,
  selectedby : "",
  matches: [5, 84]
}, {
  id: 85,
  img: "/cards/4S.svg",
  selected: false,
  selectedby : "",
  matches: [4, 85]
}, {
  id: 86,
  img: "/cards/3S.svg",
  selected: false,
  selectedby : "",
  matches: [3, 86]
}, {
  id: 87,
  img: "/cards/2S.svg",
  selected: false,
  selectedby : "",
  matches: [2, 87]
}, {
  id: 88,
  img: "/cards/2H.svg",
  selected: false,
  selectedby : "",
  matches: [55, 88]
}, {
  id: 89,
  img: "/cards/3H.svg",
  selected: false,
  selectedby : "",
  matches: [56, 89]
}, {
  id: 90,
  img: "/cards/5D.svg",
  selected: false,
  selectedby : "",
  matches: [26, 90]
}, {
  id: 91,
  img: "/cards/1B.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 92,
  img: "/cards/AD.svg",
  selected: false,
  selectedby : "",
  matches: [77, 92]
}, {
  id: 93,
  img: "/cards/KD.svg",
  selected: false,
  selectedby : "",
  matches: [78, 93]
}, {
  id: 94,
  img: "/cards/QD.svg",
  selected: false,
  selectedby : "",
  matches: [68, 94]
}, {
  id: 95,
  img: "/cards/TD.svg",
  selected: false,
  selectedby : "",
  matches: [58, 95]
}, {
  id: 96,
  img: "/cards/9D.svg",
  selected: false,
  selectedby : "",
  matches: [48, 96]
}, {
  id: 97,
  img: "/cards/8D.svg",
  selected: false,
  selectedby : "",
  matches: [38, 97]
}, {
  id: 98,
  img: "/cards/7D.svg",
  selected: false,
  selectedby : "",
  matches: [28, 98]
}, {
  id: 99,
  img: "/cards/6D.svg",
  selected: false,
  selectedby : "",
  matches: [27, 99]
}, {
  id: 100,
  img: "/cards/1B.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 101,
  img: "/cards/JD.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 102,
  img: "/cards/JD.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 103,
  img: "/cards/JC.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 104,
  img: "/cards/JC.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 105,
  img: "/cards/JS.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 106,
  img: "/cards/JS.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 107,
  img: "/cards/JH.png",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 108,
  img: "/cards/JH.png",
  selected: false,
  selectedby : "",
  matches: []
},
];

export default allCards; 