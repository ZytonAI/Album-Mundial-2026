// data.js - Álbum FIFA World Cup 2026
window.ALBUM_DATA = (() => {

  const TEAMS = [
    // Anfitrionas
    { id: 'CAN', name: 'Canadá',               conf: 'ANFITRIONAS' },
    { id: 'MEX', name: 'México',               conf: 'ANFITRIONAS' },
    { id: 'USA', name: 'Estados Unidos',        conf: 'ANFITRIONAS' },
    // AFC
    { id: 'AUS', name: 'Australia',             conf: 'AFC' },
    { id: 'IRN', name: 'RI de Irán',            conf: 'AFC' },
    { id: 'JPN', name: 'Japón',                conf: 'AFC' },
    { id: 'JOR', name: 'Jordania',              conf: 'AFC' },
    { id: 'KOR', name: 'República de Corea',    conf: 'AFC' },
    { id: 'QAT', name: 'Catar',                conf: 'AFC' },
    { id: 'SAU', name: 'Arabia Saudí',          conf: 'AFC' },
    { id: 'UZB', name: 'Uzbekistán',            conf: 'AFC' },
    { id: 'IRQ', name: 'Irak',                 conf: 'AFC' },
    // CAF
    { id: 'DZA', name: 'Argelia',              conf: 'CAF' },
    { id: 'CPV', name: 'Cabo Verde',            conf: 'CAF' },
    { id: 'CIV', name: 'Costa de Marfil',       conf: 'CAF' },
    { id: 'EGY', name: 'Egipto',               conf: 'CAF' },
    { id: 'GHA', name: 'Ghana',                conf: 'CAF' },
    { id: 'MAR', name: 'Marruecos',             conf: 'CAF' },
    { id: 'SEN', name: 'Senegal',              conf: 'CAF' },
    { id: 'ZAF', name: 'Sudáfrica',             conf: 'CAF' },
    { id: 'TUN', name: 'Túnez',                conf: 'CAF' },
    { id: 'COD', name: 'RD Congo',             conf: 'CAF' },
    // CONCACAF
    { id: 'CUW', name: 'Curazao',              conf: 'CONCACAF' },
    { id: 'HTI', name: 'Haití',                conf: 'CONCACAF' },
    { id: 'PAN', name: 'Panamá',               conf: 'CONCACAF' },
    // CONMEBOL
    { id: 'ARG', name: 'Argentina',             conf: 'CONMEBOL' },
    { id: 'BRA', name: 'Brasil',               conf: 'CONMEBOL' },
    { id: 'COL', name: 'Colombia',             conf: 'CONMEBOL' },
    { id: 'ECU', name: 'Ecuador',              conf: 'CONMEBOL' },
    { id: 'PRY', name: 'Paraguay',             conf: 'CONMEBOL' },
    { id: 'URU', name: 'Uruguay',              conf: 'CONMEBOL' },
    // OFC
    { id: 'NZL', name: 'Nueva Zelanda',         conf: 'OFC' },
    // UEFA
    { id: 'AUT', name: 'Austria',              conf: 'UEFA' },
    { id: 'BEL', name: 'Bélgica',             conf: 'UEFA' },
    { id: 'BIH', name: 'Bosnia y Herzegovina',  conf: 'UEFA' },
    { id: 'HRV', name: 'Croacia',              conf: 'UEFA' },
    { id: 'CZE', name: 'República Checa',       conf: 'UEFA' },
    { id: 'ENG', name: 'Inglaterra',            conf: 'UEFA' },
    { id: 'FRA', name: 'Francia',              conf: 'UEFA' },
    { id: 'DEU', name: 'Alemania',             conf: 'UEFA' },
    { id: 'NLD', name: 'Países Bajos',         conf: 'UEFA' },
    { id: 'NOR', name: 'Noruega',              conf: 'UEFA' },
    { id: 'PRT', name: 'Portugal',             conf: 'UEFA' },
    { id: 'SCO', name: 'Escocia',              conf: 'UEFA' },
    { id: 'ESP', name: 'España',               conf: 'UEFA' },
    { id: 'SWE', name: 'Suecia',               conf: 'UEFA' },
    { id: 'CHE', name: 'Suiza',                conf: 'UEFA' },
    { id: 'TUR', name: 'Turquía',              conf: 'UEFA' },
  ];

  // Especiales FIFA — 20 láminas, solo numeradas
  const SPECIAL_STICKERS = Array.from({ length: 20 }, (_, i) => ({
    id:   `FWC-${String(i+1).padStart(2,'0')}`,
    name: `FWC ${i+1}`,
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

  return { TEAMS, SPECIAL_STICKERS, teamStickers, ALL_STICKERS, CONFS, CONF_NAMES, FLAG_CODE, flagUrl, TOTAL: ALL_STICKERS.length };
})();
