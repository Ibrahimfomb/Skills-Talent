// ══════════════════════════════════════════════════════════════════
// CONTEXTUAL DATA — Métadonnées pays pour onboarding IA
// ══════════════════════════════════════════════════════════════════

export const COUNTRIES = [
  {
    code: 'CM',
    name: 'Cameroun',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    phonePrefix: '+237',
    salaryPeriod: 'mensuel',
    languages: ['Français', 'Anglais'],
    regions: ['Centre', 'Littoral', 'Ouest', 'Nord', 'Extrême-Nord', 'Adamaoua', 'Est', 'Sud', 'Nord-Ouest', 'Sud-Ouest'],
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+33',
    salaryPeriod: 'annuel',
    languages: ['Français'],
    regions: ['Île-de-France', 'PACA', 'Auvergne-Rhône-Alpes', 'Occitanie', 'Nouvelle-Aquitaine', 'Grand Est', 'Bretagne', 'Normandie', 'Hauts-de-France'],
  },
  {
    code: 'SN',
    name: 'Sénégal',
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+221',
    salaryPeriod: 'mensuel',
    languages: ['Français', 'Wolof'],
    regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Fatick', 'Kolda', 'Louga'],
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phonePrefix: '+225',
    salaryPeriod: 'mensuel',
    languages: ['Français'],
    regions: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Korhogo', 'San Pédro', 'Daloa', 'Man'],
  },
  {
    code: 'MA',
    name: 'Maroc',
    currency: 'MAD',
    currencySymbol: 'DH',
    phonePrefix: '+212',
    salaryPeriod: 'mensuel',
    languages: ['Français', 'Arabe', 'Amazigh'],
    regions: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda'],
  },
  {
    code: 'TN',
    name: 'Tunisie',
    currency: 'TND',
    currencySymbol: 'DT',
    phonePrefix: '+216',
    salaryPeriod: 'mensuel',
    languages: ['Français', 'Arabe'],
    regions: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana'],
  },
  {
    code: 'BE',
    name: 'Belgique',
    currency: 'EUR',
    currencySymbol: '€',
    phonePrefix: '+32',
    salaryPeriod: 'annuel',
    languages: ['Français', 'Néerlandais', 'Allemand'],
    regions: ['Bruxelles', 'Wallonie', 'Flandre', 'Liège', 'Charleroi', 'Namur'],
  },
  {
    code: 'CH',
    name: 'Suisse',
    currency: 'CHF',
    currencySymbol: 'CHF',
    phonePrefix: '+41',
    salaryPeriod: 'annuel',
    languages: ['Français', 'Allemand', 'Italien'],
    regions: ['Genève', 'Zurich', 'Berne', 'Lausanne', 'Bâle', 'Lugano', 'Lucerne'],
  },
  {
    code: 'GA',
    name: 'Gabon',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    phonePrefix: '+241',
    salaryPeriod: 'mensuel',
    languages: ['Français'],
    regions: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Lambaréné'],
  },
  {
    code: 'CD',
    name: 'Congo RDC',
    currency: 'CDF',
    currencySymbol: 'FC',
    phonePrefix: '+243',
    salaryPeriod: 'mensuel',
    languages: ['Français', 'Lingala', 'Swahili'],
    regions: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Bukavu'],
  },
  {
    code: 'CG',
    name: 'Congo Brazzaville',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    phonePrefix: '+242',
    salaryPeriod: 'mensuel',
    languages: ['Français'],
    regions: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Impfondo'],
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'CA$',
    phonePrefix: '+1',
    salaryPeriod: 'annuel',
    languages: ['Français', 'Anglais'],
    regions: ['Québec', 'Ontario', 'Colombie-Britannique', 'Alberta', 'Manitoba', 'Nouveau-Brunswick'],
  },
]

export const CITIES_BY_COUNTRY = {
  CM: ['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Bamenda', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbé', 'Kumba'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Montpellier'],
  SN: ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Mbour', 'Rufisque', 'Touba'],
  CI: ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Korhogo', 'San Pédro', 'Daloa', 'Man', 'Divo'],
  MA: ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan'],
  TN: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'La Marsa'],
  BE: ['Bruxelles', 'Liège', 'Charleroi', 'Anvers', 'Gand', 'Bruges', 'Namur', 'Mons'],
  CH: ['Genève', 'Zurich', 'Berne', 'Lausanne', 'Bâle', 'Lugano', 'Lucerne', 'Saint-Gall'],
  GA: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Lambaréné'],
  CD: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Bukavu', 'Goma'],
  CG: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Impfondo', 'Ouesso'],
  CA: ['Montréal', 'Toronto', 'Vancouver', 'Québec', 'Ottawa', 'Calgary', 'Edmonton', 'Winnipeg'],
}

export const SALARY_RANGES_BY_COUNTRY = {
  CM: {
    min: 50000,
    max: 5000000,
    step: 50000,
    currency: 'XAF',
    symbol: 'FCFA',
    period: 'mois',
    commonRanges: ['50 000 - 150 000 FCFA/mois', '150 000 - 300 000 FCFA/mois', '300 000 - 500 000 FCFA/mois', '500 000 - 1 000 000 FCFA/mois', '+ 1 000 000 FCFA/mois'],
  },
  FR: {
    min: 18000,
    max: 200000,
    step: 1000,
    currency: 'EUR',
    symbol: '€',
    period: 'an',
    commonRanges: ['18 000 - 25 000 €/an', '25 000 - 35 000 €/an', '35 000 - 50 000 €/an', '50 000 - 70 000 €/an', '+ 70 000 €/an'],
  },
  SN: {
    min: 50000,
    max: 3000000,
    step: 50000,
    currency: 'XOF',
    symbol: 'FCFA',
    period: 'mois',
    commonRanges: ['50 000 - 150 000 FCFA/mois', '150 000 - 300 000 FCFA/mois', '300 000 - 600 000 FCFA/mois', '600 000 - 1 000 000 FCFA/mois', '+ 1 000 000 FCFA/mois'],
  },
  CI: {
    min: 50000,
    max: 3000000,
    step: 50000,
    currency: 'XOF',
    symbol: 'FCFA',
    period: 'mois',
    commonRanges: ['50 000 - 150 000 FCFA/mois', '150 000 - 300 000 FCFA/mois', '300 000 - 600 000 FCFA/mois', '600 000 - 1 000 000 FCFA/mois', '+ 1 000 000 FCFA/mois'],
  },
  MA: {
    min: 3000,
    max: 100000,
    step: 1000,
    currency: 'MAD',
    symbol: 'DH',
    period: 'mois',
    commonRanges: ['3 000 - 6 000 DH/mois', '6 000 - 10 000 DH/mois', '10 000 - 20 000 DH/mois', '20 000 - 40 000 DH/mois', '+ 40 000 DH/mois'],
  },
  TN: {
    min: 1000,
    max: 50000,
    step: 500,
    currency: 'TND',
    symbol: 'DT',
    period: 'mois',
    commonRanges: ['1 000 - 2 000 DT/mois', '2 000 - 4 000 DT/mois', '4 000 - 8 000 DT/mois', '8 000 - 15 000 DT/mois', '+ 15 000 DT/mois'],
  },
  BE: {
    min: 20000,
    max: 120000,
    step: 2000,
    currency: 'EUR',
    symbol: '€',
    period: 'an',
    commonRanges: ['20 000 - 30 000 €/an', '30 000 - 45 000 €/an', '45 000 - 60 000 €/an', '60 000 - 80 000 €/an', '+ 80 000 €/an'],
  },
  CH: {
    min: 60000,
    max: 300000,
    step: 5000,
    currency: 'CHF',
    symbol: 'CHF',
    period: 'an',
    commonRanges: ['60 000 - 80 000 CHF/an', '80 000 - 100 000 CHF/an', '100 000 - 130 000 CHF/an', '130 000 - 170 000 CHF/an', '+ 170 000 CHF/an'],
  },
  GA: {
    min: 50000,
    max: 2000000,
    step: 50000,
    currency: 'XAF',
    symbol: 'FCFA',
    period: 'mois',
    commonRanges: ['50 000 - 150 000 FCFA/mois', '150 000 - 300 000 FCFA/mois', '300 000 - 500 000 FCFA/mois', '500 000 - 1 000 000 FCFA/mois', '+ 1 000 000 FCFA/mois'],
  },
  CD: {
    min: 100000,
    max: 5000000,
    step: 100000,
    currency: 'CDF',
    symbol: 'FC',
    period: 'mois',
    commonRanges: ['100 000 - 300 000 FC/mois', '300 000 - 600 000 FC/mois', '600 000 - 1 000 000 FC/mois', '1 000 000 - 2 000 000 FC/mois', '+ 2 000 000 FC/mois'],
  },
  CG: {
    min: 50000,
    max: 2000000,
    step: 50000,
    currency: 'XAF',
    symbol: 'FCFA',
    period: 'mois',
    commonRanges: ['50 000 - 150 000 FCFA/mois', '150 000 - 300 000 FCFA/mois', '300 000 - 500 000 FCFA/mois', '500 000 - 1 000 000 FCFA/mois', '+ 1 000 000 FCFA/mois'],
  },
  CA: {
    min: 35000,
    max: 200000,
    step: 5000,
    currency: 'CAD',
    symbol: 'CA$',
    period: 'an',
    commonRanges: ['35 000 - 50 000 CA$/an', '50 000 - 70 000 CA$/an', '70 000 - 100 000 CA$/an', '100 000 - 140 000 CA$/an', '+ 140 000 CA$/an'],
  },
}

export const CONTRACT_TYPES_BY_COUNTRY = {
  CM: ['CDI', 'CDD', 'Stage', 'Freelance', 'Consultant', 'Bénévolat'],
  FR: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Intérim', 'VIE', 'CDII'],
  SN: ['CDI', 'CDD', 'Stage', 'Freelance', 'Consultant'],
  CI: ['CDI', 'CDD', 'Stage', 'Freelance', 'Consultant'],
  MA: ['CDI', 'CDD', 'Stage', 'Freelance', 'ANAPEC'],
  TN: ['CDI', 'CDD', 'Stage', 'Freelance', 'SIVP'],
  BE: ['CDI', 'CDD', 'Stage', 'Freelance', 'Intérim', 'Étudiant'],
  CH: ['CDI', 'CDD', 'Stage', 'Freelance', 'Temporaire'],
  GA: ['CDI', 'CDD', 'Stage', 'Freelance', 'Consultant'],
  CD: ['CDI', 'CDD', 'Stage', 'Freelance', 'Consultant'],
  CG: ['CDI', 'CDD', 'Stage', 'Freelance', 'Consultant'],
  CA: ['Permanent', 'Contractuel', 'Stage', 'Freelance', 'Temps partiel'],
}

export const WORK_MODES_BY_COUNTRY = {
  CM: ['Présentiel', 'Hybride', 'Télétravail'],
  FR: ['Présentiel', 'Hybride', 'Full remote', 'Télétravail partiel'],
  SN: ['Présentiel', 'Hybride', 'Télétravail'],
  CI: ['Présentiel', 'Hybride', 'Télétravail'],
  MA: ['Présentiel', 'Hybride', 'Télétravail'],
  TN: ['Présentiel', 'Hybride', 'Télétravail'],
  BE: ['Présentiel', 'Hybride', 'Full remote'],
  CH: ['Présentiel', 'Hybride', 'Full remote'],
  GA: ['Présentiel', 'Hybride', 'Télétravail'],
  CD: ['Présentiel', 'Hybride', 'Télétravail'],
  CG: ['Présentiel', 'Hybride', 'Télétravail'],
  CA: ['Présentiel', 'Hybride', 'Full remote', 'Télétravail'],
}

export const CV_FORMAT_BY_COUNTRY = {
  // Pays où la photo est d'usage courant
  withPhoto: ['CM', 'SN', 'CI', 'MA', 'TN', 'GA', 'CD', 'CG'],
  // Pays où l'âge/nationalité est demandé
  withPersonalDetails: ['CM', 'SN', 'CI', 'MA', 'TN', 'GA', 'CD', 'CG'],
  // Pays avec normes RGPD strictes (sans photo, sans âge)
  rgpdStrict: ['FR', 'BE', 'CH', 'CA'],
}

export const FIELD_DEPENDENCIES = {
  city: { dependsOn: 'country', blockedMessage: 'Choisissez d\'abord votre pays' },
  salary: { dependsOn: 'country', blockedMessage: 'Choisissez d\'abord votre pays' },
  contractType: { dependsOn: 'country', blockedMessage: 'Choisissez d\'abord votre pays' },
  workMode: { dependsOn: 'country', blockedMessage: 'Choisissez d\'abord votre pays' },
  phone: { dependsOn: 'country', blockedMessage: 'Choisissez d\'abord votre pays' },
}

/**
 * Construit le contexte cumulatif depuis les réponses antérieures
 * Permet au frontend de connaître les options filtrées (villes, salaires, etc.)
 */
export const getContextFromAnswers = (answers) => {
  // Trouver une réponse par fieldKey
  const find = (key) => answers.find(a => a.fieldKey === key)?.answer

  const country = find('country')
  const countryData = COUNTRIES.find(c => c.name === country)
  const code = countryData?.code

  return {
    country,
    currency: countryData?.currency || 'EUR',
    currencySymbol: countryData?.currencySymbol || '€',
    salaryPeriod: countryData?.salaryPeriod || 'annuel',
    phonePrefix: countryData?.phonePrefix || '',
    cities: code ? (CITIES_BY_COUNTRY[code] || []) : [],
    salaryRanges: code ? (SALARY_RANGES_BY_COUNTRY[code]?.commonRanges || []) : [],
    contractTypes: code ? (CONTRACT_TYPES_BY_COUNTRY[code] || []) : [],
    workModes: code ? (WORK_MODES_BY_COUNTRY[code] || []) : [],
    languages: countryData?.languages || [],
    cvFormat: {
      withPhoto: CV_FORMAT_BY_COUNTRY.withPhoto.includes(code),
      withPersonalDetails: CV_FORMAT_BY_COUNTRY.withPersonalDetails.includes(code),
      rgpdStrict: CV_FORMAT_BY_COUNTRY.rgpdStrict.includes(code),
    },
    answeredFields: answers.map(a => a.fieldKey),
  }
}

/**
 * Retourne la liste des pays formatée pour les selects/dropdowns
 */
export const getCountriesForSelect = () => {
  return COUNTRIES.map(c => ({ label: c.name, value: c.code, name: c.name }))
}

/**
 * Extrait le code pays depuis le nom
 */
export const getCountryCode = (countryName) => {
  return COUNTRIES.find(c => c.name === countryName)?.code || ''
}

/**
 * Extrait le pays depuis le code
 */
export const getCountryByCode = (code) => {
  return COUNTRIES.find(c => c.code === code)
}
