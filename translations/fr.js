const fr = {
  home: {
    title: 'Bienvenue',
    subtitle: 'Votre tableau de bord en un coup d\'œil',
    description: 'Ceci est la page d\'accueil.'
  },
  pendingApplications: {
    title: 'Demandes en attente',
    loading: 'Chargement...',
    empty: 'Aucune demande en attente.'
  },
  // Traductions des statuts (utilisées dans la liste des demandes)
  pendingApplicationsStatuses: {
    created: 'Créée',
    approved: 'Approuvée',
    denied: 'Refusée',
    rejected: 'Rejetée',
    pending: 'En attente',
    active: 'Active',
    obsolete: 'Obsolète',
    compromised: 'Compromise'
  },
  PaginatedList: {
    titleIdApplications: 'Demandes d\'ID',
    titleAccounts: 'Comptes',
    searchPlaceholder: 'Rechercher...',
    filterAll: 'Toutes',
    filterHasId: 'Avec ID',
    filterNoId: 'Sans ID',
    limit10: '10',
    limit25: '25',
    limit50: '50',
    limitAll: 'Tout afficher'
  },
  SettingsPageClient: {
    title: 'Paramètres',
    kycTab: 'Paramètres KYC',
    apiTab: 'Clés API'
  },
  KYCSettings: {
    title: 'Paramètres KYC',
    messages: {
      loadError: 'Échec du chargement des paramètres KYC.',
      saveSuccess: 'Paramètres mis à jour avec succès !',
      saveError: 'Échec de la mise à jour des paramètres.'
    },
    sections: {
      peerReview: 'Paramètres de revue par les pairs',
      requiredFields: "Champs requis pour la création d'ID"
    },
    fields: {
      requirePeerReview: 'Exiger une revue par les pairs',
      minPeerReviewers: 'Nombre min. de réviseurs requis',
      requirePhotos: 'Exiger des photos',
      minPhotos: 'Nombre min. de photos requis'
    },
    labels: {
      FIRST: 'Prénom',
      MID: 'Deuxième prénom',
      LAST: 'Nom de famille',
      PNR: 'Numéro personnel',
      DOB: 'Date de naissance',
      GENDER: 'Sexe',
      NATIONALITY: 'Nationalité',
      ADDR: 'Adresse',
      ZIP: 'Code postal',
      CITY: 'Ville',
      COUNTRY: 'Pays',
      AREA: 'Zone',
      REGION: 'Région'
    },
    buttons: {
      reset: 'Réinitialiser les modifications',
      save: 'Enregistrer les paramètres'
    },
    unauthorized: {
      title: 'Non autorisé',
      body: "Les privilèges d'administrateur sont requis pour gérer les paramètres KYC.",
      help: "Veuillez contacter votre administrateur pour obtenir de l'aide."
    }
  },
  KYCSetting: {
    title: 'Paramètres KYC',
    messages: {
      loadError: 'Échec du chargement des paramètres KYC.',
      saveSuccess: 'Paramètres mis à jour avec succès !',
      saveError: 'Échec de la mise à jour des paramètres.'
    },
    sections: {
      peerReview: 'Paramètres de revue par les pairs',
      requiredFields: "Champs requis pour la création d'ID"
    },
    fields: {
      requirePeerReview: 'Exiger une revue par les pairs',
      minPeerReviewers: 'Nombre min. de réviseurs requis',
      requirePhotos: 'Exiger des photos',
      minPhotos: 'Nombre min. de photos requis'
    },
    labels: {
      FIRST: 'Prénom',
      MID: 'Deuxième prénom',
      LAST: 'Nom de famille',
      PNR: 'Numéro personnel',
      DOB: 'Date de naissance',
      GENDER: 'Sexe',
      NATIONALITY: 'Nationalité',
      ADDR: 'Adresse',
      ZIP: 'Code postal',
      CITY: 'Ville',
      COUNTRY: 'Pays',
      AREA: 'Zone',
      REGION: 'Région'
    },
    buttons: {
      reset: 'Réinitialiser les modifications',
      save: 'Enregistrer les paramètres'
    },
    unauthorized: {
      title: 'Non autorisé',
      body: "Les privilèges d'administrateur sont requis pour gérer les paramètres KYC.",
      help: "Veuillez contacter votre administrateur pour obtenir de l'aide."
    }
  },
  apiKeyDetails: {
    title: 'Clé API',
    back: 'Retour aux clés API',
    loading: 'Chargement...',
    notFound: 'Clé API introuvable',
    labels: {
      owner: 'Propriétaire:',
      email: 'E-mail:',
      apiKey: 'Clé API:',
      secretKey: 'Clé secrète:',
      created: 'Créée:',
      maxAccounts: 'Nb max. de comptes:',
      accountsCreated: 'Comptes créés:',
      accountsDeleted: 'Comptes supprimés:'
    }
  },
  apiKeyQR: {
    title: 'QR-code de la clé API',
    expirationLabel: 'Date et heure d\'expiration du QR-code (AAAA-MM-JJ, Heure)',
    placeholders: {
      year: 'AAAA',
      month: 'MM',
      day: 'JJ',
      time: 'Heure'
    },
    generateButton: 'Générer le QR-code',
    loading: 'Chargement du QR-code...',
    scanHelp: 'Scannez le QR-code pour accéder au Neuron',
    downloadButton: 'Télécharger le QR-code',
    shareButton: 'Partager le QR-code',
    shareNotSupported: 'Le partage n\'est pas pris en charge sur cet appareil.',
    error: 'Échec du chargement du QR-code'
  },
  apiKeysList: {
    title: 'Clés API',
    columns: {
      owner: 'Propriétaire',
      apiKey: 'Clé API',
      ownerEmail: 'E-mail du propriétaire',
      created: 'Créée'
    },
  },
  accountTableList: {
    columns: {
      idName: 'Nom de l\'ID',
      identityStatus: 'Statut de l\'identité',
      accountName: 'Nom du compte',
      email: 'E-mail',
      created: 'Créé'
    },
    statuses: {
      approved: 'Approuvée',
      compromised: 'Compromise',
      created: 'ID en attente',
      obsoleted: 'Obsolète',
      rejected: 'Rejetée',
      none: 'Aucune ID'
    }
  },
  pendingTable: {
    columns: {
      idName: "Nom de l'ID",
      accountName: 'Compte',
      email: 'E-mail',
      location: 'Localisation',
      created: 'Créé'
    },
    pendingActions: {
      See: 'Voir la demande',
      review: 'Examiner la demande'
    }
  },
  actionButtons: {
    reviewApplication: 'Examiner la demande',
    compromiseId: 'Marquer l\'ID comme compromise',
    obsoleteId: 'Rendre l\'ID obsolète',
    confirm: 'Confirmer',
    cancel: 'Annuler'
  },
  activity: {
    accountActivity: 'Activité du compte',
    identityActivity: 'Activité de l\'identité',
    comingSoon: 'Bientôt disponible'
  },
  displayDetails: {
    noData: 'Aucune donnée disponible',
    cancelOrder: 'Annuler la commande',
    confirmTitle: 'Êtes-vous sûr de vouloir annuler votre commande ?',
    confirmSubtitle: 'Cette action est irréversible.',
    confirmDelete: 'Annuler',
    cancel: 'Annuler',
    deletedMessage: 'Votre compte a été supprimé avec succès.',
    certificateTitle: 'Informations sur le certificat',
    certificateDescription: 'Le jeton valide le processus de compensation tokenisée des émissions de carbone. Le propriétaire achète le Carbon Token auprès de Creturner ce qui compense une quantité spécifique de CO₂e.'
  },
  buttons: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    confirm: 'Confirmer'
  },
  navbar: {
    profile: 'Profil',
    logout: 'Déconnexion'
  },
  profilePage: {
    systemTitle: 'Système',
    languageLabel: 'Langue',
    languageValueEnglish: 'Anglais',
    defaultThemeLabel: 'Thème par défaut',
    defaultThemeTimed: 'Programmé'
  },
  landing: {
    status: {
      active: 'Actif',
      learnMore: 'En savoir plus'
    },
    services: {
      neuroAccess: { description: 'Gestion des identités et des accès' },
      neuroCarbon: { description: 'Gestion de la compensation carbone' },
      neuroMonitor: { description: 'Surveillance des actifs et des processus' },
      neuroPayments: { description: 'Surveillance et gestion des paiements' },
      neuroLeasing: { description: 'Portail de gestion de leasing' },
      neuronManagement: { description: 'Console de gestion des serveurs' },
      neuroAssets: { description: 'Gestion des actifs numériques' }
    },
    header: {
      welcomeTo: 'Bienvenue sur',
      subtitle: 'Veuillez sélectionner où vous souhaitez entrer'
    },
    labels: {
      manageServices: 'Gérer les services',
      currentNeuron: 'Neurone actuel',
      destination: 'Destination',
      main: 'Principal'
    }
  },
  menu: {
    access: 'Accès',
    accessSettings: 'Paramètres d\'accès',
    idApplications: 'Demandes d\'ID',
    accounts: 'Comptes'
  },
  accessDashboard: {
    title: 'Tableau de bord Neuro-Access',
    subtitle: 'Aperçus en temps réel de la gestion des identités'
  },
  Identity: {
    noData: 'Aucune donnée disponible',
    noIdTitle: 'Le compte n\'a aucune ID',
    noIdDescription: 'Ce compte n\'a pas encore de vérification d\'identité.',
      applicationMade: 'Demande créée',
      registered: 'Enregistré',
      actionTitles: {
        approved: 'Approuver la demande d\'ID',
        rejected: 'Refuser la demande d\'ID',
        compromised: 'Marquer l\'ID comme compromise',
        obsoleted: 'Rendre l\'ID obsolète'
      },
    statuses: {
      pending: 'Demande d\'ID en attente',
      active: 'ID active',
      obsoleted: 'ID obsolète',
      compromised: 'ID compromise',
      rejected: 'ID rejetée'
    },
    labels: {
      idStatus: 'Statut de l\'ID',
      idCreated: 'ID créé',
      account: 'Compte',
      email: 'E-mail',
      country: 'Pays',
      phone: 'Téléphone',
      created: 'Créé',
      fullName: 'Nom complet',
      firstname: 'Prénom',
      nationality: 'Nationalité',
      address: 'Adresse',
      personalNumber: 'Numéro personnel',
      dateOfBirth: 'Date de naissance',
      back: 'Retour',
      accountInformation: 'Informations du compte',
      accountTab: 'Compte',
      identityTab: 'Identité'
    },
    sections: {
      identityInformation: 'Informations sur l\'identité',
      identityMetadata: 'Métadonnées de l\'identité'
    },
    viewMoreInformation: 'Voir plus d\'informations'
  },
  AssetMenu: {
    title: 'Assets',
    orders: 'Commandes',
    clients: 'Clients',
    coffee: 'Café'
  },
  Clients: {
    title: 'Clients Assets',
    subtitle: 'Vue d\'ensemble de l\'activité client liée aux actifs',
    loading: 'Chargement des clients...',
    empty: 'Aucun client disponible',
    summary: {
      total: 'Total',
      activeOrders: 'Commandes actives',
      totalClients: 'Nombre total de clients',
      pendingOrders: 'Commandes en attente'
    },
    table: {
      columns: {
        facilityId: 'ID installation',
        name: 'Nom',
        address: 'Adresse',
        carbonProcessed: 'Carbone total traité',
        status: 'Statut'
      },
      statusActive: 'Actif',
      statusInactive: 'Inactif'
    }
  },
  modal: {
    title: 'Examiner la demande d\'ID',
    applicantPhoto: 'Photo du demandeur',
    noPhoto: 'Pas de photo',
    applicantIdentification: 'Identification du demandeur',
    identificationChosen: 'Identification choisie',
    nationalIdCard: 'Carte d\'identité nationale',
    noFrontImage: 'Pas d\'image avant',
    noBackImage: 'Pas d\'image arrière',
    personalInformation: 'Informations personnelles',
    fullName: 'Nom complet',
    country: 'Pays',
    dateOfBirth: 'Date de naissance',
    identityNumber: 'Numéro d\'identité',
    address: 'Adresse',
    email: 'E-mail',
    phoneNumber: 'Numéro de téléphone',
    companyInformation: 'Informations sur l\'entreprise',
    idNumber: 'Numéro d\'ID',
    legalName: 'Dénomination légale',
    city: 'Ville',
    zip: 'Code postal',
    region: 'Région',
    companyCountry: 'Pays',
    legalRepresentation: 'Représentation légale',
    yes: 'Oui',
    no: 'Non',
    companyLegalDocument: 'Document juridique de l\'entreprise',
    denialReasonLabel: 'Raison du refus de la demande d\'ID',
    denialReasonHint: '(Sera envoyé au demandeur)',
    denyButton: 'Refuser la demande d\'ID',
    approveButton: 'Approuver la demande d\'ID',
    cancelDenial: 'Annuler le refus',
    submitDenial: 'Envoyer le refus',
    confirm: {
      approved: {
        state: 'Êtes-vous sûr de vouloir approuver cette demande d\'ID?',
        email: 'L\'utilisateur sera averti par e-mail.'
      },
      rejected: {
        state: 'Êtes-vous sûr de vouloir rejeter cette demande d\'ID?',
        email: 'L\'utilisateur sera averti par e-mail.'
      },
      compromised: {
        state: 'Êtes-vous sûr de vouloir marquer cette identité comme compromise?',
        email: 'L\'utilisateur sera averti par e-mail.'
      },
      obsoleted: {
        state: 'Êtes-vous sûr de vouloir marquer cette identité comme obsolète?',
        email: 'L\'utilisateur sera averti par e-mail.'
      },
      default: {
        state: 'Êtes-vous sûr?',
        email: 'L\'utilisateur sera averti.'
      }
    }
  }
  ,
  profileEditModal: {
    editPersonal: 'Modifier les informations personnelles',
    editClient: 'Modifier les informations client',
    profilePageLegend: 'Page de profil',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    nationality: 'Nationalité',
    personalNumber: 'Numéro personnel',
    email: 'E-mail',
    phoneNumber: 'Numéro de téléphone',
    language: 'Langue',
    clientSettingsLegend: 'Paramètres client',
    cancel: 'Annuler'
  }
  ,
  themeToggle: {
    light: 'Mode clair',
    dark: 'Mode sombre'
  }
  ,
  Manage: {
    pageTitle: 'Activité du client',
    searchPlaceholder: 'Rechercher une activité',
    filterAll: 'Tout',
    comingSoon: 'Bientôt disponible',
    sections: {
      identityInformation: 'Informations sur l\'identité',
      identityMetadata: 'Métadonnées de l\'identité'
    },
    labels: {
      clientType: 'Type de client :',
      clientName: 'Nom du client :',
      identityNumber: 'Numéro d\'identité :',
      countryOfOrigin: 'Pays d\'origine :',
      address: 'Adresse :',
      originDate: 'Date d\'origine :',
      email: 'E-mail :',
      phoneNumber: 'Numéro de téléphone :'
    },
    metadata: {
      requestedFlags: 'Drapeaux demandés :',
      educationSources: 'Sources de formation :',
      documents: 'Documents :',
      lastRenewal: 'Dernier renouvellement',
      complianceLevel: 'Niveau de conformité',
      delegatedAdmins: 'Administrateurs délégués',
      suspensionReason: 'Raison de la suspension',
      escalationContact: 'Contact d\'escalade',
      requiredSteps: 'Étapes requises'
    },
    statuses: {
      pending: 'Demande d\'ID en attente',
      active: 'ID active',
      obsoleted: 'ID obsolète'
    },
    actions: {
      deny: 'Refuser la demande d\'ID',
      approve: 'Approuver la demande d\'ID',
      suspend: 'Suspendre l\'ID',
      obsolete: 'Rendre l\'ID obsolète'
    }
  }
  ,
  assetClientDetail: {
    tabs: {
      overview: 'Aperçu',
      orders: 'Commandes',
      manage: 'Gérer'
    },
    summary: {
      total: 'Total',
      activeOrders: 'Commandes actives',
      pendingOrders: 'Commandes en attente'
    },
    units: {
      tons: 'tonnes'
    },
    headings: {
      orders: 'Commandes'
    },
    loading: {
      orders: 'Chargement des commandes...'
    }
  }
  ,
  assetOrders: {
    heading: 'Commandes Assets',
    summary: {
      total: 'Total',
      active: 'Commandes actives',
      pending: 'Commandes en attente'
    },
    units: {
      tons: 'tonnes'
    },
    loading: 'Chargement des commandes...'
  }
  ,
  userCard: {
    thisMonth: 'Ce mois-ci',
    types: {
      amountSold: 'Montant vendu',
      totalVolumeCompensated: 'Volume total compensé'
    }
  },
  assetDashboard: {
    heading: 'Tableau de bord des Assets'
  }
  ,
  certificateButtons: {
    download: 'Télécharger le certificat',
    share: 'Partager le certificat'
  }
  ,
  assetOrderDetail: {
    tabs: {
      order: 'Détail de la commande',
      certificate: 'Certificat',
      process: 'Processus'
    },
    headings: {
      orderDetails: 'Détails de la commande',
      orderCertificate: 'Certificat de la commande',
      certificateInformation: 'Informations sur le certificat'
    },
    fields: {
      orderName: 'Nom de la commande',
      comment: 'Commentaire',
      orderType: 'Type de commande',
      orderQuantity: 'Quantité de la commande',
      orderDate: 'Date de la commande',
      orderedBy: 'Commandée par',
      created: 'Créée'
    },
    certificateFields: {
      name: 'Nom',
      creator: 'Créateur',
      category: 'Catégorie',
      visibility: 'Visibilité',
      updated: 'Mis à jour',
      tokenId: 'ID du jeton',
      owner: 'Propriétaire',
      currency: 'Devise',
      created: 'Créé',
      validUntil: 'Valide jusqu\'au'
    },
    statusBox: {
      status: 'Statut',
      progress: 'Progression',
      amount: 'Montant',
      complete: 'terminé'
    }
  }
  ,
  processPage: {
    progress: {
      title: 'Progression de la compensation',
      descriptionTotal: 'Suivi du volume compensé dans le temps',
      descriptionRelative: 'Comparaison de chaque phase par rapport au total',
      relative: 'Relatif',
      total: 'Total',
      noData: 'Aucune donnée disponible'
    },
    summary: {
      totalValue: 'Valeur totale',
      totalCompensation: 'Compensation totale'
    },
    activity: {
      title: 'Activité du processus',
      searchPlaceholder: 'Rechercher des mises à jour',
      filterAll: 'Tout',
      comingSoon: 'Bientôt disponible'
    },
    units: {
      tons: 'tonnes'
    },
    misc: {
      completeSuffix: '% terminé'
    },
    status: {
      label: 'Statut',
      states: {
        inProgress: 'En cours',
        paused: 'En pause',
        aborted: 'Annulé',
        complete: 'Terminé',
        notStarted: 'Non démarré'
      },
      terminate: 'Terminer le processus'
    },
    actions: {
      terminate: 'Terminer le processus'
    }
  },
  clientOverview: {
  companyInformation: 'Informations sur l\'entreprise',
  regNumber: 'N° d\'enregistrement',
  industry: 'Secteur',
  location: 'Localisation',
  billingInfo: 'Informations de facturation',
  billingEmail: 'E-mail de facturation',
  paymentTerms: 'Conditions de paiement',
  vatNumber: 'N° TVA',
  invoiceDelivery: 'Mode de livraison de facture',
  clientId: 'ID Client',
  statusActive: 'Actif',
  editInformation: 'Modifier les informations',
  manageClientId: 'Gérer l\'ID Client',
  ariaShowBilling: 'Afficher les informations de facturation',
  ariaHideBilling: 'Masquer les informations de facturation',
  totalPurchases: 'Total des achats',
  totalCompensation: 'Compensation totale',
  contacts: 'Contacts'
  },
  clientEditModal: {
    title: 'Modifier les informations du client',
    clientIcon: 'Icône du client',
    lightMode: 'Mode clair',
    pngLight: 'PNG clair',
    remove: 'Supprimer',
    change: 'Changer',
    darkMode: 'Mode sombre',
    pngDark: 'PNG sombre',
    clientName: 'Nom du client',
    industry: 'Secteur',
    regNumber: 'N° d\'enregistrement',
    address: 'Adresse',
    cancel: 'Annuler',
    saveChanges: 'Enregistrer les modifications'
  },
  agreementDetailModal: {
    priceAgreementProposal: "Proposition d'accord de prix",
    pricingAgreementTerms: "Conditions de l'accord tarifaire",
    buyerLabel: 'Acheteur :',
    sellerLabel: 'Vendeur :',
    pricePerTonLabel: 'Prix (par tonne) :',
    expiryDateLabel: "Date d'expiration :",
    editProposalButton: 'Modifier la proposition',
    denyButton: 'Refuser',
    approveButton: 'Approuver'
  },
  agreementEditModal: {
    editProposalTitle: "Modifier la proposition d'accord de prix",
    newProposalTitle: "Nouvelle proposition d'accord de prix",
    buyer: 'Acheteur',
    clientRole: 'Client',
    seller: 'Vendeur',
    processOwnerRole: 'Responsable du processus',
    agreementNameLabel: "Nom de l'accord",
    pricePerTonLabel: 'Prix (par tonne)',
    setExpiryDateLabel: "Définir la date d'expiration",
    expiryDateLabel: "Date d'expiration",
    placeholders: {
      year: 'Année',
      month: 'Mois',
      day: 'Jour',
      time: 'Heure'
    },
    cancel: 'Annuler',
    makeChanges: 'Apporter des modifications',
    createAgreement: 'Créer un accord'
  },
  pricingAgreementsSection: {
    title: 'Accords tarifaires',
    searchPlaceholder: 'Rechercher des accords...',
    filterAll: 'Tous',
    filterActive: 'Actif',
    filterExpired: 'Expiré',
    createNewButton: 'Créer un nouvel accord',
    statusActive: 'Actif',
    statusExpired: 'Expiré'
  },
  localizationSettings: {
    timezone: 'Fuseau horaire'
  },
  
  kycPreview: {
    previewTitle: 'Aperçu',
    intro: 'Ce mini-flux reflète l\'intégration utilisateur finale. Activez les champs requis pour voir la checklist s\'adapter en temps réel.',
    empty: 'Aucun champ requis sélectionné. Activez au moins un champ pour afficher l\'aperçu d\'intégration.',
    progressLabel: 'Progression',
    stepsSuffix: 'étapes',
    stepLabel: 'Étape',
    placeholderPrefix: 'Saisir',
    stepDescriptions: {
      FIRST: 'Vérifier les instructions d\'identité',
      MID: 'Ajouter un deuxième prénom (optionnel)',
      LAST: 'Ajouter le nom de famille',
      PNR: 'Saisir le numéro d\'identité / personnel',
      DOB: 'Confirmer la date de naissance',
      GENDER: 'Sélectionner le sexe',
      NATIONALITY: 'Sélectionner la nationalité',
      ADDR: 'Fournir l\'adresse résidentielle',
      ZIP: 'Saisir le code postal',
      CITY: 'Ajouter la ville de résidence',
      COUNTRY: 'Sélectionner le pays',
      AREA: 'Définir la zone / quartier',
      REGION: 'Choisir la région / état'
    },
    nextField: 'Champ suivant',
    selectStep: 'Sélectionnez une étape dans la checklist pour voir les détails.'
  }
};



export default fr;
