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
    deleteAccount: 'Supprimer le compte',
    confirmTitle: 'Êtes-vous sûr de vouloir supprimer votre compte ?',
    confirmSubtitle: 'Cette action est irréversible.',
    confirmDelete: 'Supprimer',
    cancel: 'Annuler',
    deletedMessage: 'Votre compte a été supprimé avec succès.'
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
      neuronManagement: { description: 'Console de gestion des serveurs' }
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
    orders: 'Commandes',
    clients: 'Clients'
  },
  Clients: {
    title: 'Clients d\'actifs',
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
};

export default fr;
