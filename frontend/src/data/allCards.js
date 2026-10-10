const allCards = [{
  id: 1,
  name: "Corner",
  img: "/cards/corner.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 2,
  name: "Two of Spades",
  img: "/cards/two_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [2, 87]
}, {
  id: 3,
  name: "Three of Spades",
  img: "/cards/three_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [3, 86]
}, {
  id: 4,
  name: "Four of Spades",
  img: "/cards/four_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [4, 85]
}, {
  id: 5,
  name: "Five of Spades",
  img: "/cards/five_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [5, 84]
}, {
  id: 6,
  name: "Six of Spades",
  img: "/cards/six_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [6, 83]
}, {
  id: 7,
  name: "Seven of Spades",
  img: "/cards/seven_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [7, 82]
}, {
  id: 8,
  name: "Eight of Spades",
  img: "/cards/eight_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [8, 72]
}, {
  id: 9,
  name: "Nine of Spades",
  img: "/cards/nine_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [9, 62]
}, {
  id: 10,
  name: "Corner",
  img: "/cards/corner.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 11,
  name: "Six of Clubs",
  img: "/cards/six_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [11, 33]
}, {
  id: 12,
  name: "Five of Clubs",
  img: "/cards/five_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [12, 34]
}, {
  id: 13,
  name: "Four of Clubs",
  img: "/cards/four_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [13, 35]
}, {
  id: 14,
  name: "Three of Clubs",
  img: "/cards/three_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [14, 36]
}, {
  id: 15,
  name: "Two of Clubs",
  img: "/cards/two_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [15, 37]
}, {
  id: 16,
  name: "Ace of Hearts",
  img: "/cards/ace_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [16, 47]
}, {
  id: 17,
  name: "King of Hearts",
  img: "/cards/king_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [17, 57]
}, {
  id: 18,
  name: "Queen of Hearts",
  img: "/cards/queen_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [18, 67]
}, {
  id: 19,
  name: "Ten of Hearts",
  img: "/cards/ten_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [19, 66]
}, {
  id: 20,
  name: "Ten of Spades",
  img: "/cards/ten_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [20, 52]
}, {
  id: 21,
  name: "Seven of Clubs",
  img: "/cards/seven_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [21, 43]
}, {
  id: 22,
  name: "Ace of Spades",
  img: "/cards/ace_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [22, 50]
}, {
  id: 23,
  name: "Two of Diamonds",
  img: "/cards/two_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [23, 60]
}, {
  id: 24,
  name: "Three of Diamonds",
  img: "/cards/three_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [24, 70]
}, {
  id: 25,
  name: "Four of Diamonds",
  img: "/cards/four_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [25, 80]
}, {
  id: 26,
  name: "Five of Diamonds",
  img: "/cards/five_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [26, 90]
}, {
  id: 27,
  name: "Six of Diamonds",
  img: "/cards/six_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [27, 99]
}, {
  id: 28,
  name: "Seven of Diamonds",
  img: "/cards/seven_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [28, 98]
}, {
  id: 29,
  name: "Nine of Hearts",
  img: "/cards/nine_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [29, 65]
}, {
  id: 30,
  name: "Queen of Spades",
  img: "/cards/queen_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [30, 42]
}, {
  id: 31,
  name: "Eight of Clubs",
  img: "/cards/eight_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [31, 53]
}, {
  id: 32,
  name: "King of Spades",
  img: "/cards/king_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [32, 40]
}, {
  id: 33,
  name: "Six of Clubs",
  img: "/cards/six_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [11, 33]
}, {
  id: 34,
  name: "Five of Clubs",
  img: "/cards/five_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [12, 34]
}, {
  id: 35,
  name: "Four of Clubs",
  img: "/cards/four_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [13, 35]
}, {
  id: 36,
  name: "Three of Clubs",
  img: "/cards/three_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [14, 36]
}, {
  id: 37,
  name: "Two of Clubs",
  img: "/cards/two_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [15, 37]
}, {
  id: 38,
  name: "Eight of Diamonds",
  img: "/cards/eight_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [38, 97]
}, {
  id: 39,
  name: "Eight of Hearts",
  img: "/cards/eight_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [39, 64]
}, {
  id: 40,
  name: "King of Spades",
  img: "/cards/king_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [32, 40]
}, {
  id: 41,
  name: "Nine of Clubs",
  img: "/cards/nine_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [41, 63]
}, {
  id: 42,
  name: "Queen of Spades",
  img: "/cards/queen_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [30, 42]
}, {
  id: 43,
  name: "Seven of Clubs",
  img: "/cards/seven_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [21, 43]
}, {
  id: 44,
  name: "Six of Hearts",
  img: "/cards/six_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [44, 59]
}, {
  id: 45,
  name: "Five of Hearts",
  img: "/cards/five_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [45, 69]
}, {
  id: 46,
  name: "Four of Hearts",
  img: "/cards/four_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [46, 79]
}, {
  id: 47,
  name: "Ace of Hearts",
  img: "/cards/ace_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [16, 47]
}, {
  id: 48,
  name: "Nine of Diamonds",
  img: "/cards/nine_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [48, 96]
}, {
  id: 49,
  name: "Seven of Hearts",
  img: "/cards/seven_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [49, 54]
}, {
  id: 50,
  name: "Ace of Spades",
  img: "/cards/ace_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [22, 50]
}, {
  id: 51,
  name: "Ten of Clubs",
  img: "/cards/ten_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [51, 73]
}, {
  id: 52,
  name: "Ten of Spades",
  img: "/cards/ten_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [20, 52]
}, {
  id: 53,
  name: "Eight of Clubs",
  img: "/cards/eight_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [31, 53]
}, {
  id: 54,
  name: "Seven of Hearts",
  img: "/cards/seven_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [49, 54]
}, {
  id: 55,
  name: "Two of Hearts",
  img: "/cards/two_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [55, 88]
}, {
  id: 56,
  name: "Three of Hearts",
  img: "/cards/three_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [56, 89]
}, {
  id: 57,
  name: "King of Hearts",
  img: "/cards/king_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [17, 57]
}, {
  id: 58,
  name: "Ten of Diamonds",
  img: "/cards/ten_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [58, 95]
}, {
  id: 59,
  name: "Six of Hearts",
  img: "/cards/six_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [44, 59]
}, {
  id: 60,
  name: "Two of Diamonds",
  img: "/cards/two_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [23, 60]
}, {
  id: 61,
  name: "Queen of Clubs",
  img: "/cards/queen_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [61, 74]
}, {
  id: 62,
  name: "Nine of Spades",
  img: "/cards/nine_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [9, 62]
}, {
  id: 63,
  name: "Nine of Clubs",
  img: "/cards/nine_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [41, 63]
}, {
  id: 64,
  name: "Eight of Hearts",
  img: "/cards/eight_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [39, 64]
}, {
  id: 65,
  name: "Nine of Hearts",
  img: "/cards/nine_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [29, 65]
}, {
  id: 66,
  name: "Ten of Hearts",
  img: "/cards/ten_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [19, 66]
}, {
  id: 67,
  name: "Queen of Hearts",
  img: "/cards/queen_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [18, 67]
}, {
  id: 68,
  name: "Queen of Diamonds",
  img: "/cards/queen_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [68, 94]
}, {
  id: 69,
  name: "Five of Hearts",
  img: "/cards/five_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [45, 69]
}, {
  id: 70,
  name: "Three of Diamonds",
  img: "/cards/three_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [24, 70]
}, {
  id: 71,
  name: "King of Clubs",
  img: "/cards/king_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [71, 75]
}, {
  id: 72,
  name: "Eight of Spades",
  img: "/cards/eight_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [8, 72]
}, {
  id: 73,
  name: "Ten of Clubs",
  img: "/cards/ten_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [51, 73]
}, {
  id: 74,
  name: "Queen of Clubs",
  img: "/cards/queen_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [61, 74]
}, {
  id: 75,
  name: "King of Clubs",
  img: "/cards/king_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [71, 75]
}, {
  id: 76,
  name: "Ace of Clubs",
  img: "/cards/ace_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [76, 81]
}, {
  id: 77,
  name: "Ace of Diamonds",
  img: "/cards/ace_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [77, 92]
}, {
  id: 78,
  name: "King of Diamonds",
  img: "/cards/king_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [78, 93]
}, {
  id: 79,
  name: "Four of Hearts",
  img: "/cards/four_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [46, 79]
}, {
  id: 80,
  name: "Four of Diamonds",
  img: "/cards/four_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [25, 80]
}, {
  id: 81,
  name: "Ace of Clubs",
  img: "/cards/ace_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: [76, 81]
}, {
  id: 82,
  name: "Seven of Spades",
  img: "/cards/seven_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [7, 82]
}, {
  id: 83,
  name: "Six of Spades",
  img: "/cards/six_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [6, 83]
}, {
  id: 84,
  name: "Five of Spades",
  img: "/cards/five_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [5, 84]
}, {
  id: 85,
  name: "Four of Spades",
  img: "/cards/four_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [4, 85]
}, {
  id: 86,
  name: "Three of Spades",
  img: "/cards/three_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [3, 86]
}, {
  id: 87,
  name: "Two of Spades",
  img: "/cards/two_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: [2, 87]
}, {
  id: 88,
  name: "Two of Hearts",
  img: "/cards/two_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [55, 88]
}, {
  id: 89,
  name: "Three of Hearts",
  img: "/cards/three_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: [56, 89]
}, {
  id: 90,
  name: "Five of Diamonds",
  img: "/cards/five_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [26, 90]
}, {
  id: 91,
  name: "Corner",
  img: "/cards/corner.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 92,
  name: "Ace of Diamonds",
  img: "/cards/ace_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [77, 92]
}, {
  id: 93,
  name: "King of Diamonds",
  img: "/cards/king_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [78, 93]
}, {
  id: 94,
  name: "Queen of Diamonds",
  img: "/cards/queen_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [68, 94]
}, {
  id: 95,
  name: "Ten of Diamonds",
  img: "/cards/ten_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [58, 95]
}, {
  id: 96,
  name: "Nine of Diamonds",
  img: "/cards/nine_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [48, 96]
}, {
  id: 97,
  name: "Eight of Diamonds",
  img: "/cards/eight_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [38, 97]
}, {
  id: 98,
  name: "Seven of Diamonds",
  img: "/cards/seven_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [28, 98]
}, {
  id: 99,
  name: "Six of Diamonds",
  img: "/cards/six_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: [27, 99]
}, {
  id: 100,
  name: "Corner",
  img: "/cards/corner.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 101,
  name: "Jack of Diamonds",
  img: "/cards/jack_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 102,
  name: "Jack of Diamonds",
  img: "/cards/jack_of_diamonds.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 103,
  name: "Jack of Clubs",
  img: "/cards/jack_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 104,
  name: "Jack of Clubs",
  img: "/cards/jack_of_clubs.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 105,
  name: "Jack of Spades",
  img: "/cards/jack_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 106,
  name: "Jack of Spades",
  img: "/cards/jack_of_spades.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 107,
  name: "Jack of Hearts",
  img: "/cards/jack_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: []
}, {
  id: 108,
  name: "Jack of Hearts",
  img: "/cards/jack_of_hearts.svg",
  selected: false,
  selectedby : "",
  matches: []
},
];

export default allCards; 