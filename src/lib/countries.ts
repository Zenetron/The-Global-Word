export interface Continent {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export interface Country {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  continent: string;
}

export const CONTINENTS: Continent[] = [
  { name: 'Afrique', nameEn: 'Africa', lat: 5.0, lng: 20.0 },
  { name: 'Amérique du Nord', nameEn: 'North America', lat: 40.0, lng: -100.0 },
  { name: 'Amérique du Sud', nameEn: 'South America', lat: -15.0, lng: -60.0 },
  { name: 'Asie', nameEn: 'Asia', lat: 45.0, lng: 90.0 },
  { name: 'Europe', nameEn: 'Europe', lat: 50.0, lng: 15.0 },
  { name: 'Océanie', nameEn: 'Oceania', lat: -25.0, lng: 135.0 }
];

export const COUNTRIES: Country[] = [
  {
    "name": "Afghanistan",
    "nameEn": "Afghanistan",
    "lat": 33,
    "lng": 65,
    "continent": "Asie"
  },
  {
    "name": "Afrique du Sud",
    "nameEn": "South Africa",
    "lat": -29,
    "lng": 24,
    "continent": "Afrique"
  },
  {
    "name": "Ahvenanmaa",
    "nameEn": "Åland Islands",
    "lat": 60.116667,
    "lng": 19.9,
    "continent": "Europe"
  },
  {
    "name": "Albanie",
    "nameEn": "Albania",
    "lat": 41,
    "lng": 20,
    "continent": "Europe"
  },
  {
    "name": "Algérie",
    "nameEn": "Algeria",
    "lat": 28,
    "lng": 3,
    "continent": "Afrique"
  },
  {
    "name": "Allemagne",
    "nameEn": "Germany",
    "lat": 51,
    "lng": 9,
    "continent": "Europe"
  },
  {
    "name": "Andorre",
    "nameEn": "Andorra",
    "lat": 42.5,
    "lng": 1.5,
    "continent": "Europe"
  },
  {
    "name": "Angola",
    "nameEn": "Angola",
    "lat": -12.5,
    "lng": 18.5,
    "continent": "Afrique"
  },
  {
    "name": "Anguilla",
    "nameEn": "Anguilla",
    "lat": 18.25,
    "lng": -63.16666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Antarctique",
    "nameEn": "Antarctica",
    "lat": -90,
    "lng": 0,
    "continent": "Océanie"
  },
  {
    "name": "Antigua-et-Barbuda",
    "nameEn": "Antigua and Barbuda",
    "lat": 17.05,
    "lng": -61.8,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Arabie Saoudite",
    "nameEn": "Saudi Arabia",
    "lat": 25,
    "lng": 45,
    "continent": "Asie"
  },
  {
    "name": "Argentine",
    "nameEn": "Argentina",
    "lat": -34,
    "lng": -64,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Arménie",
    "nameEn": "Armenia",
    "lat": 40,
    "lng": 45,
    "continent": "Asie"
  },
  {
    "name": "Aruba",
    "nameEn": "Aruba",
    "lat": 12.5,
    "lng": -69.96666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Australie",
    "nameEn": "Australia",
    "lat": -27,
    "lng": 133,
    "continent": "Océanie"
  },
  {
    "name": "Autriche",
    "nameEn": "Austria",
    "lat": 47.33333333,
    "lng": 13.33333333,
    "continent": "Europe"
  },
  {
    "name": "Azerbaïdjan",
    "nameEn": "Azerbaijan",
    "lat": 40.5,
    "lng": 47.5,
    "continent": "Asie"
  },
  {
    "name": "Bahamas",
    "nameEn": "Bahamas",
    "lat": 25.0343,
    "lng": -77.3963,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Bahreïn",
    "nameEn": "Bahrain",
    "lat": 26,
    "lng": 50.55,
    "continent": "Asie"
  },
  {
    "name": "Bangladesh",
    "nameEn": "Bangladesh",
    "lat": 24,
    "lng": 90,
    "continent": "Asie"
  },
  {
    "name": "Barbade",
    "nameEn": "Barbados",
    "lat": 13.16666666,
    "lng": -59.53333333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Belgique",
    "nameEn": "Belgium",
    "lat": 50.83333333,
    "lng": 4,
    "continent": "Europe"
  },
  {
    "name": "Belize",
    "nameEn": "Belize",
    "lat": 17.25,
    "lng": -88.75,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Bénin",
    "nameEn": "Benin",
    "lat": 9.5,
    "lng": 2.25,
    "continent": "Afrique"
  },
  {
    "name": "Bermudes",
    "nameEn": "Bermuda",
    "lat": 32.33333333,
    "lng": -64.75,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Bhoutan",
    "nameEn": "Bhutan",
    "lat": 27.5,
    "lng": 90.5,
    "continent": "Asie"
  },
  {
    "name": "Biélorussie",
    "nameEn": "Belarus",
    "lat": 53,
    "lng": 28,
    "continent": "Europe"
  },
  {
    "name": "Birmanie",
    "nameEn": "Myanmar",
    "lat": 22,
    "lng": 98,
    "continent": "Asie"
  },
  {
    "name": "Bolivie",
    "nameEn": "Bolivia",
    "lat": -17,
    "lng": -65,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Bosnie-Herzégovine",
    "nameEn": "Bosnia and Herzegovina",
    "lat": 44,
    "lng": 18,
    "continent": "Europe"
  },
  {
    "name": "Botswana",
    "nameEn": "Botswana",
    "lat": -22,
    "lng": 24,
    "continent": "Afrique"
  },
  {
    "name": "Brésil",
    "nameEn": "Brazil",
    "lat": -10,
    "lng": -55,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Brunei",
    "nameEn": "Brunei",
    "lat": 4.5,
    "lng": 114.66666666,
    "continent": "Asie"
  },
  {
    "name": "Bulgarie",
    "nameEn": "Bulgaria",
    "lat": 43,
    "lng": 25,
    "continent": "Europe"
  },
  {
    "name": "Burkina Faso",
    "nameEn": "Burkina Faso",
    "lat": 13,
    "lng": -2,
    "continent": "Afrique"
  },
  {
    "name": "Burundi",
    "nameEn": "Burundi",
    "lat": -3.5,
    "lng": 30,
    "continent": "Afrique"
  },
  {
    "name": "Cambodge",
    "nameEn": "Cambodia",
    "lat": 13,
    "lng": 105,
    "continent": "Asie"
  },
  {
    "name": "Cameroun",
    "nameEn": "Cameroon",
    "lat": 6,
    "lng": 12,
    "continent": "Afrique"
  },
  {
    "name": "Canada",
    "nameEn": "Canada",
    "lat": 60,
    "lng": -95,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Chili",
    "nameEn": "Chile",
    "lat": -30,
    "lng": -71,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Chine",
    "nameEn": "China",
    "lat": 35,
    "lng": 105,
    "continent": "Asie"
  },
  {
    "name": "Chypre",
    "nameEn": "Cyprus",
    "lat": 35,
    "lng": 33,
    "continent": "Europe"
  },
  {
    "name": "Cité du Vatican",
    "nameEn": "Vatican City",
    "lat": 41.9,
    "lng": 12.45,
    "continent": "Europe"
  },
  {
    "name": "Colombie",
    "nameEn": "Colombia",
    "lat": 4,
    "lng": -72,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Comores",
    "nameEn": "Comoros",
    "lat": -12.16666666,
    "lng": 44.25,
    "continent": "Afrique"
  },
  {
    "name": "Congo",
    "nameEn": "Republic of the Congo",
    "lat": -1,
    "lng": 15,
    "continent": "Afrique"
  },
  {
    "name": "Congo (Rép. dém.)",
    "nameEn": "DR Congo",
    "lat": 0,
    "lng": 25,
    "continent": "Afrique"
  },
  {
    "name": "Corée du Nord",
    "nameEn": "North Korea",
    "lat": 40,
    "lng": 127,
    "continent": "Asie"
  },
  {
    "name": "Corée du Sud",
    "nameEn": "South Korea",
    "lat": 37,
    "lng": 127.5,
    "continent": "Asie"
  },
  {
    "name": "Costa Rica",
    "nameEn": "Costa Rica",
    "lat": 10,
    "lng": -84,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Côte d'Ivoire",
    "nameEn": "Ivory Coast",
    "lat": 8,
    "lng": -5,
    "continent": "Afrique"
  },
  {
    "name": "Croatie",
    "nameEn": "Croatia",
    "lat": 45.16666666,
    "lng": 15.5,
    "continent": "Europe"
  },
  {
    "name": "Cuba",
    "nameEn": "Cuba",
    "lat": 21.5,
    "lng": -80,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Curaçao",
    "nameEn": "Curaçao",
    "lat": 12.116667,
    "lng": -68.933333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Danemark",
    "nameEn": "Denmark",
    "lat": 56,
    "lng": 10,
    "continent": "Europe"
  },
  {
    "name": "Djibouti",
    "nameEn": "Djibouti",
    "lat": 11.5,
    "lng": 43,
    "continent": "Afrique"
  },
  {
    "name": "Dominique",
    "nameEn": "Dominica",
    "lat": 15.41666666,
    "lng": -61.33333333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Égypte",
    "nameEn": "Egypt",
    "lat": 27,
    "lng": 30,
    "continent": "Afrique"
  },
  {
    "name": "Émirats arabes unis",
    "nameEn": "United Arab Emirates",
    "lat": 24,
    "lng": 54,
    "continent": "Asie"
  },
  {
    "name": "Équateur",
    "nameEn": "Ecuador",
    "lat": -2,
    "lng": -77.5,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Érythrée",
    "nameEn": "Eritrea",
    "lat": 15,
    "lng": 39,
    "continent": "Afrique"
  },
  {
    "name": "Espagne",
    "nameEn": "Spain",
    "lat": 40,
    "lng": -4,
    "continent": "Europe"
  },
  {
    "name": "Estonie",
    "nameEn": "Estonia",
    "lat": 59,
    "lng": 26,
    "continent": "Europe"
  },
  {
    "name": "États-Unis",
    "nameEn": "United States",
    "lat": 38,
    "lng": -97,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Éthiopie",
    "nameEn": "Ethiopia",
    "lat": 8,
    "lng": 38,
    "continent": "Afrique"
  },
  {
    "name": "Fidji",
    "nameEn": "Fiji",
    "lat": -17.7134,
    "lng": 178.065,
    "continent": "Océanie"
  },
  {
    "name": "Finlande",
    "nameEn": "Finland",
    "lat": 64,
    "lng": 26,
    "continent": "Europe"
  },
  {
    "name": "France",
    "nameEn": "France",
    "lat": 46,
    "lng": 2,
    "continent": "Europe"
  },
  {
    "name": "Gabon",
    "nameEn": "Gabon",
    "lat": -1,
    "lng": 11.75,
    "continent": "Afrique"
  },
  {
    "name": "Gambie",
    "nameEn": "Gambia",
    "lat": 13.46666666,
    "lng": -16.56666666,
    "continent": "Afrique"
  },
  {
    "name": "Géorgie",
    "nameEn": "Georgia",
    "lat": 42,
    "lng": 43.5,
    "continent": "Asie"
  },
  {
    "name": "Géorgie du Sud-et-les Îles Sandwich du Sud",
    "nameEn": "South Georgia",
    "lat": -54.5,
    "lng": -37,
    "continent": "Océanie"
  },
  {
    "name": "Ghana",
    "nameEn": "Ghana",
    "lat": 8,
    "lng": -2,
    "continent": "Afrique"
  },
  {
    "name": "Gibraltar",
    "nameEn": "Gibraltar",
    "lat": 36.13333333,
    "lng": -5.35,
    "continent": "Europe"
  },
  {
    "name": "Grèce",
    "nameEn": "Greece",
    "lat": 39,
    "lng": 22,
    "continent": "Europe"
  },
  {
    "name": "Grenade",
    "nameEn": "Grenada",
    "lat": 12.11666666,
    "lng": -61.66666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Groenland",
    "nameEn": "Greenland",
    "lat": 72,
    "lng": -40,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Guadeloupe",
    "nameEn": "Guadeloupe",
    "lat": 16.25,
    "lng": -61.583333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Guam",
    "nameEn": "Guam",
    "lat": 13.46666666,
    "lng": 144.78333333,
    "continent": "Océanie"
  },
  {
    "name": "Guatemala",
    "nameEn": "Guatemala",
    "lat": 15.5,
    "lng": -90.25,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Guernesey",
    "nameEn": "Guernsey",
    "lat": 49.46666666,
    "lng": -2.58333333,
    "continent": "Europe"
  },
  {
    "name": "Guinée",
    "nameEn": "Guinea",
    "lat": 11,
    "lng": -10,
    "continent": "Afrique"
  },
  {
    "name": "Guinée équatoriale",
    "nameEn": "Equatorial Guinea",
    "lat": 2,
    "lng": 10,
    "continent": "Afrique"
  },
  {
    "name": "Guinée-Bissau",
    "nameEn": "Guinea-Bissau",
    "lat": 12,
    "lng": -15,
    "continent": "Afrique"
  },
  {
    "name": "Guyana",
    "nameEn": "Guyana",
    "lat": 5,
    "lng": -59,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Guyane",
    "nameEn": "French Guiana",
    "lat": 4,
    "lng": -53,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Haïti",
    "nameEn": "Haiti",
    "lat": 19,
    "lng": -72.41666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Honduras",
    "nameEn": "Honduras",
    "lat": 15,
    "lng": -86.5,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Hong Kong",
    "nameEn": "Hong Kong",
    "lat": 22.267,
    "lng": 114.188,
    "continent": "Asie"
  },
  {
    "name": "Hongrie",
    "nameEn": "Hungary",
    "lat": 47,
    "lng": 20,
    "continent": "Europe"
  },
  {
    "name": "Île Bouvet",
    "nameEn": "Bouvet Island",
    "lat": -54.4208,
    "lng": 3.3464,
    "continent": "Océanie"
  },
  {
    "name": "Île Christmas",
    "nameEn": "Christmas Island",
    "lat": -10.5,
    "lng": 105.66666666,
    "continent": "Océanie"
  },
  {
    "name": "Île de Man",
    "nameEn": "Isle of Man",
    "lat": 54.25,
    "lng": -4.5,
    "continent": "Europe"
  },
  {
    "name": "Île Maurice",
    "nameEn": "Mauritius",
    "lat": -20.28333333,
    "lng": 57.55,
    "continent": "Afrique"
  },
  {
    "name": "Île Norfolk",
    "nameEn": "Norfolk Island",
    "lat": -29.03333333,
    "lng": 167.95,
    "continent": "Océanie"
  },
  {
    "name": "Îles Caïmans",
    "nameEn": "Cayman Islands",
    "lat": 19.3133,
    "lng": -81.2546,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Îles Cocos",
    "nameEn": "Cocos (Keeling) Islands",
    "lat": -12.1642,
    "lng": 96.871,
    "continent": "Océanie"
  },
  {
    "name": "Îles Cook",
    "nameEn": "Cook Islands",
    "lat": -21.23333333,
    "lng": -159.76666666,
    "continent": "Océanie"
  },
  {
    "name": "Îles du Cap-Vert",
    "nameEn": "Cape Verde",
    "lat": 16.5388,
    "lng": -23.0418,
    "continent": "Afrique"
  },
  {
    "name": "Îles Féroé",
    "nameEn": "Faroe Islands",
    "lat": 62,
    "lng": -7,
    "continent": "Europe"
  },
  {
    "name": "Îles Heard-et-MacDonald",
    "nameEn": "Heard Island and McDonald Islands",
    "lat": -53.0818,
    "lng": 73.5042,
    "continent": "Océanie"
  },
  {
    "name": "Îles Malouines",
    "nameEn": "Falkland Islands",
    "lat": -51.75,
    "lng": -59,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Îles Mariannes du Nord",
    "nameEn": "Northern Mariana Islands",
    "lat": 15.2,
    "lng": 145.75,
    "continent": "Océanie"
  },
  {
    "name": "Îles Marshall",
    "nameEn": "Marshall Islands",
    "lat": 9,
    "lng": 168,
    "continent": "Océanie"
  },
  {
    "name": "Îles mineures éloignées des États-Unis",
    "nameEn": "United States Minor Outlying Islands",
    "lat": 19.3,
    "lng": 166.633333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Îles Pitcairn",
    "nameEn": "Pitcairn Islands",
    "lat": -25.06666666,
    "lng": -130.1,
    "continent": "Océanie"
  },
  {
    "name": "Îles Salomon",
    "nameEn": "Solomon Islands",
    "lat": -8,
    "lng": 159,
    "continent": "Océanie"
  },
  {
    "name": "Îles Turques-et-Caïques",
    "nameEn": "Turks and Caicos Islands",
    "lat": 21.75,
    "lng": -71.58333333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Îles Vierges britanniques",
    "nameEn": "British Virgin Islands",
    "lat": 18.431383,
    "lng": -64.62305,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Îles Vierges des États-Unis",
    "nameEn": "United States Virgin Islands",
    "lat": 18.35,
    "lng": -64.933333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Inde",
    "nameEn": "India",
    "lat": 20,
    "lng": 77,
    "continent": "Asie"
  },
  {
    "name": "Indonésie",
    "nameEn": "Indonesia",
    "lat": -5,
    "lng": 120,
    "continent": "Asie"
  },
  {
    "name": "Irak",
    "nameEn": "Iraq",
    "lat": 33,
    "lng": 44,
    "continent": "Asie"
  },
  {
    "name": "Iran",
    "nameEn": "Iran",
    "lat": 32,
    "lng": 53,
    "continent": "Asie"
  },
  {
    "name": "Irlande",
    "nameEn": "Ireland",
    "lat": 53,
    "lng": -8,
    "continent": "Europe"
  },
  {
    "name": "Islande",
    "nameEn": "Iceland",
    "lat": 65,
    "lng": -18,
    "continent": "Europe"
  },
  {
    "name": "Israël",
    "nameEn": "Israel",
    "lat": 31.47,
    "lng": 35.13,
    "continent": "Asie"
  },
  {
    "name": "Italie",
    "nameEn": "Italy",
    "lat": 42.83333333,
    "lng": 12.83333333,
    "continent": "Europe"
  },
  {
    "name": "Jamaïque",
    "nameEn": "Jamaica",
    "lat": 18.25,
    "lng": -77.5,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Japon",
    "nameEn": "Japan",
    "lat": 36,
    "lng": 138,
    "continent": "Asie"
  },
  {
    "name": "Jersey",
    "nameEn": "Jersey",
    "lat": 49.25,
    "lng": -2.16666666,
    "continent": "Europe"
  },
  {
    "name": "Jordanie",
    "nameEn": "Jordan",
    "lat": 31,
    "lng": 36,
    "continent": "Asie"
  },
  {
    "name": "Kazakhstan",
    "nameEn": "Kazakhstan",
    "lat": 48.0196,
    "lng": 66.9237,
    "continent": "Asie"
  },
  {
    "name": "Kenya",
    "nameEn": "Kenya",
    "lat": 1,
    "lng": 38,
    "continent": "Afrique"
  },
  {
    "name": "Kirghizistan",
    "nameEn": "Kyrgyzstan",
    "lat": 41,
    "lng": 75,
    "continent": "Asie"
  },
  {
    "name": "Kiribati",
    "nameEn": "Kiribati",
    "lat": 1.41666666,
    "lng": 173,
    "continent": "Océanie"
  },
  {
    "name": "Kosovo",
    "nameEn": "Kosovo",
    "lat": 42.666667,
    "lng": 21.166667,
    "continent": "Europe"
  },
  {
    "name": "Koweït",
    "nameEn": "Kuwait",
    "lat": 29.5,
    "lng": 45.75,
    "continent": "Asie"
  },
  {
    "name": "Laos",
    "nameEn": "Laos",
    "lat": 18,
    "lng": 105,
    "continent": "Asie"
  },
  {
    "name": "Lesotho",
    "nameEn": "Lesotho",
    "lat": -29.5,
    "lng": 28.5,
    "continent": "Afrique"
  },
  {
    "name": "Lettonie",
    "nameEn": "Latvia",
    "lat": 57,
    "lng": 25,
    "continent": "Europe"
  },
  {
    "name": "Liban",
    "nameEn": "Lebanon",
    "lat": 33.83333333,
    "lng": 35.83333333,
    "continent": "Asie"
  },
  {
    "name": "Liberia",
    "nameEn": "Liberia",
    "lat": 6.5,
    "lng": -9.5,
    "continent": "Afrique"
  },
  {
    "name": "Libye",
    "nameEn": "Libya",
    "lat": 25,
    "lng": 17,
    "continent": "Afrique"
  },
  {
    "name": "Liechtenstein",
    "nameEn": "Liechtenstein",
    "lat": 47.26666666,
    "lng": 9.53333333,
    "continent": "Europe"
  },
  {
    "name": "Lituanie",
    "nameEn": "Lithuania",
    "lat": 56,
    "lng": 24,
    "continent": "Europe"
  },
  {
    "name": "Luxembourg",
    "nameEn": "Luxembourg",
    "lat": 49.75,
    "lng": 6.16666666,
    "continent": "Europe"
  },
  {
    "name": "Macao",
    "nameEn": "Macau",
    "lat": 22.16666666,
    "lng": 113.55,
    "continent": "Asie"
  },
  {
    "name": "Macédoine du Nord",
    "nameEn": "North Macedonia",
    "lat": 41.83333333,
    "lng": 22,
    "continent": "Europe"
  },
  {
    "name": "Madagascar",
    "nameEn": "Madagascar",
    "lat": -20,
    "lng": 47,
    "continent": "Afrique"
  },
  {
    "name": "Malaisie",
    "nameEn": "Malaysia",
    "lat": 2.5,
    "lng": 112.5,
    "continent": "Asie"
  },
  {
    "name": "Malawi",
    "nameEn": "Malawi",
    "lat": -13.5,
    "lng": 34,
    "continent": "Afrique"
  },
  {
    "name": "Maldives",
    "nameEn": "Maldives",
    "lat": 3.25,
    "lng": 73,
    "continent": "Asie"
  },
  {
    "name": "Mali",
    "nameEn": "Mali",
    "lat": 17,
    "lng": -4,
    "continent": "Afrique"
  },
  {
    "name": "Malte",
    "nameEn": "Malta",
    "lat": 35.9375,
    "lng": 14.3754,
    "continent": "Europe"
  },
  {
    "name": "Maroc",
    "nameEn": "Morocco",
    "lat": 32,
    "lng": -5,
    "continent": "Afrique"
  },
  {
    "name": "Martinique",
    "nameEn": "Martinique",
    "lat": 14.666667,
    "lng": -61,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Mauritanie",
    "nameEn": "Mauritania",
    "lat": 20,
    "lng": -12,
    "continent": "Afrique"
  },
  {
    "name": "Mayotte",
    "nameEn": "Mayotte",
    "lat": -12.83333333,
    "lng": 45.16666666,
    "continent": "Afrique"
  },
  {
    "name": "Mexique",
    "nameEn": "Mexico",
    "lat": 23,
    "lng": -102,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Micronésie",
    "nameEn": "Micronesia",
    "lat": 6.91666666,
    "lng": 158.25,
    "continent": "Océanie"
  },
  {
    "name": "Moldavie",
    "nameEn": "Moldova",
    "lat": 47,
    "lng": 29,
    "continent": "Europe"
  },
  {
    "name": "Monaco",
    "nameEn": "Monaco",
    "lat": 43.73333333,
    "lng": 7.4,
    "continent": "Europe"
  },
  {
    "name": "Mongolie",
    "nameEn": "Mongolia",
    "lat": 46,
    "lng": 105,
    "continent": "Asie"
  },
  {
    "name": "Monténégro",
    "nameEn": "Montenegro",
    "lat": 42.5,
    "lng": 19.3,
    "continent": "Europe"
  },
  {
    "name": "Montserrat",
    "nameEn": "Montserrat",
    "lat": 16.75,
    "lng": -62.2,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Mozambique",
    "nameEn": "Mozambique",
    "lat": -18.25,
    "lng": 35,
    "continent": "Afrique"
  },
  {
    "name": "Namibie",
    "nameEn": "Namibia",
    "lat": -22,
    "lng": 17,
    "continent": "Afrique"
  },
  {
    "name": "Nauru",
    "nameEn": "Nauru",
    "lat": -0.53333333,
    "lng": 166.91666666,
    "continent": "Océanie"
  },
  {
    "name": "Népal",
    "nameEn": "Nepal",
    "lat": 28,
    "lng": 84,
    "continent": "Asie"
  },
  {
    "name": "Nicaragua",
    "nameEn": "Nicaragua",
    "lat": 13,
    "lng": -85,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Niger",
    "nameEn": "Niger",
    "lat": 16,
    "lng": 8,
    "continent": "Afrique"
  },
  {
    "name": "Nigéria",
    "nameEn": "Nigeria",
    "lat": 10,
    "lng": 8,
    "continent": "Afrique"
  },
  {
    "name": "Niue",
    "nameEn": "Niue",
    "lat": -19.03333333,
    "lng": -169.86666666,
    "continent": "Océanie"
  },
  {
    "name": "Norvège",
    "nameEn": "Norway",
    "lat": 62,
    "lng": 10,
    "continent": "Europe"
  },
  {
    "name": "Nouvelle-Calédonie",
    "nameEn": "New Caledonia",
    "lat": -21.5,
    "lng": 165.5,
    "continent": "Océanie"
  },
  {
    "name": "Nouvelle-Zélande",
    "nameEn": "New Zealand",
    "lat": -41,
    "lng": 174,
    "continent": "Océanie"
  },
  {
    "name": "Oman",
    "nameEn": "Oman",
    "lat": 21,
    "lng": 57,
    "continent": "Asie"
  },
  {
    "name": "Ouganda",
    "nameEn": "Uganda",
    "lat": 1,
    "lng": 32,
    "continent": "Afrique"
  },
  {
    "name": "Ouzbékistan",
    "nameEn": "Uzbekistan",
    "lat": 41,
    "lng": 64,
    "continent": "Asie"
  },
  {
    "name": "Pakistan",
    "nameEn": "Pakistan",
    "lat": 30,
    "lng": 70,
    "continent": "Asie"
  },
  {
    "name": "Palaos (Palau)",
    "nameEn": "Palau",
    "lat": 7.5,
    "lng": 134.5,
    "continent": "Océanie"
  },
  {
    "name": "Palestine",
    "nameEn": "Palestine",
    "lat": 31.9,
    "lng": 35.2,
    "continent": "Asie"
  },
  {
    "name": "Panama",
    "nameEn": "Panama",
    "lat": 9,
    "lng": -80,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Papouasie-Nouvelle-Guinée",
    "nameEn": "Papua New Guinea",
    "lat": -6,
    "lng": 147,
    "continent": "Océanie"
  },
  {
    "name": "Paraguay",
    "nameEn": "Paraguay",
    "lat": -23,
    "lng": -58,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Pays-Bas",
    "nameEn": "Netherlands",
    "lat": 52.5,
    "lng": 5.75,
    "continent": "Europe"
  },
  {
    "name": "Pays-Bas caribéens",
    "nameEn": "Caribbean Netherlands",
    "lat": 12.18,
    "lng": -68.25,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Pérou",
    "nameEn": "Peru",
    "lat": -10,
    "lng": -76,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Philippines",
    "nameEn": "Philippines",
    "lat": 13,
    "lng": 122,
    "continent": "Asie"
  },
  {
    "name": "Pologne",
    "nameEn": "Poland",
    "lat": 52,
    "lng": 20,
    "continent": "Europe"
  },
  {
    "name": "Polynésie française",
    "nameEn": "French Polynesia",
    "lat": -17.6797,
    "lng": -149.4068,
    "continent": "Océanie"
  },
  {
    "name": "Porto Rico",
    "nameEn": "Puerto Rico",
    "lat": 18.25,
    "lng": -66.5,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Portugal",
    "nameEn": "Portugal",
    "lat": 39.5,
    "lng": -8,
    "continent": "Europe"
  },
  {
    "name": "Qatar",
    "nameEn": "Qatar",
    "lat": 25.5,
    "lng": 51.25,
    "continent": "Asie"
  },
  {
    "name": "République centrafricaine",
    "nameEn": "Central African Republic",
    "lat": 7,
    "lng": 21,
    "continent": "Afrique"
  },
  {
    "name": "République dominicaine",
    "nameEn": "Dominican Republic",
    "lat": 19,
    "lng": -70.66666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Réunion",
    "nameEn": "Réunion",
    "lat": -21.15,
    "lng": 55.5,
    "continent": "Afrique"
  },
  {
    "name": "Roumanie",
    "nameEn": "Romania",
    "lat": 46,
    "lng": 25,
    "continent": "Europe"
  },
  {
    "name": "Royaume-Uni",
    "nameEn": "United Kingdom",
    "lat": 54,
    "lng": -2,
    "continent": "Europe"
  },
  {
    "name": "Russie",
    "nameEn": "Russia",
    "lat": 60,
    "lng": 100,
    "continent": "Europe"
  },
  {
    "name": "Rwanda",
    "nameEn": "Rwanda",
    "lat": -2,
    "lng": 30,
    "continent": "Afrique"
  },
  {
    "name": "Sahara Occidental",
    "nameEn": "Western Sahara",
    "lat": 24.5,
    "lng": -13,
    "continent": "Afrique"
  },
  {
    "name": "Saint-Barthélemy",
    "nameEn": "Saint Barthélemy",
    "lat": 18.5,
    "lng": -63.41666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Saint-Christophe-et-Niévès",
    "nameEn": "Saint Kitts and Nevis",
    "lat": 17.33333333,
    "lng": -62.75,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Saint-Marin",
    "nameEn": "San Marino",
    "lat": 43.76666666,
    "lng": 12.41666666,
    "continent": "Europe"
  },
  {
    "name": "Saint-Martin",
    "nameEn": "Saint Martin",
    "lat": 18.0708,
    "lng": -63.0501,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Saint-Martin",
    "nameEn": "Sint Maarten",
    "lat": 18.033333,
    "lng": -63.05,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Saint-Pierre-et-Miquelon",
    "nameEn": "Saint Pierre and Miquelon",
    "lat": 46.83333333,
    "lng": -56.33333333,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Saint-Vincent-et-les-Grenadines",
    "nameEn": "Saint Vincent and the Grenadines",
    "lat": 13.25,
    "lng": -61.2,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Sainte-Hélène, Ascension et Tristan da Cunha",
    "nameEn": "Saint Helena, Ascension and Tristan da Cunha",
    "lat": -15.95,
    "lng": -5.72,
    "continent": "Afrique"
  },
  {
    "name": "Sainte-Lucie",
    "nameEn": "Saint Lucia",
    "lat": 13.88333333,
    "lng": -60.96666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Salvador",
    "nameEn": "El Salvador",
    "lat": 13.83333333,
    "lng": -88.91666666,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Samoa",
    "nameEn": "Samoa",
    "lat": -13.58333333,
    "lng": -172.33333333,
    "continent": "Océanie"
  },
  {
    "name": "Samoa américaines",
    "nameEn": "American Samoa",
    "lat": -14.33333333,
    "lng": -170,
    "continent": "Océanie"
  },
  {
    "name": "São Tomé et Príncipe",
    "nameEn": "São Tomé and Príncipe",
    "lat": 1,
    "lng": 7,
    "continent": "Afrique"
  },
  {
    "name": "Sénégal",
    "nameEn": "Senegal",
    "lat": 14,
    "lng": -14,
    "continent": "Afrique"
  },
  {
    "name": "Serbie",
    "nameEn": "Serbia",
    "lat": 44,
    "lng": 21,
    "continent": "Europe"
  },
  {
    "name": "Seychelles",
    "nameEn": "Seychelles",
    "lat": -4.58333333,
    "lng": 55.66666666,
    "continent": "Afrique"
  },
  {
    "name": "Sierra Leone",
    "nameEn": "Sierra Leone",
    "lat": 8.5,
    "lng": -11.5,
    "continent": "Afrique"
  },
  {
    "name": "Singapour",
    "nameEn": "Singapore",
    "lat": 1.36666666,
    "lng": 103.8,
    "continent": "Asie"
  },
  {
    "name": "Slovaquie",
    "nameEn": "Slovakia",
    "lat": 48.66666666,
    "lng": 19.5,
    "continent": "Europe"
  },
  {
    "name": "Slovénie",
    "nameEn": "Slovenia",
    "lat": 46.11666666,
    "lng": 14.81666666,
    "continent": "Europe"
  },
  {
    "name": "Somalie",
    "nameEn": "Somalia",
    "lat": 10,
    "lng": 49,
    "continent": "Afrique"
  },
  {
    "name": "Soudan",
    "nameEn": "Sudan",
    "lat": 15,
    "lng": 30,
    "continent": "Afrique"
  },
  {
    "name": "Soudan du Sud",
    "nameEn": "South Sudan",
    "lat": 7,
    "lng": 30,
    "continent": "Afrique"
  },
  {
    "name": "Sri Lanka",
    "nameEn": "Sri Lanka",
    "lat": 7,
    "lng": 81,
    "continent": "Asie"
  },
  {
    "name": "Suède",
    "nameEn": "Sweden",
    "lat": 62,
    "lng": 15,
    "continent": "Europe"
  },
  {
    "name": "Suisse",
    "nameEn": "Switzerland",
    "lat": 47,
    "lng": 8,
    "continent": "Europe"
  },
  {
    "name": "Surinam",
    "nameEn": "Suriname",
    "lat": 4,
    "lng": -56,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Svalbard et Jan Mayen",
    "nameEn": "Svalbard and Jan Mayen",
    "lat": 78,
    "lng": 20,
    "continent": "Europe"
  },
  {
    "name": "Swaziland",
    "nameEn": "Eswatini",
    "lat": -26.5,
    "lng": 31.5,
    "continent": "Afrique"
  },
  {
    "name": "Syrie",
    "nameEn": "Syria",
    "lat": 35,
    "lng": 38,
    "continent": "Asie"
  },
  {
    "name": "Tadjikistan",
    "nameEn": "Tajikistan",
    "lat": 39,
    "lng": 71,
    "continent": "Asie"
  },
  {
    "name": "Taïwan",
    "nameEn": "Taiwan",
    "lat": 23.5,
    "lng": 121,
    "continent": "Asie"
  },
  {
    "name": "Tanzanie",
    "nameEn": "Tanzania",
    "lat": -6,
    "lng": 35,
    "continent": "Afrique"
  },
  {
    "name": "Tchad",
    "nameEn": "Chad",
    "lat": 15,
    "lng": 19,
    "continent": "Afrique"
  },
  {
    "name": "Tchéquie",
    "nameEn": "Czechia",
    "lat": 49.75,
    "lng": 15.5,
    "continent": "Europe"
  },
  {
    "name": "Terres australes et antarctiques françaises",
    "nameEn": "French Southern and Antarctic Lands",
    "lat": -49.25,
    "lng": 69.167,
    "continent": "Océanie"
  },
  {
    "name": "Territoire britannique de l'océan Indien",
    "nameEn": "British Indian Ocean Territory",
    "lat": -6,
    "lng": 71.5,
    "continent": "Afrique"
  },
  {
    "name": "Thaïlande",
    "nameEn": "Thailand",
    "lat": 15,
    "lng": 100,
    "continent": "Asie"
  },
  {
    "name": "Timor oriental",
    "nameEn": "Timor-Leste",
    "lat": -8.83333333,
    "lng": 125.91666666,
    "continent": "Asie"
  },
  {
    "name": "Togo",
    "nameEn": "Togo",
    "lat": 8,
    "lng": 1.16666666,
    "continent": "Afrique"
  },
  {
    "name": "Tokelau",
    "nameEn": "Tokelau",
    "lat": -9,
    "lng": -172,
    "continent": "Océanie"
  },
  {
    "name": "Tonga",
    "nameEn": "Tonga",
    "lat": -20,
    "lng": -175,
    "continent": "Océanie"
  },
  {
    "name": "Trinité-et-Tobago",
    "nameEn": "Trinidad and Tobago",
    "lat": 10.6918,
    "lng": -61.2225,
    "continent": "Amérique du Nord"
  },
  {
    "name": "Tunisie",
    "nameEn": "Tunisia",
    "lat": 34,
    "lng": 9,
    "continent": "Afrique"
  },
  {
    "name": "Turkménistan",
    "nameEn": "Turkmenistan",
    "lat": 40,
    "lng": 60,
    "continent": "Asie"
  },
  {
    "name": "Turquie",
    "nameEn": "Turkey",
    "lat": 39,
    "lng": 35,
    "continent": "Asie"
  },
  {
    "name": "Tuvalu",
    "nameEn": "Tuvalu",
    "lat": -8,
    "lng": 178,
    "continent": "Océanie"
  },
  {
    "name": "Ukraine",
    "nameEn": "Ukraine",
    "lat": 49,
    "lng": 32,
    "continent": "Europe"
  },
  {
    "name": "Uruguay",
    "nameEn": "Uruguay",
    "lat": -33,
    "lng": -56,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Vanuatu",
    "nameEn": "Vanuatu",
    "lat": -16,
    "lng": 167,
    "continent": "Océanie"
  },
  {
    "name": "Venezuela",
    "nameEn": "Venezuela",
    "lat": 8,
    "lng": -66,
    "continent": "Amérique du Sud"
  },
  {
    "name": "Viêt Nam",
    "nameEn": "Vietnam",
    "lat": 16.16666666,
    "lng": 107.83333333,
    "continent": "Asie"
  },
  {
    "name": "Wallis-et-Futuna",
    "nameEn": "Wallis and Futuna",
    "lat": -13.3,
    "lng": -176.2,
    "continent": "Océanie"
  },
  {
    "name": "Yémen",
    "nameEn": "Yemen",
    "lat": 15,
    "lng": 48,
    "continent": "Asie"
  },
  {
    "name": "Zambie",
    "nameEn": "Zambia",
    "lat": -15,
    "lng": 30,
    "continent": "Afrique"
  },
  {
    "name": "Zimbabwe",
    "nameEn": "Zimbabwe",
    "lat": -20,
    "lng": 30,
    "continent": "Afrique"
  }
];

export const normalizeCountryName = (name: string): string => {
  if (!name) return 'Inconnu';

  const mapping: Record<string, string> = {
    'Netherlands': 'Pays-Bas',
    'The Netherlands': 'Pays-Bas',
    'United States': 'États-Unis',
    'United States of America': 'États-Unis',
    'USA': 'États-Unis',
    'United Kingdom': 'Angleterre',
    'UK': 'Angleterre',
    'Germany': 'Allemagne',
    'Spain': 'Espagne',
    'Italy': 'Italie',
    'Belgium': 'Belgique',
    'Switzerland': 'Suisse',
    'Brazil': 'Brésil',
    'Mexico': 'Mexique',
    'Japan': 'Japon',
    'China': 'Chine',
    'Russia': 'Russie',
    'South Korea': 'Corée du Sud',
    'Egypt': 'Égypte',
    'Morocco': 'Maroc',
    'Algeria': 'Algérie',
    'Tunisia': 'Tunisie'
  };

  return mapping[name] || name;
};
