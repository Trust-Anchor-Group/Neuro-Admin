const en = {
  home: {
    title: 'Welcome',
    subtitle: 'Your dashboard at a glance',
    description: 'This is the home page.'
  },
  pendingApplications: {
    title: 'Pending Applications',
    loading: 'Loading...',
    empty: 'No pending applications.'
  },
  // Status translations (used in PendingApplications list)
  pendingApplicationsStatuses: {
    created: 'Created',
    approved: 'Approved',
    denied: 'Denied',
    rejected: 'Rejected',
    pending: 'Pending',
    active: 'Active',
    obsolete: 'Obsolete',
    compromised: 'Compromised'
  },
  PaginatedList: {
    titleIdApplications: 'ID applications',
    titleAccounts: 'Accounts',
    searchPlaceholder: 'Search...',
    filterAll: 'All',
    filterHasId: 'Has ID',
    filterNoId: 'No ID',
    limit10: '10',
    limit25: '25',
    limit50: '50',
    limitAll: 'Show all'
  },
  SettingsPageClient: {
  title: 'Settings',
  kycTab: 'KYC Settings',
  apiTab: 'API Keys'
  },
  KYCSettings: {
    title: 'KYC settings',
    messages: {
      loadError: 'Failed to load KYC settings.',
      saveSuccess: 'Settings updated successfully!',
      saveError: 'Failed to update settings.'
    },
    sections: {
      peerReview: 'Peer review settings',
      requiredFields: 'Required fields for ID creation'
    },
    fields: {
      requirePeerReview: 'Require peer review',
      minPeerReviewers: 'Min. number of peer reviewers required',
      requirePhotos: 'Require photos',
      minPhotos: 'Min. number of photos required'
    },
    labels: {
      FIRST: 'First name',
      MID: 'Middle name',
      LAST: 'Last name',
      PNR: 'Personal number',
      DOB: 'Date of birth',
      GENDER: 'Gender',
      NATIONALITY: 'Nationality',
      ADDR: 'Address',
      ZIP: 'Postal code',
      CITY: 'City',
      COUNTRY: 'Country',
      AREA: 'Area',
      REGION: 'Region'
    },
    buttons: {
      reset: 'Reset changes',
      save: 'Save settings'
    },
    unauthorized: {
      title: 'Unauthorized',
      body: 'Administrator privileges are required to manage KYC settings.',
      help: 'Please contact your administrator for further help.'
    }
  },
  KYCSetting: {
    title: 'KYC settings',
    messages: {
      loadError: 'Failed to load KYC settings.',
      saveSuccess: 'Settings updated successfully!',
      saveError: 'Failed to update settings.'
    },
    sections: {
      peerReview: 'Peer review settings',
      requiredFields: 'Required fields for ID creation'
    },
    fields: {
      requirePeerReview: 'Require peer review',
      minPeerReviewers: 'Min. number of peer reviewers required',
      requirePhotos: 'Require photos',
      minPhotos: 'Min. number of photos required'
    },
    labels: {
      FIRST: 'First name',
      MID: 'Middle name',
      LAST: 'Last name',
      PNR: 'Personal number',
      DOB: 'Date of birth',
      GENDER: 'Gender',
      NATIONALITY: 'Nationality',
      ADDR: 'Address',
      ZIP: 'Postal code',
      CITY: 'City',
      COUNTRY: 'Country',
      AREA: 'Area',
      REGION: 'Region'
    },
    buttons: {
      reset: 'Reset changes',
      save: 'Save settings'
    },
    unauthorized: {
      title: 'Unauthorized',
      body: 'Administrator privileges are required to manage KYC settings.',
      help: 'Please contact your administrator for further help.'
    }
  },
  apiKeyDetails: {
    title: 'API key',
    back: 'Back to API Keys',
    loading: 'Loading...',
    notFound: 'API Key not found',
    labels: {
      owner: 'Owner:',
      email: 'Email:',
      apiKey: 'API key:',
      secretKey: 'Secret key:',
      created: 'Created:',
      maxAccounts: 'Max no. accounts:',
      accountsCreated: 'Accounts created:',
      accountsDeleted: 'Accounts deleted:'
    }
  },
  apiKeyQR: {
    title: 'API key QR-code',
    expirationLabel: 'QR-code expiration date & time (YYYY-MM-DD, Time)',
    placeholders: {
      year: 'YYYY',
      month: 'MM',
      day: 'DD',
      time: 'Time'
    },
    generateButton: 'Generate QR-code',
    loading: 'Loading QR code...',
    scanHelp: 'Scan the QR code to access the Neuron',
    downloadButton: 'Download QR-code',
    shareButton: 'Share QR-code',
    shareNotSupported: 'Sharing is not supported on this device.',
    error: 'Failed to load QR code'
  },
  apiKeysList: {
    title: 'API keys',
    columns: {
      owner: 'Owner',
      apiKey: 'API key',
      ownerEmail: 'Owner email',
      created: 'Created'
    },
  },
  accountTableList: {
    columns: {
      idName: 'ID name',
      identityStatus: 'Identity status',
      accountName: 'Account Name',
      email: 'Email',
      created: 'Created'
    },
    statuses: {
      approved: 'Approved',
      compromised: 'Compromised',
      created: 'ID pending',
      obsoleted: 'Obsoleted',
      rejected: 'Rejected',
      none: 'No ID'
    }
  },
  pendingTable: {
    columns: {
      idName: 'ID name',
      Account: 'Account',
      Email: 'Email',
      Location: 'Location',
      created: 'Created',
      Actions: 'Actions'
    },
    pendingActions: {
      See: 'See Application',
      review: 'Review Application',
    }
  },
  actionButtons: {
    reviewApplication: 'Review application',
    compromiseId: 'Compromise ID',
    obsoleteId: 'Obsolete ID',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  activity: {
    accountActivity: 'Account Activity',
    identityActivity: 'Identity Activity',
    comingSoon: 'Coming soon'
  },
  displayDetails: {
    noData: 'No data available',
    cancelOrder: 'Cancel Order',
    confirmTitle: 'Are you sure you want to delete your account?',
    confirmSubtitle: 'This action cannot be undone.',
    confirmDelete: 'Delete',
    cancel: 'Cancel',
    deletedMessage: 'Your account has been successfully deleted.',
    certificateTitle: 'Certificate Information',
    certificateDescription: 'The token validates the process of a tokenized Carbon Emissions Offset. The owner purchases the Carbon Token from Creturner which offsets a specific amount of CO₂e.'
  },
  buttons: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm'
  },
  navbar: {
    profile: 'Profile',
    logout: 'Logout'
  },
  profilePage: {
    systemTitle: 'System',
    languageLabel: 'Language',
    languageValueEnglish: 'English',
    defaultThemeLabel: 'Default theme',
    defaultThemeTimed: 'Timed'
  },
  landing: {
    status: {
      active: 'Active',
      learnMore: 'Learn more'
    },
    services: {
      neuroAccess: {
        description: 'Identity and access management'
      },
      neuroCarbon: {
        description: 'Climate compensation management'
      },
      neuroMonitor: {
        description: 'Asset and process monitoring'
      },
      neuroPayments: {
        description: 'Payment monitoring and management'
      },
      neuroLeasing: {
        description: 'Leasing management portal'
      },
      neuronManagement: {
        description: 'Server management console'
      },
      neuroAssets: {
        description: 'Digital asset management'
      }
    },
    header: {
      welcomeTo: 'Welcome to',
      subtitle: 'Please select where you would like to enter'
    },
    labels: {
      manageServices: 'Manage services',
      currentNeuron: 'Current Neuron',
      destination: 'Destination',
      main: 'Main'
    }
  },  
  menu: {
    access: 'Access',
    accessSettings: 'Access settings',
    idApplications: 'ID applications',
    accounts: 'Accounts'
  },
  accessDashboard: {
    title: 'Neuro-Access Dashboard',
    subtitle: 'Real-time identity management insights'
  },
  Identity: {
    noData: 'No available data',
    noIdTitle: 'Account does not have any ID',
    noIdDescription: "This account doesn't have an identity verification yet.",
    applicationMade: 'Application made',
    registered: 'Registered',
    actionTitles: {
      approved: 'Approve ID application',
      rejected: 'Deny ID application',
      compromised: 'Compromise ID',
      obsoleted: 'Obsolete ID'
    },
    statuses: {
      pending: 'Pending ID application',
      active: 'Active ID',
      obsoleted: 'Obsoleted ID',
      compromised: 'Compromised ID',
      rejected: 'Rejected ID'
    },
    labels: {
      idStatus: 'ID status',
      idCreated: 'ID created',
      account: 'Account',
      email: 'Email',
      country: 'Country',
      phone: 'Phone',
      created: 'Created',
      fullName: 'Full Name',
      firstname: 'First Name',
      nationality: 'Nationality',
      address: 'Address',
      personalNumber: 'Personal number',
      dateOfBirth: 'Date of birth',
      back: 'Back',
      accountInformation: 'Account Information',
      accountTab: 'Account',
      identityTab: 'Identity'
    },
    sections: {
      identityInformation: 'Identity Information',
      identityMetadata: 'Identity Metadata'
    },
    viewMoreInformation: 'View more Information'
  },
  AssetMenu:{
    title: 'Assets',
    carbonCredit: 'Carbon Credit',
    clients: 'Clients',
    coffee: 'Coffee'
  },
  Clients: {
    title: 'Asset Clients',
    subtitle: 'Overview of asset-related client activity',
    loading: 'Loading clients...',
    empty: 'No clients available',
    summary: {
      total: 'Total',
      activeOrders: 'Active orders',
      totalClients: 'Total clients',
      pendingOrders: 'Pending orders'
    },
    table: {
      columns: {
        facilityId: 'Facility ID',
        name: 'Name',
        address: 'Address',
        carbonProcessed: 'Total Processed Carbon',
        status: 'Status'
      },
      statusActive: 'Active',
      statusInactive: 'Inactive'
    }
  },
  modal: {
    title: 'Review ID application',
    applicantPhoto: 'Applicant photo',
    noPhoto: 'No photo',
    applicantIdentification: 'Applicant identification',
    identificationChosen: 'Identification chosen',
    nationalIdCard: 'National ID card',
    noFrontImage: 'No front image',
    noBackImage: 'No back image',
    personalInformation: 'Personal information',
    fullName: 'Full name',
    country: 'Country',
    dateOfBirth: 'Date of birth',
    identityNumber: 'Identity number',
    address: 'Address',
    email: 'Email',
    phoneNumber: 'Phone number',
    companyInformation: 'Company information',
    idNumber: 'ID number',
    legalName: 'Legal name',
    city: 'City',
    zip: 'ZIP',
    region: 'Region',
    companyCountry: 'Country',
    legalRepresentation: 'Legal representation',
    yes: 'Yes',
    no: 'No',
    companyLegalDocument: 'Company legal document',
    denialReasonLabel: 'Reason for denial of ID application',
    denialReasonHint: '(Will be sent to the applicant)',
    denyButton: 'Deny ID application',
    approveButton: 'Approve ID application',
    cancelDenial: 'Cancel denial',
    submitDenial: 'Submit denial',
    confirm: {
      approved: {
        state: 'Are you sure you want to approve this ID application?',
        email: 'The user will be notified by email.'
      },
      rejected: {
        state: 'Are you sure you want to reject this ID application?',
        email: 'The user will be notified by email.'
      },
      compromised: {
        state: 'Are you sure you want to change this identity to compromised?',
        email: 'The user will be notified by email.'
      },
      obsoleted: {
        state: 'Are you sure you want to change this identity to obsoleted?',
        email: 'The user will be notified by email.'
      },
      default: {
        state: 'Are you sure?',
        email: 'The user will be notified.'
      }
    }
  }
  ,
  profileEditModal: {
    editPersonal: 'Edit personal information',
    editClient: 'Edit client information',
    profilePageLegend: 'Profile Page',
    firstName: 'First name',
    lastName: 'Last name',
    nationality: 'Nationality',
    personalNumber: 'Personal number',
    email: 'Email',
    phoneNumber: 'Phone number',
    language: 'Language',
    clientSettingsLegend: 'Client settings',
    cancel: 'Cancel'
  }
  ,
  themeToggle: {
    light: 'Light Mode',
    dark: 'Dark Mode'
  }
  ,
  Manage: {
    pageTitle: 'Client activity',
    searchPlaceholder: 'Search activity',
    filterAll: 'All',
    comingSoon: 'Coming soon',
    sections: {
      identityInformation: 'Identity information',
      identityMetadata: 'Identity metadata'
    },
    labels: {
      clientType: 'Client type:',
      clientName: 'Client name:',
      identityNumber: 'Identity number:',
      countryOfOrigin: 'Country of origin:',
      address: 'Address:',
      originDate: 'Origin date:',
      email: 'Email:',
      phoneNumber: 'Phone number:'
    },
    metadata: {
      requestedFlags: 'Requested flags:',
      educationSources: 'Education sources:',
      documents: 'Documents:',
      lastRenewal: 'Last renewal',
      complianceLevel: 'Compliance level',
      delegatedAdmins: 'Delegated admins',
      suspensionReason: 'Suspension reason',
      escalationContact: 'Escalation contact',
      requiredSteps: 'Required steps'
    },
    statuses: {
      pending: 'Pending ID application',
      active: 'Active ID',
      obsoleted: 'Obsoleted ID'
    },
    actions: {
      deny: 'Deny ID application',
      approve: 'Approve ID application',
      suspend: 'Suspend ID',
      obsolete: 'Obsolete ID'
    }
  }
  ,
  assetClientDetail: {
    tabs: {
      overview: 'Overview',
      orders: 'Orders',
      manage: 'Manage'
    },
    summary: {
      total: 'Total',
      activeOrders: 'Active orders',
      pendingOrders: 'Pending orders'
    },
    units: {
      tons: 'ton'
    },
    headings: {
      orders: 'Orders'
    },
    loading: {
      orders: 'Loading orders...'
    }
  }
  ,
  assetOrders: {
    heading: 'Asset Orders',
    summary: {
      total: 'Total',
      active: 'Active orders',
      pending: 'Pending orders'
    },
    units: {
      tons: 'ton'
    },
    loading: 'Loading orders...'
  }
  ,
  userCard: {
    thisMonth: 'This Month',
    types: {
      amountSold: 'Amount Sold',
      totalVolumeCompensated: 'Total volume compensated'
    }
  },
  assetDashboard: {
    heading: 'Assets Dashboard'
  }
  ,
  certificateButtons: {
    download: 'Download certificate',
    share: 'Share certificate'
  }
  ,
  assetOrderDetail: {
    tabs: {
      order: 'Order detail',
      certificate: 'Certificate',
      process: 'Process'
    },
    headings: {
      orderDetails: 'Order details',
      orderCertificate: 'Order certificate',
      certificateInformation: 'Certificate Information'
    },
    fields: {
      orderName: 'Order Name',
      comment: 'Comment',
      orderType: 'Order type',
      orderQuantity: 'Order Quantity',
      orderDate: 'Order Date',
      orderedBy: 'Ordered By',
      created: 'Created'
    },
    certificateFields: {
      name: 'Name',
      creator: 'Creator',
      category: 'Category',
      visibility: 'Visibility',
      updated: 'Updated',
      tokenId: 'Token ID',
      owner: 'Owner',
      currency: 'Currency',
      created: 'Created',
      validUntil: 'Valid Until'
    },
    statusBox: {
      status: 'Status',
      progress: 'Progress',
      amount: 'Amount',
      complete: 'complete'
    }
  }
  ,
  processPage: {
    progress: {
      title: 'Compensation progress',
      descriptionTotal: 'Tracking compensated volume over time',
      descriptionRelative: 'Comparing each phase share of the total order',
      relative: 'Relative',
      total: 'Total',
      noData: 'No data available'
    },
    summary: {
      totalValue: 'Total value',
      totalCompensation: 'Total compensation'
    },
    activity: {
      title: 'Process activity',
      searchPlaceholder: 'Search updates',
      filterAll: 'All',
      comingSoon: 'Coming soon'
    },
    units: {
      tons: 'tons'
    },
    misc: {
      completeSuffix: '% complete'
    },
    status: {
      label: 'Status',
      states: {
        inProgress: 'In progress',
        paused: 'Paused',
        aborted: 'Aborted',
        complete: 'Complete',
        notStarted: 'Not started'
      },
      terminate: 'Terminate process'
    },
    actions: {
      terminate: 'Terminate process'
    }
  },
  clientOverview: {
  companyInformation: 'Company Information',
  regNumber: 'Reg. Number',
  industry: 'Industry',
  location: 'Location',
  billingInfo: 'Billing Info',
  billingEmail: 'Billing Email',
  paymentTerms: 'Payment Terms',
  vatNumber: 'VAT Number',
  invoiceDelivery: 'Invoice Delivery',
  clientId: 'Client ID',
  statusActive: 'Active',
  editInformation: 'Edit Information',
  manageClientId: 'Manage Client ID',
  ariaShowBilling: 'Show billing info',
  ariaHideBilling: 'Hide billing info',
  totalPurchases: 'Total purchases',
  totalCompensation: 'Total compensation',
  contacts: 'Contacts'
},
  localizationSettings: {
    timezone: 'Time Zone'
  },
  clientEditModal: {
    title: 'Edit Client Information',
    clientIcon: 'Client icon',
    lightMode: 'Light mode',
    pngLight: 'PNG Light',
    remove: 'Remove',
    change: 'Change',
    darkMode: 'Dark mode',
    pngDark: 'PNG Dark',
    clientName: 'Client Name',
    industry: 'Industry',
    regNumber: 'Reg. Number',
    address: 'Address',
    cancel: 'Cancel',
    saveChanges: 'Save Changes'
  },
  agreementDetailModal: {
    priceAgreementProposal: 'Price agreement proposal',
    pricingAgreementTerms: 'Pricing agreement terms',
    buyerLabel: 'Buyer:',
    sellerLabel: 'Seller:',
    pricePerTonLabel: 'Price (per ton):',
    expiryDateLabel: 'Expiry date:',
    editProposalButton: 'Edit Proposal',
    denyButton: 'Deny',
    approveButton: 'Approve'
  },
  agreementEditModal: {
    editProposalTitle: 'Edit pricing agreement proposal',
    newProposalTitle: 'New pricing agreement',
    buyer: 'Buyer',
    clientRole: 'Client',
    seller: 'Seller',
    processOwnerRole: 'Process Owner',
    agreementNameLabel: 'Agreement Name',
    pricePerTonLabel: 'Price (per ton)',
    setExpiryDateLabel: 'Set expiry date',
    expiryDateLabel: 'Expiry Date',
    placeholders: {
      year: 'Year',
      month: 'Month',
      day: 'Day',
      time: 'Time'
    },
    cancel: 'Cancel',
    makeChanges: 'Make Changes',
    createAgreement: 'Create Agreement'
  },
  pricingAgreementsSection: {
    title: 'Pricing agreements',
    searchPlaceholder: 'Search agreements...',
    filterAll: 'All',
    filterActive: 'Active',
    filterExpired: 'Expired',
    createNewButton: 'Create New Agreement',
    statusActive: 'Active',
    statusExpired: 'Expired'
  },
  kycPreview: {
    previewTitle: 'Preview',
    intro: 'This miniature flow mirrors the end-user onboarding. Toggle required fields to see how the checklist adapts in real time.',
    empty: 'No required fields selected. Enable at least one field to view the onboarding preview.',
    progressLabel: 'Progress',
    stepsSuffix: 'steps',
    stepLabel: 'Step',
    placeholderPrefix: 'Enter',
    stepDescriptions: {
      FIRST: 'Review ID instructions',
      MID: 'Add middle name (optional in most flows)',
      LAST: 'Add last name',
      PNR: 'Enter national ID / personal number',
      DOB: 'Confirm date of birth',
      GENDER: 'Select gender',
      NATIONALITY: 'Select nationality',
      ADDR: 'Provide residential address',
      ZIP: 'Enter postal / ZIP code',
      CITY: 'Add city of residence',
      COUNTRY: 'Select country',
      AREA: 'Set area / neighborhood',
      REGION: 'Choose state / region'
    },
    nextField: 'Next field',
    selectStep: 'Select a step from the checklist to inspect the preview.'
  }
};

export default en;
