'use client'
import { TabNavigation } from '@/components/shared/TabNavigation';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react'
import { FaChartLine, FaRegFileAlt, FaFirstOrderAlt } from 'react-icons/fa';
import { Award, Activity, Timer } from 'lucide-react';
import Manage from '@/components/assets/Manage';
import Overview from '@/components/assets/Overview';
import { Suspense } from 'react';
import AssetOrdersTable from '@/components/assets/orders/AssetOrdersTable';




const DetailPageClient = () => {
   const searchParams = useSearchParams()
   const { id } = useParams()
   const tab = searchParams.get('tab') || 'overview'

  const [ordersData, setOrdersData] = React.useState({ loading: true, orders: [] });

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await import('@/components/assets/orders/tokenFetch');
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

  // Hardcoded orders data and summary, matching the cards
  const orders = [
    { id: '1', assetName: 'Asset A', category: 'Type 1', amount: 100, orderDate: '2025-10-01', status: 'active' },
    { id: '2', assetName: 'Asset B', category: 'Type 2', amount: 200, orderDate: '2025-10-02', status: 'pending' },
    { id: '3', assetName: 'Asset C', category: 'Type 1', amount: 150, orderDate: '2025-10-03', status: 'active' },
    { id: '4', assetName: 'Asset D', category: 'Type 3', amount: 50, orderDate: '2025-10-04', status: 'pending' },
    { id: '5', assetName: 'Asset E', category: 'Type 2', amount: 75, orderDate: '2025-10-05', status: 'active' },
    { id: '6', assetName: 'Asset F', category: 'Type 1', amount: 125, orderDate: '2025-10-06', status: 'active' },
  ];

  const summaryCards = [
    {
      label: 'Total',
      value: '450 ton',
      Icon: Award,
      accentClass: 'text-emerald-500 bg-emerald-100',
    },
    {
      label: 'Active orders',
      value: '6',
      Icon: Activity,
      accentClass: 'text-blue-500 bg-blue-100',
    },
    {
      label: 'Pending orders',
      value: '4',
      Icon: Timer,
      accentClass: 'text-amber-500 bg-amber-100',
    },
  ];

  return (
    <div className='p-5'>
      <TabNavigation tab={tab} id={id} gridCols={'grid-cols-3'} tabArray={[
        {
          title: 'Overview',
          href: '/neuro-assets/detailpageclient',
          tabDesination: 'overview',
          icon: FaRegFileAlt,
          tabRef: 'overview',
        },
        {
          title: 'Orders',
          href: '/neuro-assets/detailpageclient',
          tabDesination: 'orders',
          icon: FaFirstOrderAlt,
          tabRef: 'orders',
        },
        {
          title: 'Manage',
          href: '/neuro-assets/detailpageclient',
          tabDesination: 'manage',
          icon: FaChartLine,
          tabRef: 'manage',
        },
      ]} />
      {/* Summary cards section */}
      {tab === 'orders' && (
        <section className='mt-4 mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {summaryCards.map(({ label, value, Icon, accentClass }) => (
            <div
              key={label}
              className='flex flex-col rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5 shadow-sm backdrop-blur'
            >
              <div className='flex items-start justify-between'>
                <p className='text-sm font-medium text-[var(--brand-text-secondary)]'>{label}</p>
                <span
                  className={`inline-flex items-center justify-center rounded-full p-2 ${accentClass}`}
                >
                  <Icon className='h-5 w-5' strokeWidth={2.2} />
                </span>
              </div>
              <p className='mt-5 text-3xl font-semibold text-[var(--brand-text)]'>{value}</p>
            </div>
          ))}
        </section>
      )}
      <div className='mt-5'>
        {tab === 'overview' && <Overview />}
        {tab === 'orders' && (
          <div className='rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-navbar)] p-5'>
            <h1 className='font-semibold text-xl mb-5 text-[var(--brand-text)]'>Orders</h1>
            <Suspense fallback={<p className="text-[var(--brand-text-secondary)]">Loading orders...</p>}>
              <AssetOrdersTable orders={ordersData.orders} isLoading={ordersData.loading} />
            </Suspense>
          </div>
        )}
        {tab === 'manage' && <Manage />}
      </div>
  
    </div>
                
                

  )}  


export default DetailPageClient
