'use client'
import Link from "next/link";
import { FaCheck, FaExclamationTriangle, FaPlusCircle, FaTimes, FaTimesCircle, FaUser } from "react-icons/fa";
import { MenuItem } from "@mui/material";
import { MdAssignment } from 'react-icons/md'
import { content as i18nContent } from '../../../context/LanguageContext'

const headCellBaseSx = {
  color: 'var(--brand-text-secondary)',
  fontWeight: 500,
  '& .MuiTableSortLabel-root': {
    color: 'var(--brand-text-color) !important',
    '&.Mui-active': {
      color: 'var(--brand-text-color) !important',
    },
    '& .MuiTableSortLabel-icon': {
      color: 'var(--brand-text-color) !important',
      opacity: 1,
    },
  },
  '& .MuiSvgIcon-root': {
    color: 'var(--brand-text-color) !important',
    opacity: 0.9,
  },
};

// Decide what columns you should have in your table
export const userColoumnsPending = (language) => {
  const t = i18nContent?.[language]?.pendingTable?.columns || {}
  return [
    {
      accessorKey: 'name',
      header: t.idName || 'ID name',
      size: 100,
      muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } },
  muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } },
    },
    {
      accessorKey: 'account',
      header: t.accountName || 'Account',
      size: 100,
  muiTableHeadCellProps: { sx: headCellBaseSx },
    },
    {
      accessorKey: 'other.EMAIL',
      header: t.email || 'Email',
      size: 100,
      muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } },
  muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } },
    },
    {
      accessorKey: 'city',
      header: t.location || 'Location',
      size: 100,
      muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } },
  muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } },
    },
    {
      accessorKey: 'createdDate',
      header: t.created || 'Created',
      size: 100,
      muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } },
  muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } },
    },
  ]
}

// Special actions a column should/could have
export const customCellPendingTable = {
  account: ({ cell, row }) => {
    const account = row.original.account
    if (account) {
      return (
        <p>{account}</p>
      )
    } else {
      <p>-</p>
    }
  },
  name: ({ cell, row }) => {
    const name = row.original.name
    if (name) {
      return (
        <p>{name}</p>
      )
    } else {
      <p>-</p>
    }
  },
  "other.EMAIL": ({ cell, row }) => {
    const email = row.original.other.EMAIL
    return email ? (
      <p title={email}>
        {email.length > 20 ? `${email.slice(0, 20)}...` : email}
      </p>
    ) : (
      <p>-</p>
    );
  },
  city: ({ cell, row }) => {
    const city = row.original.city
    if (city) {
      return (
        <p>{city}</p>
      )
    } else {
      <p>-</p>
    }
  }
}

const arrayActions = [
  { actionTitle: 'Approved', icon: FaCheck, iconColor: 'text-green-600', name: 'Approve application' },
  { actionTitle: 'Rejected', icon: FaTimes, iconColor: 'text-red-600', name: 'Deny application' },
]

export const pendingActions = ({ closeMenu, row, getData, onToggleHandler, pathnameWithFilter, language }) => {
  const pa = i18nContent?.[language]?.pendingTable?.pendingActions || {}
  return [
    <MenuItem key={1} onClick={closeMenu}>
      <div className="">
        <Link href={`/neuro-access/detailpage/${row.original.id}?ref=${encodeURIComponent(pathnameWithFilter)}`}>
          <div className="flex gap-2 items-center">
            <MdAssignment />
            <p>{pa.See || 'See Application'}</p>
          </div>
        </Link>
      </div>
    </MenuItem>,
    <MenuItem key="review" onClick={() => {
      onToggleHandler(row.original.id, "Review", "Review ID application");
      closeMenu();
    }}>
      <div className="flex gap-2 items-center">
        <FaUser />
        <p>{pa.review || 'Review Application'}</p>
      </div>
    </MenuItem>,
    // arrayActions.map((item,index) =>(
    //   <MenuItem key={index + 2}>
    //     <button 
    //       onClick={() => {
    //         onToggleHandler(row.original.id, item.actionTitle, item.name);
    //         closeMenu(); // Kalla pǾ closeMenu efterǾt
    //       }}
    //       className="flex gap-2 rounded-full items-center"
    //     >
    //       <item.icon className={item.iconColor} />
    //       {item.name}
    //     </button>
    //   </MenuItem>
    //     )),   
  ];
}
