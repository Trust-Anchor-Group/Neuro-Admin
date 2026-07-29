"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  FileBadge2,
  FileCheck2,
  FileSearch,
  GripVertical,
  House,
  Info,
  Landmark,
  Mail,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

const availableFieldGroups = [
  {
    title: "Personal Information",
    fields: [
      { id: "firstName", label: "First Name", type: "Text input" },
      { id: "middleName", label: "Middle Name", type: "Text input" },
      { id: "lastName", label: "Last Name", type: "Text input" },
      { id: "preferredName", label: "Preferred Name", type: "Text input" },
      { id: "dateOfBirth", label: "Date of Birth", type: "Date" },
      { id: "gender", label: "Gender", type: "Radio" },
      { id: "nationality", label: "Nationality", type: "Text input" },
      { id: "placeOfBirth", label: "Place of Birth", type: "Text input" },
    ],
  },
  {
    title: "Contact Information",
    fields: [
      { id: "emailAddress", label: "Email Address", type: "Email" },
      { id: "phoneNumber", label: "Phone Number", type: "Phone" },
      { id: "alternatePhoneNumber", label: "Alternate Phone Number", type: "Phone" },
    ],
  },
  {
    title: "Residential Address",
    fields: [
      { id: "streetAddressLine1", label: "Street Address Line 1", type: "Text input" },
      { id: "streetAddressLine2", label: "Street Address Line 2", type: "Text input" },
      { id: "city", label: "City", type: "Text input" },
      { id: "stateProvinceRegion", label: "State/Province/Region", type: "Text input" },
      { id: "zipPostalCode", label: "ZIP/Postal Code", type: "Text input" },
      { id: "country", label: "Country", type: "Text input" },
      { id: "yearsAtCurrentAddress", label: "Years at Current Address", type: "Number" },
    ],
  },
  {
    title: "Identification Document",
    fields: [
      { id: "documentType", label: "Document Type", type: "Select" },
      { id: "documentNumber", label: "Document Number", type: "Text input" },
      { id: "issuingCountry", label: "Issuing Country", type: "Text input" },
      { id: "issuingAuthority", label: "Issuing Authority", type: "Text input" },
      { id: "issueDate", label: "Issue Date", type: "Date" },
      { id: "expirationDate", label: "Expiration Date", type: "Date" },
    ],
  },
  {
    title: "Identity Verification",
    fields: [
      { id: "uploadFrontOfId", label: "Upload Front of ID", type: "File upload" },
      { id: "uploadBackOfId", label: "Upload Back of ID", type: "File upload" },
      { id: "selfieFaceVerification", label: "Selfie / Face Verification", type: "File upload" },
      { id: "proofOfLiveness", label: "Proof of Liveness", type: "Verification" },
    ],
  },
];

const comingSoonFieldGroups = [
  {
    title: "Proof of Address",
    comingSoon: true,
    fields: [
      { id: "proofAddressDocumentType", label: "Document Type", type: "Select" },
      { id: "proofAddressUploadDocument", label: "Upload Document", type: "File upload" },
      { id: "proofAddressDocumentDate", label: "Document Date", type: "Date" },
    ],
  },
  {
    title: "Employment & Financial Information",
    comingSoon: true,
    fields: [
      { id: "employmentStatus", label: "Employment Status", type: "Select" },
      { id: "employerName", label: "Employer Name", type: "Text input" },
      { id: "occupation", label: "Occupation", type: "Text input" },
      { id: "annualIncomeRange", label: "Annual Income Range", type: "Select" },
      { id: "sourceOfFunds", label: "Source of Funds", type: "Text input" },
      { id: "sourceOfWealth", label: "Source of Wealth", type: "Text input" },
    ],
  },
  {
    title: "Tax Information",
    comingSoon: true,
    fields: [
      { id: "taxResidency", label: "Tax Residency", type: "Text input" },
      { id: "taxIdentificationNumber", label: "Tax Identification Number (TIN)", type: "Text input" },
      { id: "fatcaCrsQuestions", label: "FATCA/CRS Questions", type: "Checkboxes" },
    ],
  },
  {
    title: "Compliance Questions",
    comingSoon: true,
    fields: [
      { id: "politicallyExposedPerson", label: "Politically Exposed Person (PEP)?", type: "Radio" },
      { id: "familyAssociatePep", label: "Family/Associate of a PEP?", type: "Radio" },
      { id: "subjectToSanctions", label: "Subject to Sanctions?", type: "Radio" },
      { id: "countryOfResidence", label: "Country of Residence", type: "Text input" },
      { id: "countryOfCitizenship", label: "Country of Citizenship", type: "Text input" },
    ],
  },
  {
    title: "Consent & Agreements",
    comingSoon: true,
    fields: [
      { id: "privacyPolicyAcceptance", label: "Privacy Policy Acceptance", type: "Checkboxes" },
      { id: "termsConditionsAcceptance", label: "Terms & Conditions Acceptance", type: "Checkboxes" },
      { id: "identityVerificationConsent", label: "Consent to Identity Verification", type: "Checkboxes" },
      { id: "electronicSignature", label: "Electronic Signature", type: "Signature" },
    ],
  },
];

const availableFields = availableFieldGroups.flatMap((group) => group.fields);
const savedKycStorageKey = "neuro-admin-my-kycs";

const inputTypeOptions = [
  { value: "radio", label: "Radio" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "text", label: "Text input" },
];

const createEmptyCustomField = () => ({
  id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  kind: "field",
  label: "",
  description: "",
  hint: "",
  inputType: "",
  required: false,
  placeholder: "",
  options: [{ id: `option-${Date.now()}`, value: "" }],
});

const createEmptyCustomGroup = () => ({
  id: `custom-group-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  kind: "group",
  label: "",
  description: "",
  hint: "",
  inputType: "group",
  required: false,
  placeholder: "",
  options: [{ id: `option-${Date.now()}`, value: "" }],
  subfields: [
    {
      id: `subfield-${Date.now()}-1`,
      label: "",
      placeholder: "",
      required: false,
    },
    {
      id: `subfield-${Date.now()}-2`,
      label: "",
      placeholder: "",
      required: false,
    },
  ],
});

const getCustomFieldType = (field) =>
  field.kind === "group"
    ? "Multi-field page item"
    : inputTypeOptions.find((option) => option.value === field.inputType)?.label || field.type || "Custom field";

const usesAnswerOptions = (field) =>
  field.inputType === "radio" ||
  field.inputType === "checkboxes" ||
  field.type === "Radio" ||
  field.type === "Checkboxes";

const normalizeCustomField = (field) => ({
  ...field,
  type: getCustomFieldType(field),
});

const getGroupKey = (group) => group.id || group.title;
const defaultPageDescription = "Complete this page to continue your verification.";

const previewLanguages = [
  ["en", "English"], ["sv", "Svenska"], ["es", "Español"], ["pt", "Português"],
  ["da", "Dansk"], ["no", "Norsk"], ["fi", "Suomi"], ["fr", "Français"],
];

const previewTranslations = {
  "Preview": ["Förhandsvisning", "Vista previa", "Pré-visualização", "Forhåndsvisning", "Forhåndsvisning", "Esikatselu", "Aperçu"],
  "Personal Information": ["Personuppgifter", "Información personal", "Informações pessoais", "Personlige oplysninger", "Personopplysninger", "Henkilötiedot", "Informations personnelles"],
  "Contact Information": ["Kontaktuppgifter", "Información de contacto", "Informações de contacto", "Kontaktoplysninger", "Kontaktinformasjon", "Yhteystiedot", "Coordonnées"],
  "Residential Address": ["Bostadsadress", "Dirección residencial", "Morada residencial", "Bopælsadresse", "Bostedsadresse", "Kotiosoite", "Adresse résidentielle"],
  "Identification Document": ["Identitetshandling", "Documento de identidad", "Documento de identificação", "Identitetsdokument", "Identitetsdokument", "Henkilöllisyystodistus", "Document d’identité"],
  "Identity Verification": ["Identitetsverifiering", "Verificación de identidad", "Verificação de identidade", "Identitetsbekræftelse", "Identitetsbekreftelse", "Henkilöllisyyden vahvistaminen", "Vérification d’identité"],
  "Complete this page to continue your verification.": ["Fyll i den här sidan för att fortsätta verifieringen.", "Complete esta página para continuar con la verificación.", "Preencha esta página para continuar a verificação.", "Udfyld denne side for at fortsætte verificeringen.", "Fullfør denne siden for å fortsette verifiseringen.", "Täytä tämä sivu jatkaaksesi vahvistusta.", "Remplissez cette page pour poursuivre la vérification."],
  "First name": ["Förnamn", "Nombre", "Primeiro nome", "Fornavn", "Fornavn", "Etunimi", "Prénom"],
  "Middle name": ["Mellannamn", "Segundo nombre", "Nome do meio", "Mellemnavn", "Mellomnavn", "Toinen nimi", "Deuxième prénom"],
  "Last name": ["Efternamn", "Apellido", "Apelido", "Efternavn", "Etternavn", "Sukunimi", "Nom"],
  "Personal number": ["Personnummer", "Número personal", "Número pessoal", "Personnummer", "Fødselsnummer", "Henkilötunnus", "Numéro personnel"],
  "Date of birth": ["Födelsedatum", "Fecha de nacimiento", "Data de nascimento", "Fødselsdato", "Fødselsdato", "Syntymäaika", "Date de naissance"],
  "Gender": ["Kön", "Género", "Género", "Køn", "Kjønn", "Sukupuoli", "Genre"],
  "Nationality": ["Nationalitet", "Nacionalidad", "Nacionalidade", "Nationalitet", "Nasjonalitet", "Kansalaisuus", "Nationalité"],
  "Address": ["Adress", "Dirección", "Morada", "Adresse", "Adresse", "Osoite", "Adresse"],
  "Postal code": ["Postnummer", "Código postal", "Código postal", "Postnummer", "Postnummer", "Postinumero", "Code postal"],
  "City": ["Stad", "Ciudad", "Cidade", "By", "By", "Kaupunki", "Ville"],
  "Country": ["Land", "País", "País", "Land", "Land", "Maa", "Pays"],
  "Male": ["Man", "Masculino", "Masculino", "Mand", "Mann", "Mies", "Homme"],
  "Female": ["Kvinna", "Femenino", "Feminino", "Kvinde", "Kvinne", "Nainen", "Femme"],
  "Preferred Name": ["Tilltalsnamn", "Nombre preferido", "Nome preferido", "Foretrukket navn", "Foretrukket navn", "Kutsumanimi", "Prénom usuel"],
  "Place of Birth": ["Födelseort", "Lugar de nacimiento", "Local de nascimento", "Fødested", "Fødested", "Syntymäpaikka", "Lieu de naissance"],
  "Email Address": ["E-postadress", "Correo electrónico", "Endereço de e-mail", "E-mailadresse", "E-postadresse", "Sähköpostiosoite", "Adresse e-mail"],
  "Phone Number": ["Telefonnummer", "Número de teléfono", "Número de telefone", "Telefonnummer", "Telefonnummer", "Puhelinnumero", "Numéro de téléphone"],
  "Alternate Phone Number": ["Alternativt telefonnummer", "Teléfono alternativo", "Telefone alternativo", "Alternativt telefonnummer", "Alternativt telefonnummer", "Vaihtoehtoinen puhelinnumero", "Autre numéro de téléphone"],
  "Street Address Line 1": ["Gatuadress rad 1", "Dirección línea 1", "Morada linha 1", "Adresselinje 1", "Adresselinje 1", "Katuosoite 1", "Adresse ligne 1"],
  "Street Address Line 2": ["Gatuadress rad 2", "Dirección línea 2", "Morada linha 2", "Adresselinje 2", "Adresselinje 2", "Katuosoite 2", "Adresse ligne 2"],
  "State/Province/Region": ["Stat/Provins/Region", "Estado/Provincia/Región", "Estado/Província/Região", "Stat/Provins/Region", "Stat/Provins/Region", "Osavaltio/Maakunta/Alue", "État/Province/Région"],
  "ZIP/Postal Code": ["Postnummer", "Código postal", "Código postal", "Postnummer", "Postnummer", "Postinumero", "Code postal"],
  "Years at Current Address": ["År på nuvarande adress", "Años en la dirección actual", "Anos na morada atual", "År på nuværende adresse", "År på nåværende adresse", "Vuodet nykyisessä osoitteessa", "Années à l’adresse actuelle"],
  "Document Type": ["Dokumenttyp", "Tipo de documento", "Tipo de documento", "Dokumenttype", "Dokumenttype", "Asiakirjan tyyppi", "Type de document"],
  "Document Number": ["Dokumentnummer", "Número de documento", "Número do documento", "Dokumentnummer", "Dokumentnummer", "Asiakirjan numero", "Numéro du document"],
  "Issuing Country": ["Utfärdandeland", "País emisor", "País emissor", "Udstedelsesland", "Utstedelsesland", "Myöntäjämaa", "Pays émetteur"],
  "Issuing Authority": ["Utfärdande myndighet", "Autoridad emisora", "Autoridade emissora", "Udstedende myndighed", "Utstedende myndighet", "Myöntävä viranomainen", "Autorité émettrice"],
  "Issue Date": ["Utfärdandedatum", "Fecha de emisión", "Data de emissão", "Udstedelsesdato", "Utstedelsesdato", "Myöntämispäivä", "Date de délivrance"],
  "Expiration Date": ["Utgångsdatum", "Fecha de caducidad", "Data de validade", "Udløbsdato", "Utløpsdato", "Viimeinen voimassaolopäivä", "Date d’expiration"],
  "Upload Front of ID": ["Ladda upp framsidan av ID", "Subir anverso del documento", "Carregar frente do documento", "Upload forsiden af ID", "Last opp forsiden av ID", "Lataa henkilötodistuksen etupuoli", "Téléverser le recto de la pièce d’identité"],
  "Upload Back of ID": ["Ladda upp baksidan av ID", "Subir reverso del documento", "Carregar verso do documento", "Upload bagsiden af ID", "Last opp baksiden av ID", "Lataa henkilötodistuksen kääntöpuoli", "Téléverser le verso de la pièce d’identité"],
  "Selfie / Face Verification": ["Selfie / Ansiktsverifiering", "Selfie / Verificación facial", "Selfie / Verificação facial", "Selfie / Ansigtsbekræftelse", "Selfie / Ansiktsbekreftelse", "Selfie / Kasvojen vahvistus", "Selfie / Vérification faciale"],
  "Proof of Liveness": ["Livskontroll", "Prueba de vida", "Prova de vida", "Livstjek", "Livssjekk", "Elollisuustarkistus", "Preuve de présence"],
  "Select an option": ["Välj ett alternativ", "Seleccione una opción", "Selecione uma opção", "Vælg en mulighed", "Velg et alternativ", "Valitse vaihtoehto", "Sélectionnez une option"],
  "Enter details": ["Ange uppgifter", "Introduzca los datos", "Introduza os dados", "Indtast oplysninger", "Skriv inn opplysninger", "Anna tiedot", "Saisissez les informations"],
  "Upload file": ["Ladda upp fil", "Subir archivo", "Carregar ficheiro", "Upload fil", "Last opp fil", "Lataa tiedosto", "Téléverser un fichier"],
  "Verification step": ["Verifieringssteg", "Paso de verificación", "Etapa de verificação", "Verifikationstrin", "Verifiseringstrinn", "Vahvistusvaihe", "Étape de vérification"],
  "Option": ["Alternativ", "Opción", "Opção", "Mulighed", "Alternativ", "Vaihtoehto", "Option"],
  "Subfield": ["Underfält", "Subcampo", "Subcampo", "Underfelt", "Underfelt", "Alikenttä", "Sous-champ"],
  "Powered by": ["Drivs av", "Desarrollado por", "Desenvolvido por", "Drevet af", "Drevet av", "Palvelun tarjoaa", "Propulsé par"],
  "Continue": ["Fortsätt", "Continuar", "Continuar", "Fortsæt", "Fortsett", "Jatka", "Continuer"],
  "Help": ["Hjälp", "Ayuda", "Ajuda", "Hjælp", "Hjelp", "Ohje", "Aide"],
  "Select fields on the left to build the customer view.": ["Välj fält till vänster för att skapa kundvyn.", "Seleccione campos a la izquierda para crear la vista del cliente.", "Selecione campos à esquerda para criar a vista do cliente.", "Vælg felter til venstre for at opbygge kundevisningen.", "Velg felt til venstre for å bygge kundevisningen.", "Valitse kentät vasemmalta luodaksesi asiakasnäkymän.", "Sélectionnez des champs à gauche pour créer la vue client."],
};

const translatePreview = (value, language) => {
  const index = previewLanguages.findIndex(([code]) => code === language);
  if (index <= 0 || !value) return value;
  const normalizedValue = String(value).trim().toLocaleLowerCase("en");
  const translationKey = Object.keys(previewTranslations).find(
    (key) => key.toLocaleLowerCase("en") === normalizedValue
  );
  return previewTranslations[translationKey]?.[index - 1] || value;
};

const groupIcons = {
  "Personal Information": UserRound,
  "Contact Information": Mail,
  "Residential Address": House,
  "Identification Document": FileBadge2,
  "Identity Verification": BadgeCheck,
  "Proof of Address": FileCheck2,
  "Employment & Financial Information": Landmark,
  "Tax Information": FileSearch,
  "Compliance Questions": FileCheck2,
  "Consent & Agreements": BadgeCheck,
};

export default function MyKYCBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trustServicesContext = searchParams.get("section") === "trust-services";
  const myKycPath = trustServicesContext
    ? "/neuro-access/settings/my-kyc?section=trust-services"
    : "/neuro-access/settings/my-kyc";
  const [kycName, setKycName] = useState("");
  const [kycDescription, setKycDescription] = useState("");
  const [activeStep, setActiveStep] = useState("groups");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState([]);
  const [currentConfigGroupIndex, setCurrentConfigGroupIndex] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isRemovingDragOver, setIsRemovingDragOver] = useState(false);
  const [draggedSelectedGroupTitle, setDraggedSelectedGroupTitle] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldGroups, setCustomFieldGroups] = useState([]);
  const [groupCustomFields, setGroupCustomFields] = useState({});
  const [editedFields, setEditedFields] = useState({});
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [customFieldTargetGroupTitle, setCustomFieldTargetGroupTitle] = useState(null);
  const [fieldBeingEdited, setFieldBeingEdited] = useState(null);
  const [availableFieldSearch, setAvailableFieldSearch] = useState("");
  const [savedKyc, setSavedKyc] = useState(null);
  const [showKycNameError, setShowKycNameError] = useState(false);
  const [editingKycId, setEditingKycId] = useState(null);
  const [pageTitles, setPageTitles] = useState({});
  const [pageDescriptions, setPageDescriptions] = useState({});
  const [fieldOrderByGroup, setFieldOrderByGroup] = useState({});
  const [shouldSelectNewCustomPage, setShouldSelectNewCustomPage] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get("edit");
    if (!editId) return;

    const existingKycs = JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]");
    const kycToEdit = existingKycs.find((kyc) => kyc.id === editId);
    if (!kycToEdit) return;

    if (kycToEdit.draftState) {
      const draft = kycToEdit.draftState;
      setEditingKycId(editId);
      setKycName(kycToEdit.name || "");
      setKycDescription(kycToEdit.description || "");
      setSelectedGroups(draft.selectedGroups || []);
      setSelectedFieldIds(draft.selectedFieldIds || []);
      setCustomFields(draft.customFields || []);
      setCustomFieldGroups(draft.customFieldGroups || []);
      setGroupCustomFields(draft.groupCustomFields || {});
      setEditedFields(draft.editedFields || {});
      setPageTitles(draft.pageTitles || {});
      setPageDescriptions(draft.pageDescriptions || {});
      setFieldOrderByGroup(draft.fieldOrderByGroup || {});
      setCurrentConfigGroupIndex(draft.currentConfigGroupIndex || 0);
      setActiveStep(draft.activeStep === "configure" ? "configure" : "groups");
      setShowKycNameError(false);
      return;
    }

    const savedGroupCustomFields = kycToEdit.groups.reduce((groupFields, group) => {
      if (group.title === "Custom Fields") return groupFields;

      const baseGroup = availableFieldGroups.find(
        (availableGroup) => availableGroup.title === (group.sourceTitle || group.title)
      );
      if (!baseGroup) return groupFields;

      const baseFieldIds = new Set(baseGroup.fields.map((field) => field.id));
      const extraFields = group.fields.filter((field) => !baseFieldIds.has(field.id));

      return extraFields.length ? { ...groupFields, [group.title]: extraFields } : groupFields;
    }, {});
    const savedEditedFields = kycToEdit.groups.reduce((fieldOverrides, group) => {
      const baseGroup = availableFieldGroups.find(
        (availableGroup) => availableGroup.title === (group.sourceTitle || group.title)
      );
      if (!baseGroup) return fieldOverrides;

      const baseFieldIds = new Set(baseGroup.fields.map((field) => field.id));
      const editedBaseFields = group.fields.filter((field) => baseFieldIds.has(field.id));

      return editedBaseFields.reduce(
        (overrides, field) => ({
          ...overrides,
          [field.id]: field,
        }),
        fieldOverrides
      );
    }, {});
    const savedCustomFieldGroups = kycToEdit.groups
      .filter(
        (group) =>
          group.title === "Custom Fields" ||
          !availableFieldGroups.some(
            (availableGroup) => availableGroup.title === (group.sourceTitle || group.title)
          )
      )
      .map((group) => ({
        id: group.sourceKey || `custom-kyc-group-${group.title}`,
        title: group.sourceTitle || group.title,
        description: group.description || "",
        fields: group.fields,
      }));
    const savedPageTitles = kycToEdit.groups.reduce(
      (titles, group) => ({
        ...titles,
        [group.sourceKey || group.sourceTitle || group.title]: group.title,
      }),
      {}
    );
    const savedPageDescriptions = kycToEdit.groups.reduce(
      (descriptions, group) => ({
        ...descriptions,
        [group.sourceKey || group.sourceTitle || group.title]: group.description || "",
      }),
      {}
    );
    const savedFieldOrderByGroup = kycToEdit.groups.reduce(
      (orders, group) => ({
        ...orders,
        [group.sourceKey || group.sourceTitle || group.title]: group.fields.map((field) => field.id),
      }),
      {}
    );

    setEditingKycId(editId);
    setKycName(kycToEdit.name || "");
    setKycDescription(kycToEdit.description || "");
    setSelectedGroups(kycToEdit.groups.map((group) => group.sourceKey || group.sourceTitle || group.title));
    setSelectedFieldIds(kycToEdit.groups.flatMap((group) => group.fields.map((field) => field.id)));
    setCustomFields([]);
    setCustomFieldGroups(savedCustomFieldGroups);
    setGroupCustomFields(savedGroupCustomFields);
    setEditedFields(savedEditedFields);
    setPageTitles(savedPageTitles);
    setPageDescriptions(savedPageDescriptions);
    setFieldOrderByGroup(savedFieldOrderByGroup);
    setShowKycNameError(false);
  }, []);

  const applyFieldEdits = (field) => ({ ...field, ...(editedFields[field.id] || {}) });
  const getPageTitle = (group) => pageTitles[getGroupKey(group)]?.trim() || group.title;
  const getPageDescription = (group) =>
    pageDescriptions[getGroupKey(group)] !== undefined
      ? pageDescriptions[getGroupKey(group)]
      : group.description ?? defaultPageDescription;
  const orderFieldsForGroup = (groupKey, fields) => {
    const explicitOrder = fieldOrderByGroup[groupKey];
    if (!explicitOrder?.length) return fields;

    const fieldMap = new Map(fields.map((field) => [field.id, field]));
    const orderedFields = explicitOrder.map((fieldId) => fieldMap.get(fieldId)).filter(Boolean);
    const remainingFields = fields.filter((field) => !explicitOrder.includes(field.id));
    return [...orderedFields, ...remainingFields];
  };

  const availableGroupsWithCustomFields = [
    ...availableFieldGroups.map((group) => ({
      ...group,
      groupKey: getGroupKey(group),
      fields: orderFieldsForGroup(
        getGroupKey(group),
        [...group.fields, ...(groupCustomFields[group.title] || []).map(normalizeCustomField)].map(applyFieldEdits)
      ),
    })),
    ...comingSoonFieldGroups.map((group) => ({
      ...group,
      groupKey: getGroupKey(group),
      fields: orderFieldsForGroup(getGroupKey(group), group.fields.map(applyFieldEdits)),
    })),
    ...customFieldGroups.map((group) => ({
      ...group,
      groupKey: getGroupKey(group),
      fields: orderFieldsForGroup(
        getGroupKey(group),
        [...group.fields, ...(groupCustomFields[group.title] || [])].map(normalizeCustomField).map(applyFieldEdits)
      ),
    })),
  ];

  const selectedGroupDetails = selectedGroups
    .map((groupKey) => availableGroupsWithCustomFields.find((group) => group.groupKey === groupKey))
    .filter(Boolean)
    .map((group) => ({
      ...group,
      displayTitle: getPageTitle(group),
      displayDescription: getPageDescription(group),
    }));
  const currentConfigGroup =
    selectedGroupDetails[Math.min(currentConfigGroupIndex, Math.max(selectedGroupDetails.length - 1, 0))];
  const currentPreviewFields =
    currentConfigGroup?.fields.filter((field) => selectedFieldIds.includes(field.id)) || [];

  const visibleAvailableGroups = availableGroupsWithCustomFields.filter((group) => {
    const searchValue = availableFieldSearch.trim().toLowerCase();
    if (!searchValue) return true;
    return (
      getPageTitle(group).toLowerCase().includes(searchValue) ||
      group.fields.some((field) => `${field.label} ${field.type}`.toLowerCase().includes(searchValue))
    );
  });

  const addGroup = (groupKey) => {
    const group = availableGroupsWithCustomFields.find((item) => item.groupKey === groupKey);
    if (!group || group.comingSoon || selectedGroups.includes(group.groupKey)) return;
    setSelectedGroups((current) => [...current, group.groupKey]);
  };

  const removeGroup = (groupKey) => {
    const group = availableGroupsWithCustomFields.find((item) => item.groupKey === groupKey);
    setSelectedGroups((current) => current.filter((selectedGroupKey) => selectedGroupKey !== groupKey));
    if (group) {
      setSelectedFieldIds((current) => current.filter((fieldId) => !group.fields.some((field) => field.id === fieldId)));
    }
    setCurrentConfigGroupIndex((current) => Math.max(0, Math.min(current, selectedGroups.length - 2)));
  };

  const handleDragStart = (event, groupKey) => {
    event.dataTransfer.setData("text/plain", groupKey);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const selectedGroupKey = event.dataTransfer.getData("application/x-kyc-selected-group");

    if (selectedGroupKey) {
      moveSelectedGroup(selectedGroupKey);
      setDraggedSelectedGroupTitle(null);
      return;
    }

    addGroup(event.dataTransfer.getData("text/plain"));
  };

  const handleAvailableDrop = (event) => {
    event.preventDefault();
    setIsRemovingDragOver(false);

    const selectedGroupKey = event.dataTransfer.getData("application/x-kyc-selected-group");
    if (!selectedGroupKey) return;

    removeGroup(selectedGroupKey);
    setDraggedSelectedGroupTitle(null);
  };

  const moveSelectedGroup = (groupKey, beforeGroupKey = null) => {
    const activeGroupKey = currentConfigGroup?.groupKey;

    setSelectedGroups((current) => {
      const currentIndex = current.findIndex((selectedGroupKey) => selectedGroupKey === groupKey);
      if (currentIndex === -1 || groupKey === beforeGroupKey) return current;

      const next = [...current];
      const [movedGroupKey] = next.splice(currentIndex, 1);

      if (!beforeGroupKey) return [...next, movedGroupKey];

      const targetIndex = next.findIndex((selectedGroupKey) => selectedGroupKey === beforeGroupKey);
      if (targetIndex === -1) return current;

      next.splice(targetIndex, 0, movedGroupKey);
      if (activeGroupKey) {
        setCurrentConfigGroupIndex(Math.max(0, next.findIndex((selectedGroupKey) => selectedGroupKey === activeGroupKey)));
      }
      return next;
    });
  };

  const handleSelectedDragStart = (event, groupKey) => {
    event.dataTransfer.setData("application/x-kyc-selected-group", groupKey);
    event.dataTransfer.effectAllowed = "move";
    setDraggedSelectedGroupTitle(groupKey);
  };

  const startConfiguration = () => {
    if (!kycName.trim()) {
      setShowKycNameError(true);
      return;
    }

    const nextFieldIds = selectedGroupDetails.flatMap((group) => group.fields.map((field) => field.id));
    setSelectedFieldIds((current) => {
      const stillAvailable = current.filter((fieldId) => nextFieldIds.includes(fieldId));
      const newFieldIds = nextFieldIds.filter((fieldId) => !stillAvailable.includes(fieldId));
      return [...stillAvailable, ...newFieldIds];
    });
    setCurrentConfigGroupIndex(0);
    setActiveStep("configure");
  };

  const toggleField = (fieldId) => {
    setSelectedFieldIds((current) =>
      current.includes(fieldId) ? current.filter((id) => id !== fieldId) : [...current, fieldId]
    );
  };

  const selectAllFieldsForGroup = (group) => {
    if (!group) return;

    setSelectedFieldIds((current) => [
      ...current,
      ...group.fields.map((field) => field.id).filter((fieldId) => !current.includes(fieldId)),
    ]);
  };

  const unselectAllFieldsForGroup = (group) => {
    if (!group) return;

    const groupFieldIds = new Set(group.fields.map((field) => field.id));
    setSelectedFieldIds((current) => current.filter((fieldId) => !groupFieldIds.has(fieldId)));
  };

  const confirmAndRemoveGroup = (group) => {
    if (!group) return;

    const shouldDelete = window.confirm(`Are you sure you want to delete the page "${group.displayTitle}"?`);
    if (!shouldDelete) return;

    removeGroup(group.groupKey);
  };

  const moveFieldWithinGroup = (group, fieldId, beforeFieldId = null) => {
    if (!group) return;

    const currentFieldIds = group.fields.map((field) => field.id);
    setFieldOrderByGroup((current) => {
      const activeOrder = current[group.groupKey]?.length
        ? [...current[group.groupKey]].filter((id) => currentFieldIds.includes(id))
        : [...currentFieldIds];
      const missingIds = currentFieldIds.filter((id) => !activeOrder.includes(id));
      const nextOrderBase = [...activeOrder, ...missingIds];
      const currentIndex = nextOrderBase.findIndex((id) => id === fieldId);

      if (currentIndex === -1 || fieldId === beforeFieldId) return current;

      const nextOrder = [...nextOrderBase];
      const [movedFieldId] = nextOrder.splice(currentIndex, 1);

      if (!beforeFieldId) {
        nextOrder.push(movedFieldId);
      } else {
        const targetIndex = nextOrder.findIndex((id) => id === beforeFieldId);
        if (targetIndex === -1) return current;
        nextOrder.splice(targetIndex, 0, movedFieldId);
      }

      return {
        ...current,
        [group.groupKey]: nextOrder,
      };
    });
  };

  const handleFieldDragStart = (event, group, fieldId) => {
    if (!group) return;
    event.dataTransfer.setData("application/x-kyc-field-id", fieldId);
    event.dataTransfer.setData("application/x-kyc-field-group", group.groupKey);
    event.dataTransfer.effectAllowed = "move";
    setDraggedFieldId(fieldId);
  };

  const saveCustomFieldGroup = (fields, pageTitle, pageDescription) => {
    const nextPageTitle = pageTitle.trim();
    const nextFields = fields.map(normalizeCustomField);
    const nextGroupId = `custom-kyc-page-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setCustomFieldGroups((current) => [
      ...current,
      {
        id: nextGroupId,
        title: nextPageTitle,
        description: pageDescription.trim(),
        fields: nextFields,
      },
    ]);
    setPageTitles((current) => ({
      ...current,
      [nextGroupId]: nextPageTitle,
    }));
    setPageDescriptions((current) => ({
      ...current,
      [nextGroupId]: pageDescription.trim(),
    }));
    setFieldOrderByGroup((current) => ({
      ...current,
      [nextGroupId]: nextFields.map((field) => field.id),
    }));
    if (shouldSelectNewCustomPage) {
      setSelectedGroups((current) => {
        const next = [...current, nextGroupId];
        setCurrentConfigGroupIndex(next.length - 1);
        return next;
      });
    }
    setIsCustomFieldModalOpen(false);
    setCustomFieldTargetGroupTitle(null);
    setShouldSelectNewCustomPage(false);
  };

  const saveFieldsToGroup = (fields, groupTitle) => {
    const nextFields = fields.map(normalizeCustomField);

    setGroupCustomFields((current) => ({
      ...current,
      [groupTitle]: [...(current[groupTitle] || []), ...nextFields],
    }));
    setFieldOrderByGroup((current) => ({
      ...current,
      [groupTitle]: [...(current[groupTitle] || []), ...nextFields.map((field) => field.id)],
    }));

    setSelectedFieldIds((current) => [
      ...current,
      ...nextFields.map((field) => field.id).filter((fieldId) => !current.includes(fieldId)),
    ]);
    setIsCustomFieldModalOpen(false);
    setCustomFieldTargetGroupTitle(null);
  };

  const saveEditedField = (field) => {
    const nextField = normalizeCustomField(field);

    setEditedFields((current) => ({
      ...current,
      [nextField.id]: nextField,
    }));
    setIsCustomFieldModalOpen(false);
    setCustomFieldTargetGroupTitle(null);
    setFieldBeingEdited(null);
    setShouldSelectNewCustomPage(false);
  };

  const goToPreviousStep = () => {
    if (activeStep !== "configure") return;
    if (currentConfigGroupIndex > 0) {
      setCurrentConfigGroupIndex((current) => current - 1);
      return;
    }
    setActiveStep("groups");
  };

  const goToNextStep = () => {
    if (activeStep === "groups") {
      startConfiguration();
      return;
    }

    if (currentConfigGroupIndex < selectedGroupDetails.length - 1) {
      setCurrentConfigGroupIndex((current) => current + 1);
      return;
    }

    saveCreatedKyc();
  };

  const saveCreatedKyc = () => {
    const now = new Date().toISOString();
    const existingKycs = JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]");
    const existingKyc = existingKycs.find((kyc) => kyc.id === editingKycId);
    const kyc = {
      id: editingKycId || `kyc-${Date.now()}`,
      name: kycName.trim() || "Untitled KYC",
      description: kycDescription.trim(),
      createdAt: existingKyc?.createdAt || now,
      updatedAt: now,
      isDraft: false,
      groups: selectedGroupDetails.map((group) => ({
        title: group.displayTitle,
        sourceKey: group.groupKey,
        sourceTitle: group.title,
        description: group.displayDescription || "",
        fields: group.fields.filter((field) => selectedFieldIds.includes(field.id)),
      })),
    };

    const nextKycs = editingKycId
      ? existingKycs.map((savedKycItem) => (savedKycItem.id === editingKycId ? kyc : savedKycItem))
      : [kyc, ...existingKycs];

    window.localStorage.setItem(savedKycStorageKey, JSON.stringify(nextKycs));
    setSavedKyc(kyc);
    setActiveStep("complete");
  };

  const saveDraftAndExit = () => {
    const now = new Date().toISOString();
    const existingKycs = JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]");
    const existingKyc = existingKycs.find((kyc) => kyc.id === editingKycId);
    const kyc = {
      id: editingKycId || `kyc-${Date.now()}`,
      name: kycName.trim() || "Untitled KYC",
      description: kycDescription.trim(),
      createdAt: existingKyc?.createdAt || now,
      updatedAt: now,
      isDraft: true,
      groups: selectedGroupDetails.map((group) => ({
        title: group.displayTitle,
        sourceKey: group.groupKey,
        sourceTitle: group.title,
        description: group.displayDescription || "",
        fields: group.fields.filter((field) => selectedFieldIds.includes(field.id)),
      })),
      draftState: {
        activeStep,
        selectedGroups,
        selectedFieldIds,
        customFields,
        customFieldGroups,
        groupCustomFields,
        editedFields,
        pageTitles,
        pageDescriptions,
        fieldOrderByGroup,
        currentConfigGroupIndex,
      },
    };
    const nextKycs = editingKycId
      ? existingKycs.map((savedKycItem) => (savedKycItem.id === editingKycId ? kyc : savedKycItem))
      : [kyc, ...existingKycs];

    window.localStorage.setItem(savedKycStorageKey, JSON.stringify(nextKycs));
    router.push(myKycPath);
  };

  const cancelAndDeleteKyc = () => {
    if (editingKycId) {
      const existingKycs = JSON.parse(window.localStorage.getItem(savedKycStorageKey) || "[]");
      window.localStorage.setItem(
        savedKycStorageKey,
        JSON.stringify(existingKycs.filter((kyc) => kyc.id !== editingKycId))
      );
    }
    router.push(myKycPath);
  };

  const createAnotherKyc = () => {
    setKycName("");
    setKycDescription("");
    setSelectedGroups([]);
    setSelectedFieldIds([]);
    setCustomFields([]);
    setCustomFieldGroups([]);
    setGroupCustomFields({});
    setEditedFields({});
    setPageTitles({});
    setPageDescriptions({});
    setFieldOrderByGroup({});
    setShouldSelectNewCustomPage(false);
    setDraggedFieldId(null);
    setCurrentConfigGroupIndex(0);
    setSavedKyc(null);
    setEditingKycId(null);
    setActiveStep("groups");
  };

  return (
    <div className="flex min-h-[calc(100vh-63px)] flex-col overflow-hidden">
      {activeStep === "complete" ? (
        <KYCCompleteScreen savedKyc={savedKyc} onCreateAnother={createAnotherKyc} isEditing={Boolean(editingKycId)} myKycPath={myKycPath} />
      ) : activeStep === "groups" ? (
        <>
          <div className="grid grid-cols-1 gap-3 px-4 pb-3 pt-3 sm:px-6 lg:grid-cols-2 lg:px-8 min-[1800px]:gap-6 min-[1800px]:pb-6 min-[1800px]:pt-5">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--brand-text)] min-[1800px]:gap-3 min-[1800px]:text-lg">
              KYC name
              <input
                type="text"
                value={kycName}
                onChange={(event) => {
                  setKycName(event.target.value);
                  if (event.target.value.trim()) setShowKycNameError(false);
                }}
                placeholder="Enter KYC name"
                className={`h-11 rounded-md border-2 bg-[var(--brand-navbar)] px-3 text-sm font-normal text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)] min-[1800px]:h-[64px] min-[1800px]:px-5 min-[1800px]:text-xl ${
                  showKycNameError ? "border-[#d11f3f]" : "border-[var(--brand-border)]"
                }`}
              />
              {!kycName.trim() && (
                <span className="text-sm font-semibold text-[#d11f3f]">KYC name is required.</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--brand-text)] min-[1800px]:gap-3 min-[1800px]:text-lg">
              Description
              <input
                type="text"
                value={kycDescription}
                onChange={(event) => setKycDescription(event.target.value)}
                placeholder="Add a short description"
                className="h-11 rounded-md border-2 border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 text-sm font-normal text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)] min-[1800px]:h-[64px] min-[1800px]:px-5 min-[1800px]:text-xl"
              />
            </label>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pb-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] lg:px-8 min-[1800px]:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] min-[1800px]:gap-5 min-[1800px]:pb-6">
            <section
              onDragOver={(event) => {
                if (!event.dataTransfer.types.includes("application/x-kyc-selected-group")) return;
                event.preventDefault();
                setIsRemovingDragOver(true);
              }}
              onDragLeave={() => setIsRemovingDragOver(false)}
              onDrop={handleAvailableDrop}
              className={`flex min-h-0 max-w-full flex-col overflow-hidden transition-colors lg:max-w-[1080px] ${
                isRemovingDragOver ? "rounded-md bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)]/40" : ""
              }`}
            >
          <div className="shrink-0 pb-2 pr-2 min-[1800px]:pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--brand-text)] min-[1800px]:text-2xl">Available pages</h2>

              <div className="flex min-w-0 items-center gap-2 min-[1800px]:gap-3">
                <label className="flex h-9 w-[160px] min-w-0 items-center gap-2 rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-2 text-[var(--brand-text-secondary)] transition-colors focus-within:border-[var(--brand-primary)] min-[1800px]:h-11 min-[1800px]:w-[220px] min-[1800px]:px-3">
                  <Search className="h-4 w-4 shrink-0" />
                  <input
                    type="search"
                    value={availableFieldSearch}
                    onChange={(event) => setAvailableFieldSearch(event.target.value)}
                    placeholder="Search"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-normal text-[var(--brand-text)] outline-none placeholder:text-[var(--brand-text-secondary)] min-[1800px]:text-base"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCustomFieldTargetGroupTitle(null);
                    setIsCustomFieldModalOpen(true);
                  }}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-95 min-[1800px]:h-11 min-[1800px]:gap-2 min-[1800px]:px-5 min-[1800px]:text-base"
                >
                  <Plus className="h-4 w-4 min-[1800px]:h-5 min-[1800px]:w-5" />
                  Create
                </button>
              </div>
            </div>
          </div>
          <div className="min-h-0 w-full max-w-full flex-1 space-y-2 overflow-y-auto pr-2 min-[1800px]:space-y-3">
            {visibleAvailableGroups.map((group) => {
              const isSelected = selectedGroups.includes(group.groupKey);
              const isComingSoon = Boolean(group.comingSoon);
              const GroupIcon = groupIcons[group.title] || FileBadge2;

              return (
                <div
                  key={group.groupKey}
                  draggable={!isSelected && !isComingSoon}
                  onDragStart={(event) => handleDragStart(event, group.groupKey)}
                  title={isComingSoon ? "Coming Soon" : undefined}
                  className={`group relative flex min-h-[72px] w-full max-w-full items-center gap-2 rounded-md border px-3 py-2 shadow-sm transition-colors min-[1800px]:min-h-[104px] min-[1800px]:gap-4 min-[1800px]:px-5 min-[1800px]:py-4 ${
                    isSelected || isComingSoon
                      ? "cursor-not-allowed border-[var(--brand-border)] opacity-45"
                      : "cursor-grab border-[var(--brand-border)] hover:border-[var(--brand-primary)] active:cursor-grabbing"
                  } ${isComingSoon ? "bg-[#eef1f5] grayscale" : "bg-[var(--brand-navbar)]"}`}
                >
                  <GripVertical className="h-5 w-5 shrink-0 text-[var(--brand-text-secondary)] min-[1800px]:h-7 min-[1800px]:w-7" />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] min-[1800px]:h-9 min-[1800px]:w-9">
                        <GroupIcon className="h-4.5 w-4.5" />
                      </span>
                      <div className="truncate text-base font-semibold text-[var(--brand-text)] min-[1800px]:text-xl">{getPageTitle(group)}</div>
                      {isComingSoon && (
                        <span className="shrink-0 rounded-full bg-[#d7dde6] px-2.5 py-1 text-xs font-bold text-[#64748b]">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-[var(--brand-text-secondary)] min-[1800px]:mt-1 min-[1800px]:text-lg">
                      {group.fields.length} fields
                    </div>
                    <div className="mt-1 truncate text-xs text-[var(--brand-text-secondary)] min-[1800px]:mt-2 min-[1800px]:text-sm">
                      {group.fields.slice(0, 3).map((field) => field.label).join(", ")}
                      {group.fields.length > 3 ? "..." : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    draggable={false}
                    onClick={() => addGroup(group.groupKey)}
                    onMouseDown={(event) => event.stopPropagation()}
                    disabled={isSelected || isComingSoon}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] transition-colors hover:border-[var(--brand-primary)] hover:bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[var(--brand-border)] disabled:hover:bg-transparent min-[1800px]:h-11 min-[1800px]:w-11"
                    aria-label={isComingSoon ? `${getPageTitle(group)} coming soon` : `Add ${getPageTitle(group)}`}
                    title={isComingSoon ? "Coming Soon" : `Add ${getPageTitle(group)}`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  {isComingSoon && (
                    <span className="pointer-events-none absolute right-4 top-3 hidden rounded-md bg-[#111827] px-2.5 py-1 text-xs font-bold text-white shadow-lg group-hover:inline-flex">
                      Coming Soon
                    </span>
                  )}
                </div>
              );
            })}
            {visibleAvailableGroups.length === 0 && (
              <div className="flex min-h-[180px] items-center justify-center rounded-md border border-dashed border-[var(--brand-border)] bg-[var(--brand-navbar)] px-6 text-center text-lg font-medium text-[var(--brand-text-secondary)]">
                No pages found
              </div>
            )}
          </div>
        </section>

        <div className="relative hidden lg:flex min-h-0 items-center justify-center">
          <div className="pointer-events-none flex h-10 w-10 items-center justify-center text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] animate-[kycArrowJump_1.35s_ease-in-out_infinite] min-[1800px]:h-20 min-[1800px]:w-20">
            <ArrowRight className="h-7 w-7 min-[1800px]:h-12 min-[1800px]:w-12" />
          </div>
        </div>

        <section className="flex min-h-0 w-full max-w-full flex-col overflow-hidden">
          <div className="shrink-0 border-b border-[var(--brand-border)]">
            <div className="inline-flex h-10 items-center border-b-2 border-[var(--brand-primary)] px-1 text-lg font-bold text-[var(--brand-text)] min-[1800px]:h-14 min-[1800px]:text-2xl">
              Your Selected Pages
            </div>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`mt-2 flex min-h-0 flex-1 flex-col rounded-md border-2 border-dashed border-[#8F40D4] bg-[#8F40D4]/[0.04] p-3 shadow-[inset_0_0_0_2px_rgba(143,64,212,0.28)] transition-colors min-[1800px]:mt-5 min-[1800px]:border-4 min-[1800px]:p-5 min-[1800px]:shadow-[inset_0_0_0_3px_rgba(143,64,212,0.28)] ${
              isDraggingOver
                ? "bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)]"
                : ""
            }`}
          >
            {selectedGroups.length === 0 ? (
              <div className="flex min-h-[160px] flex-1 items-center justify-center text-center text-base font-medium text-[var(--brand-text-secondary)] min-[1800px]:min-h-[280px] min-[1800px]:text-xl">
                Drop pages here
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-2 min-[1800px]:space-y-4">
                {selectedGroupDetails.map((group, index) => (
                  <div
                    key={group.groupKey}
                    draggable
                    onDragStart={(event) => handleSelectedDragStart(event, group.groupKey)}
                    onDragEnd={() => setDraggedSelectedGroupTitle(null)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = event.dataTransfer.types.includes(
                        "application/x-kyc-selected-group"
                      )
                        ? "move"
                        : "copy";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const movedGroupKey = event.dataTransfer.getData("application/x-kyc-selected-group");
                      if (movedGroupKey) {
                        moveSelectedGroup(movedGroupKey, group.groupKey);
                      } else {
                        addGroup(event.dataTransfer.getData("text/plain"));
                      }
                      setDraggedSelectedGroupTitle(null);
                    }}
                    className={`flex h-14 cursor-grab items-center gap-2 rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 shadow-sm transition-opacity active:cursor-grabbing min-[1800px]:h-[76px] min-[1800px]:gap-4 min-[1800px]:px-5 ${
                      draggedSelectedGroupTitle === group.groupKey ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-[var(--brand-text-secondary)] min-[1800px]:h-6 min-[1800px]:w-6" />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-sm font-bold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] min-[1800px]:h-10 min-[1800px]:w-10 min-[1800px]:text-base">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold text-[var(--brand-text)] min-[1800px]:text-lg">{group.displayTitle}</div>
                      <div className="truncate text-xs text-[var(--brand-text-secondary)] min-[1800px]:text-base">
                        {group.fields.length} fields
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGroup(group.groupKey)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[#d11f3f] transition-colors hover:bg-[#fff1f3] min-[1800px]:h-12 min-[1800px]:w-12"
                      aria-label={`Remove ${group.displayTitle}`}
                    >
                      <Trash2 className="h-4 w-4 min-[1800px]:h-6 min-[1800px]:w-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
          </div>
        </>
      ) : (
        <KYCFieldConfigurationPage
          selectedGroups={selectedGroupDetails}
          currentGroup={currentConfigGroup}
          currentGroupIndex={currentConfigGroupIndex}
          selectedFieldIds={selectedFieldIds}
          selectedPreviewFields={currentPreviewFields}
          onToggleField={toggleField}
          onSelectAllFields={() => selectAllFieldsForGroup(currentConfigGroup)}
          onUnselectAllFields={() => unselectAllFieldsForGroup(currentConfigGroup)}
          onDeletePage={() => confirmAndRemoveGroup(currentConfigGroup)}
          onReorderField={(fieldId, beforeFieldId) => moveFieldWithinGroup(currentConfigGroup, fieldId, beforeFieldId)}
          onFieldDragStart={(event, fieldId) => handleFieldDragStart(event, currentConfigGroup, fieldId)}
          draggedFieldId={draggedFieldId}
          onFieldDragEnd={() => setDraggedFieldId(null)}
          onSelectGroupStep={setCurrentConfigGroupIndex}
          onReorderGroup={moveSelectedGroup}
          onProgressDragStart={handleSelectedDragStart}
          onAddCustomPage={() => {
            setFieldBeingEdited(null);
            setCustomFieldTargetGroupTitle(null);
            setShouldSelectNewCustomPage(true);
            setIsCustomFieldModalOpen(true);
          }}
          onPageTitleChange={(value) =>
            currentConfigGroup &&
            setPageTitles((current) => ({
              ...current,
              [currentConfigGroup.groupKey]: value,
            }))
          }
          onPageDescriptionChange={(value) =>
            currentConfigGroup &&
            setPageDescriptions((current) => ({
              ...current,
              [currentConfigGroup.groupKey]: value,
            }))
          }
          onCreateField={() => {
            setCustomFieldTargetGroupTitle(currentConfigGroup.title);
            setFieldBeingEdited(null);
            setIsCustomFieldModalOpen(true);
          }}
          onEditField={(field) => {
            setCustomFieldTargetGroupTitle(currentConfigGroup.title);
            setFieldBeingEdited(field);
            setIsCustomFieldModalOpen(true);
          }}
        />
      )}

      {activeStep !== "complete" && (
        <footer className="flex h-16 shrink-0 items-center justify-between border-t border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 sm:px-6 lg:px-8 min-[1800px]:h-24">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--brand-border)] bg-transparent px-4 text-sm font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)] sm:px-5 sm:text-base min-[1800px]:h-14 min-[1800px]:px-8 min-[1800px]:text-xl"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPreviousStep}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--brand-border)] bg-transparent px-4 text-sm font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)] sm:px-5 sm:text-base min-[1800px]:h-14 min-[1800px]:gap-3 min-[1800px]:px-8 min-[1800px]:text-xl"
            >
              <ArrowLeft className="h-4 w-4 min-[1800px]:h-6 min-[1800px]:w-6" />
              Prev
            </button>

            <button
              type="button"
              onClick={goToNextStep}
              disabled={activeStep === "groups" && selectedGroups.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 sm:px-6 sm:text-base min-[1800px]:h-14 min-[1800px]:gap-3 min-[1800px]:px-9 min-[1800px]:text-xl"
            >
              {activeStep === "groups"
                ? "Start"
                : currentConfigGroupIndex < selectedGroupDetails.length - 1
                  ? "Next"
                  : "Finish"}
              <ArrowRight className="h-4 w-4 min-[1800px]:h-6 min-[1800px]:w-6" />
            </button>
          </div>
        </footer>
      )}

      {isCustomFieldModalOpen && (
        <CustomFieldModal
          mode={fieldBeingEdited ? "edit" : customFieldTargetGroupTitle ? "fields" : "group"}
          initialFields={fieldBeingEdited ? [fieldBeingEdited] : []}
          onClose={() => {
            setIsCustomFieldModalOpen(false);
            setCustomFieldTargetGroupTitle(null);
            setFieldBeingEdited(null);
            setShouldSelectNewCustomPage(false);
          }}
          onSave={(fields, pageTitle, pageDescription) =>
            fieldBeingEdited
              ? saveEditedField(fields[0])
              : customFieldTargetGroupTitle
              ? saveFieldsToGroup(fields, customFieldTargetGroupTitle)
              : saveCustomFieldGroup(fields, pageTitle, pageDescription)
          }
          key={fieldBeingEdited?.id || customFieldTargetGroupTitle || "global-custom-fields"}
        />
      )}

      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="cancel-kyc-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="cancel-kyc-title" className="text-2xl font-bold text-[var(--brand-text)]">Cancel KYC creation?</h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--brand-text-secondary)]">Choose whether to discard this KYC or keep your progress as a draft.</p>
              </div>
              <button type="button" onClick={() => setIsCancelModalOpen(false)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[var(--brand-text-secondary)] transition-colors hover:bg-[var(--brand-background)]" aria-label="Close cancel confirmation">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={cancelAndDeleteKyc} className="inline-flex h-11 items-center justify-center rounded-md border border-[#d11f3f] px-5 text-base font-semibold text-[#d11f3f] transition-colors hover:bg-[#fff1f3]">Cancel and delete KYC</button>
              <button type="button" onClick={saveDraftAndExit} className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-5 text-base font-semibold text-white shadow-sm transition-colors hover:brightness-95">Cancel and save as draft</button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        @keyframes kycArrowJump {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}

function KYCCompleteScreen({ savedKyc, onCreateAnother, isEditing, myKycPath }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-8 py-10">
      <section className="w-full max-w-2xl rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ecfdf5] text-[#047857]">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-3xl font-bold text-[var(--brand-text)]">
          {isEditing ? "KYC updated" : "KYC saved"}
        </h2>
        <p className="mt-3 text-lg text-[var(--brand-text-secondary)]">
          {savedKyc?.name || "Your KYC"} has been {isEditing ? "updated" : "created and added to My KYC"}.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={myKycPath}
            className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-7 text-lg font-semibold text-white shadow-sm transition-colors hover:brightness-95"
          >
            View My KYC
          </Link>
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex h-12 items-center justify-center rounded-md border border-[var(--brand-border)] bg-transparent px-7 text-lg font-semibold text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-background)]"
          >
            Create another
          </button>
        </div>
      </section>
    </div>
  );
}

function KYCFieldConfigurationPage({
  selectedGroups,
  currentGroup,
  currentGroupIndex,
  selectedFieldIds,
  selectedPreviewFields,
  onToggleField,
  onSelectAllFields,
  onUnselectAllFields,
  onDeletePage,
  onReorderField,
  onFieldDragStart,
  draggedFieldId,
  onFieldDragEnd,
  onSelectGroupStep,
  onReorderGroup,
  onProgressDragStart,
  onAddCustomPage,
  onPageTitleChange,
  onPageDescriptionChange,
  onCreateField,
  onEditField,
}) {
  const [fieldDropIndicator, setFieldDropIndicator] = useState(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-2 pt-2 sm:px-4 lg:px-6 min-[1800px]:px-8 min-[1800px]:pb-6 min-[1800px]:pt-5">
      <KYCGroupProgress
        groups={selectedGroups}
        currentGroupIndex={currentGroupIndex}
        onSelectGroupStep={onSelectGroupStep}
        onReorderGroup={onReorderGroup}
        onDragStartGroup={onProgressDragStart}
        onAddCustomPage={onAddCustomPage}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)] min-[1800px]:gap-8 min-[1800px]:grid-cols-[minmax(300px,0.76fr)_minmax(560px,1.24fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-2 pb-2 min-[1800px]:gap-4 min-[1800px]:pb-5">
            <div className="flex min-w-0 flex-1 items-center gap-2 min-[1800px]:gap-3">
              <input
                type="text"
                value={currentGroup?.displayTitle || ""}
                onChange={(event) => onPageTitleChange(event.target.value)}
                placeholder="Enter page name"
                disabled={!currentGroup}
                className="h-10 min-w-0 flex-1 rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 text-lg font-bold text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-45 min-[1800px]:h-12 min-[1800px]:px-4 min-[1800px]:text-2xl"
              />
              <button
                type="button"
                onClick={onDeletePage}
                disabled={!currentGroup}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] bg-white text-[#d11f3f] transition-colors hover:border-[#d11f3f] hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-45 min-[1800px]:h-11 min-[1800px]:w-11"
                aria-label={`Delete ${currentGroup?.displayTitle || "page"}`}
                title="Delete page"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onCreateField}
              disabled={!currentGroup}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 min-[1800px]:h-11 min-[1800px]:px-5 min-[1800px]:text-base"
            >
              <Plus className="h-5 w-5" />
              Create field
            </button>
          </div>

          <div className="shrink-0 pb-2 min-[1800px]:pb-5">
            <textarea
              value={currentGroup?.displayDescription || ""}
              onChange={(event) => onPageDescriptionChange(event.target.value)}
              placeholder="Add page description"
              disabled={!currentGroup}
              rows={2}
              className="min-h-[56px] w-full resize-none rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-2 text-sm text-[var(--brand-text)] outline-none transition-colors placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-45 min-[1800px]:min-h-[92px] min-[1800px]:px-4 min-[1800px]:py-3 min-[1800px]:text-base"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            {currentGroup && (
              <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-3 shadow-sm min-[1800px]:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-end gap-2 min-[1800px]:mb-4">
                  <button
                    type="button"
                    onClick={onSelectAllFields}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[#d11f3f] bg-[#fff1f3] px-3 text-sm font-semibold text-[#d11f3f] transition-colors hover:bg-[#ffe4e8]"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={onUnselectAllFields}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--brand-border)] bg-white px-3 text-sm font-semibold text-[var(--brand-text-secondary)] transition-colors hover:border-[#d11f3f] hover:text-[#d11f3f]"
                  >
                    Unselect all
                  </button>
                </div>

                <div className="space-y-2 min-[1800px]:space-y-3">
                  {currentGroup.fields.map((field) => {
                    const isIncluded = selectedFieldIds.includes(field.id);
                    const isDragged = draggedFieldId === field.id;
                    const indicatorPosition =
                      fieldDropIndicator?.fieldId === field.id ? fieldDropIndicator.position : null;

                    return (
                      <div
                        key={field.id}
                        className={`rounded-md border border-[var(--brand-border)] bg-white transition-all ${
                          isDragged ? "opacity-55" : "opacity-100"
                        } ${
                          indicatorPosition === "before"
                            ? "border-t-[3px] border-t-[#8F40D4]"
                            : indicatorPosition === "after"
                              ? "border-b-[3px] border-b-[#8F40D4]"
                              : ""
                        }`}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          const rect = event.currentTarget.getBoundingClientRect();
                          const position = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
                          setFieldDropIndicator({ fieldId: field.id, position });
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget)) {
                            setFieldDropIndicator((current) => (current?.fieldId === field.id ? null : current));
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const currentDraggedFieldId = event.dataTransfer.getData("application/x-kyc-field-id");
                          const draggedGroupKey = event.dataTransfer.getData("application/x-kyc-field-group");
                          if (currentDraggedFieldId && draggedGroupKey === currentGroup.groupKey) {
                            const fieldIndex = currentGroup.fields.findIndex((item) => item.id === field.id);
                            const nextFieldId =
                              fieldDropIndicator?.position === "after"
                                ? currentGroup.fields[fieldIndex + 1]?.id || null
                                : field.id;
                            onReorderField(currentDraggedFieldId, nextFieldId);
                          }
                          setFieldDropIndicator(null);
                        }}
                      >
                        <div
                          className="flex items-center gap-2 px-3 py-2 min-[1800px]:gap-4 min-[1800px]:px-4 min-[1800px]:py-3"
                        >
                          <div
                            draggable
                            onDragStart={(event) => onFieldDragStart(event, field.id)}
                            onDragEnd={() => {
                              onFieldDragEnd();
                              setFieldDropIndicator(null);
                            }}
                            className="flex shrink-0 cursor-grab items-center justify-center text-[var(--brand-text-secondary)] active:cursor-grabbing"
                            aria-label={`Reorder ${field.label}`}
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4 min-[1800px]:h-5 min-[1800px]:w-5" />
                          </div>
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => onToggleField(field.id)}
                            className="h-4 w-4 accent-[#d11f3f] min-[1800px]:h-5 min-[1800px]:w-5"
                            aria-label={`Include ${field.label}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-[var(--brand-text)] min-[1800px]:text-base">
                              {field.label}
                            </div>
                            <div className="truncate text-xs text-[var(--brand-text-secondary)] min-[1800px]:text-sm">{field.type}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onEditField(field)}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--brand-border)] text-[var(--brand-text-secondary)] transition-colors hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] min-[1800px]:h-10 min-[1800px]:w-10"
                            aria-label={`Edit ${field.label}`}
                            title="Edit field"
                          >
                            <Pencil className="h-4 w-4 min-[1800px]:h-5 min-[1800px]:w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <KYCFlowPreview group={currentGroup} selectedPreviewFields={selectedPreviewFields} />
      </div>
    </div>
  );
}

function KYCGroupProgress({
  groups,
  currentGroupIndex,
  onSelectGroupStep,
  onReorderGroup,
  onDragStartGroup,
  onAddCustomPage,
}) {
  const progressWidth =
    groups.length > 1 ? `${(currentGroupIndex / (groups.length - 1)) * 100}%` : "100%";

  return (
    <div className="mb-3 shrink-0 rounded-lg bg-[#f4f7fb] px-4 py-2 min-[1800px]:mb-6 min-[1800px]:px-6 min-[1800px]:py-4">
      <div className="relative">
        <div className="absolute left-3 right-3 top-[13px] h-1 rounded-full bg-[#cfd8ee] min-[1800px]:left-4 min-[1800px]:right-4 min-[1800px]:top-[18px]" />
        <div
          className="absolute left-3 top-[13px] h-1 rounded-full bg-[#2f67dc] transition-all min-[1800px]:left-4 min-[1800px]:top-[18px]"
          style={{ width: `calc((100% - 32px) * ${parseFloat(progressWidth) / 100})` }}
        />

        <div className="relative grid gap-3" style={{ gridTemplateColumns: `repeat(${groups.length + 1}, minmax(0, 1fr))` }}>
        {groups.map((group, index) => {
          const isActive = index === currentGroupIndex;
          const isComplete = index < currentGroupIndex;

          return (
            <button
              key={group.groupKey}
              type="button"
              draggable
              onDragStart={(event) => onDragStartGroup(event, group.groupKey)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDrop={(event) => {
                event.preventDefault();
                const movedGroupKey = event.dataTransfer.getData("application/x-kyc-selected-group");
                if (movedGroupKey) onReorderGroup(movedGroupKey, group.groupKey);
              }}
              onClick={() => onSelectGroupStep(index)}
              className="group min-w-0 cursor-grab text-left active:cursor-grabbing"
            >
              <div className="relative mb-1 flex h-8 items-center min-[1800px]:mb-2 min-[1800px]:h-10">
                <span
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm transition-colors min-[1800px]:h-8 min-[1800px]:w-8 ${
                    isActive || isComplete
                      ? "border-[#2f67dc] text-[#2f67dc]"
                      : "border-[#d8dde7] text-[#64748b] group-hover:border-[#2f67dc]"
                  }`}
                >
                  <SlidersHorizontal className="h-3 w-3 min-[1800px]:h-4 min-[1800px]:w-4" />
                </span>
                {isComplete && (
                  <span className="absolute left-5 top-0 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-[#35c78a] text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div
                className={`truncate text-xs min-[1800px]:text-sm ${
                  isActive ? "font-bold text-[#1f2a44]" : "font-medium text-[#344256]"
                }`}
              >
                {group.displayTitle || group.title}
              </div>
            </button>
          );
        })}
          <button
            type="button"
            onClick={onAddCustomPage}
            className="group min-w-0 text-left"
          >
            <div className="relative mb-1 flex h-8 items-center min-[1800px]:mb-2 min-[1800px]:h-10">
              <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[#8F40D4] bg-white text-[#8F40D4] shadow-sm transition-colors group-hover:bg-[#f4ebfc] min-[1800px]:h-8 min-[1800px]:w-8">
                <Plus className="h-3 w-3 min-[1800px]:h-4 min-[1800px]:w-4" />
              </span>
            </div>
            <div className="truncate text-xs font-medium text-[#344256] min-[1800px]:text-sm">Add page</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function KYCFlowPreview({ group, selectedPreviewFields }) {
  const [previewLanguage, setPreviewLanguage] = useState("en");
  const visibleFields = group?.fields.filter((field) =>
    selectedPreviewFields.some((selectedField) => selectedField.id === field.id)
  ) || [];
  const previewTitle = `${translatePreview(group?.displayTitle || group?.title || "KYC", previewLanguage)} ${translatePreview("Preview", previewLanguage)}`;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 min-[1800px]:mb-4 min-[1800px]:gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-base font-bold text-[#111827] sm:gap-3 sm:text-lg"><span className="h-4 w-1 rounded-full bg-[#111827] sm:h-5" />{previewTitle}</h2>
        <select value={previewLanguage} onChange={(event) => setPreviewLanguage(event.target.value)} aria-label="Preview language" className="h-8 max-w-[130px] rounded-md border border-[#e5e9f0] bg-white px-2 text-xs font-semibold text-[#475569] outline-none focus:border-[#8F40D4] sm:h-9 sm:max-w-none sm:px-3">
          {previewLanguages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-[16px] border border-[#c7d6f5] bg-[#e9effb] p-1.5 shadow-[inset_0_0_0_1px_rgba(143,64,212,0.08)] sm:rounded-[20px] sm:p-2.5">
        <div className="relative mx-auto min-h-full max-w-[960px] overflow-hidden rounded-[14px] bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="flex h-9 items-center gap-2 border-b border-[#d7dde7] bg-[#e7ebf2] px-3 min-[1800px]:h-11 min-[1800px]:gap-3 min-[1800px]:px-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            </div>
            <div className="flex h-7 min-w-0 flex-1 items-center rounded bg-white px-3 text-[11px] text-[#64748b]">
              https://verify.example.com/session/{(group?.displayTitle || group?.title || "kyc").toLowerCase().replaceAll(" ", "-")}
            </div>
          </div>

          <div className="relative px-3 py-3 sm:px-4 lg:px-5 min-[1800px]:px-8 min-[1800px]:py-6">
            <div className="mb-2 flex items-center justify-end gap-2 min-[1800px]:mb-5 min-[1800px]:gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-8 items-center rounded-md border border-[#e5e9f0] bg-white px-2 text-xs font-semibold text-[#64748b] min-[1800px]:h-9 min-[1800px]:px-3"
              >
                {translatePreview("Help", previewLanguage)}
              </span>
            </div>

            <div className="mx-auto max-w-[760px]">
              <div className="mb-3 text-center min-[1800px]:mb-6">
                <h3 className="text-xl font-bold leading-tight text-[#151b23] min-[1800px]:text-[26px]">
                  {translatePreview(group?.displayTitle || group?.title, previewLanguage)}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#64748b] min-[1800px]:mt-2 min-[1800px]:text-sm">
                  {translatePreview(group?.displayDescription || group?.description || defaultPageDescription, previewLanguage)}
                </p>
              </div>

              <div className="rounded-lg border border-[#e5e9f0] bg-white p-3 shadow-sm min-[1800px]:p-6">
                {selectedPreviewFields.length === 0 ? (
                  <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#c7ced9] bg-[#f8fafc] px-6 text-center text-base font-medium text-[#64748b]">
                    {translatePreview("Select fields on the left to build the customer view.", previewLanguage)}
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 min-[1800px]:gap-4">
                      {visibleFields.map((field) => (
                        <KYCPreviewField key={field.id} field={field} language={previewLanguage} />
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end border-t border-[#e5e9f0] pt-2 min-[1800px]:mt-6 min-[1800px]:pt-4">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-9 items-center rounded-md bg-[#6b7280] px-4 text-xs font-bold text-white shadow-sm min-[1800px]:h-11 min-[1800px]:px-6 min-[1800px]:text-sm"
                      >
                        {translatePreview("Continue", previewLanguage)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-8 inline-flex items-center gap-2 text-xs font-semibold text-[#64748b]">
            <span>{translatePreview("Powered by", previewLanguage)}</span>
            <img src="/NeuroLogo.svg" alt="Neuro logo" className="h-4 w-auto opacity-80" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function KYCPreviewField({ field, language }) {
  const translate = (value) => translatePreview(value, language);
  const visibleOptions = field.options?.filter((option) => option.value.trim()) || [];

  if (field.kind === "group") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-2 min-[1800px]:mb-3">
          <div className="text-xs font-semibold text-[#151b23] min-[1800px]:text-sm">{translate(field.label)}</div>
          {field.description && <p className="mt-1 text-xs text-[#64748b] min-[1800px]:text-sm">{translate(field.description)}</p>}
        </div>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 min-[1800px]:gap-4">
          {field.subfields.map((subfield) => (
            <label key={subfield.id} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#151b23] min-[1800px]:mb-2 min-[1800px]:text-sm">
                {translate(subfield.label || "Subfield")}
              </span>
              <div className="flex h-9 items-center rounded-md border border-[#d8dde7] bg-[#f8fafc] px-3 text-xs text-[#64748b] min-[1800px]:h-12 min-[1800px]:px-3.5 min-[1800px]:text-sm">
                {translate(subfield.placeholder || "Enter details")}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  const placeholderByType = {
    Date: "DD / MM / YYYY",
    Email: "name@example.com",
    Phone: "+46 70 000 00 00",
    Number: "0",
    Select: "Select an option",
    Verification: "Verification step",
    "File upload": "Upload file",
    "Text input": "Enter details",
  };
  const placeholder = field.placeholder || placeholderByType[field.type] || "Enter details";

  if (field.type === "Radio" || field.inputType === "radio") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-1 text-xs font-semibold text-[#151b23] min-[1800px]:mb-2 min-[1800px]:text-sm">{translate(field.label)}</div>
        <div className="grid grid-cols-2 gap-2">
          {(visibleOptions.length ? visibleOptions : [{ id: "preview-radio-1", value: "Option" }]).map((option) => (
            <div
              key={option.id}
              className="flex h-9 items-center gap-2 rounded-md border border-[#d8dde7] px-2 min-[1800px]:h-11 min-[1800px]:px-3"
            >
              <span className="h-4 w-4 rounded-full border-2 border-[#9aa4b2]" />
              <span className="text-xs text-[#151b23]/65 min-[1800px]:text-sm">{translate(option.value.trim() || "Option")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "Checkboxes" || field.inputType === "checkboxes") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-1 text-xs font-semibold text-[#151b23] min-[1800px]:mb-2 min-[1800px]:text-sm">{translate(field.label)}</div>
        <div className="grid grid-cols-2 gap-2">
          {(visibleOptions.length ? visibleOptions : [{ id: "preview-checkbox-1", value: "Option" }]).map(
            (option) => (
              <div
                key={option.id}
                className="flex h-9 items-center gap-2 rounded-md border border-[#d8dde7] px-2 min-[1800px]:h-11 min-[1800px]:px-3"
              >
                <span className="h-4 w-4 rounded border-2 border-[#9aa4b2]" />
                <span className="text-xs text-[#151b23]/65 min-[1800px]:text-sm">{translate(option.value.trim() || "Option")}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (field.type === "File upload" || field.type === "Verification") {
    return (
      <div className="xl:col-span-2">
        <div className="mb-1 text-xs font-semibold text-[#151b23] min-[1800px]:mb-2 min-[1800px]:text-sm">{translate(field.label)}</div>
        <div className="flex h-14 items-center justify-center rounded-lg border border-dashed border-[#b8c1cf] bg-[#f8fafc] text-xs font-semibold text-[#64748b] min-[1800px]:h-20 min-[1800px]:text-sm">
          {translate(placeholder)}
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#151b23] min-[1800px]:mb-2 min-[1800px]:text-sm">{translate(field.label)}</span>
      <div className="flex h-9 items-center rounded-md border border-[#d8dde7] bg-[#f8fafc] px-3 text-xs text-[#64748b] min-[1800px]:h-12 min-[1800px]:px-3.5 min-[1800px]:text-sm">
        {translate(placeholder)}
      </div>
    </label>
  );
}

function CustomFieldModal({ mode = "fields", initialFields, onClose, onSave }) {
  const [fields, setFields] = useState(() =>
    initialFields.length
      ? initialFields.map((field) => ({
          ...field,
          kind: field.kind || "field",
          description: field.description || "",
          hint: field.hint || "",
          placeholder: field.placeholder || "",
          required: Boolean(field.required),
          inputType: field.inputType || "",
          subfields: (field.subfields || []).map((subfield) => ({ ...subfield })),
          options: field.options?.length
            ? field.options.map((option) => ({ ...option }))
            : usesAnswerOptions(field)
              ? [{ id: `option-${Date.now()}`, value: "" }]
              : [],
        }))
      : [createEmptyCustomField()]
  );
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [openInputTypeFieldId, setOpenInputTypeFieldId] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const isPageMode = mode === "group";
  const isEditMode = mode === "edit";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateField = (fieldId, updates) => {
    setFields((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...updates } : field))
    );
  };

  const updateSubfield = (fieldId, subfieldId, updates) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              subfields: (field.subfields || []).map((subfield) =>
                subfield.id === subfieldId ? { ...subfield, ...updates } : subfield
              ),
            }
          : field
      )
    );
  };

  const addSubfield = (fieldId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              subfields: [
                ...(field.subfields || []),
                {
                  id: `subfield-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  label: "",
                  placeholder: "",
                  required: false,
                },
              ],
            }
          : field
      )
    );
  };

  const removeSubfield = (fieldId, subfieldId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId && (field.subfields || []).length > 1
          ? { ...field, subfields: (field.subfields || []).filter((subfield) => subfield.id !== subfieldId) }
          : field
      )
    );
  };

  const addAnswerOption = (fieldId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: [
                ...(field.options || []),
                { id: `option-${Date.now()}-${Math.random().toString(36).slice(2)}`, value: "" },
              ],
            }
          : field
      )
    );
  };

  const updateAnswerOption = (fieldId, optionId, value) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              options: (field.options || []).map((option) =>
                option.id === optionId ? { ...option, value } : option
              ),
            }
          : field
      )
    );
  };

  const removeAnswerOption = (fieldId, optionId) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId && (field.options || []).length > 1
          ? { ...field, options: (field.options || []).filter((option) => option.id !== optionId) }
          : field
      )
    );
  };

  const canSave = fields.every(
    (field) =>
      field.label?.trim() &&
      (field.kind === "group"
        ? (field.subfields || []).length > 0 &&
          (field.subfields || []).every((subfield) => subfield.label?.trim())
        : (field.inputType || field.type) &&
          (!usesAnswerOptions(field) ||
            (field.options || []).length > 0 &&
            (field.options || []).every((option) => option.value?.trim())))
  ) && (!isPageMode || pageTitle.trim());
  const previewGroup = {
    title: isPageMode ? pageTitle.trim() || "Page title" : "Page preview",
    displayTitle: isPageMode ? pageTitle.trim() || "Page title" : "Page preview",
    description: isPageMode ? pageDescription.trim() : "",
    displayDescription: isPageMode ? pageDescription.trim() : "",
    fields: fields.map(normalizeCustomField),
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-8">
      <button
        type="button"
        aria-label="Close custom field modal"
        className="absolute inset-0 h-full w-full bg-black/35 backdrop-blur-md"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-field-modal-title"
        className="relative z-10 flex max-h-[calc(100vh-64px)] w-full max-w-[1180px] flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[#f8f9fb] shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-6 border-b border-[#e3e7ee] px-7 py-6">
          <div>
            <h2 id="custom-field-modal-title" className="text-[30px] font-bold leading-tight text-[#181f25]">
              {isEditMode ? "Edit Field" : isPageMode ? "Create Custom Page" : "Create Page Fields"}
            </h2>
            <p className="mt-2 text-base text-[#181f25]/70">
              {isEditMode
                ? "Update this field directly inside the page configuration."
                : isPageMode
                ? "Name the page, describe it, then add the fields that belong inside it."
                : "Add fields directly into the page you are configuring."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#d1d7e0] bg-white text-[#181f25]/70 transition-colors hover:bg-[#eef0f3]"
            aria-label="Close custom fields"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden px-7 py-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#181f25]">Classic configuration</h3>
              <p className="mt-1 text-sm text-[#181f25]/60">
                {isEditMode
                  ? "Adjust the field label, input behavior, answers, hint text, and required status."
                  : isPageMode
                  ? "A custom KYC page is made from one or more fields."
                  : "Build the field details and answer behavior."}
              </p>
            </div>

          {isPageMode && (
            <div className="mb-5 space-y-3">
              <input
                type="text"
                value={pageTitle}
                onChange={(event) => setPageTitle(event.target.value)}
                placeholder="Add custom page title"
                className="h-[52px] w-full rounded-md border border-[#d1d7e0] bg-white px-4 text-[20px] font-semibold text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
              />
              <textarea
                value={pageDescription}
                onChange={(event) => setPageDescription(event.target.value)}
                placeholder="Add page description"
                rows={3}
                className="min-h-[92px] w-full resize-none rounded-md border border-[#d1d7e0] bg-white px-4 py-3 text-[17px] text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
              />
            </div>
          )}

          {showInfo && (
            <div className="mb-5 flex items-start gap-3 rounded-md bg-[#d8e5f6] px-4 py-4 text-[#155da8]">
              <Info className="mt-0.5 h-6 w-6 shrink-0" />
              <p className="flex-1 text-base leading-snug">
                {isEditMode
                  ? "Changes will update this field wherever it appears in this KYC."
                  : isPageMode
                  ? "Custom pages appear beside the default pages and can be dragged into your KYC."
                  : "Saved fields will be added directly into this page and selected automatically."}
              </p>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="rounded p-1 transition-colors hover:bg-white/35"
                aria-label="Dismiss custom fields information"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex gap-3 rounded-md border border-[#d7dde6] bg-white px-4 py-5 shadow-[inset_0_0_0_1px_rgba(24,31,37,0.04)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#f3f4f6] text-[#181f25]/60">
                  <GripVertical className="h-[22px] w-[22px]" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(event) => updateField(field.id, { label: event.target.value })}
                    placeholder={field.kind === "group" ? "Add Page Field Label" : "Add Field Label"}
                    className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                  />

                  {field.kind === "group" ? (
                    <div>
                      <div className="mb-2 text-base font-semibold text-[#181f25]/60">Fields in this page item</div>
                      <div className="space-y-2">
                        {field.subfields.map((subfield) => (
                          <div key={subfield.id} className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={subfield.label}
                              onChange={(event) =>
                                updateSubfield(field.id, subfield.id, { label: event.target.value })
                              }
                              placeholder="Subfield label"
                              className="h-12 min-w-0 rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                            />
                            <div className="relative">
                              <input
                                type="text"
                                value={subfield.placeholder}
                                onChange={(event) =>
                                  updateSubfield(field.id, subfield.id, { placeholder: event.target.value })
                                }
                                placeholder="Placeholder"
                                className="h-12 w-full min-w-0 rounded-md border border-[#d1d7e0] bg-white px-3.5 pr-12 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                              />
                              <button
                                type="button"
                                onClick={() => removeSubfield(field.id, subfield.id)}
                                disabled={field.subfields.length <= 1}
                                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[26px] font-bold leading-none text-[#d11f3f] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-35"
                                aria-label="Remove subfield"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addSubfield(field.id)}
                        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d1d7e0] text-[18px] font-medium text-[#181f25]/60 transition-colors hover:border-[var(--brand-primary)] hover:bg-[#f3f4f6]"
                      >
                        <Plus className="h-[22px] w-[22px]" />
                        Add subfield
                      </button>
                    </div>
                  ) : (
                    <>
                  <div className="relative z-20">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenInputTypeFieldId((current) => (current === field.id ? null : field.id))
                      }
                      className="flex h-12 w-full items-center justify-between rounded-md border border-[#d1d7e0] bg-white px-3.5 text-left text-[18px] text-[#181f25]/70 transition-colors hover:border-[var(--brand-primary)]"
                      aria-haspopup="listbox"
                      aria-expanded={openInputTypeFieldId === field.id}
                    >
                      <span>
                        {inputTypeOptions.find((option) => option.value === field.inputType)?.label ||
                          "Choose Input Type"}
                      </span>
                      <ChevronDown
                        className={`h-[22px] w-[22px] transition-transform ${
                          openInputTypeFieldId === field.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openInputTypeFieldId === field.id && (
                      <div
                        className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-[#d1d7e0] bg-white shadow-lg"
                        role="listbox"
                      >
                        {inputTypeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              updateField(field.id, { inputType: option.value });
                              setOpenInputTypeFieldId(null);
                            }}
                            className={`block w-full px-3.5 py-3 text-left text-[18px] transition-colors ${
                              field.inputType === option.value
                                ? "bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[var(--Button-Neuro-Secondary-Content,_#722FAD)]"
                                : "text-[#181f25]/70 hover:bg-[#f3f4f6]"
                            }`}
                            role="option"
                            aria-selected={field.inputType === option.value}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {field.inputType === "text" && (
                    <div>
                      <div className="mb-2 text-base font-semibold text-[#181f25]/60">Placeholder</div>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                        placeholder="Edit placeholder"
                        className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                      />
                    </div>
                  )}

                  {usesAnswerOptions(field) && (
                    <div>
                      <div className="mb-2 text-base font-semibold text-[#181f25]/60">Answer Options</div>
                      <div className="space-y-2">
                        {field.options.map((option) => (
                          <div key={option.id} className="relative">
                            <input
                              type="text"
                              value={option.value}
                              onChange={(event) =>
                                updateAnswerOption(field.id, option.id, event.target.value)
                              }
                              placeholder="Edit answer"
                              className="h-12 w-full min-w-0 rounded-md border border-[#d1d7e0] bg-white px-3.5 pr-12 text-[18px] text-[#181f25] outline-none placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswerOption(field.id, option.id)}
                              disabled={field.options.length <= 1}
                              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[26px] font-bold leading-none text-[#d11f3f] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label="Remove answer option"
                            >
                              -
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addAnswerOption(field.id)}
                        className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-[#d1d7e0] text-[18px] font-medium text-[#181f25]/60 transition-colors hover:border-[var(--brand-primary)] hover:bg-[#f3f4f6]"
                      >
                        <Plus className="h-[22px] w-[22px]" />
                        Add option
                      </button>
                    </div>
                  )}
                    </>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={field.hint}
                      onChange={(event) => updateField(field.id, { hint: event.target.value })}
                      placeholder="Add hint text"
                      className="h-12 w-full rounded-md border border-[#d1d7e0] bg-white px-3.5 pr-11 text-[18px] text-[#181f25] outline-none transition-colors placeholder:text-[#181f25]/55 focus:border-[var(--brand-primary)]"
                    />
                    <span
                      className="absolute right-3 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#eef2ff] text-[#722FAD]"
                      aria-label="Hint text is used by screen readers"
                      title="Hint text is used by screen readers"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex h-11 cursor-pointer items-center gap-3 rounded-md border border-[#d1d7e0] px-3.5 text-base font-medium text-[#181f25]">
                      Required
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={() => updateField(field.id, { required: !field.required })}
                        className="sr-only"
                      />
                      <span
                        className={`relative h-5 w-9 rounded-full border transition-colors ${
                          field.required
                            ? "border-[#29BF86] bg-[#29BF86]"
                            : "border-[#181f25]/50 bg-white"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-transform ${
                            field.required ? "translate-x-4 bg-white" : "bg-[#181f25]/70"
                          }`}
                        />
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setFields((current) =>
                          current.length > 1
                            ? current.filter((currentField) => currentField.id !== field.id)
                            : current
                        )
                      }
                      disabled={fields.length <= 1}
                      className="flex h-11 w-11 items-center justify-center rounded-md border border-[#d1d7e0] text-[#d11f3f] transition-colors hover:bg-[#fff1f3] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remove custom field"
                    >
                      <Trash2 className="h-[22px] w-[22px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isEditMode && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setFields((current) => [...current, createEmptyCustomField()])}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--Button-Neuro-Secondary-bg,_#8F40D426)] text-[18px] font-semibold text-[var(--Button-Neuro-Secondary-Content,_#722FAD)] transition-colors hover:brightness-95"
              >
                <Plus className="h-[22px] w-[22px]" />
                Add field to page
              </button>
            </div>
          )}
          </div>

          <aside className="min-h-0 overflow-y-auto">
            <KYCFlowPreview group={previewGroup} selectedPreviewFields={previewGroup.fields} />
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e3e7ee] bg-white px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-md border border-[#d1d7e0] bg-white px-6 text-[18px] font-semibold text-[#181f25] transition-colors hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(fields, pageTitle, pageDescription)}
            disabled={!canSave}
            className="h-12 rounded-md bg-[var(--Button-Neuro-Primary-bg,_#8F40D4)] px-7 text-[18px] font-bold text-white shadow-sm transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isEditMode ? "Save Field" : isPageMode ? "Save Page" : "Save Fields"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function CustomFieldPreview({ field }) {
  const label = field.label?.trim() || "Field label";
  const hint = field.hint?.trim() || "";
  const placeholder = field.placeholder?.trim() || "Enter answer";
  const visibleOptions = field.options?.filter((option) => option.value.trim()) || [];

  if (field.kind === "group") {
    return (
      <div className="rounded-md border border-[#d7dde6] bg-[#fbfcfd] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="block text-base font-bold text-[#181f25]">{label}</div>
          </div>
          <span className="shrink-0 rounded-full bg-[#eef0f3] px-2.5 py-1 text-xs font-semibold text-[#181f25]/55">
            Page item
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(field.subfields || []).map((subfield) => (
            <div key={subfield.id}>
              <div className="mb-1.5 text-sm font-semibold text-[#181f25]/70">
                {subfield.label || "Subfield label"}
              </div>
              <div className="flex h-11 items-center rounded-md border border-[#d1d7e0] bg-white px-3 text-sm text-[#181f25]/45">
                {subfield.placeholder || "Enter answer"}
              </div>
            </div>
          ))}
        </div>
        {hint && <p className="mt-3 text-sm leading-snug text-[#181f25]/55">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#d7dde6] bg-[#fbfcfd] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="block text-base font-bold text-[#181f25]">
            {label}
            {field.required && <span className="ml-1 text-[#d11f3f]">*</span>}
          </label>
        </div>
        <span className="shrink-0 rounded-full bg-[#eef0f3] px-2.5 py-1 text-xs font-semibold text-[#181f25]/55">
          {inputTypeOptions.find((option) => option.value === field.inputType)?.label || "Type"}
        </span>
      </div>

      <div className="mt-4">
        {(field.inputType === "radio" || field.type === "Radio") && (
          <div className="space-y-2">
            {(visibleOptions.length ? visibleOptions : [{ id: "preview-radio", value: "Option" }]).map(
              (option) => (
                <label key={option.id} className="flex items-center gap-3 text-sm font-medium text-[#181f25]/75">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#b9c1cc] bg-white">
                    <span className="h-2 w-2 rounded-full bg-transparent" />
                  </span>
                  {option.value.trim() || "Option"}
                </label>
              )
            )}
          </div>
        )}

        {(field.inputType === "checkboxes" || field.type === "Checkboxes") && (
          <div className="space-y-2">
            {(visibleOptions.length ? visibleOptions : [{ id: "preview-checkbox", value: "Option" }]).map(
              (option) => (
                <label key={option.id} className="flex items-center gap-3 text-sm font-medium text-[#181f25]/75">
                  <span className="h-5 w-5 shrink-0 rounded border-2 border-[#b9c1cc] bg-white" />
                  {option.value.trim() || "Option"}
                </label>
              )
            )}
          </div>
        )}

        {!usesAnswerOptions(field) && (
          <div className="flex h-12 items-center rounded-md border border-[#d1d7e0] bg-white px-3.5 text-base text-[#181f25]/45">
            {field.inputType === "text" ? placeholder : "Choose input type"}
          </div>
        )}
      </div>

      {hint && <p className="mt-3 text-sm leading-snug text-[#181f25]/55">{hint}</p>}
    </div>
  );
}
