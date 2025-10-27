"use client";
import { createTheme } from '@mui/material/styles';
import { StatusIcon } from './StatusIcon';
import { Box } from '@mui/material';
import { content as i18nContent } from '../../../context/LanguageContext';

export const theme = createTheme({
  typography: { fontFamily: '"Space Grotesk", sans-serif' },
});

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

export const userColoumnsAccount = (language) => {
  const t = i18nContent?.[language]?.accountTableList?.columns || {};
  return [
    { accessorKey: 'firstName', header: t.idName || 'ID name', size: 100, muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } }, muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } } },
    { accessorKey: 'latestLegalIdState', header: t.identityStatus || 'Identity status', size: 100, muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } }, muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } } },
    { accessorKey: 'userName', header: t.accountName || 'Account Name', size: 100, muiTableHeadCellProps: { sx: headCellBaseSx } },
    { accessorKey: 'email', header: t.email || 'Email', size: 100, muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } }, muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } } },
    { accessorKey: 'created', header: t.created || 'Created', size: 100, muiTableBodyCellProps: { sx: { display: { xs: 'none', sm: 'table-cell' } } }, muiTableHeadCellProps: { sx: { ...headCellBaseSx, display: { xs: 'none', sm: 'table-cell' } } } },
  ];
};

export const customCellAcountTable = (language) => {
  const st = i18nContent?.[language]?.accountTableList?.statuses || {};
  return {
    latestLegalIdState: ({ cell }) => {
      const state = cell.getValue();
      let statusComponent;
      switch (state) {
        case 'Approved':
          statusComponent = <StatusIcon text={st.approved || 'Approved'} color='text-activeGreen' bgColor='bg-activeGreen/20' />;
          break;
        case 'Compromised':
          statusComponent = <StatusIcon text={st.compromised || 'Compromised'} color='text-orange-500' bgColor='bg-orange-500/30' />;
          break;
        case 'Created':
          statusComponent = <StatusIcon text={st.created || 'Id pending'} color='text-neuroDarkOrange' bgColor='bg-neuroOrange/20' />;
          break;
        case 'Obsoleted':
          statusComponent = <StatusIcon text={st.obsoleted || 'Obsoleted'} color='text-obsoletedRed' bgColor='bg-obsoletedRed/20' />;
          break;
        case 'Rejected':
          statusComponent = <StatusIcon text={st.rejected || 'Rejected'} color='text-obsoletedRed' bgColor='bg-neuroRed/20' />;
          break;
        default:
          statusComponent = <StatusIcon text={st.none || 'No Id'} color='text-neuroTextBlack/60' bgColor='bg-neuroButtonGray' />;
      }
      const paddingLeftByState = { Approved: '1rem', Compromised: '0.5rem', Created: '1.25rem', Obsoleted: '1rem', Rejected: '1rem', default: '2rem' };
      return <Box sx={{ pl: paddingLeftByState[state] ?? paddingLeftByState.default }}>{statusComponent}</Box>;
    },
    firstName: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastNames;
      if (firstName !== '') return <p>{firstName} {lastName}</p>;
      return <p>-</p>;
    },
    userName: ({ row }) => {
      const userName = row.original.userName;
      if (userName) {
        const displayName = userName.length > 20 ? `${userName.slice(0, 20)}...` : userName;
        return (
          <p title={userName} style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
        );
      }
      return <p>-</p>;
    },
    created: ({ row }) => {
      const createdTimestamp = row.original.created;
      if (!createdTimestamp) return <span>-</span>;
      const date = new Date(createdTimestamp * 1000);
      const formattedDate = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return <span>{formattedDate}</span>;
    },
    email: ({ row }) => {
      const email = row.original.email;
      if (email) return <p title={email}>{email.length > 20 ? `${email.slice(0, 20)}...` : email}</p>;
      return <p>-</p>;
    },
  };
};
