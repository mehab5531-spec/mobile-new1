import { fetch as expoFetch } from 'expo/fetch';

type Params = Parameters<typeof expoFetch>;

const enhancedFetch = async function (...args: Params) {
  return expoFetch(...args);
};

export default enhancedFetch;
