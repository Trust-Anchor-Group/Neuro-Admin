'use client'
import { TabNavigation } from '@/components/shared/TabNavigation';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react'
import { FaChartLine, FaRegFileAlt, FaRegBuilding } from 'react-icons/fa';
import { Award, Activity, Timer } from 'lucide-react';
import Sales from '@/components/assets/Sales';
import Overview from '@/components/assets/Overview';
// NOTE: context folder is at project root (not under src), so we need five parent traversals
import { useLanguage, content as i18nContent } from '../../../../../context/LanguageContext';
import { Suspense } from 'react';
import AssetTokensTable from '@/components/assets/Tokens/AssetTokensTable';




const DetailPageIssuer = () => {
   const searchParams = useSearchParams()
   const { id } = useParams()
   const tab = searchParams.get('tab') || 'overview'

  const { language } = useLanguage();
  const t = i18nContent[language]?.assetClientDetail || {};
  const [ordersData, setOrdersData] = React.useState({ loading: true, orders: [] });

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await import('@/components/assets/Tokens/tokenFetch');
        const response = await result.fetchTokensClientSide(10, 0);
        const rawOrders = response?.data || response;
        // Map raw token data to table format
        const orders = Array.isArray(rawOrders)
          ? rawOrders.map(token => {
              // Format amount with SEK if currency is present or default to SEK
              let amount = token.amount || token.quantity || token.balance || token.value || token.total || '';
              if (amount !== '') {
                const currency = token.currency || token.unit || 'SEK';
                amount = `${amount} ${currency}`;
              }
              // Format created date: combine createdDate and createdTime if present
              let orderDate = '';
              if (token.createdDate && token.createdTime) {
                // Combine and format, but only show the date
                const d = new Date(`${token.createdDate} ${token.createdTime}`);
                orderDate = !isNaN(d) ? d.toLocaleDateString('sv-SE') : token.createdDate;
              } else {
                orderDate = token.orderDate || token.createdAt || token.date || token.timestamp || token.time || token.created_date || token.created || token.creationDate || '';
                if (orderDate && typeof orderDate === 'string' && orderDate.length > 10) {
                  const d = new Date(orderDate);
                  if (!isNaN(d)) orderDate = d.toLocaleDateString('sv-SE');
                }
              }
              return {
                id: token.tokenId || token.id || '',
                assetName: token.friendlyName || token.assetName || '',
                category: token.category || token.type || '',
                amount,
                orderDate,
                status: token.status || token.state || 'pending',
              };
            })
          : [];
        setOrdersData({ loading: false, orders });
  setOrdersData({ loading: false, orders, rawTokens: rawOrders });
      } catch (err) {
        setOrdersData({ loading: false, orders: [] });
      }
    }
    fetchOrders();
  }, []);



  const summaryCards = [
    {
      label: t.summary?.tota || 'Live tokens',
      value: `23`,
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
    {
      label: t.summary?.activeOrde || '[Stat]',
      value: '4',
      Icon: Activity,
      accentClass: 'text-amber-500 bg-amber-100',
    },
    {
      label: t.summary?.pendingOrde || '[Stat]',
      value: '450 000 kg',
      Icon: Timer,
      accentClass: 'text-emerald-500 bg-emerald-100',
    },
  ];

  return (
    <div className='p-5'>
      <TabNavigation tab={tab} id={id} gridCols={'grid-cols-3'} tabArray={[
        {
          title: t.tabs?.overview || 'Overview',
          href: '/neuro-assets/detailpageIssuer',
          tabDesination: 'overview',
          icon: FaRegBuilding,
          tabRef: 'overview',
        },
        {
          title: t.tabs?.order || 'Tokens',
          href: '/neuro-assets/detailpageIssuer',
          tabDesination: 'Tokens',
          icon: FaRegFileAlt,
          tabRef: 'Tokens',
        },
        {
          title: t.tabs?.manae || 'Sales',
          href: '/neuro-assets/detailpageIssuer',
          tabDesination: 'Sales',
          icon: FaChartLine,
          tabRef: 'Sales',
        },
      ]} />
      {/* Summary cards section */}
      {tab === 'Tokens' && (
        <section className='mt-4 mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {summaryCards.map(({ label, value, Icon, accentClass }) => (
            <div
              key={label}
              className='flex flex-col rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm backdrop-blur'
            >
              <div className='flex items-start justify-between'>
                <p className='text-sm font-medium text-[var(--brand-text-secondary)]'>{label}</p>
              </div>
              <div className='flex flex-row items-center gap-3 mt-3'>
                <span className={`flex items-center justify-center rounded-full p-2 ${accentClass}`}>
                  <Icon className='h-5 w-5' strokeWidth={2.2} />
                </span>
                <p className='text-3xl font-semibold text-[var(--brand-text)]'>{value}</p>
              </div>
            </div>
          ))}
        </section>
      )}
      <div className='mt-5'>
        {tab === 'overview' && <Overview />}
        {tab === 'Tokens' && (
          <div className='rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5'>
            <h1 className='font-semibold text-xl mb-5 text-[var(--brand-text)]'>{t.headings?.tokens || 'Tokens'}</h1>
            <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">{t.loading?.orders || 'Loading orders...'}</p>}>
              <AssetTokensTable orders={ordersData.orders} isLoading={ordersData.loading} />
            </Suspense>
          </div>
        )}
        {tab === 'Sales' && <Sales />}
      </div>
  
    </div>
                
                

  )}  


export default DetailPageIssuer
