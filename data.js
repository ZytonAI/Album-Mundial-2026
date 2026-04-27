// data.js - Álbum FIFA World Cup 2026
window.ALBUM_DATA = (() => {

  const TEAMS = [
    // Anfitrionas
    { id: 'CAN', name: 'Canadá',               nameEn: 'Canada',                   conf: 'ANFITRIONAS' },
    { id: 'MEX', name: 'México',               nameEn: 'Mexico',                   conf: 'ANFITRIONAS' },
    { id: 'USA', name: 'Estados Unidos',        nameEn: 'United States',            conf: 'ANFITRIONAS' },
    // AFC
    { id: 'AUS', name: 'Australia',             nameEn: 'Australia',                conf: 'AFC' },
    { id: 'IRN', name: 'RI de Irán',            nameEn: 'IR Iran',                  conf: 'AFC' },
    { id: 'JPN', name: 'Japón',                nameEn: 'Japan',                    conf: 'AFC' },
    { id: 'JOR', name: 'Jordania',              nameEn: 'Jordan',                   conf: 'AFC' },
    { id: 'KOR', name: 'República de Corea',    nameEn: 'Republic of Korea',        conf: 'AFC' },
    { id: 'QAT', name: 'Catar',                nameEn: 'Qatar',                    conf: 'AFC' },
    { id: 'SAU', name: 'Arabia Saudí',          nameEn: 'Saudi Arabia',             conf: 'AFC' },
    { id: 'UZB', name: 'Uzbekistán',            nameEn: 'Uzbekistan',               conf: 'AFC' },
    { id: 'IRQ', name: 'Irak',                 nameEn: 'Iraq',                     conf: 'AFC' },
    // CAF
    { id: 'DZA', name: 'Argelia',              nameEn: 'Algeria',                  conf: 'CAF' },
    { id: 'CPV', name: 'Cabo Verde',            nameEn: 'Cabo Verde',               conf: 'CAF' },
    { id: 'CIV', name: 'Costa de Marfil',       nameEn: "Côte d'Ivoire",            conf: 'CAF' },
    { id: 'EGY', name: 'Egipto',               nameEn: 'Egypt',                    conf: 'CAF' },
    { id: 'GHA', name: 'Ghana',                nameEn: 'Ghana',                    conf: 'CAF' },
    { id: 'MAR', name: 'Marruecos',             nameEn: 'Morocco',                  conf: 'CAF' },
    { id: 'SEN', name: 'Senegal',              nameEn: 'Senegal',                  conf: 'CAF' },
    { id: 'ZAF', name: 'Sudáfrica',             nameEn: 'South Africa',             conf: 'CAF' },
    { id: 'TUN', name: 'Túnez',                nameEn: 'Tunisia',                  conf: 'CAF' },
    { id: 'COD', name: 'RD Congo',             nameEn: 'DR Congo',                 conf: 'CAF' },
    // CONCACAF
    { id: 'CUW', name: 'Curazao',              nameEn: 'Curaçao',                  conf: 'CONCACAF' },
    { id: 'HTI', name: 'Haití',                nameEn: 'Haiti',                    conf: 'CONCACAF' },
    { id: 'PAN', name: 'Panamá',               nameEn: 'Panama',                   conf: 'CONCACAF' },
    // CONMEBOL
    { id: 'ARG', name: 'Argentina',             nameEn: 'Argentina',                conf: 'CONMEBOL' },
    { id: 'BRA', name: 'Brasil',               nameEn: 'Brazil',                   conf: 'CONMEBOL' },
    { id: 'COL', name: 'Colombia',             nameEn: 'Colombia',                 conf: 'CONMEBOL' },
    { id: 'ECU', name: 'Ecuador',              nameEn: 'Ecuador',                  conf: 'CONMEBOL' },
    { id: 'PRY', name: 'Paraguay',             nameEn: 'Paraguay',                 conf: 'CONMEBOL' },
    { id: 'URU', name: 'Uruguay',              nameEn: 'Uruguay',                  conf: 'CONMEBOL' },
    // OFC
    { id: 'NZL', name: 'Nueva Zelanda',         nameEn: 'New Zealand',              conf: 'OFC' },
    // UEFA
    { id: 'AUT', name: 'Austria',              nameEn: 'Austria',                  conf: 'UEFA' },
    { id: 'BEL', name: 'Bélgica',             nameEn: 'Belgium',                  conf: 'UEFA' },
    { id: 'BIH', name: 'Bosnia y Herzegovina',  nameEn: 'Bosnia and Herzegovina',   conf: 'UEFA' },
    { id: 'HRV', name: 'Croacia',              nameEn: 'Croatia',                  conf: 'UEFA' },
    { id: 'CZE', name: 'República Checa',       nameEn: 'Czechia',                  conf: 'UEFA' },
    { id: 'ENG', name: 'Inglaterra',            nameEn: 'England',                  conf: 'UEFA' },
    { id: 'FRA', name: 'Francia',              nameEn: 'France',                   conf: 'UEFA' },
    { id: 'DEU', name: 'Alemania',             nameEn: 'Germany',                  conf: 'UEFA' },
    { id: 'NLD', name: 'Países Bajos',         nameEn: 'Netherlands',              conf: 'UEFA' },
    { id: 'NOR', name: 'Noruega',              nameEn: 'Norway',                   conf: 'UEFA' },
    { id: 'PRT', name: 'Portugal',             nameEn: 'Portugal',                 conf: 'UEFA' },
    { id: 'SCO', name: 'Escocia',              nameEn: 'Scotland',                 conf: 'UEFA' },
    { id: 'ESP', name: 'España',               nameEn: 'Spain',                    conf: 'UEFA' },
    { id: 'SWE', name: 'Suecia',               nameEn: 'Sweden',                   conf: 'UEFA' },
    { id: 'CHE', name: 'Suiza',                nameEn: 'Switzerland',              conf: 'UEFA' },
    { id: 'TUR', name: 'Turquía',              nameEn: 'Türkiye',                  conf: 'UEFA' },
  ];

  // Especiales FIFA — 20 láminas, numeradas 00–19
  const SPECIAL_STICKERS = Array.from({ length: 20 }, (_, i) => ({
    id:   `FWC-${String(i).padStart(2,'0')}`,
    name: `FWC ${String(i).padStart(2,'0')}`,
    num:  i,
  }));

  // Coca-Cola — 14 láminas, prefijo CC
  const COCACOLA_STICKERS = Array.from({ length: 14 }, (_, i) => ({
    id:   `CC-${String(i+1).padStart(2,'0')}`,
    name: `CC ${i+1}`,
    num:  i + 1,
  }));

  // 20 láminas por equipo: 1=Escudo, 2-12=Jugadores 1-11, 13=Foto Grupal, 14-20=Jugadores 12-18
  function generateTeamStickers(team) {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      let name, type;
      if (i === 1)       { name = 'Escudo';     type = 'badge';  }
      else if (i === 13) { name = 'Foto Grupal'; type = 'team';   }
      else { const n = i <= 12 ? i - 1 : i - 2; name = `Jugador ${n}`; type = 'player'; }
      list.push({ id: `${team.id}-${String(i).padStart(2,'0')}`, name, type, num: i });
    }
    return list;
  }

  const teamStickers = {};
  TEAMS.forEach(t => { teamStickers[t.id] = generateTeamStickers(t); });

  const ALL_STICKERS = [
    ...SPECIAL_STICKERS.map(s => ({ ...s, type: 'special' })),
    ...COCACOLA_STICKERS.map(s => ({ ...s, type: 'cocacola' })),
    ...Object.values(teamStickers).flat(),
  ];

  // Mapa ISO alpha-3 → alpha-2 para banderas de flagcdn.com
  const FLAG_CODE = {
    CAN:'ca', MEX:'mx', USA:'us',
    AUS:'au', IRN:'ir', JPN:'jp', JOR:'jo', KOR:'kr', QAT:'qa', SAU:'sa', UZB:'uz', IRQ:'iq',
    DZA:'dz', CPV:'cv', CIV:'ci', EGY:'eg', GHA:'gh', MAR:'ma', SEN:'sn', ZAF:'za', TUN:'tn', COD:'cd',
    CUW:'cw', HTI:'ht', PAN:'pa',
    ARG:'ar', BRA:'br', COL:'co', ECU:'ec', PRY:'py', URU:'uy',
    NZL:'nz',
    AUT:'at', BEL:'be', BIH:'ba', HRV:'hr', CZE:'cz', ENG:'gb-eng',
    FRA:'fr', DEU:'de', NLD:'nl', NOR:'no', PRT:'pt', SCO:'gb-sct',
    ESP:'es', SWE:'se', CHE:'ch', TUR:'tr',
  };

  function flagUrl(id) {
    const code = FLAG_CODE[id];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  }

  const CONFS = ['ANFITRIONAS', 'AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA'];
  const CONF_NAMES = {
    ANFITRIONAS: 'Anfitrionas',
    AFC:         'Asia',
    CAF:         'África',
    CONCACAF:    'Norte y Centroamérica',
    CONMEBOL:    'Sudamérica',
    OFC:         'Oceanía',
    UEFA:        'Europa',
  };

  return { TEAMS, SPECIAL_STICKERS, COCACOLA_STICKERS, teamStickers, ALL_STICKERS, CONFS, CONF_NAMES, FLAG_CODE, flagUrl, TOTAL: ALL_STICKERS.length };
})();
