const NAMESPACE = 'https://paiwise.tagroot.io/Schema/NeuroAccessKycProcess.xsd';

export const KYC_LANGUAGES = ['en', 'sv', 'es', 'pt', 'da', 'no', 'fi', 'fr'];

const STANDARD_FIELD_DEFINITIONS = {
  FIRST: { id: 'firstNames', type: 'text', mapping: ['FIRST'] },
  MID: { id: 'middleNames', type: 'text', mapping: ['MID'] },
  LAST: { id: 'lastNames', type: 'text', mapping: ['LAST'] },
  PNR: { id: 'personalNumber', type: 'text', mapping: ['PNR'] },
  DOB: {
    id: 'dob',
    type: 'date',
    mapping: ['BDAY', 'BMONTH', 'BYEAR'],
    transforms: ['day', 'month', 'year'],
  },
  GENDER: { id: 'gender', type: 'gender', mapping: ['GENDER'] },
  NATIONALITY: { id: 'nationality', type: 'country', mapping: ['NATIONALITY'] },
  ADDR: { id: 'address', type: 'text', mapping: ['ADDR'] },
  ZIP: { id: 'zipCode', type: 'text', mapping: ['ZIP'] },
  CITY: { id: 'city', type: 'text', mapping: ['CITY'] },
  COUNTRY: { id: 'country', type: 'country', mapping: ['COUNTRY'] },
  AREA: { id: 'area', type: 'text', mapping: ['AREA'] },
  REGION: { id: 'region', type: 'text', mapping: ['REGION'] },
};

const STANDARD_LABELS = {
  FIRST: ['First name', 'Förnamn', 'Nombre', 'Nome', 'Fornavn', 'Fornavn', 'Etunimi', 'Prénom'],
  MID: ['Middle name', 'Mellannamn', 'Segundo nombre', 'Nome do meio', 'Mellemnavn', 'Mellomnavn', 'Toinen nimi', 'Deuxième prénom'],
  LAST: ['Last name', 'Efternamn', 'Apellido', 'Sobrenome', 'Efternavn', 'Etternavn', 'Sukunimi', 'Nom de famille'],
  PNR: ['Personal number', 'Personnummer', 'Número personal', 'Número pessoal', 'Personnummer', 'Personnummer', 'Henkilötunnus', 'Numéro personnel'],
  DOB: ['Date of birth', 'Födelsedatum', 'Fecha de nacimiento', 'Data de nascimento', 'Fødselsdato', 'Fødselsdato', 'Syntymäaika', 'Date de naissance'],
  GENDER: ['Gender', 'Kön', 'Género', 'Gênero', 'Køn', 'Kjønn', 'Sukupuoli', 'Genre'],
  NATIONALITY: ['Nationality', 'Nationalitet', 'Nacionalidad', 'Nacionalidade', 'Nationalitet', 'Nasjonalitet', 'Kansalaisuus', 'Nationalité'],
  ADDR: ['Address', 'Adress', 'Dirección', 'Endereço', 'Adresse', 'Adresse', 'Osoite', 'Adresse'],
  ZIP: ['Postal code', 'Postnummer', 'Código postal', 'CEP', 'Postnummer', 'Postnummer', 'Postinumero', 'Code postal'],
  CITY: ['City', 'Stad', 'Ciudad', 'Cidade', 'By', 'By', 'Kaupunki', 'Ville'],
  COUNTRY: ['Country', 'Land', 'País', 'País', 'Land', 'Land', 'Maa', 'Pays'],
  AREA: ['Area', 'Område', 'Zona', 'Área', 'Område', 'Område', 'Alue', 'Zone'],
  REGION: ['Region', 'Region', 'Región', 'Região', 'Region', 'Region', 'Alue', 'Région'],
};

const PAGE_COPY = {
  personal: {
    title: ['Personal information', 'Personuppgifter', 'Información personal', 'Informações pessoais', 'Personlige oplysninger', 'Personlig informasjon', 'Henkilötiedot', 'Informations personnelles'],
    description: ['Please enter your personal details as they appear on your legal documents.', 'Ange dina personuppgifter enligt dina officiella dokument.', 'Introduce tus datos personales tal y como aparecen en tus documentos legales.', 'Insira seus dados pessoais conforme constam em seus documentos legais.', 'Indtast dine personlige oplysninger, som de fremgår af dine officielle dokumenter.', 'Oppgi dine personlige opplysninger slik de står i dine offisielle dokumenter.', 'Anna henkilötietosi täsmälleen kuten ne ovat virallisissa asiakirjoissasi.', 'Veuillez saisir vos informations personnelles telles qu’elles apparaissent sur vos documents officiels.'],
  },
  address: {
    title: ['Address information', 'Adressinformation', 'Información de dirección', 'Informações de endereço', 'Adresseoplysninger', 'Adresseinformasjon', 'Osoitetiedot', 'Informations d’adresse'],
    description: ['Please enter your current address.', 'Ange din nuvarande adress.', 'Introduce tu dirección actual.', 'Insira seu endereço atual.', 'Indtast din nuværende adresse.', 'Oppgi din nåværende adresse.', 'Anna nykyinen osoitteesi.', 'Veuillez saisir votre adresse actuelle.'],
  },
  custom: {
    title: ['Additional information', 'Ytterligare information', 'Información adicional', 'Informações adicionais', 'Yderligere oplysninger', 'Tilleggsinformasjon', 'Lisätiedot', 'Informations complémentaires'],
    description: ['Please provide the additional information requested.', 'Ange den ytterligare information som efterfrågas.', 'Proporciona la información adicional solicitada.', 'Forneça as informações adicionais solicitadas.', 'Angiv de yderligere oplysninger, der anmodes om.', 'Oppgi den ekstra informasjonen som etterspørres.', 'Anna pyydetyt lisätiedot.', 'Veuillez fournir les informations complémentaires demandées.'],
  },
};

const COMMON_TRANSLATIONS = {
  'phone number': ['Phone number', 'Telefonnummer', 'Número de teléfono', 'Número de telefone', 'Telefonnummer', 'Telefonnummer', 'Puhelinnumero', 'Numéro de téléphone'],
  'email address': ['Email address', 'E-postadress', 'Dirección de correo electrónico', 'Endereço de e-mail', 'E-mailadresse', 'E-postadresse', 'Sähköpostiosoite', 'Adresse e-mail'],
  'occupation': ['Occupation', 'Yrke', 'Ocupación', 'Ocupação', 'Beskæftigelse', 'Yrke', 'Ammatti', 'Profession'],
  'company name': ['Company name', 'Företagsnamn', 'Nombre de la empresa', 'Nome da empresa', 'Virksomhedsnavn', 'Firmanavn', 'Yrityksen nimi', 'Nom de l’entreprise'],
  'tax number': ['Tax number', 'Skattenummer', 'Número fiscal', 'Número fiscal', 'Skattenummer', 'Skattenummer', 'Veronumero', 'Numéro fiscal'],
  yes: ['Yes', 'Ja', 'Sí', 'Sim', 'Ja', 'Ja', 'Kyllä', 'Oui'],
  no: ['No', 'Nej', 'No', 'Não', 'Nej', 'Nei', 'Ei', 'Non'],
  male: ['Male', 'Man', 'Masculino', 'Masculino', 'Mand', 'Mann', 'Mies', 'Homme'],
  female: ['Female', 'Kvinna', 'Femenino', 'Feminino', 'Kvinde', 'Kvinne', 'Nainen', 'Femme'],
};

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toFieldId(value, fallback) {
  const normalized = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+(.)/g, (_, character) => character.toUpperCase())
    .replace(/^./, (character) => character.toLowerCase());

  return normalized || fallback;
}

function localizedText(elementName, values, indent = '\t\t') {
  return [
    `${indent}<${elementName}>`,
    ...KYC_LANGUAGES.map((language, index) => `${indent}\t<Text lang="${language}">${escapeXml(values[index] || values[0])}</Text>`),
    `${indent}</${elementName}>`,
  ].join('\n');
}

function getTranslatedText(value) {
  const text = String(value || '').trim();
  const knownTranslation = COMMON_TRANSLATIONS[text.toLocaleLowerCase()];
  return knownTranslation || KYC_LANGUAGES.map(() => text);
}

function getCustomLabels(field) {
  return getTranslatedText(field.label);
}

function fieldXml(field, indent = '\t\t') {
  const options = (field.options || []).filter((option) => String(option.value || '').trim());
  const fieldOpen = `${indent}<Field id="${escapeXml(field.xmlId)}" type="${escapeXml(field.type || 'text')}" required="${field.required ? 'true' : 'false'}">`;
  const lines = [fieldOpen, localizedText('Label', field.labels, `${indent}\t`)];

  if (field.placeholderLabels) {
    lines.push(localizedText('Placeholder', field.placeholderLabels, `${indent}\t`));
  }

  if (field.type === 'radio' || field.type === 'checkboxes' || field.type === 'picker') {
    const xmlType = field.type === 'checkboxes' ? 'checkbox' : field.type;
    lines[0] = `${indent}<Field id="${escapeXml(field.xmlId)}" type="${xmlType}" required="${field.required ? 'true' : 'false'}">`;
    if (options.length) {
      lines.push(`${indent}\t<Options>`);
      options.forEach((option, index) => {
        const optionValue = toFieldId(option.value, `option${index + 1}`);
        lines.push(`${indent}\t\t<Option value="${escapeXml(optionValue)}">`);
        getTranslatedText(option.value).forEach((translatedOption, languageIndex) => {
          lines.push(`${indent}\t\t\t<Text lang="${KYC_LANGUAGES[languageIndex]}">${escapeXml(translatedOption)}</Text>`);
        });
        lines.push(`${indent}\t\t</Option>`);
      });
      lines.push(`${indent}\t</Options>`);
    }
  }

  field.mapping.forEach((key, index) => {
    const transform = field.transforms?.[index];
    lines.push(transform
      ? `${indent}\t<Mapping key="${escapeXml(key)}"><Transform name="${transform}" /></Mapping>`
      : `${indent}\t<Mapping key="${escapeXml(key)}" />`);
  });
  lines.push(`${indent}</Field>`);
  return lines.join('\n');
}

/**
 * Builds a schema-compatible KYC process XML document from the selected fields.
 * Custom labels use known translations where available; otherwise their entered
 * wording is retained in every language so no label is lost in the export.
 */
export function buildKycProcessXml(requiredFields = []) {
  const selected = requiredFields.filter((field) => field.required);
  const standardFields = selected
    .filter((field) => STANDARD_FIELD_DEFINITIONS[field.id])
    .map((field) => {
      const definition = STANDARD_FIELD_DEFINITIONS[field.id];
      return {
        ...definition,
        xmlId: definition.id,
        required: true,
        labels: STANDARD_LABELS[field.id],
        placeholderLabels: STANDARD_LABELS[field.id],
      };
    });
  const customFields = selected
    .filter((field) => field.custom)
    .map((field, index) => ({
      xmlId: `custom${toFieldId(field.label, `Field${index + 1}`).replace(/^./, (character) => character.toUpperCase())}${index + 1}`,
      type: field.type || 'text',
      required: true,
      labels: getCustomLabels(field),
      placeholderLabels: getTranslatedText(field.placeholder || field.label),
      options: field.options,
      mapping: [field.mappingKey || `CUSTOM_${toFieldId(field.label, index + 1).toUpperCase()}`],
    }));

  const fields = [...standardFields, ...customFields];
  const pageXml = fields.length
    ? fields.map((field) => [
      `\t<Page id="page-${escapeXml(field.xmlId)}">`,
      localizedText('Title', field.labels),
      fieldXml(field),
      '\t</Page>',
    ].join('\n'))
    : [[
      '\t<Page id="information">',
      localizedText('Title', PAGE_COPY.custom.title),
      localizedText('Description', PAGE_COPY.custom.description),
      '\t</Page>',
    ].join('\n')];

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<KYCProcess xmlns="${NAMESPACE}">`,
    localizedText('Name', ['KYC process', 'KYC-process', 'Proceso KYC', 'Processo KYC', 'KYC-proces', 'KYC-prosess', 'KYC-prosessi', 'Processus KYC'], '\t'),
    ...pageXml,
    '</KYCProcess>',
    '',
  ].join('\n');
}
