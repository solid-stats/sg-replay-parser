import fetch from 'node-fetch';

const fetchData = async <DataType>(url: string): Promise<DataType> => {
  const resp = await fetch(url);

  return resp.json();
};

export default fetchData;
