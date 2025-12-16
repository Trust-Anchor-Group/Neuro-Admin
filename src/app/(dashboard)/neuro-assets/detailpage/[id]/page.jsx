'use client'
import React, { useMemo, useState, useCallback, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation';
import { FaCertificate, FaRegFileAlt } from 'react-icons/fa';

// Components
import { DisplayDetailsAsset } from '@/components/assets/DisplayDetailsAsset'
import AssetTokensTable from "@/components/assets/Tokens/AssetTokensTable";
import { TabNavigation } from '@/components/shared/TabNavigation';
import { StatusBox } from '@/components/assets/StatusBox';
import { CertificateBox } from '@/components/assets/CertificateBox';
import { PublishBox } from '@/components/assets/PublishBox';

// Hooks & Data
import { useLanguage, content as translations } from '../../../../../../context/LanguageContext';
import projectsData from '@/data/projects.json';

const DetailPageAssets = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'Token';

  const { language } = useLanguage();
  const t = translations[language];

  // 1. Find the specific project
  const project = useMemo(() => {
    return projectsData.find(p => p.id == id);
  }, [id]);

  const [publishStatus, setPublishStatus] = useState('published');

  // -- Data Mapping --
  const seriesData = project?.series?.[0] || {};
  const tokenContent = seriesData?.tokenContent || {};

  const headTitle = useMemo(() => ({
    title: project?.projectTitle || 'Unknown Project',
    issuer: project?.organizationName || 'Unknown Issuer',
    created: seriesData.tokenContent?.Coffee_HarvestSeason || '2025/2026',
    tons: `${seriesData.quantity || 0} Bags | ${seriesData.price || 0} BRL`,
    image: project?.logoPath || '/neuroAdminLogo.svg',
    categories: project?.categories || []
  }), [project, seriesData]);

  const generalData = useMemo(() => ({
    introTitle: project?.introTitle,
    shortTitle: project?.projectShortTitle,
    location: project?.location,
    tags: project?.tags?.join(', '),
  }), [project]);

  const generalFields = useMemo(() => [
    { label: 'Introduction', key: 'introTitle' },
    { label: 'Short Title', key: 'shortTitle' },
    { label: 'Location', key: 'location' },
    { label: 'Tags', key: 'tags' },
  ], []);

  const productionData = useMemo(() => ({
    producer: tokenContent.Coffee_ProducerName,
    product: tokenContent.Coffee_ProductDescription,
    quality: tokenContent.Coffee_QualityStandard,
    sieve: tokenContent.Coffee_Sieve,
    harvest: tokenContent.Coffee_HarvestSeason,
    cpr: tokenContent.Coffee_CPR_Number,
  }), [tokenContent]);

  const productionFields = useMemo(() => [
    { label: 'Producer', key: 'producer' },
    { label: 'Product', key: 'product' },
    { label: 'Quality Standard', key: 'quality' },
    { label: 'Sieve', key: 'sieve' },
    { label: 'Harvest Season', key: 'harvest' },
    { label: 'CPR Number', key: 'cpr' },
  ], []);

  const pricingData = useMemo(() => ({
    basePrice: `${tokenContent.Coffee_BasePricePerBag} BRL`,
    premium: `${tokenContent.Coffee_PremiumPerBag} BRL`,
    totalCPR: `${tokenContent.Coffee_InitialCPRValue?.toLocaleString()} BRL`,
    maturity: tokenContent.Coffee_MaturityDate ? new Date(tokenContent.Coffee_MaturityDate).toLocaleDateString() : 'N/A',
  }), [tokenContent]);

  const pricingFields = useMemo(() => [
    { label: 'Base Price (per bag)', key: 'basePrice' },
    { label: 'Premium (per bag)', key: 'premium' },
    { label: 'Total CPR Value', key: 'totalCPR' },
    { label: 'Maturity Date', key: 'maturity' },
  ], []);

  const companyData = useMemo(() => ({
    producerId: tokenContent.Coffee_ProducerId,
    insurance: tokenContent.Coffee_HasAgriculturalInsurance === 'SANT' ? 'Yes (Santander)' : 'No',
    endorsement: tokenContent.Coffee_HasPersonalEndorsement === 'SANT' ? 'Yes (Santander)' : 'No',
    collateral: tokenContent.Asset_CollateralReference,
  }), [tokenContent]);

  const companyFields = useMemo(() => [
    { label: 'Producer CNPJ', key: 'producerId' },
    { label: 'Agricultural Insurance', key: 'insurance' },
    { label: 'Personal Endorsement', key: 'endorsement' },
    { label: 'Collateral Ref', key: 'collateral' },
  ], []);

  const handlePublishSave = useCallback(async (nextStatus) => {
    setPublishStatus(nextStatus);
  }, []);

  const statusCard = {
    progress: '100',
    amount: `${seriesData.quantity || 0} Bags`,
    status: 'Live'
  };

  const paymentStatusCard = {
    progress: '100',
    status: 'Tokenized',
  };

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
        {tab === 'Token' && (
          <div className='grid grid-cols-4 gap-5 max-xl:grid-cols-1'>
            <div className='col-span-3'>
              <DisplayDetailsAsset
                header={headTitle}
                title={'Project Overview'}
                userData={generalData}
                fieldsToShow={generalFields}

                descriptionTitle={project.projectDescriptionTitle}
                descriptionText={project.projectDescription?.join('\n\n')}
                images={project.images}

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

            <div className='col-start-4 col-end-5 flex flex-col items-start gap-5 max-xl:col-span-1 max-xl:w-full'>
              <PublishBox status={publishStatus} onSave={handlePublishSave} />
              <StatusBox statusCard={statusCard} title={'Asset status'} />
              <StatusBox statusCard={paymentStatusCard} title={'Token status'} />
              <CertificateBox />
            </div>
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
      </div>
    </div>
  )
}

export default DetailPageAssets