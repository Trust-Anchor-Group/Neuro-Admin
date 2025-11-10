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
    cancelOrder: 'Cancelar pedido',
    confirmTitle: 'Tem certeza de que deseja cancelar seu pedido?',
    confirmSubtitle: 'Esta ação não pode ser desfeita.',
    confirmDelete: 'Cancelar',
    cancel: 'Cancelar',
    deletedMessage: 'Sua conta foi excluída com sucesso.',
    certificateTitle: 'Informações do Certificado',
    certificateDescription: 'O token valida o processo de compensação tokenizada de emissões de carbono. O proprietário compra o Carbon Token da Creturner que compensa uma quantidade específica de CO₂e.'
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
      },
      neuroAssets: {
        description: 'Gestão de ativos digitais'
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
    title: 'Assets',
    orders: 'Pedidos',
    clients: 'Clientes',
    coffee: 'Café'
  },
  Clients: {
    title: 'Clientes de Assets',
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
  ,
  Manage: {
    pageTitle: 'Atividade do cliente',
    searchPlaceholder: 'Buscar atividade',
    filterAll: 'Tudo',
    comingSoon: 'Em breve',
    sections: {
      identityInformation: 'Informações da identidade',
      identityMetadata: 'Metadados da identidade'
    },
    labels: {
      clientType: 'Tipo de cliente:',
      clientName: 'Nome do cliente:',
      identityNumber: 'Número de identidade:',
      countryOfOrigin: 'País de origem:',
      address: 'Endereço:',
      originDate: 'Data de origem:',
      email: 'E-mail:',
      phoneNumber: 'Número de telefone:'
    },
    metadata: {
      requestedFlags: 'Flags solicitadas:',
      educationSources: 'Fontes de educação:',
      documents: 'Documentos:',
      lastRenewal: 'Última renovação',
      complianceLevel: 'Nível de conformidade',
      delegatedAdmins: 'Administradores delegados',
      suspensionReason: 'Motivo da suspensão',
      escalationContact: 'Contato de escalonamento',
      requiredSteps: 'Etapas necessárias'
    },
    statuses: {
      pending: 'Aplicação de ID pendente',
      active: 'ID ativa',
      obsoleted: 'ID obsoleta'
    },
    actions: {
      deny: 'Negar aplicação de ID',
      approve: 'Aprovar aplicação de ID',
      suspend: 'Suspender ID',
      obsolete: 'Tornar ID obsoleta'
    }
  }
  ,
  assetClientDetail: {
    tabs: {
      overview: 'Visão geral',
      orders: 'Pedidos',
      manage: 'Gerenciar'
    },
    summary: {
      total: 'Total',
      activeOrders: 'Pedidos ativos',
      pendingOrders: 'Pedidos pendentes'
    },
    units: {
      tons: 'ton'
    },
    headings: {
      orders: 'Pedidos'
    },
    loading: {
      orders: 'Carregando pedidos...'
    }
  }
  ,
  assetOrders: {
    heading: 'Pedidos de Assets',
    summary: {
      total: 'Total',
      active: 'Pedidos ativos',
      pending: 'Pedidos pendentes'
    },
    units: {
      tons: 'ton'
    },
    loading: 'Carregando pedidos...'
  }
  ,
  userCard: {
    thisMonth: 'Este mês',
    types: {
      amountSold: 'Quantidade vendida',
      totalVolumeCompensated: 'Volume total compensado'
    }
  },
  assetDashboard: {
    heading: 'Painel de Assets'
  }
  ,
  certificateButtons: {
    download: 'Baixar certificado',
    share: 'Compartilhar certificado'
  }
  ,
  assetOrderDetail: {
    tabs: {
      order: 'Detalhe do pedido',
      certificate: 'Certificado',
      process: 'Processo'
    },
    headings: {
      orderDetails: 'Detalhes do pedido',
      orderCertificate: 'Certificado do pedido',
      certificateInformation: 'Informações do certificado'
    },
    fields: {
      orderName: 'Nome do pedido',
      comment: 'Comentário',
      orderType: 'Tipo de pedido',
      orderQuantity: 'Quantidade do pedido',
      orderDate: 'Data do pedido',
      orderedBy: 'Pedido por',
      created: 'Criado'
    },
    certificateFields: {
      name: 'Nome',
      creator: 'Criador',
      category: 'Categoria',
      visibility: 'Visibilidade',
      updated: 'Atualizado',
      tokenId: 'ID do Token',
      owner: 'Proprietário',
      currency: 'Moeda',
      created: 'Criado',
      validUntil: 'Válido até'
    },
    statusBox: {
      status: 'Status',
      progress: 'Progresso',
      amount: 'Quantidade',
      complete: 'concluído'
    }
  }
  ,
  processPage: {
    progress: {
      title: 'Progresso da compensação',
      descriptionTotal: 'Acompanhando o volume compensado ao longo do tempo',
      descriptionRelative: 'Comparando cada fase em relação ao total do pedido',
      relative: 'Relativo',
      total: 'Total',
      noData: 'Nenhum dado disponível'
    },
    summary: {
      totalValue: 'Valor total',
      totalCompensation: 'Compensação total'
    },
    activity: {
      title: 'Atividade do processo',
      searchPlaceholder: 'Buscar atualizações',
      filterAll: 'Tudo',
      comingSoon: 'Em breve'
    },
    units: {
      tons: 'tons'
    },
    misc: {
      completeSuffix: '% concluído'
    },
    status: {
      label: 'Status',
      states: {
        inProgress: 'Em progresso',
        paused: 'Pausado',
        aborted: 'Abortado',
        complete: 'Concluído',
        notStarted: 'Não iniciado'
      },
      terminate: 'Encerrar processo'
    },
    actions: {
      terminate: 'Encerrar processo'
    }
  },
  clientOverview: {
  companyInformation: 'Informações da Empresa',
  regNumber: 'Nº de Registro',
  industry: 'Setor',
  location: 'Localização',
  billingInfo: 'Informações de Faturamento',
  billingEmail: 'E-mail de faturamento',
  paymentTerms: 'Termos de pagamento',
  vatNumber: 'Nº IVA',
  invoiceDelivery: 'Entrega da fatura',
  clientId: 'ID do Cliente',
  statusActive: 'Ativo',
  editInformation: 'Editar informações',
  manageClientId: 'Gerenciar ID do Cliente',
  ariaShowBilling: 'Mostrar informações de faturamento',
  ariaHideBilling: 'Ocultar informações de faturamento',
  totalPurchases: 'Total de compras',
  totalCompensation: 'Compensação total',
  contacts: 'Contatos'
}
,
  clientEditModal: {
    title: 'Editar informações do cliente',
    clientIcon: 'Ícone do cliente',
    lightMode: 'Modo claro',
    pngLight: 'PNG claro',
    remove: 'Remover',
    change: 'Alterar',
    darkMode: 'Modo escuro',
    pngDark: 'PNG escuro',
    clientName: 'Nome do cliente',
    industry: 'Setor',
    regNumber: 'Nº de registro',
    address: 'Endereço',
    cancel: 'Cancelar',
    saveChanges: 'Salvar alterações'
  },
  agreementDetailModal: {
    priceAgreementProposal: 'Proposta de acordo de preço',
    pricingAgreementTerms: 'Termos do acordo de preço',
    buyerLabel: 'Comprador:',
    sellerLabel: 'Vendedor:',
    pricePerTonLabel: 'Preço (por tonelada):',
    expiryDateLabel: 'Data de expiração:',
    editProposalButton: 'Editar Proposta',
    denyButton: 'Negar',
    approveButton: 'Aprovar'
  },
  agreementEditModal: {
    editProposalTitle: 'Editar proposta de acordo de preço',
    newProposalTitle: 'Nova proposta de acordo de preço',
    buyer: 'Comprador',
    clientRole: 'Cliente',
    seller: 'Vendedor',
    processOwnerRole: 'Responsável pelo processo',
    agreementNameLabel: 'Nome do acordo',
    pricePerTonLabel: 'Preço (por tonelada)',
    setExpiryDateLabel: 'Definir data de expiração',
    expiryDateLabel: 'Data de expiração',
    placeholders: {
      year: 'Ano',
      month: 'Mês',
      day: 'Dia',
      time: 'Hora'
    },
    cancel: 'Cancelar',
    makeChanges: 'Fazer alterações',
    createAgreement: 'Criar acordo'
  },
  pricingAgreementsSection: {
    title: 'Acordos de preços',
    searchPlaceholder: 'Pesquisar acordos...',
    filterAll: 'Todos',
    filterActive: 'Ativo',
    filterExpired: 'Expirado',
    createNewButton: 'Criar novo acordo',
    statusActive: 'Ativo',
    statusExpired: 'Expirado'
  },
  localizationSettings: {
    timezone: 'Fuso horário'
  },
  kycPreview: {
    previewTitle: 'Pré-visualização Beta',
    intro: 'Este fluxo reduzido espelha a experiência de onboarding do usuário final. Ative campos obrigatórios para ver a lista se adaptar em tempo real.',
    empty: 'Nenhum campo obrigatório selecionado. Ative pelo menos um para ver a pré-visualização.',
    progressLabel: 'Progresso',
    stepsSuffix: 'etapas',
    stepLabel: 'Etapa',
    placeholderPrefix: 'Inserir',
    stepDescriptions: {
      FIRST: 'Revisar instruções de identificação',
      MID: 'Adicionar nome do meio (opcional)',
      LAST: 'Adicionar sobrenome',
      PNR: 'Inserir número de identificação nacional / pessoal',
      DOB: 'Confirmar data de nascimento',
      GENDER: 'Selecionar gênero',
      NATIONALITY: 'Selecionar nacionalidade',
      ADDR: 'Fornecer endereço residencial',
      ZIP: 'Inserir CEP',
      CITY: 'Adicionar cidade de residência',
      COUNTRY: 'Selecionar país',
      AREA: 'Definir área / bairro',
      REGION: 'Escolher estado / região'
    },
    nextField: 'Próximo campo',
    selectStep: 'Selecione uma etapa na lista para ver os detalhes.'
  }
};



export default pt;
