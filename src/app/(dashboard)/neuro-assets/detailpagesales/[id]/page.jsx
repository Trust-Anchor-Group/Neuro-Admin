"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SalesDetailPage() {
	const { id } = useParams() || {}
	const [token, setToken] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		if (!id) return

		// 1) Try to hydrate from sessionStorage when navigated from list
		try {
			const raw = sessionStorage.getItem('selected-sale')
			if (raw) {
				const obj = JSON.parse(raw)
				const objId = String(obj?.tokenId ?? obj?.id ?? '')
				if (objId && objId === String(id)) {
					setToken(obj)
				}
			}
		} catch {}

		// 2) Prefer: fetch detailed info for this id
		;(async () => {
			try {
				const res = await fetch(`/api/tokens/${encodeURIComponent(String(id))}`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
				})
				if (res.ok) {
					const json = await res.json()
					const detail = Array.isArray(json?.data) ? json.data[0] : json?.data
					if (detail) setToken(prev => ({ ...(prev || {}), ...(detail || {}) }))
				} else {
					setError(`Failed to load details (${res.status})`)
				}
			} catch {}
			finally {
				setLoading(false)
			}
		})()
	}, [id])

	if (loading && !token) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-semibold">Loading sale…</h1>
			</div>
		)
	}

	if (!token) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-semibold">Sale not found</h1>
				<p className="text-sm text-[var(--brand-text-secondary)]">No sale/token with id {String(id)} was found.</p>
				{error && <p className="mt-2 text-sm text-red-500">{error}</p>}
			</div>
		)
	}

	const tokenId = token?.tokenId ?? token?.id
	const title = token?.friendlyName ?? token?.assetName ?? `Sale #${String(id)}`
	const amount = (token?.value && token?.currency) ? `${token.value} ${token.currency}` : (token?.amount ?? '—')
	const createdDate = token?.createdDate ?? token?.orderDate ?? '—'
	const status = token?.paymentStatus ?? token?.['payment status'] ?? 'Pending'

	return (
		<div className="p-6 space-y-6">
			<header className="space-y-1">
				<h1 className="text-3xl font-bold text-[var(--brand-text)]">{title}</h1>
				<p className="text-sm text-[var(--brand-text-secondary)]">Token ID: {tokenId}</p>
			</header>

			<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-card)] p-4">
					<h2 className="font-semibold mb-2">Sale Summary</h2>
					<dl className="space-y-1 text-sm">
						<div className="flex justify-between"><dt>Amount</dt><dd>{amount}</dd></div>
						<div className="flex justify-between"><dt>Status</dt><dd>{status}</dd></div>
						<div className="flex justify-between"><dt>Created</dt><dd>{createdDate}</dd></div>
						<div className="flex justify-between"><dt>Category</dt><dd>{token?.category || '—'}</dd></div>
					</dl>
				</div>

				<div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-card)] p-4">
					<h2 className="font-semibold mb-2">Identifiers</h2>
					<dl className="space-y-1 text-sm">
						<div className="flex justify-between"><dt>Token ID</dt><dd>{tokenId}</dd></div>
						<div className="flex justify-between"><dt>Asset Name</dt><dd>{token?.friendlyName ?? token?.assetName ?? '—'}</dd></div>
					</dl>
				</div>
			</section>
		</div>
	)
}

