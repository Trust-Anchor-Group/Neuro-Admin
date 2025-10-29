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
    deleteAccount: 'Delete Account',
    confirmTitle: 'Are you sure you want to delete your account?',
    confirmSubtitle: 'This action cannot be undone.',
    confirmDelete: 'Delete',
    cancel: 'Cancel',
    deletedMessage: 'Your account has been successfully deleted.'
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
    orders: 'Orders',
    clients: 'Clients'
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
};

export default en;
