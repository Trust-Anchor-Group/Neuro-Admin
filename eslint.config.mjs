import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      // Preserve the project's existing effect-driven state synchronization
      // while adopting eslint-config-next's native flat configuration.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
