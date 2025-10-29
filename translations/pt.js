const pt = {
  home: {
    title: 'Bem-vindo',
    subtitle: 'Seu painel em um relance',
    description: 'Esta é a página inicial.'
  },
  pendingApplications: {
    title: 'Aplicações pendentes',
    loading: 'Carregando...',
    empty: 'Nenhuma aplicação pendente.'
  },
  pendingApplicationsStatuses: {
    created: 'Criada',
    approved: 'Aprovada',
    denied: 'Negada',
    rejected: 'Rejeitada',
    pending: 'Pendente',
    active: 'Ativa',
    obsolete: 'Obsoleta',
    compromised: 'Comprometida'
  },
  PaginatedList: {
  titleIdApplications: 'Aplicações de ID',
  titleAccounts: 'Contas',
  searchPlaceholder: 'Buscar...',
  filterAll: 'Todas',
  filterHasId: 'Com ID',
  filterNoId: 'Sem ID',
  limit10: '10',
  limit25: '25',
  limit50: '50',
  limitAll: 'Mostrar tudo'
  },
  SettingsPageClient: {
    title: 'Configurações',
    kycTab: 'Configurações KYC',
    apiTab: 'Chaves de API'
  },
  KYCSettings: {
    title: 'Configurações de KYC',
    messages: {
      loadError: 'Falha ao carregar as configurações de KYC.',
      saveSuccess: 'Configurações atualizadas com sucesso!',
      saveError: 'Falha ao atualizar as configurações.'
    },
    sections: {
      peerReview: 'Configurações de revisão por pares',
      requiredFields: 'Campos obrigatórios para criação de ID'
    },
    fields: {
      requirePeerReview: 'Exigir revisão por pares',
      minPeerReviewers: 'Nº mín. de revisores exigidos',
      requirePhotos: 'Exigir fotos',
      minPhotos: 'Nº mín. de fotos exigidas'
    },
    labels: {
      FIRST: 'Nome',
      MID: 'Nome do meio',
      LAST: 'Sobrenome',
      PNR: 'Número pessoal',
      DOB: 'Data de nascimento',
      GENDER: 'Gênero',
      NATIONALITY: 'Nacionalidade',
      ADDR: 'Endereço',
      ZIP: 'CEP',
      CITY: 'Cidade',
      COUNTRY: 'País',
      AREA: 'Área',
      REGION: 'Região'
    },
    buttons: {
      reset: 'Redefinir alterações',
      save: 'Salvar configurações'
    },
    unauthorized: {
      title: 'Não autorizado',
      body: 'Privilégios de administrador são necessários para gerenciar as configurações de KYC.',
      help: 'Entre em contato com o administrador para obter ajuda.'
    }
  },
  KYCSetting: {
    title: 'Configurações de KYC',
    messages: {
      loadError: 'Falha ao carregar as configurações de KYC.',
      saveSuccess: 'Configurações atualizadas com sucesso!',
      saveError: 'Falha ao atualizar as configurações.'
    },
    sections: {
      peerReview: 'Configurações de revisão por pares',
      requiredFields: 'Campos obrigatórios para criação de ID'
    },
    fields: {
      requirePeerReview: 'Exigir revisão por pares',
      minPeerReviewers: 'Nº mín. de revisores exigidos',
      requirePhotos: 'Exigir fotos',
      minPhotos: 'Nº mín. de fotos exigidas'
    },
    labels: {
      FIRST: 'Nome',
      MID: 'Nome do meio',
      LAST: 'Sobrenome',
      PNR: 'Número pessoal',
      DOB: 'Data de nascimento',
      GENDER: 'Gênero',
      NATIONALITY: 'Nacionalidade',
      ADDR: 'Endereço',
      ZIP: 'CEP',
      CITY: 'Cidade',
      COUNTRY: 'País',
      AREA: 'Área',
      REGION: 'Região'
    },
    buttons: {
      reset: 'Redefinir alterações',
      save: 'Salvar configurações'
    },
    unauthorized: {
      title: 'Não autorizado',
      body: 'Privilégios de administrador são necessários para gerenciar as configurações de KYC.',
      help: 'Entre em contato com o administrador para obter ajuda.'
    }
  },
  apiKeyDetails: {
    title: 'Chave de API',
    back: 'Voltar para Chaves de API',
    loading: 'Carregando...',
    notFound: 'Chave de API não encontrada',
    labels: {
      owner: 'Proprietário:',
      email: 'E-mail:',
      apiKey: 'Chave de API:',
      secretKey: 'Chave secreta:',
      created: 'Criada:',
      maxAccounts: 'Máx. nº de contas:',
      accountsCreated: 'Contas criadas:',
      accountsDeleted: 'Contas excluídas:'
    }
  },
  apiKeyQR: {
    title: 'QR-code da chave de API',
    expirationLabel: 'Data e hora de expiração do QR-code (AAAA-MM-DD, Hora)',
    placeholders: {
      year: 'AAAA',
      month: 'MM',
      day: 'DD',
      time: 'Hora'
    },
    generateButton: 'Gerar QR-code',
    loading: 'Carregando QR-code...',
    scanHelp: 'Escaneie o QR-code para acessar o Neuron',
    downloadButton: 'Baixar QR-code',
    shareButton: 'Compartilhar QR-code',
    shareNotSupported: 'Compartilhamento não é suportado neste dispositivo.',
    error: 'Falha ao carregar o QR-code'
  },
  apiKeysList: {
    title: 'Chaves de API',
    columns: {
      owner: 'Proprietário',
      apiKey: 'Chave de API',
      ownerEmail: 'E-mail do proprietário',
      created: 'Criada'
    },
  },
    accountTableList: {
      columns: {
        idName: 'Nome do ID',
        identityStatus: 'Status da identidade',
        accountName: 'Nome da conta',
        email: 'E-mail',
        created: 'Criado'
      },
      statuses: {
        approved: 'Aprovado',
        compromised: 'Comprometido',
        created: 'ID pendente',
        obsoleted: 'Obsoleto',
        rejected: 'Rejeitado',
        none: 'Sem ID'
      }
    },
  pendingTable: {
    columns: {
      idName: 'Nome do ID',
      accountName: 'Conta',
      email: 'E-mail',
      location: 'Localização',
      created: 'Criado'
    },
    pendingActions: {
      See: 'Ver aplicação',
      review: 'Revisar aplicação'
    }
  },
  actionButtons: {
    reviewApplication: 'Revisar aplicação',
    compromiseId: 'Comprometer ID',
    obsoleteId: 'Obsoletar ID',
    confirm: 'Confirmar',
    cancel: 'Cancelar'
  },
  activity: {
    accountActivity: 'Atividade da conta',
    identityActivity: 'Atividade da identidade',
    comingSoon: 'Em breve'
  },
  displayDetails: {
    noData: 'Nenhum dado disponível',
    deleteAccount: 'Excluir conta',
    confirmTitle: 'Tem certeza de que deseja excluir sua conta?',
    confirmSubtitle: 'Esta ação não pode ser desfeita.',
    confirmDelete: 'Excluir',
    cancel: 'Cancelar',
    deletedMessage: 'Sua conta foi excluída com sucesso.'
  },
  buttons: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    close: 'Fechar',
    confirm: 'Confirmar'
  },
  navbar: {
    profile: 'Perfil',
    logout: 'Sair'
  },
  profilePage: {
    systemTitle: 'Sistema',
    languageLabel: 'Idioma',
    languageValueEnglish: 'Inglês',
    defaultThemeLabel: 'Tema padrão',
    defaultThemeTimed: 'Temporizado'
  },
  landing: {
    status: {
      active: 'Ativo',
      learnMore: 'Saiba mais'
    },
    services: {
      neuroAccess: {
        description: 'Gestão de identidade e acesso'
      },
      neuroCarbon: {
        description: 'Gestão de compensação de carbono'
      },
      neuroMonitor: {
        description: 'Monitoramento de ativos e processos'
      },
      neuroPayments: {
        description: 'Monitoramento e gestão de pagamentos'
      },
      neuroLeasing: {
        description: 'Portal de gestão de leasing'
      },
      neuronManagement: {
        description: 'Console de gestão de servidores'
      }
    },
    header: {
      welcomeTo: 'Bem-vindo ao',
      subtitle: 'Selecione para onde você deseja entrar'
    },
    labels: {
      manageServices: 'Gerenciar serviços',
      currentNeuron: 'Neurônio atual',
      destination: 'Destino',
      main: 'Principal'
    }
  }, 
  menu: {
    access: 'Access',
    accessSettings: 'Configurações de Access',
    idApplications: 'Aplicações de ID',
    accounts: 'Contas'
  },
  accessDashboard: {
    title: 'Painel Neuro-Access',
    subtitle: 'Insights em tempo real de gestão de identidade'
  },
  Identity: {
    noData: 'Nenhum dado disponível',
    noIdTitle: 'A conta não possui nenhuma ID',
    noIdDescription: 'Esta conta ainda não possui uma verificação de identidade.',
      applicationMade: 'Aplicação feita',
      registered: 'Registrado',
      actionTitles: {
        approved: 'Aprovar aplicação de ID',
        rejected: 'Negar aplicação de ID',
        compromised: 'Comprometer ID',
        obsoleted: 'Obsoletar ID'
      },
    statuses: {
      pending: 'Aplicação de ID pendente',
      active: 'ID ativa',
      obsoleted: 'ID obsoleta',
      compromised: 'ID comprometida',
      rejected: 'ID rejeitada'
    },
    labels: {
      idStatus: 'Status do ID',
      idCreated: 'ID criado',
      account: 'Conta',
      email: 'E-mail',
      country: 'País',
      phone: 'Telefone',
      created: 'Criado',
      fullName: 'Nome completo',
      firstname: 'Nome',
      nationality: 'Nacionalidade',
      address: 'Endereço',
      personalNumber: 'Número pessoal',
      dateOfBirth: 'Data de nascimento',
      back: 'Voltar',
      accountInformation: 'Informações da conta',
      accountTab: 'Conta',
      identityTab: 'Identidade'
    },
    sections: {
      identityInformation: 'Informações da Identidade',
      identityMetadata: 'Metadados da Identidade'
    },
    viewMoreInformation: 'Ver mais informações'
  },
  AssetMenu: {
    orders: 'Pedidos',
    clients: 'Clientes'
  },
  Clients: {
    title: 'Clientes de Ativos',
    subtitle: 'Visão geral da atividade de clientes relacionada a ativos',
    loading: 'Carregando clientes...',
    empty: 'Nenhum cliente disponível',
    summary: {
      total: 'Total',
      activeOrders: 'Pedidos ativos',
      totalClients: 'Total de clientes',
      pendingOrders: 'Pedidos pendentes'
    },
    table: {
      columns: {
        facilityId: 'ID da Instalação',
        name: 'Nome',
        address: 'Endereço',
        carbonProcessed: 'Carbono Processado Total',
        status: 'Status'
      },
      statusActive: 'Ativo',
      statusInactive: 'Inativo'
    }
  },
  modal: {
    title: 'Revisar aplicação de ID',
  applicantPhoto: 'Foto do aplicante',
    noPhoto: 'Sem foto',
  applicantIdentification: 'Identificação do aplicante',
    identificationChosen: 'Identificação escolhida',
    nationalIdCard: 'Cartão de identidade nacional',
    noFrontImage: 'Sem imagem frontal',
    noBackImage: 'Sem imagem traseira',
    personalInformation: 'Informações pessoais',
    fullName: 'Nome completo',
    country: 'País',
    dateOfBirth: 'Data de nascimento',
    identityNumber: 'Número de identidade',
    address: 'Endereço',
    email: 'E-mail',
    phoneNumber: 'Telefone',
    companyInformation: 'Informações da empresa',
    idNumber: 'Número de ID',
    legalName: 'Nome legal',
    city: 'Cidade',
    zip: 'CEP',
    region: 'Região',
    companyCountry: 'País',
    legalRepresentation: 'Representação legal',
    yes: 'Sim',
    no: 'Não',
    companyLegalDocument: 'Documento legal da empresa',
  denialReasonLabel: 'Motivo da negação da aplicação de ID',
  denialReasonHint: '(Será enviado ao aplicante)',
    denyButton: 'Negar aplicação de ID',
    approveButton: 'Aprovar aplicação de ID',
  cancelDenial: 'Cancelar negação',
  submitDenial: 'Enviar negação',
    confirm: {
      approved: {
        state: 'Tem certeza de que deseja aprovar esta aplicação de ID?',
        email: 'O usuário será notificado por e-mail.'
      },
      rejected: {
        state: 'Tem certeza de que deseja rejeitar esta aplicação de ID?',
        email: 'O usuário será notificado por e-mail.'
      },
      compromised: {
        state: 'Tem certeza de que deseja alterar esta identidade para comprometida?',
        email: 'O usuário será notificado por e-mail.'
      },
      obsoleted: {
        state: 'Tem certeza de que deseja alterar esta identidade para obsoleta?',
        email: 'O usuário será notificado por e-mail.'
      },
      default: {
        state: 'Tem certeza?',
        email: 'O usuário será notificado.'
      }
    }
  }
  ,
  profileEditModal: {
    editPersonal: 'Editar informações pessoais',
    editClient: 'Editar informações do cliente',
    profilePageLegend: 'Página de perfil',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    nationality: 'Nacionalidade',
    personalNumber: 'Número pessoal',
    email: 'E-mail',
    phoneNumber: 'Número de telefone',
    language: 'Idioma',
    clientSettingsLegend: 'Configurações do cliente',
    cancel: 'Cancelar'
  }
  ,
  themeToggle: {
    light: 'Modo claro',
    dark: 'Modo escuro'
  }
};

export default pt;
