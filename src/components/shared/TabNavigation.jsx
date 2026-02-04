import Link from "next/link";
import React from "react";

export const TabNavigation = ({ tab, id, gridCols, tabArray, queryId = false }) => {
  return (
    <nav className={`grid ${gridCols} w-full shadow-sm text-center rounded-lg bg-[var(--brand-background)] font-semibold`}>
      {tabArray &&
        tabArray.map((item, index) => {
          const basePath =
            queryId && id
              ? `${item.href}?id=${encodeURIComponent(id)}`
              : id
              ? `${item.href}/${id}`
              : item.href;

          const href = `${basePath}${basePath.includes("?") ? "&" : "?"}tab=${item.tabDesination}`;

          return (
            <Link key={index} href={href}>
              <div
                className={`flex items-center justify-center gap-2 rounded-lg py-3 text-text16 ${
                  tab === `${item.tabRef}`
                    ? "bg-aprovedPurple/15 text-neuroPurpleDark  duration-300"
                    : "bg-[var(--brand-navbar)] text-[var(--brand-text)]"
                }`}
              >
                {item.icon ? <item.icon className="max-md:hidden" size={14} /> : null}
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
    </nav>
  );
};
