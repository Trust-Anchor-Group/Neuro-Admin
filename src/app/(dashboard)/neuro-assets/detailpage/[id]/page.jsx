'use client'
import React, { useMemo, useState, useCallback, Suspense, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation';
import { FaCertificate, FaRegFileAlt } from 'react-icons/fa';

// Components
import { DisplayDetailsAsset } from '@/components/assets/DisplayDetailsAsset'
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { TabNavigation } from '@/components/shared/TabNavigation';
import { StatusBox } from '@/components/assets/StatusBox';
import { CertificateBox } from '@/components/assets/CertificateBox';
import { PublishBox } from '@/components/assets/PublishBox';
import { updateProject as updateProjectFlow } from '@/lib/projectWizard';
import { listIssuers, listIssuerLocalizations, uploadIssuerProfilePhoto } from '@/lib/projectAdmin';
import { MEDIA_RULES, validateFileSize, validateImageFile } from '@/lib/mediaValidation';
import { mapBackendValidationError } from '@/lib/backendValidation';

// Hooks & Data
import { useLanguage, content as translations } from '../../../../../../context/LanguageContext';

const Field = ({ label, children }) => (
  <label className='flex flex-col gap-1'>
    <span className='text-sm font-medium text-[var(--brand-text-secondary)]'>{label}</span>
    {children}
  </label>
);

const MAX_TAGS = 12;
const MAX_TAG_LENGTH = 30;
const READING_WORDS_PER_MINUTE = 180;
const VISIBILITY_OPTIONS = ["Private", "Unlisted", "Public"];

const sanitizeTags = (rawValue) => {
  const values = Array.isArray(rawValue)
    ? rawValue
    : String(rawValue || '').split(',');

  const uniqueTags = [];
  const seen = new Set();

  values.forEach((entry) => {
    const cleaned = String(entry || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    const truncated = cleaned.slice(0, MAX_TAG_LENGTH);
    const normalizedKey = truncated.toLowerCase();
    if (seen.has(normalizedKey)) return;
    seen.add(normalizedKey);
    uniqueTags.push(truncated);
  });

  return uniqueTags.slice(0, MAX_TAGS);
};

const tagsToInput = (tags) => (Array.isArray(tags) ? tags.join(', ') : '');

const TagPreview = ({ tags }) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return <span className='text-xs text-[var(--brand-text-secondary)]'>No tags yet.</span>;
  }

  return (
    <div className='mt-2 flex flex-wrap gap-1'>
      {tags.map((tag) => (
        <span key={tag} className='rounded-full border border-[var(--brand-border)] bg-[var(--brand-background)] px-2 py-0.5 text-xs text-[var(--brand-text)]'>
          {tag}
        </span>
      ))}
    </div>
  );
};

const normalizeTextBlock = (value) => String(value || '')
  .replace(/\r\n/g, '\n')
  .split('\n')
  .map((line) => line.replace(/\s+$/g, ''))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const getDescriptionStats = (value) => {
  const raw = String(value || '');
  const trimmed = raw.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE));
  return {
    words,
    characters: trimmed.length,
    paragraphs,
    readMinutes,
  };
};

const DescriptionInsights = ({ value, mode }) => {
  const stats = getDescriptionStats(value);
  const isShort = mode === 'short';
  const qualityText = isShort
    ? (stats.characters < 80 ? 'Try 80+ chars for better marketplace cards.' : 'Good summary length for listing cards.')
    : (stats.paragraphs < 2 ? 'Consider splitting into sections for readability.' : 'Structured well for long-form reading.');

  return (
    <div className='rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]'>
      <div className='flex flex-wrap gap-3'>
        <span>{stats.characters} chars</span>
        <span>{stats.words} words</span>
        {!isShort ? <span>{stats.paragraphs} paragraphs</span> : null}
        {!isShort ? <span>~{stats.readMinutes} min read</span> : null}
      </div>
      <p className='mt-1'>{qualityText}</p>
    </div>
  );
};

const DetailPageAssets = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'Token';

  const { language } = useLanguage();
  const t = translations[language];

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [deletingMediaKeys, setDeletingMediaKeys] = useState(() => new Set());
  const [fieldErrors, setFieldErrors] = useState({});
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState({ errors: {}, warnings: {} });
  const [tagDrafts, setTagDrafts] = useState({
    'en-US': '',
    'pt-PT': '',
  });
  const [editProjectId, setEditProjectId] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [issuerOptions, setIssuerOptions] = useState([]);
  const [issuersLoading, setIssuersLoading] = useState(false);
  const [issuersError, setIssuersError] = useState('');
  const [issuer, setIssuer] = useState({
    'en-US': {
      name: '',
      about: '',
      location: '',
      industry: '',
    },
    'pt-PT': {
      name: '',
      about: '',
      location: '',
      industry: '',
    },
  });
  const [issuerLogoUrl, setIssuerLogoUrl] = useState('');
  const [issuerLogoFile, setIssuerLogoFile] = useState(null);
  const [projectFinancials, setProjectFinancials] = useState({
    token_price: 0,
    token_premium: 0,
    min_investment: 0,
    max_investment: 0,
    project_country_code: '',
    visibility: 'Private',
    start_date: '',
    end_date: '',
  });
  const [projectContent, setProjectContent] = useState({
    'en-US': {
      title: '',
      asset_type: '',
      short_description: '',
      long_description: '',
      tags: [],
    },
    'pt-PT': {
      title: '',
      asset_type: '',
      short_description: '',
      long_description: '',
      tags: [],
    },
  });
  const [existingMedia, setExistingMedia] = useState({
    'en-US': [],
    'pt-PT': [],
  });
  const [mediaToRemove, setMediaToRemove] = useState({
    imageIds: [],
    deleteThumbnail: false,
    resourceIds: [],
  });
  const [newMedia, setNewMedia] = useState({
    thumbnail: null,
    newGalleryImages: [],
    newResources: [],
  });

  const projectId = useMemo(() => {
    if (Array.isArray(id)) return id[0] || '';
    return id || '';
  }, [id]);

  const backendHost = useMemo(() => {
    const storedHost = typeof window !== 'undefined'
      ? String(sessionStorage.getItem('AgentAPI.Host') || '').trim()
      : '';

    const sanitizedStoredHost = storedHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    if (sanitizedStoredHost) return sanitizedStoredHost;

    return process.env.NEXT_PUBLIC_AGENT_HOST || process.env.AGENT_HOST || 'mateo.lab.tagroot.io';
  }, []);
  const resolveBackendAssetUrl = useCallback((rawUrl) => {
    const value = String(rawUrl || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/nex-resources/')) return `https://${backendHost}${value}`;
    return value.startsWith('/') ? value : `/${value}`;
  }, [backendHost]);

  const readApiData = (payload) => payload?.data?.data ?? payload?.data ?? null;
  const getIssuerLogoUrl = useCallback((localizationEntry) => {
    const candidates = [
      localizationEntry?.profile_photo?.url,
      localizationEntry?.profilePhoto?.url,
      localizationEntry?.issuer_profile_photo?.url,
      localizationEntry?.issuerProfilePhoto?.url,
      localizationEntry?.image?.url,
      localizationEntry?.photo?.url,
      localizationEntry?.logo?.url,
      localizationEntry?.logo_url,
      localizationEntry?.image_url,
      localizationEntry?.photo_url,
    ];

    const found = candidates.find((value) => typeof value === 'string' && value.trim()) || '';
    return resolveBackendAssetUrl(found);
  }, [resolveBackendAssetUrl]);
  const readLocalizationNode = (record) => {
    if (record?.localization && typeof record.localization === 'object') {
      return record.localization;
    }
    return record || null;
  };

  const toContent = (localization, fallbackProjectData) => ({
    title: localization?.title || fallbackProjectData?.token?.project_label || '',
    asset_type: localization?.asset_type || fallbackProjectData?.token?.project_type || '',
    short_description: localization?.short_description || '',
    long_description: localization?.long_description || fallbackProjectData?.token?.description || '',
    tags: Array.isArray(localization?.tags) ? localization.tags : [],
  });

  const toDateTimeInputValue = (value) => {
    if (value === null || value === undefined || value === '') return '';

    const formatLocalDateTime = (dateObject) => {
      const pad = (part) => String(part).padStart(2, '0');
      return `${dateObject.getFullYear()}-${pad(dateObject.getMonth() + 1)}-${pad(dateObject.getDate())}T${pad(dateObject.getHours())}:${pad(dateObject.getMinutes())}:${pad(dateObject.getSeconds())}`;
    };

    if (typeof value === 'number' || /^\d+$/.test(String(value))) {
      const seconds = Number(value);
      if (!Number.isFinite(seconds) || seconds <= 0) return '';
      return formatLocalDateTime(new Date(seconds * 1000));
    }

    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) return '';
    return formatLocalDateTime(parsed);
  };

  const formatDateForDisplay = (value) => {
    const normalized = toDateTimeInputValue(value);
    if (!normalized) return 'N/A';
    return new Date(normalized).toLocaleString();
  };

  const toMediaList = (localization) => {
    const media = [];

    const thumbnail = localization?.project_thumbnail;
    if (thumbnail?.file_url || thumbnail?.url) {
      media.push({
        id: thumbnail?.image_id || thumbnail?.id || null,
        url: thumbnail?.file_url || thumbnail?.url || '',
        type: 'thumbnail',
        title: thumbnail?.title || thumbnail?.description || '',
      });
    }

    const images = Array.isArray(localization?.images)
      ? localization.images
      : (Array.isArray(localization?.project_images) ? localization.project_images : []);

    images.forEach((image) => {
        media.push({
          id: image?.image_id || image?.id || null,
          url: image?.file_url || image?.url || '',
          type: 'image',
          title: image?.title || image?.description || '',
        });
      });

    const resources = Array.isArray(localization?.resources)
      ? localization.resources
      : (Array.isArray(localization?.project_resources) ? localization.project_resources : []);

    resources.forEach((resource) => {
        media.push({
          id: resource?.resource_id || resource?.id || null,
          url: resource?.file_url || resource?.url || '',
          type: 'resource',
          title: resource?.title || resource?.description || '',
        });
      });

    return media;
  };

  const loadProjectData = useCallback(async (currentProjectId) => {
    if (!currentProjectId) return;

    setIsLoading(true);
    setLoadError('');

    try {
      const coreResponse = await fetch(`/api/projects/${encodeURIComponent(currentProjectId)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        credentials: 'include',
      });

      if (!coreResponse.ok) {
        throw new Error(`Failed to fetch project core data: ${coreResponse.status}`);
      }

      const corePayload = await coreResponse.json();
      const coreProject = readApiData(corePayload);

      if (!coreProject?.project_id) {
        throw new Error('Project not found');
      }

      const resolvedProjectId = coreProject?.project_id || currentProjectId;
      const resolvedIssuerId = coreProject?.token?.issuer_id || '';

      setProject(coreProject);
      setEditProjectId(resolvedProjectId);
      setIssuerId(resolvedIssuerId);
      setProjectFinancials({
        token_price: Number(coreProject?.token_price || 0),
        token_premium: Number(coreProject?.token_premium || 0),
        min_investment: Number(coreProject?.min_investment || 0),
        max_investment: Number(coreProject?.max_investment || 0),
        project_country_code: String(coreProject?.token?.project_country_code || coreProject?.token?.project_country || '').toUpperCase(),
        visibility: (() => {
          const raw = String(coreProject?.visibility || '').trim().toLowerCase();
          if (raw === 'public') return 'Public';
          if (raw === 'unlisted') return 'Unlisted';
          return 'Private';
        })(),
        start_date: toDateTimeInputValue(coreProject?.start_date),
        end_date: toDateTimeInputValue(coreProject?.end_date),
      });

      const [enResponse, ptResponse] = await Promise.all([
        fetch('/api/projects?localization=en-US', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        }),
        fetch('/api/projects?localization=pt-PT', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        }),
      ]);

      const [enPayload, ptPayload] = await Promise.all([
        enResponse.ok ? enResponse.json() : Promise.resolve(null),
        ptResponse.ok ? ptResponse.json() : Promise.resolve(null),
      ]);

      const enListRaw = readApiData(enPayload);
      const ptListRaw = readApiData(ptPayload);
      const enList = Array.isArray(enListRaw) ? enListRaw : [];
      const ptList = Array.isArray(ptListRaw) ? ptListRaw : [];

      const enRecord = enList.find((item) => item?.project_id === resolvedProjectId) || null;
      const ptRecord = ptList.find((item) => item?.project_id === resolvedProjectId) || null;
      const enLocalization = readLocalizationNode(enRecord);
      const ptLocalization = readLocalizationNode(ptRecord);

      setProjectContent({
        'en-US': toContent(enLocalization, coreProject),
        'pt-PT': toContent(ptLocalization, coreProject),
      });
      setTagDrafts({
        'en-US': tagsToInput(toContent(enLocalization, coreProject).tags),
        'pt-PT': tagsToInput(toContent(ptLocalization, coreProject).tags),
      });

      setExistingMedia({
        'en-US': toMediaList(enLocalization),
        'pt-PT': toMediaList(ptLocalization),
      });

      let issuerLocalizations = [];
      if (resolvedIssuerId) {
        const issuerLocalizationResponse = await fetch(`/api/issuers/${encodeURIComponent(resolvedIssuerId)}/localization`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          credentials: 'include',
        });

        if (issuerLocalizationResponse.ok) {
          const issuerLocalizationPayload = await issuerLocalizationResponse.json();
          const issuerData = readApiData(issuerLocalizationPayload);
          issuerLocalizations = Array.isArray(issuerData)
            ? issuerData
            : (issuerData ? [issuerData] : []);
        }
      }

      const issuerEn = issuerLocalizations.find((entry) => entry?.localization === 'en-US') || issuerLocalizations[0] || {};
      const issuerPt = issuerLocalizations.find((entry) => entry?.localization === 'pt-PT') || {};

      setIssuer({
        'en-US': {
          name: issuerEn?.name || coreProject?.token?.issuer_name || '',
          about: issuerEn?.about || '',
          location: issuerEn?.location || '',
          industry: issuerEn?.industry || '',
        },
        'pt-PT': {
          name: issuerPt?.name || issuerEn?.name || coreProject?.token?.issuer_name || '',
          about: issuerPt?.about || issuerEn?.about || '',
          location: issuerPt?.location || issuerEn?.location || '',
          industry: issuerPt?.industry || issuerEn?.industry || '',
        },
      });
      setIssuerLogoUrl(getIssuerLogoUrl(issuerEn || issuerPt));
      setIssuerLogoFile(null);

      setMediaToRemove({ imageIds: [], deleteThumbnail: false, resourceIds: [] });
      setNewMedia({ thumbnail: null, newGalleryImages: [], newResources: [] });
    } catch (error) {
      setProject(null);
      setLoadError(error?.message || 'Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjectData(projectId);
  }, [projectId, loadProjectData]);

  useEffect(() => {
    let active = true;

    const loadIssuers = async () => {
      setIssuersLoading(true);
      setIssuersError('');

      try {
        const data = await listIssuers();
        if (!active) return;

        const options = (Array.isArray(data) ? data : []).map((item) => ({
          id: item?.issuer_id || item?.id || '',
          label: item?.issuer_name || item?.name || item?.issuer_id || item?.id || 'Unknown issuer',
        })).filter((item) => item.id);

        setIssuerOptions(options);
      } catch (error) {
        if (!active) return;
        setIssuersError(error?.message || 'Failed to list issuers');
      } finally {
        if (active) {
          setIssuersLoading(false);
        }
      }
    };

    loadIssuers();

    return () => {
      active = false;
    };
  }, []);

  const hasUploadErrors = useMemo(
    () => Object.values(uploadFeedback.errors || {}).some((message) => String(message || '').trim()),
    [uploadFeedback.errors]
  );

  const onIssuerChange = (localization, event) => {
    const { name, value } = event.target;
    setIssuer((prev) => ({
      ...prev,
      [localization]: {
        ...prev[localization],
        [name]: value,
      },
    }));

    if (localization === 'en-US' && name === 'name') {
      const trimmed = String(value || '').trim();
      setFieldErrors((prev) => ({ ...prev, issuerName: '' }));
      setUploadFeedback((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          issuerName: trimmed && (trimmed.length < 5 || trimmed.length > 40)
            ? 'Issuer name must be between 5 and 40 characters.'
            : '',
        },
      }));
    }
  };

  const onIssuerSelectionChange = async (event) => {
    const nextIssuerId = event.target.value;
    setIssuerId(nextIssuerId);

    if (!nextIssuerId) return;

    try {
      const localizations = await listIssuerLocalizations(nextIssuerId);
      const list = Array.isArray(localizations) ? localizations : [];
      const en = list.find((entry) => entry?.localization === 'en-US') || list[0] || {};
      const pt = list.find((entry) => entry?.localization === 'pt-PT') || {};

      setIssuer((prev) => ({
        ...prev,
        'en-US': {
          name: en?.name || prev['en-US'].name || '',
          about: en?.about || prev['en-US'].about || '',
          location: en?.location || prev['en-US'].location || '',
          industry: en?.industry || prev['en-US'].industry || '',
        },
        'pt-PT': {
          name: pt?.name || prev['pt-PT'].name || en?.name || prev['en-US'].name || '',
          about: pt?.about || prev['pt-PT'].about || en?.about || prev['en-US'].about || '',
          location: pt?.location || prev['pt-PT'].location || en?.location || prev['en-US'].location || '',
          industry: pt?.industry || prev['pt-PT'].industry || en?.industry || prev['en-US'].industry || '',
        },
      }));
      setIssuerLogoUrl(getIssuerLogoUrl(en));
      setIssuerLogoFile(null);
    } catch {
    }
  };

  const onIssuerLogoChange = (event) => {
    const file = event.target.files?.[0] || null;

    validateImageFile(file, {
      label: 'Issuer logo',
      maxBytes: MEDIA_RULES.imageMaxBytes,
      minWidth: MEDIA_RULES.logoMinWidth,
      minHeight: MEDIA_RULES.logoMinHeight,
    }).then((result) => {
      setUploadFeedback((prev) => ({
        ...prev,
        errors: { ...prev.errors, issuerLogo: result.error || '' },
        warnings: { ...prev.warnings, issuerLogo: result.warning || '' },
      }));

      if (result.error) {
        setIssuerLogoFile(null);
        return;
      }

      setIssuerLogoFile(file);
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setIssuerLogoUrl(objectUrl);
      }
    });
  };

  const onFinancialChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === 'currency') {
      value = String(value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      setProjectFinancials((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === 'start_date' || name === 'end_date') {
      setFieldErrors((prev) => ({ ...prev, startDate: '', endDate: '' }));
      setProjectFinancials((prev) => ({ ...prev, [name]: String(value || '') }));
      return;
    }

    if (name === 'visibility') {
      setProjectFinancials((prev) => ({ ...prev, visibility: String(value || '') }));
      return;
    }

    setProjectFinancials((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const onTagInputChange = (localization, value) => {
    setTagDrafts((prev) => ({
      ...prev,
      [localization]: value,
    }));

    onContentChange(localization, 'tags', sanitizeTags(value));
  };

  const onTagInputBlur = (localization) => {
    setTagDrafts((prev) => ({
      ...prev,
      [localization]: tagsToInput(sanitizeTags(prev[localization])),
    }));
  };

  const onDescriptionBlur = (localization, field) => {
    const current = projectContent?.[localization]?.[field] || '';
    const normalized = normalizeTextBlock(current);
    if (normalized === current) return;
    onContentChange(localization, field, normalized);
  };

  const copyEnContentToPt = () => {
    const enContent = projectContent?.['en-US'] || {};
    const nextPtTags = sanitizeTags(enContent.tags || []);

    setProjectContent((prev) => ({
      ...prev,
      'pt-PT': {
        ...prev['pt-PT'],
        title: enContent.title || '',
        asset_type: enContent.asset_type || '',
        short_description: enContent.short_description || '',
        long_description: enContent.long_description || '',
        tags: nextPtTags,
      },
    }));

    setTagDrafts((prev) => ({
      ...prev,
      'pt-PT': tagsToInput(nextPtTags),
    }));
  };

  const onContentChange = (localization, key, value) => {
    setProjectContent((prev) => ({
      ...prev,
      [localization]: {
          ...prev[localization],
          [key]: value,
      },
    }));
  };

  const onMediaRemoveChange = (key, value) => {
    setMediaToRemove((prev) => ({ ...prev, [key]: value }));
  };

  const isMediaMarkedForRemoval = (item) => {
    if (!item) return false;
    if (item.type === 'thumbnail') return Boolean(mediaToRemove.deleteThumbnail);
    if (!item.id) return false;
    if (item.type === 'image') return mediaToRemove.imageIds.includes(item.id);
    if (item.type === 'resource') return mediaToRemove.resourceIds.includes(item.id);
    return false;
  };

  const getMediaProgressKey = (item) => {
    if (!item) return '';
    if (item.type === 'thumbnail') return 'thumbnail';
    return `${item.type}:${String(item.id || '')}`;
  };

  const isDeletingMediaItem = (item) => deletingMediaKeys.has(getMediaProgressKey(item));

  const onExistingMediaToggle = (item, checked) => {
    if (!item) return;

    if (item.type === 'thumbnail') {
      setMediaToRemove((prev) => ({ ...prev, deleteThumbnail: checked }));
      return;
    }

    if (!item.id) return;

    if (item.type === 'image') {
      setMediaToRemove((prev) => ({
        ...prev,
        imageIds: checked
          ? Array.from(new Set([...prev.imageIds, item.id]))
          : prev.imageIds.filter((idValue) => idValue !== item.id),
      }));
      return;
    }

    if (item.type === 'resource') {
      setMediaToRemove((prev) => ({
        ...prev,
        resourceIds: checked
          ? Array.from(new Set([...prev.resourceIds, item.id]))
          : prev.resourceIds.filter((idValue) => idValue !== item.id),
      }));
    }
  };

  const onNewThumbnailChange = async (event) => {
    const file = event.target.files?.[0] || null;

    const result = await validateImageFile(file, {
      label: 'Thumbnail',
      maxBytes: MEDIA_RULES.imageMaxBytes,
      minWidth: MEDIA_RULES.mediaMinWidth,
      minHeight: MEDIA_RULES.mediaMinHeight,
    });

    setUploadFeedback((prev) => ({
      ...prev,
      errors: { ...prev.errors, thumbnail: result.error || '' },
      warnings: { ...prev.warnings, thumbnail: result.warning || '' },
    }));

    if (result.error) {
      setNewMedia((prev) => ({ ...prev, thumbnail: null }));
      return;
    }

    setNewMedia((prev) => ({ ...prev, thumbnail: file }));
  };

  const onNewGalleryChange = async (event) => {
    const files = Array.from(event.target.files || []);

    const acceptedFiles = [];
    const errors = [];
    const warnings = [];

    for (const file of files) {
      const result = await validateImageFile(file, {
        label: `Gallery image ${file.name}`,
        maxBytes: MEDIA_RULES.imageMaxBytes,
        minWidth: MEDIA_RULES.mediaMinWidth,
        minHeight: MEDIA_RULES.mediaMinHeight,
      });

      if (result.error) {
        errors.push(result.error);
        continue;
      }

      if (result.warning) {
        warnings.push(result.warning);
      }

      acceptedFiles.push(file);
    }

    setUploadFeedback((prev) => ({
      ...prev,
      errors: { ...prev.errors, gallery: errors.join(' ') },
      warnings: { ...prev.warnings, gallery: warnings.join(' ') },
    }));

    setNewMedia((prev) => ({ ...prev, newGalleryImages: acceptedFiles }));
  };

  const addNewResource = () => {
    setNewMedia((prev) => ({
      ...prev,
      newResources: [...prev.newResources, { file: null, title: '' }],
    }));
  };

  const removeNewResource = (index) => {
    setNewMedia((prev) => ({
      ...prev,
      newResources: prev.newResources.filter((_, resourceIndex) => resourceIndex !== index),
    }));
  };

  const onNewResourceTitleChange = (index, value) => {
    setNewMedia((prev) => ({
      ...prev,
      newResources: prev.newResources.map((resource, resourceIndex) => (
          resourceIndex === index ? { ...resource, title: value } : resource
        )),
    }));
  };

  const onNewResourceFileChange = (index, event) => {
    const file = event.target.files?.[0] || null;

    const result = validateFileSize(file, {
      label: `Resource ${index + 1}`,
      maxBytes: MEDIA_RULES.resourceMaxBytes,
    });

    setUploadFeedback((prev) => ({
      ...prev,
      errors: { ...prev.errors, [`resource-${index}`]: result.error || '' },
      warnings: { ...prev.warnings, [`resource-${index}`]: result.warning || '' },
    }));

    if (result.error) return;

    setNewMedia((prev) => ({
      ...prev,
      newResources: prev.newResources.map((resource, resourceIndex) => (
          resourceIndex === index ? { ...resource, file } : resource
        )),
    }));
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateMessage('');
    setFieldErrors({});

    try {
      const issuerName = String(issuer?.['en-US']?.name || '').trim();
      if (!issuerName || issuerName.length < 5 || issuerName.length > 40) {
        throw new Error('Issuer name must be between 5 and 40 characters.');
      }

      if (hasUploadErrors) {
        throw new Error('Please fix upload issues first. Images above 2 MB should be compressed for clearer admin review before upload.');
      }

      const startDate = String(projectFinancials.start_date || '').trim();
      const endDate = String(projectFinancials.end_date || '').trim();
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error('End date must be on or after start date.');
      }

      if (issuerLogoFile && issuerId) {
        await Promise.all(['en-US', 'pt-PT'].map((localization) => uploadIssuerProfilePhoto(issuerId, {
          file: issuerLogoFile,
          localization,
          description: 'Issuer profile photo',
          imageName: issuerLogoFile?.name || 'issuer-profile-photo',
        })));
      }

      setDeletingMediaKeys(new Set());

      await updateProjectFlow({
        projectId: editProjectId || projectId,
        issuerId,
        visibility: String(projectFinancials.visibility || '').trim(),
        issuer,
        projectFinancials: {
          token_price: Number(projectFinancials.token_price || 0),
          token_premium: Number(projectFinancials.token_premium || 0),
          min_investment: Number(projectFinancials.min_investment || 0),
          max_investment: Number(projectFinancials.max_investment || 0),
          start_date: String(projectFinancials.start_date || '').trim(),
          end_date: String(projectFinancials.end_date || '').trim(),
        },
        projectContent: {
          'en-US': {
            ...projectContent['en-US'],
            tags: Array.isArray(projectContent['en-US']?.tags) ? projectContent['en-US'].tags : [],
          },
          'pt-PT': {
            ...projectContent['pt-PT'],
            tags: Array.isArray(projectContent['pt-PT']?.tags) ? projectContent['pt-PT'].tags : [],
          },
        },
        mediaToRemove,
        newMedia: {
          ...newMedia,
          newGalleryImages: newMedia.newGalleryImages || [],
          newResources: (newMedia.newResources || []).filter((resource) => resource.file),
        },
      }, {
        onDeleteProgress: ({ phase, key }) => {
          if (!key) return;
          setDeletingMediaKeys((prev) => {
            const next = new Set(prev);
            if (phase === 'start') {
              next.add(key);
            } else {
              next.delete(key);
            }
            return next;
          });
        },
      });

      setProject((prev) => ({
        ...(prev || {}),
        token_price: Number(projectFinancials.token_price),
        token_premium: Number(projectFinancials.token_premium),
        min_investment: Number(projectFinancials.min_investment),
        max_investment: Number(projectFinancials.max_investment),
        visibility: String(projectFinancials.visibility || '').trim() || 'Private',
        start_date: String(projectFinancials.start_date || '').trim() || null,
        end_date: String(projectFinancials.end_date || '').trim() || null,
        token: {
          ...(prev?.token || {}),
          issuer_name: issuer['en-US']?.name || prev?.token?.issuer_name,
        },
      }));

      setMediaToRemove({ imageIds: [], deleteThumbnail: false, resourceIds: [] });
      setNewMedia({ thumbnail: null, newGalleryImages: [], newResources: [] });
      setIssuerLogoFile(null);
      await loadProjectData(editProjectId || projectId);

      setUpdateMessage('Project updated successfully. Changes are now live.');
    } catch (error) {
      const mapped = mapBackendValidationError(error);
      setFieldErrors(mapped.fieldErrors || {});
      setUpdateError(mapped.formError || mapped.backendMessage || error?.message || 'Failed to update project.');
    } finally {
      setDeletingMediaKeys(new Set());
      setUpdateLoading(false);
    }
  };

  const [publishStatus, setPublishStatus] = useState('published');

  const formatCurrency = useCallback((value, currency) => {
    const numericValue = Number(value || 0);
    const safeCurrency = (currency || 'BRL').toUpperCase();

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: safeCurrency,
        minimumFractionDigits: 2,
      }).format(numericValue);
    } catch {
      return `${safeCurrency} ${numericValue.toFixed(2)}`;
    }
  }, []);

  const activeLocalization = useMemo(() => {
    const normalized = String(language || 'en').toLowerCase();
    return normalized.startsWith('pt') ? 'pt-PT' : 'en-US';
  }, [language]);

  const localizedContent = useMemo(() => {
    const preferred = projectContent?.[activeLocalization] || {};
    const fallback = projectContent?.['en-US'] || {};
    return {
      title: preferred?.title || fallback?.title || project?.token?.project_label || '',
      asset_type: preferred?.asset_type || fallback?.asset_type || project?.token?.project_type || '',
      short_description: preferred?.short_description || fallback?.short_description || '',
      long_description: preferred?.long_description || fallback?.long_description || project?.token?.description || '',
      tags: Array.isArray(preferred?.tags) && preferred.tags.length > 0
        ? preferred.tags
        : (Array.isArray(fallback?.tags) ? fallback.tags : []),
    };
  }, [activeLocalization, projectContent, project]);

  const displayGalleryImages = useMemo(() => {
    const preferredMedia = Array.isArray(existingMedia?.[activeLocalization]) ? existingMedia[activeLocalization] : [];
    const fallbackMedia = Array.isArray(existingMedia?.['en-US']) ? existingMedia['en-US'] : [];
    const source = preferredMedia.length > 0 ? preferredMedia : fallbackMedia;
    return source
      .filter((item) => item?.type === 'image' && item?.url)
      .map((item) => item.url);
  }, [activeLocalization, existingMedia]);

  const displayThumbnail = useMemo(() => {
    const preferredMedia = Array.isArray(existingMedia?.[activeLocalization]) ? existingMedia[activeLocalization] : [];
    const fallbackMedia = Array.isArray(existingMedia?.['en-US']) ? existingMedia['en-US'] : [];
    const source = preferredMedia.length > 0 ? preferredMedia : fallbackMedia;
    const thumbnail = source.find((item) => item?.type === 'thumbnail' && item?.url);
    return thumbnail?.url || '/neuroAdminLogo.svg';
  }, [activeLocalization, existingMedia]);

  const displayResources = useMemo(() => {
    const preferredMedia = Array.isArray(existingMedia?.[activeLocalization]) ? existingMedia[activeLocalization] : [];
    const fallbackMedia = Array.isArray(existingMedia?.['en-US']) ? existingMedia['en-US'] : [];
    const source = preferredMedia.length > 0 ? preferredMedia : fallbackMedia;
    return source
      .filter((item) => item?.type === 'resource' && item?.url)
      .map((item) => ({
        id: item?.id || null,
        title: item?.title || '',
        url: item?.url || '',
      }));
  }, [activeLocalization, existingMedia]);

  const headTitle = useMemo(() => ({
    title: localizedContent?.title || project?.token?.project_label || project?.token?.friendly_name || 'Unknown Project',
    issuer: project?.token?.issuer_name || 'Unknown Issuer',
    tons: `${Number(project?.token?.tokens_left || 0).toLocaleString()} / ${Number(project?.token?.token_quantity || 0).toLocaleString()} tokens`,
    image: issuerLogoUrl || displayThumbnail,
    categories: localizedContent?.asset_type
      ? [localizedContent.asset_type]
      : (project?.token?.project_type ? [project.token.project_type] : []),
  }), [project, localizedContent, displayThumbnail, issuerLogoUrl]);

  const generalData = useMemo(() => ({
    projectId: project?.project_id,
    label: localizedContent?.title || project?.token?.project_label,
    type: localizedContent?.asset_type || project?.token?.project_type,
    country: project?.token?.project_country_code || project?.token?.project_country,
    currency: (project?.currency || 'BRL').toUpperCase(),
    localization: activeLocalization,
  }), [project, localizedContent, activeLocalization]);

  const generalFields = useMemo(() => [
    { label: 'Project ID', key: 'projectId' },
    { label: 'Label', key: 'label' },
    { label: 'Type', key: 'type' },
    { label: 'Country Code', key: 'country' },
    { label: 'Currency', key: 'currency' },
    { label: 'Localization', key: 'localization' },
  ], []);

  const productionData = useMemo(() => ({
    tokenName: project?.token?.friendly_name,
    templateId: project?.token?.template_id,
    issuerName: project?.token?.issuer_name,
    issuerId: project?.token?.issuer_id,
    shortDescription: localizedContent?.short_description || 'N/A',
    tags: Array.isArray(localizedContent?.tags) && localizedContent.tags.length > 0
      ? localizedContent.tags.join(', ')
      : 'N/A',
  }), [project, localizedContent]);

  const productionFields = useMemo(() => [
    { label: 'Token Name', key: 'tokenName' },
    { label: 'Template ID', key: 'templateId' },
    { label: 'Issuer', key: 'issuerName' },
    { label: 'Issuer ID', key: 'issuerId' },
    { label: 'Short Description', key: 'shortDescription' },
    { label: 'Tags', key: 'tags' },
  ], []);

  const pricingData = useMemo(() => ({
    tokenPrice: formatCurrency(project?.token_price, project?.currency),
    tokenPremium: formatCurrency(project?.token_premium, project?.currency),
    minInvestment: formatCurrency(project?.min_investment, project?.currency),
    maxInvestment: formatCurrency(project?.max_investment, project?.currency),
    startDate: formatDateForDisplay(project?.start_date),
    endDate: formatDateForDisplay(project?.end_date),
  }), [project, formatCurrency]);

  const pricingFields = useMemo(() => [
    { label: 'Token Price', key: 'tokenPrice' },
    { label: 'Token Premium', key: 'tokenPremium' },
    { label: 'Minimum Investment', key: 'minInvestment' },
    { label: 'Maximum Investment', key: 'maxInvestment' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'End Date', key: 'endDate' },
  ], []);

  const soldPercentage = useMemo(() => {
    const total = Number(project?.token?.token_quantity || 0);
    const left = Number(project?.token?.tokens_left || 0);
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round(((total - left) / total) * 100)));
  }, [project]);

  const companyData = useMemo(() => ({
    projectId: project?.project_id,
    tokenQuantity: Number(project?.token?.token_quantity || 0).toLocaleString(),
    tokensLeft: Number(project?.token?.tokens_left || 0).toLocaleString(),
    sold: `${soldPercentage}%`,
    resourcesCount: String(displayResources.length),
    resources: displayResources.length > 0
      ? displayResources.map((resource) => resource.title || resource.id || 'Resource').join(', ')
      : 'N/A',
  }), [project, soldPercentage, displayResources]);

  const companyFields = useMemo(() => [
    { label: 'Project ID', key: 'projectId' },
    { label: 'Total Supply', key: 'tokenQuantity' },
    { label: 'Tokens Left', key: 'tokensLeft' },
    { label: 'Sold', key: 'sold' },
    { label: 'Resources Count', key: 'resourcesCount' },
    { label: 'Resources', key: 'resources' },
  ], []);

  const handlePublishSave = useCallback(async (nextStatus) => {
    setPublishStatus(nextStatus);
  }, []);

  const statusCard = {
    progress: String(100 - soldPercentage),
    amount: `${Number(project?.token?.tokens_left || 0).toLocaleString()} tokens left`,
    status: soldPercentage === 100 ? 'Sold Out' : 'Live'
  };

  const paymentStatusCard = {
    progress: String(soldPercentage),
    status: 'Tokenized',
  };

  if (isLoading) {
    return <div className="p-10 text-center text-xl">Loading project...</div>;
  }

  if (!project) {
    return <div className="p-10 text-center text-xl">Project not found</div>;
  }

  return (
    <div className='p-5'>
      {/* FIX: Removed `${id}` from href. 
         TabNavigation likely appends the 'id' prop to the 'href' automatically.
      */}
      <TabNavigation tab={tab} id={id} gridCols={'grid-cols-1'} tabArray={[
        {
          title: t?.assetOrderDetail?.tabs?.token || 'Token detail',
          href: '/neuro-assets/detailpage',
          tabDesination: 'Token',
          icon: FaRegFileAlt,
          tabRef: 'Token'
        },
        // {
        //   title: t?.assetOrderDetail?.tabs?.certificat || 'Sales',
        //   href: '/neuro-assets/detailpage',
        //   tabDesination: 'sales',
        //   icon: FaCertificate,
        //   tabRef: 'sales'
        // },
      ]} />

      <div className='mt-5'>
        <section className='mb-5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-[var(--brand-text)]'>Project Details</h2>
              <p className='mt-1 text-sm text-[var(--brand-text-secondary)]'>View project information and open the editor only when you need to update.</p>
            </div>
            <button
              type='button'
              onClick={() => setIsEditPanelOpen((prev) => !prev)}
              className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)]'
            >
              {isEditPanelOpen ? 'Close Update Panel' : 'Open Update Panel'}
            </button>
          </div>
        </section>

        {isEditPanelOpen && (
        <section className='mb-5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-4'>
          <h2 className='text-lg font-semibold text-[var(--brand-text)]'>Update Project</h2>
          <p className='mt-1 text-sm text-[var(--brand-text-secondary)]'>Editable fields for this project. Changes are applied immediately after save.</p>
          <form className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-2' onSubmit={handleUpdateProject}>
            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3'>
              <h3 className='mb-2 text-sm font-semibold text-[var(--brand-text)]'>Issuer</h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <Field label='Issuer ID'>
                  <select
                    value={issuerId}
                    onChange={onIssuerSelectionChange}
                    disabled={issuersLoading}
                    className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2'
                  >
                    <option value=''>Select issuer</option>
                    {issuerId && !issuerOptions.some((option) => option.id === issuerId) ? (
                      <option value={issuerId}>{issuer['en-US']?.name || issuerId}</option>
                    ) : null}
                    {issuerOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  {issuersError ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{issuersError}</span> : null}
                </Field>
                <div className='md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2 rounded-lg border border-[var(--brand-border)] p-3'>
                  <h4 className='md:col-span-2 text-sm font-semibold text-[var(--brand-text)]'>Issuer Localization (EN)</h4>
                  <Field label='Issuer Name (EN)'>
                    <input type='text' maxLength={40} name='name' value={issuer['en-US']?.name || ''} onChange={(event) => onIssuerChange('en-US', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                    {fieldErrors.issuerName ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{fieldErrors.issuerName}</span> : null}
                    {uploadFeedback.errors.issuerName ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{uploadFeedback.errors.issuerName}</span> : null}
                  </Field>
                  <Field label='Issuer About (EN)'>
                    <textarea rows={5} name='about' value={issuer['en-US']?.about || ''} onChange={(event) => onIssuerChange('en-US', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                  <Field label='Issuer Location (EN)'>
                    <input type='text' maxLength={80} name='location' value={issuer['en-US']?.location || ''} onChange={(event) => onIssuerChange('en-US', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                  <Field label='Issuer Industry (EN)'>
                    <input type='text' maxLength={80} name='industry' value={issuer['en-US']?.industry || ''} onChange={(event) => onIssuerChange('en-US', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                </div>

                <div className='md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2 rounded-lg border border-[var(--brand-border)] p-3'>
                  <h4 className='md:col-span-2 text-sm font-semibold text-[var(--brand-text)]'>Issuer Localization (PT)</h4>
                  <p className='md:col-span-2 text-xs text-[var(--brand-text-secondary)]'>If PT fields are empty, EN values are used on save.</p>
                  <Field label='Issuer Name (PT)'>
                    <input type='text' maxLength={40} name='name' value={issuer['pt-PT']?.name || ''} onChange={(event) => onIssuerChange('pt-PT', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                  <Field label='Issuer About (PT)'>
                    <textarea rows={5} name='about' value={issuer['pt-PT']?.about || ''} onChange={(event) => onIssuerChange('pt-PT', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                  <Field label='Issuer Location (PT)'>
                    <input type='text' maxLength={80} name='location' value={issuer['pt-PT']?.location || ''} onChange={(event) => onIssuerChange('pt-PT', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                  <Field label='Issuer Industry (PT)'>
                    <input type='text' maxLength={80} name='industry' value={issuer['pt-PT']?.industry || ''} onChange={(event) => onIssuerChange('pt-PT', event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  </Field>
                </div>
                <Field label='Issuer Logo (Company)'>
                  <input type='file' accept='image/*' onChange={onIssuerLogoChange} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  {issuerLogoUrl ? (
                    <div className='mt-2 flex items-center gap-2'>
                      <img src={issuerLogoUrl} alt='Issuer logo preview' className='h-12 w-12 rounded-full border border-[var(--brand-border)] object-cover' />
                      <span className='text-xs text-[var(--brand-text-secondary)]'>Current logo preview</span>
                    </div>
                  ) : null}
                  {uploadFeedback.errors.issuerLogo ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{uploadFeedback.errors.issuerLogo}</span> : null}
                  {uploadFeedback.warnings.issuerLogo ? <span className='text-xs text-amber-600'>{uploadFeedback.warnings.issuerLogo}</span> : null}
                </Field>
              </div>
            </div>

            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3'>
              <h3 className='mb-2 text-sm font-semibold text-[var(--brand-text)]'>Financials</h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <Field label='Token Price'>
              <input type='number' min='0' step='any' name='token_price' value={projectFinancials.token_price} onChange={onFinancialChange} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' placeholder='Token price' />
            </Field>
            <Field label='Token Premium'>
              <input type='number' min='0' step='any' name='token_premium' value={projectFinancials.token_premium} onChange={onFinancialChange} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' placeholder='Token premium' />
            </Field>
            <Field label='Visibility'>
              <select
                name='visibility'
                value={projectFinancials.visibility}
                onChange={onFinancialChange}
                className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2'
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label='Start Date & Time'>
              <input
                type='datetime-local'
                step='1'
                name='start_date'
                value={projectFinancials.start_date}
                onChange={onFinancialChange}
                className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2'
              />
            </Field>
            <Field label='End Date & Time'>
              <input
                type='datetime-local'
                step='1'
                name='end_date'
                value={projectFinancials.end_date}
                onChange={onFinancialChange}
                className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2'
              />
            </Field>
            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-3 text-xs text-[var(--brand-text-secondary)]'>
              Investment limits are managed automatically: minimum `1` and maximum `1,000,000`.
            </div>
            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-3 text-xs text-[var(--brand-text-secondary)]'>
              Visibility guide: Private = admin-only dashboard; Unlisted = marketplace link-only; Public = marketplace visible and navigable.
            </div>
              </div>
            </div>

            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3'>
              <h3 className='mb-2 text-sm font-semibold text-[var(--brand-text)]'>Project Content (EN/PT)</h3>
              <div className='mb-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-3 text-xs text-[var(--brand-text-secondary)]'>
                Marketplace copy quality matters: keep short description tight, and structure long description into readable sections.
              </div>
              <div className='mb-3 flex items-center justify-between rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2'>
                <span className='text-xs text-[var(--brand-text-secondary)]'>Need speed? Start PT from EN, then refine translation.</span>
                <button type='button' onClick={copyEnContentToPt} className='rounded-md border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-3 py-1 text-xs font-medium text-[var(--brand-text)]'>
                  Copy EN content to PT
                </button>
              </div>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <Field label='EN Title'>
                  <input type='text' value={projectContent['en-US'].title} onChange={(event) => onContentChange('en-US', 'title', event.target.value)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                </Field>
                <Field label='PT Title'>
                  <input type='text' value={projectContent['pt-PT'].title} onChange={(event) => onContentChange('pt-PT', 'title', event.target.value)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                </Field>
                <Field label='EN Asset Type'>
                  <input type='text' value={projectContent['en-US'].asset_type} onChange={(event) => onContentChange('en-US', 'asset_type', event.target.value)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                </Field>
                <Field label='PT Asset Type'>
                  <input type='text' value={projectContent['pt-PT'].asset_type} onChange={(event) => onContentChange('pt-PT', 'asset_type', event.target.value)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                </Field>
                <Field label='EN Short Description'>
                  <textarea rows={3} value={projectContent['en-US'].short_description} onChange={(event) => onContentChange('en-US', 'short_description', event.target.value)} onBlur={() => onDescriptionBlur('en-US', 'short_description')} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  <DescriptionInsights value={projectContent['en-US'].short_description} mode='short' />
                </Field>
                <Field label='PT Short Description'>
                  <textarea rows={3} value={projectContent['pt-PT'].short_description} onChange={(event) => onContentChange('pt-PT', 'short_description', event.target.value)} onBlur={() => onDescriptionBlur('pt-PT', 'short_description')} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  <DescriptionInsights value={projectContent['pt-PT'].short_description} mode='short' />
                </Field>
                <Field label='EN Long Description'>
                  <textarea rows={8} value={projectContent['en-US'].long_description} onChange={(event) => onContentChange('en-US', 'long_description', event.target.value)} onBlur={() => onDescriptionBlur('en-US', 'long_description')} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2 leading-relaxed' />
                  <DescriptionInsights value={projectContent['en-US'].long_description} mode='long' />
                </Field>
                <Field label='PT Long Description'>
                  <textarea rows={8} value={projectContent['pt-PT'].long_description} onChange={(event) => onContentChange('pt-PT', 'long_description', event.target.value)} onBlur={() => onDescriptionBlur('pt-PT', 'long_description')} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2 leading-relaxed' />
                  <DescriptionInsights value={projectContent['pt-PT'].long_description} mode='long' />
                </Field>
                <Field label='EN Tags (comma-separated)'>
                  <input type='text' value={tagDrafts['en-US']} onChange={(event) => onTagInputChange('en-US', event.target.value)} onBlur={() => onTagInputBlur('en-US')} placeholder='solar, green-energy, verified' className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  <span className='text-xs text-[var(--brand-text-secondary)]'>{projectContent['en-US'].tags.length}/{MAX_TAGS} tags</span>
                  <TagPreview tags={projectContent['en-US'].tags} />
                </Field>
                <Field label='PT Tags (comma-separated)'>
                  <input type='text' value={tagDrafts['pt-PT']} onChange={(event) => onTagInputChange('pt-PT', event.target.value)} onBlur={() => onTagInputBlur('pt-PT')} placeholder='solar, energia-verde, verificado' className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  <span className='text-xs text-[var(--brand-text-secondary)]'>{projectContent['pt-PT'].tags.length}/{MAX_TAGS} tags</span>
                  <TagPreview tags={projectContent['pt-PT'].tags} />
                </Field>
              </div>
            </div>

            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3'>
              <h3 className='mb-2 text-sm font-semibold text-[var(--brand-text)]'>Existing Media</h3>
              <p className='mb-3 text-xs text-[var(--brand-text-secondary)]'>Select files to remove. IDs are auto-managed for you.</p>
              <div className='mb-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]'>
                Selected for removal: {mediaToRemove.imageIds.length} image(s), {mediaToRemove.resourceIds.length} resource(s), thumbnail {mediaToRemove.deleteThumbnail ? 'selected' : 'not selected'}.
              </div>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div className='rounded-lg border border-[var(--brand-border)] p-3'>
                  <h4 className='mb-2 text-xs font-semibold text-[var(--brand-text-secondary)]'>EN-US</h4>
                  <div className='space-y-1 text-xs text-[var(--brand-text)]'>
                    {existingMedia['en-US'].length === 0 && <p>No media found.</p>}
                    {existingMedia['en-US'].map((item, index) => (
                      <label key={`existing-en-${item.id || index}`} className={`flex items-center gap-2 rounded border px-2 py-1 ${isMediaMarkedForRemoval(item) ? 'border-amber-400 bg-amber-50' : 'border-[var(--brand-border)]'}`}>
                        <input
                          type='checkbox'
                          checked={isMediaMarkedForRemoval(item)}
                          onChange={(event) => onExistingMediaToggle(item, event.target.checked)}
                          disabled={item.type !== 'thumbnail' && !item.id}
                        />
                        {(item.type === 'image' || item.type === 'thumbnail') && item.url ? (
                          <img
                            src={resolveBackendAssetUrl(item.url)}
                            alt={item.title || item.type}
                            className='h-8 w-8 rounded border border-[var(--brand-border)] object-cover'
                          />
                        ) : null}
                        <span className='truncate'>{item.type} · {item.title || item.id || 'untitled'}</span>
                        {item.type === 'resource' && item.url ? (
                          <a
                            href={resolveBackendAssetUrl(item.url)}
                            target='_blank'
                            rel='noreferrer'
                            className='ml-1 text-[10px] font-semibold text-[var(--brand-accent)] underline'
                          >
                            Preview PDF
                          </a>
                        ) : null}
                        {isDeletingMediaItem(item) ? <span className='ml-auto text-[10px] font-semibold text-blue-700'>Deleting...</span> : null}
                        {!isDeletingMediaItem(item) && isMediaMarkedForRemoval(item) ? <span className='ml-auto text-[10px] font-semibold text-amber-700'>Selected</span> : null}
                      </label>
                    ))}
                  </div>
                </div>
                <div className='rounded-lg border border-[var(--brand-border)] p-3'>
                  <h4 className='mb-2 text-xs font-semibold text-[var(--brand-text-secondary)]'>PT-PT</h4>
                  <div className='space-y-1 text-xs text-[var(--brand-text)]'>
                    {existingMedia['pt-PT'].length === 0 && <p>No media found.</p>}
                    {existingMedia['pt-PT'].map((item, index) => (
                      <label key={`existing-pt-${item.id || index}`} className={`flex items-center gap-2 rounded border px-2 py-1 ${isMediaMarkedForRemoval(item) ? 'border-amber-400 bg-amber-50' : 'border-[var(--brand-border)]'}`}>
                        <input
                          type='checkbox'
                          checked={isMediaMarkedForRemoval(item)}
                          onChange={(event) => onExistingMediaToggle(item, event.target.checked)}
                          disabled={item.type !== 'thumbnail' && !item.id}
                        />
                        {(item.type === 'image' || item.type === 'thumbnail') && item.url ? (
                          <img
                            src={resolveBackendAssetUrl(item.url)}
                            alt={item.title || item.type}
                            className='h-8 w-8 rounded border border-[var(--brand-border)] object-cover'
                          />
                        ) : null}
                        <span className='truncate'>{item.type} · {item.title || item.id || 'untitled'}</span>
                        {item.type === 'resource' && item.url ? (
                          <a
                            href={resolveBackendAssetUrl(item.url)}
                            target='_blank'
                            rel='noreferrer'
                            className='ml-1 text-[10px] font-semibold text-[var(--brand-accent)] underline'
                          >
                            Preview PDF
                          </a>
                        ) : null}
                        {isDeletingMediaItem(item) ? <span className='ml-auto text-[10px] font-semibold text-blue-700'>Deleting...</span> : null}
                        {!isDeletingMediaItem(item) && isMediaMarkedForRemoval(item) ? <span className='ml-auto text-[10px] font-semibold text-amber-700'>Selected</span> : null}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3'>
              <h3 className='mb-2 text-sm font-semibold text-[var(--brand-text)]'>Media Removals</h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <Field label='Delete Thumbnail'>
                  <label className='inline-flex items-center gap-2 text-sm text-[var(--brand-text)]'>
                    <input type='checkbox' checked={mediaToRemove.deleteThumbnail} onChange={(event) => onMediaRemoveChange('deleteThumbnail', event.target.checked)} />
                    Remove current thumbnail in EN/PT
                  </label>
                </Field>
                <Field label='Image IDs selected (auto)'>
                  <input type='text' readOnly value={mediaToRemove.imageIds.join(', ')} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' placeholder='Use checkboxes above' />
                </Field>
                <Field label='Resource IDs selected (auto)'>
                  <input type='text' readOnly value={mediaToRemove.resourceIds.join(', ')} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' placeholder='Use checkboxes above' />
                </Field>
                <div className='flex items-end'>
                  <button
                    type='button'
                    onClick={() => setMediaToRemove({ imageIds: [], deleteThumbnail: false, resourceIds: [] })}
                    className='rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-sm text-[var(--brand-text)]'
                  >
                    Clear Selections
                  </button>
                </div>
              </div>
            </div>

            <div className='md:col-span-2 rounded-lg border border-[var(--brand-border)] p-3'>
              <h3 className='mb-2 text-sm font-semibold text-[var(--brand-text)]'>Add New Media</h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <Field label='New Thumbnail'>
                  <input type='file' accept='image/*' onChange={onNewThumbnailChange} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  {newMedia.thumbnail ? <span className='text-xs text-[var(--brand-text-secondary)]'>Selected: {newMedia.thumbnail.name}</span> : null}
                  {uploadFeedback.errors.thumbnail ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{uploadFeedback.errors.thumbnail}</span> : null}
                  {uploadFeedback.warnings.thumbnail ? <span className='text-xs text-amber-600'>{uploadFeedback.warnings.thumbnail}</span> : null}
                </Field>
                <Field label='New Gallery Images'>
                  <input type='file' accept='image/*' multiple onChange={onNewGalleryChange} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                  {newMedia.newGalleryImages.length > 0 ? (
                    <span className='text-xs text-[var(--brand-text-secondary)]'>Selected: {newMedia.newGalleryImages.length} file(s)</span>
                  ) : null}
                  {uploadFeedback.errors.gallery ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{uploadFeedback.errors.gallery}</span> : null}
                  {uploadFeedback.warnings.gallery ? <span className='text-xs text-amber-600'>{uploadFeedback.warnings.gallery}</span> : null}
                </Field>
              </div>
              <div className='mt-3 rounded-lg border border-[var(--brand-border)] p-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <h4 className='text-sm font-semibold text-[var(--brand-text)]'>New Resources</h4>
                  <button type='button' onClick={addNewResource} className='rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-1 text-xs text-[var(--brand-text)]'>
                    Add Resource
                  </button>
                </div>
                {newMedia.newResources.length === 0 && (
                  <p className='text-sm text-[var(--brand-text-secondary)]'>No new resources selected.</p>
                )}
                <div className='space-y-2'>
                  {newMedia.newResources.map((resource, index) => (
                    <div key={`new-resource-${index}`} className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                      <Field label='Resource Title'>
                        <input type='text' value={resource.title} onChange={(event) => onNewResourceTitleChange(index, event.target.value)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                      </Field>
                      <Field label='Resource File'>
                        <input type='file' onChange={(event) => onNewResourceFileChange(index, event)} className='rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] p-2' />
                        {uploadFeedback.errors[`resource-${index}`] ? <span className='text-xs text-[var(--status-error,#ef4444)]'>{uploadFeedback.errors[`resource-${index}`]}</span> : null}
                      </Field>
                      <div className='flex items-end'>
                        <button type='button' onClick={() => removeNewResource(index)} className='rounded-md border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-2 text-xs text-[var(--brand-text)]'>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='md:col-span-2 flex items-center gap-3'>
              <button type='submit' disabled={updateLoading || hasUploadErrors} className='rounded-lg bg-[var(--brand-accent)] px-4 py-2 font-semibold text-[var(--brand-primary)] disabled:opacity-60'>
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
              {updateMessage && (
                <div className='rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2'>
                  <span className='text-sm font-semibold text-emerald-700'>{updateMessage}</span>
                </div>
              )}
              {updateError && <span className='text-sm text-[var(--status-error,#ef4444)]'>{updateError}</span>}
            </div>
          </form>
        </section>
        )}

        {tab === 'Token' && (
          <div className='grid grid-cols-2 gap-5 max-xl:grid-cols-1'>
            <div className='col-span-3'>
              <DisplayDetailsAsset
                header={headTitle}
                title={'Project Overview'}
                userData={generalData}
                fieldsToShow={generalFields}

                descriptionTitle={'Project Description'}
                descriptionText={localizedContent?.long_description || project?.token?.description}
                images={displayGalleryImages}
                resources={displayResources}
                resourcesTitle={'Project Resources'}

                extraTitle={'Production Details'}
                extraData={productionData}
                extraFields={productionFields}

                priceTitle={'Financial Specifics'}
                extraPrice={pricingData}
                priceFields={pricingFields}

                companyTitle={'Legal & Collateral'}
                extraCompany={companyData}
                companyFields={companyFields}
              />
            </div>

            {/* <div className='col-start-4 col-end-5 flex flex-col items-start gap-5 max-xl:col-span-1 max-xl:w-full'>
              <PublishBox status={publishStatus} onSave={handlePublishSave} />
              <StatusBox statusCard={statusCard} title={'Asset status'} />
              <StatusBox statusCard={paymentStatusCard} title={'Token status'} />
              <CertificateBox />
            </div> */}
          </div>
        )}

        {tab === 'sales' && (
          <div className='grid grid-cols-1 gap-5'>
            <div className='mx-auto w-full bg-[var(--brand-navbar)] shadow-md p-5 rounded-lg '>
              <h1 className='font-semibold text-xl mb-5'>
                Sales Activity (Mock)
              </h1>
              <Suspense fallback={<p>Loading...</p>}>
                <AssetTokensTable orders={[project]} isLoading={false} />
              </Suspense>
            </div>
          </div>
        )}

        {loadError && (
          <p className='mt-4 text-sm text-[var(--status-error,#ef4444)]'>
            {loadError}
          </p>
        )}
      </div>
    </div>
  )
}

export default DetailPageAssets