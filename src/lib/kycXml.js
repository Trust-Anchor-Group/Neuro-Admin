export const KYC_XML_NAMESPACE = "https://paiwise.tagroot.io/Schema/NeuroAccessKycProcess.xsd";

const languages = ["en", "sv", "es", "pt", "da", "no", "fi", "fr"];

const standardFieldDefinitions = {
  FIRST: { key: "firstName", label: "First name", type: "text" },
  MID: { key: "middleName", label: "Middle name", type: "text" },
  LAST: { key: "lastName", label: "Last name", type: "text" },
  PNR: { key: "personalNumber", label: "Personal number", type: "text" },
  DOB: { key: "dateOfBirth", label: "Date of birth", type: "date" },
  GENDER: { key: "gender", label: "Gender", type: "radio" },
  NATIONALITY: { key: "nationality", label: "Nationality", type: "country" },
  ADDR: { key: "address", label: "Address", type: "text" },
  ZIP: { key: "postalCode", label: "Postal code", type: "text" },
  CITY: { key: "city", label: "City", type: "text" },
  COUNTRY: { key: "country", label: "Country", type: "country" },
  AREA: { key: "area", label: "Area", type: "text" },
  REGION: { key: "region", label: "Region", type: "text" },
};

const translations = {
  "First name": ["Förnamn", "Nombre", "Primeiro nome", "Fornavn", "Fornavn", "Etunimi", "Prénom"],
  "Middle name": ["Mellannamn", "Segundo nombre", "Nome do meio", "Mellemnavn", "Mellomnavn", "Toinen nimi", "Deuxième prénom"],
  "Last name": ["Efternamn", "Apellido", "Apelido", "Efternavn", "Etternavn", "Sukunimi", "Nom"],
  "Personal number": ["Personnummer", "Número personal", "Número pessoal", "Personnummer", "Fødselsnummer", "Henkilötunnus", "Numéro personnel"],
  "Date of birth": ["Födelsedatum", "Fecha de nacimiento", "Data de nascimento", "Fødselsdato", "Fødselsdato", "Syntymäaika", "Date de naissance"],
  Gender: ["Kön", "Género", "Género", "Køn", "Kjønn", "Sukupuoli", "Genre"],
  Nationality: ["Nationalitet", "Nacionalidad", "Nacionalidade", "Nationalitet", "Nasjonalitet", "Kansalaisuus", "Nationalité"],
  Address: ["Adress", "Dirección", "Morada", "Adresse", "Adresse", "Osoite", "Adresse"],
  "Postal code": ["Postnummer", "Código postal", "Código postal", "Postnummer", "Postnummer", "Postinumero", "Code postal"],
  City: ["Stad", "Ciudad", "Cidade", "By", "By", "Kaupunki", "Ville"],
  Country: ["Land", "País", "País", "Land", "Land", "Maa", "Pays"],
  Area: ["Område", "Zona", "Área", "Område", "Område", "Alue", "Zone"],
  Region: ["Region", "Región", "Região", "Region", "Region", "Alue", "Région"],
  Yes: ["Ja", "Sí", "Sim", "Ja", "Ja", "Kyllä", "Oui"],
  No: ["Nej", "No", "Não", "Nej", "Nei", "Ei", "Non"],
  Other: ["Annat", "Otro", "Outro", "Andet", "Annet", "Muu", "Autre"],
  Male: ["Man", "Masculino", "Masculino", "Mand", "Mann", "Mies", "Homme"],
  Female: ["Kvinna", "Femenino", "Feminino", "Kvinde", "Kvinne", "Nainen", "Femme"],
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toSlug = (value) =>
  String(value || "field")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "field";

const createIdFactory = () => {
  let count = 0;
  return (prefix) => `${prefix}-${++count}`;
};

const multilingualText = (value) => {
  const localized = translations[value] || [];
  return languages
    .map((language, index) => `<Text lang="${language}">${escapeXml(index === 0 ? value : localized[index - 1] || value)}</Text>`)
    .join("");
};

const normalizeCustomType = (type) => ({
  text: "text",
  radio: "radio",
  checkboxes: "checkbox",
}[type] || "text");

const customMappingKey = (field) => `custom.${toSlug(field.label)}.${toSlug(field.id).slice(-12)}`;

const builderFieldKeys = {
  firstName: "firstName",
  middleName: "middleName",
  lastName: "lastName",
  preferredName: "preferredName",
  dateOfBirth: "dateOfBirth",
  gender: "gender",
  nationality: "nationality",
  placeOfBirth: "placeOfBirth",
  emailAddress: "emailAddress",
  phoneNumber: "phoneNumber",
  alternatePhoneNumber: "alternatePhoneNumber",
  streetAddressLine1: "addressLine1",
  streetAddressLine2: "addressLine2",
  city: "city",
  stateProvinceRegion: "region",
  zipPostalCode: "postalCode",
  country: "country",
  yearsAtCurrentAddress: "yearsAtCurrentAddress",
  documentType: "documentType",
  documentNumber: "documentNumber",
  issuingCountry: "issuingCountry",
  issuingAuthority: "issuingAuthority",
  issueDate: "issueDate",
  expirationDate: "expirationDate",
};

const normalizeBuilderType = (field) => {
  if (["country", "nationality", "issuingCountry"].includes(field.id)) return "country";
  if (field.id === "gender") return "gender";
  return ({
    Date: "date",
    Email: "email",
    Phone: "phone",
    Number: "integer",
    Select: "picker",
    Radio: "radio",
    Checkboxes: "checkbox",
    "File upload": "file",
    Verification: "info",
    Signature: "text",
    "Text input": "text",
  }[field.inputType === "radio" ? "Radio" : field.inputType === "checkboxes" ? "Checkboxes" : field.type] || "text");
};

export function getKycPreviewSteps(requiredFields = [], customFields = [], labels = {}) {
  const standardSteps = requiredFields
    .filter((field) => field.required && standardFieldDefinitions[field.id])
    .map((field) => ({
      ...field,
      ...standardFieldDefinitions[field.id],
      label: labels[field.id] || standardFieldDefinitions[field.id].label,
      xmlLabel: standardFieldDefinitions[field.id].label,
      description: "Provide this information to continue your verification.",
      required: true,
      options: field.id === "GENDER" ? [{ id: "male", value: "Male" }, { id: "female", value: "Female" }] : [],
    }));

  const savedCustomSteps = customFields
    .filter((field) => field?.label?.trim() && field?.type)
    .map((field) => ({
      ...field,
      key: customMappingKey(field),
      type: normalizeCustomType(field.type),
      description: field.description || "Provide this information to continue your verification.",
      options: (field.options || []).filter((option) => option.value?.trim()),
    }));

  return [...standardSteps, ...savedCustomSteps];
}

export function buildKycXml({ requiredFields = [], customFields = [], labels = {}, name = "KYC Process" } = {}) {
  const nextId = createIdFactory();
  const steps = getKycPreviewSteps(requiredFields, customFields, labels);
  const pages = steps.map((field) => {
    const pageId = nextId("page");
    const options = (field.options || [])
      .map((option) => `<Option value="${escapeXml(option.value)}">${multilingualText(option.value)}</Option>`)
      .join("");
    const placeholder = field.placeholder || (field.type === "date" ? "YYYY-MM-DD" : "");
    const xmlLabel = field.xmlLabel || field.label;
    return `<Page id="${pageId}" title="${escapeXml(xmlLabel)}"><Title>${multilingualText(xmlLabel)}</Title><Description>${multilingualText(field.description)}</Description><Field id="${escapeXml(field.id)}" type="${escapeXml(field.type)}" required="${Boolean(field.required)}"><Label>${multilingualText(xmlLabel)}</Label><Placeholder>${multilingualText(placeholder)}</Placeholder>${options ? `<Options>${options}</Options>` : ""}<Mapping key="${escapeXml(field.key)}"/></Field></Page>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<KYCProcess xmlns="${KYC_XML_NAMESPACE}"><Name>${multilingualText(name)}</Name>${pages.join("")}</KYCProcess>`;
}

export function buildKycXmlFromBuilderGroups({ groups = [], selectedFieldIds = [], name = "KYC Process" } = {}) {
  const selectedIds = new Set(selectedFieldIds);
  const nextId = createIdFactory();
  const pages = groups.flatMap((group) => {
    const fields = group.fields.flatMap((field) => {
      if (!selectedIds.has(field.id)) return [];
      if (field.kind === "group") {
        return (field.subfields || []).map((subfield) => ({
          id: `${field.id}-${subfield.id}`,
          key: `custom.${toSlug(field.label)}.${toSlug(subfield.id)}`,
          label: subfield.label || field.label || "Custom field",
          type: "text",
          required: Boolean(subfield.required || field.required),
          placeholder: subfield.placeholder || "",
          hint: "",
          options: [],
        }));
      }

      const isCustom = field.id.startsWith("custom-") || field.kind === "field";
      return [{
        id: field.id,
        key: isCustom ? customMappingKey(field) : builderFieldKeys[field.id] || toSlug(field.id),
        label: field.label || "Field",
        type: normalizeBuilderType(field),
        required: isCustom ? Boolean(field.required) : true,
        placeholder: field.placeholder || "",
        hint: field.hint || "",
        options: (field.options || []).filter((option) => option.value?.trim()),
      }];
    });
    if (!fields.length) return [];

    const fieldsXml = fields.map((field) => {
      const options = field.options
        .map((option) => `<Option value="${escapeXml(option.value)}">${multilingualText(option.value)}</Option>`)
        .join("");
      const specialType = field.type === "info" || field.type === "text" && field.id.includes("signature") ? ` specialType="${escapeXml(field.type === "info" ? "verification" : "signature")}"` : "";
      return `<Field id="${escapeXml(field.id)}" type="${escapeXml(field.type)}" required="${field.required}"${specialType}><Label>${multilingualText(field.label)}</Label>${field.hint ? `<Hint>${multilingualText(field.hint)}</Hint>` : ""}${field.placeholder ? `<Placeholder>${multilingualText(field.placeholder)}</Placeholder>` : ""}${options ? `<Options>${options}</Options>` : ""}<Mapping key="${escapeXml(field.key)}"/></Field>`;
    });

    const title = group.title || "KYC page";
    return [`<Page id="${nextId("page")}" title="${escapeXml(title)}"><Title>${multilingualText(title)}</Title>${group.description ? `<Description>${multilingualText(group.description)}</Description>` : ""}${fieldsXml.join("")}</Page>`];
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<KYCProcess xmlns="${KYC_XML_NAMESPACE}"><Name>${multilingualText(name)}</Name>${pages.join("")}</KYCProcess>`;
}
