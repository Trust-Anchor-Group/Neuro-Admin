"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function AssetAmountCard({ onChange }) {
  const [definition, setDefinition] = useState("units"); // "units" | "volume"
  const [unitVolume, setUnitVolume] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("kg");
  const [totalUnitAmount, setTotalUnitAmount] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("EUR");

  const [totalVolume, setTotalVolume] = useState("");
  const [totalVolumeMeasure, setTotalVolumeMeasure] = useState("kg");
  const [totalPrice, setTotalPrice] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");

  const [facilityName, setFacilityName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [creationStage, setCreationStage] = useState("");
  const [startDay, setStartDay] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endDay, setEndDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange({
        definition,
        unitVolume,
        unitMeasure,
        totalUnitAmount,
        pricePerUnit,
        priceCurrency,
        totalVolume,
        totalVolumeMeasure,
        totalPrice,
        minPurchaseAmount,
        facilityName,
        location,
        address,
        creationStage,
        start: { day: startDay, month: startMonth, year: startYear },
        end: { day: endDay, month: endMonth, year: endYear },
      });
    }
  }, [
    definition,
    unitVolume,
    unitMeasure,
    totalUnitAmount,
    pricePerUnit,
    priceCurrency,
    totalVolume,
    totalVolumeMeasure,
    totalPrice,
    minPurchaseAmount,
    facilityName,
    location,
    address,
    creationStage,
    startDay,
    startMonth,
    startYear,
    endDay,
    endMonth,
    endYear,
    onChange,
  ]);

  const hintText = (text) => (
    <span className="whitespace-nowrap text-sm text-[var(--brand-text-secondary)]">{text}</span>
  );

  const numberInput = (value, onChange, placeholder = "", extraClasses = "") => (
    <input
      type="number"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full max-w-xs rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none ${extraClasses}`}
    />
  );

  const selectInput = (value, onChange, options) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-background)] px-3 py-3 text-base text-[var(--brand-text)] outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );

  const labelRow = (label, children, trailing) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">{label}</p>
      <div className="flex items-center gap-3">
        {children}
        {trailing}
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl bg-[var(--brand-navbar)] p-6 shadow-md">
      <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Asset amount definition</p>
      <div className="mt-2">
        <select
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base font-semibold text-[var(--brand-text)] outline-none"
        >
          <option value="units">Units</option>
          <option value="volume">Total volume</option>
        </select>
      </div>

      <div className="mt-5 grid gap-4">
        {definition === "units" ? (
          <>
            {labelRow(
              "Unit volume",
              <>
                {numberInput(unitVolume, setUnitVolume, "Enter unit volume")}
                {selectInput(unitMeasure, setUnitMeasure, ["kg", "ton", "g"])}
              </>,
              hintText("")
            )}

            {labelRow(
              "Total unit amount",
              <>{numberInput(totalUnitAmount, setTotalUnitAmount, "Enter total units")}</>,
              hintText("")
            )}

            {labelRow(
              "Price per unit",
              <>
                {numberInput(pricePerUnit, setPricePerUnit, "Enter price")}
                {selectInput(priceCurrency, setPriceCurrency, ["EUR", "USD", "GBP"])}
              </>,
              hintText("")
            )}
          </>
        ) : (
          <>
            {labelRow(
              "Total asset volume",
              <>
                {numberInput(totalVolume, setTotalVolume, "Enter total volume")}
                {selectInput(totalVolumeMeasure, setTotalVolumeMeasure, ["kg", "ton", "g"])}
              </>,
              hintText("")
            )}

            {labelRow(
              "Total price",
              <>
                {numberInput(totalPrice, setTotalPrice, "Enter total price")}
                {selectInput(priceCurrency, setPriceCurrency, ["EUR", "USD", "GBP"])}
              </>,
              hintText("")
            )}

            {labelRow(
              "Minimum purchase amount",
              <>
                {numberInput(minPurchaseAmount, setMinPurchaseAmount, "Enter minimum")}
                {selectInput(totalVolumeMeasure, setTotalVolumeMeasure, ["kg", "ton", "g"])}
              </>,
              hintText("")
            )}
          </>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Asset facilities name</p>
          <input
            type="text"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
            placeholder="Enter facility name"
            className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Location (place of residence)</p>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            list="location-suggestions"
            placeholder="Type or select a location"
            className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
          />
          <datalist id="location-suggestions">
            <option value="Cuiabà, Brazil" />
            <option value="Stockholm, Sweden" />
            <option value="New York, USA" />
          </datalist>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Address</p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
          />
        </div>
      </div>
      <div>
        <Image
          className='mb-5 mt-6 w-full h-auto rounded-xl border border-[var(--brand-border)]'
          src='/brazilMap.svg'
          width={600}
          height={100}
          alt='Brazil production map'
          priority
          unoptimized
        />
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Asset creation stage</p>
          <select
            value={creationStage}
            onChange={(e) => setCreationStage(e.target.value)}
            className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
          >
            <option value="" disabled>
              Select stage
            </option>
            <option value="Planned">Planned</option>
            <option value="In progress">In progress</option>
            <option value="Complete">Complete</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Start (DD/MM/YYYY)</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
                placeholder="DD"
                className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
              />
              <input
                type="text"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                placeholder="MM"
                className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
              />
              <input
                type="text"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="YYYY"
                className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">End (DD/MM/YYYY)</p>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={endDay}
                onChange={(e) => setEndDay(e.target.value)}
                placeholder="DD"
                className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
              />
              <input
                type="text"
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                placeholder="MM"
                className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
              />
              <input
                type="text"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="YYYY"
                className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {[0, 1, 2, 3, 4].map((idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-sm font-semibold text-[var(--brand-text-secondary)]">Additional variable</p>
            <input
              type="text"
              placeholder="Variable"
              className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)] px-4 py-3 text-base text-[var(--brand-text)] outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
